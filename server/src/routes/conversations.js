import express from 'express';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { verifyToken, verifyOwnership } from '../middleware/auth.js';

const router = express.Router();

// Create a new conversation
router.post('/', verifyToken, async (req, res) => {
    try {
        const { title } = req.body;

        if (!title) {
            return res.status(400).json({ error: 'title is required' });
        }

        // Use userId from verified token, not from request body
        const conversation = await Conversation.create({
            userId: req.userId,
            title
        });
        res.status(201).json(conversation);
    } catch (err) {
        console.error('Error creating conversation:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all conversations for a user
router.get('/:userId', verifyToken, verifyOwnership, async (req, res) => {
    try {
        // User can only fetch their own conversations (verified by verifyOwnership)
        const conversations = await Conversation
            .find({ userId: req.userId })
            .sort({ createdAt: -1 });

        res.json(conversations);
    } catch (err) {
        console.error('Error fetching conversations:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a conversation and all its messages
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const conversationId = req.params.id;

        // First, verify the conversation belongs to the user
        const conversation = await Conversation.findById(conversationId);

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        if (conversation.userId.toString() !== req.userId) {
            return res.status(403).json({ error: 'Access denied: You can only delete your own conversations' });
        }

        // Delete all messages in this conversation
        await Message.deleteMany({ conversationId });

        // Delete the conversation
        await Conversation.findByIdAndDelete(conversationId);

        res.json({ message: 'Conversation deleted successfully' });
    } catch (err) {
        console.error('Error deleting conversation:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
