import express from 'express';
import Message from '../models/Message.js';
import Conversation from '../models/Conversation.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Save a new message
router.post('/', verifyToken, async (req, res) => {
    try {
        const { conversationId, sender, content } = req.body;

        if (!conversationId || !sender || !content) {
            return res.status(400).json({
                error: 'conversationId, sender, and content are required'
            });
        }

        if (!['user', 'bot'].includes(sender)) {
            return res.status(400).json({
                error: 'sender must be either "user" or "bot"'
            });
        }

        // Verify the conversation belongs to the authenticated user
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        if (conversation.userId.toString() !== req.userId) {
            return res.status(403).json({ error: 'Access denied: You can only add messages to your own conversations' });
        }

        const message = await Message.create({ conversationId, sender, content });
        res.status(201).json(message);
    } catch (err) {
        console.error('Error saving message:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all messages for a conversation
router.get('/:conversationId', verifyToken, async (req, res) => {
    try {
        // Verify the conversation belongs to the authenticated user
        const conversation = await Conversation.findById(req.params.conversationId);
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        if (conversation.userId.toString() !== req.userId) {
            return res.status(403).json({ error: 'Access denied: You can only view messages from your own conversations' });
        }

        const messages = await Message
            .find({ conversationId: req.params.conversationId })
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update message feedback
router.patch('/:id/feedback', verifyToken, async (req, res) => {
    try {
        const { feedback } = req.body;

        if (!feedback || !['none', 'liked', 'disliked'].includes(feedback)) {
            return res.status(400).json({
                error: 'feedback must be "none", "liked", or "disliked"'
            });
        }

        // Find the message and verify ownership through conversation
        const message = await Message.findById(req.params.id);
        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        const conversation = await Conversation.findById(message.conversationId);
        if (!conversation || conversation.userId.toString() !== req.userId) {
            return res.status(403).json({ error: 'Access denied: You can only update feedback on your own messages' });
        }

        message.feedback = feedback;
        await message.save();

        res.json(message);
    } catch (err) {
        console.error('Error updating feedback:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
