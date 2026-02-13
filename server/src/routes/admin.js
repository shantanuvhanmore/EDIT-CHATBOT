import express from 'express';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(verifyToken);
router.use(requireAdmin);

// ==================== ANALYTICS ENDPOINTS ====================

// Get analytics overview
router.get('/analytics/overview', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalConversations = await Conversation.countDocuments();
        const totalMessages = await Message.countDocuments();

        // Active users (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const activeUsers = await Conversation.distinct('userId', {
            createdAt: { $gte: sevenDaysAgo }
        });

        // Feedback stats
        const feedbackStats = await Message.aggregate([
            {
                $group: {
                    _id: '$feedback',
                    count: { $sum: 1 }
                }
            }
        ]);

        const liked = feedbackStats.find(s => s._id === 'liked')?.count || 0;
        const disliked = feedbackStats.find(s => s._id === 'disliked')?.count || 0;
        const noFeedback = feedbackStats.find(s => s._id === null)?.count || 0;

        // Average messages per conversation
        const avgMessagesResult = await Message.aggregate([
            {
                $group: {
                    _id: '$conversationId',
                    count: { $sum: 1 }
                }
            },
            {
                $group: {
                    _id: null,
                    avgMessages: { $avg: '$count' }
                }
            }
        ]);

        const avgMessages = avgMessagesResult[0]?.avgMessages || 0;

        res.json({
            totalUsers,
            totalConversations,
            totalMessages,
            activeUsers: activeUsers.length,
            feedbackStats: {
                liked,
                disliked,
                noFeedback,
                feedbackRatio: totalMessages > 0 ? ((liked + disliked) / totalMessages * 100).toFixed(1) : 0
            },
            avgMessagesPerConversation: avgMessages.toFixed(1)
        });
    } catch (err) {
        console.error('Error fetching analytics overview:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get feedback trends over time (last 30 days)
router.get('/analytics/feedback-trends', async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const trends = await Message.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo },
                    feedback: { $in: ['liked', 'disliked'] }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        feedback: '$feedback'
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.date': 1 }
            }
        ]);

        res.json(trends);
    } catch (err) {
        console.error('Error fetching feedback trends:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user activity timeline (messages per day, last 30 days)
router.get('/analytics/user-activity', async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const activity = await Message.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);

        res.json(activity);
    } catch (err) {
        console.error('Error fetching user activity:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get conversation preview (first 3 messages)
router.get('/conversations/:id/preview', async (req, res) => {
    try {
        const messages = await Message.find({ conversationId: req.params.id })
            .sort({ createdAt: 1 })
            .limit(3)
            .select('sender content createdAt');

        res.json(messages);
    } catch (err) {
        console.error('Error fetching conversation preview:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== CONVERSATIONS ENDPOINTS ====================

// Get all conversations with enhanced stats
router.get('/conversations', async (req, res) => {
    try {
        const { startDate, endDate, userId, minMessages, maxMessages } = req.query;

        // Build match filter
        let matchFilter = {};
        if (startDate || endDate) {
            matchFilter.createdAt = {};
            if (startDate) matchFilter.createdAt.$gte = new Date(startDate);
            if (endDate) matchFilter.createdAt.$lte = new Date(endDate);
        }
        if (userId) {
            matchFilter.userId = mongoose.Types.ObjectId(userId);
        }

        const conversations = await Conversation.aggregate([
            ...(Object.keys(matchFilter).length > 0 ? [{ $match: matchFilter }] : []),
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $lookup: {
                    from: 'messages',
                    localField: '_id',
                    foreignField: 'conversationId',
                    as: 'messages'
                }
            },
            {
                $addFields: {
                    messageCount: { $size: '$messages' },
                    lastActivity: { $max: '$messages.createdAt' },
                    duration: {
                        $subtract: [
                            { $max: '$messages.createdAt' },
                            { $min: '$messages.createdAt' }
                        ]
                    },
                    feedbackStats: {
                        liked: {
                            $size: {
                                $filter: {
                                    input: '$messages',
                                    cond: { $eq: ['$$this.feedback', 'liked'] }
                                }
                            }
                        },
                        disliked: {
                            $size: {
                                $filter: {
                                    input: '$messages',
                                    cond: { $eq: ['$$this.feedback', 'disliked'] }
                                }
                            }
                        }
                    }
                }
            },
            {
                $project: {
                    messages: 0 // Don't send all messages
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]);

        // Apply message count filters
        let filteredConversations = conversations;
        if (minMessages) {
            filteredConversations = filteredConversations.filter(c => c.messageCount >= parseInt(minMessages));
        }
        if (maxMessages) {
            filteredConversations = filteredConversations.filter(c => c.messageCount <= parseInt(maxMessages));
        }

        res.json(filteredConversations);
    } catch (err) {
        console.error('Error fetching admin conversations:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete conversation
router.delete('/conversations/:id', async (req, res) => {
    try {
        const conversation = await Conversation.findByIdAndDelete(req.params.id);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        await Message.deleteMany({ conversationId: req.params.id });
        res.json({ message: 'Conversation deleted successfully' });
    } catch (err) {
        console.error('Error deleting conversation:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== MESSAGES ENDPOINTS ====================

// Get filtered and paginated messages
router.get('/messages', async (req, res) => {
    try {
        const { filter = 'all', page = 1, limit = 20, search = '' } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build filter query
        let feedbackFilter = {};
        if (filter === 'liked') {
            feedbackFilter.feedback = 'liked';
        } else if (filter === 'disliked') {
            feedbackFilter.feedback = 'disliked';
        }

        // Add search filter
        if (search) {
            feedbackFilter.content = { $regex: search, $options: 'i' };
        }

        // Get messages with conversation and user info
        const messages = await Message.aggregate([
            {
                $match: feedbackFilter
            },
            {
                $lookup: {
                    from: 'conversations',
                    localField: 'conversationId',
                    foreignField: '_id',
                    as: 'conversation'
                }
            },
            {
                $unwind: '$conversation'
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'conversation.userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $skip: skip
            },
            {
                $limit: parseInt(limit)
            },
            {
                $project: {
                    _id: 1,
                    content: 1,
                    sender: 1,
                    feedback: 1,
                    createdAt: 1,
                    conversationId: 1,
                    'conversation.title': 1,
                    'user.email': 1,
                    'user.name': 1
                }
            }
        ]);

        // Get total count for pagination
        const totalCount = await Message.countDocuments(feedbackFilter);

        res.json({
            messages,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / parseInt(limit)),
                totalCount,
                limit: parseInt(limit)
            }
        });
    } catch (err) {
        console.error('Error fetching admin messages:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== USERS ENDPOINTS ====================

// Get all users with stats
router.get('/users', async (req, res) => {
    try {
        const { role, activeFilter } = req.query;

        // Build match filter
        let matchFilter = {};
        if (role && role !== 'all') {
            matchFilter.role = role;
        }

        const users = await User.aggregate([
            ...(Object.keys(matchFilter).length > 0 ? [{ $match: matchFilter }] : []),
            {
                $lookup: {
                    from: 'conversations',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'conversations'
                }
            },
            {
                $lookup: {
                    from: 'messages',
                    let: { userId: '$_id' },
                    pipeline: [
                        {
                            $lookup: {
                                from: 'conversations',
                                localField: 'conversationId',
                                foreignField: '_id',
                                as: 'conv'
                            }
                        },
                        {
                            $unwind: '$conv'
                        },
                        {
                            $match: {
                                $expr: { $eq: ['$conv.userId', '$$userId'] }
                            }
                        }
                    ],
                    as: 'messages'
                }
            },
            {
                $addFields: {
                    totalConversations: { $size: '$conversations' },
                    totalMessages: { $size: '$messages' },
                    lastActive: { $max: '$conversations.createdAt' }
                }
            },
            {
                $project: {
                    googleId: 0,
                    conversations: 0,
                    messages: 0
                }
            },
            {
                $sort: { createdAt: -1 }
            }
        ]);

        // Apply active filter
        let filteredUsers = users;
        if (activeFilter === 'active') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            filteredUsers = users.filter(u => u.lastActive && new Date(u.lastActive) >= sevenDaysAgo);
        } else if (activeFilter === 'inactive') {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            filteredUsers = users.filter(u => !u.lastActive || new Date(u.lastActive) < sevenDaysAgo);
        }

        res.json(filteredUsers);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role, isAdmin: role === 'admin' },
            { new: true }
        ).select('-googleId');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error('Error updating user role:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete user's conversations and messages
        const conversations = await Conversation.find({ userId: req.params.id });
        const conversationIds = conversations.map(c => c._id);

        await Message.deleteMany({ conversationId: { $in: conversationIds } });
        await Conversation.deleteMany({ userId: req.params.id });

        res.json({ message: 'User and all associated data deleted successfully' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user's conversations
router.get('/users/:id/conversations', async (req, res) => {
    try {
        const conversations = await Conversation.find({ userId: req.params.id })
            .sort({ createdAt: -1 })
            .populate('userId', 'name email');

        res.json(conversations);
    } catch (err) {
        console.error('Error fetching user conversations:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
