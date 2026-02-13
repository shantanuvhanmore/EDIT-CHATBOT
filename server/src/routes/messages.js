import express from 'express';
import Message from '../models/Message.js';

const router = express.Router();

// Save a new message
router.post('/', async (req, res) => {
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

        const message = await Message.create({ conversationId, sender, content });
        res.status(201).json(message);
    } catch (err) {
        console.error('Error saving message:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all messages for a conversation
router.get('/:conversationId', async (req, res) => {
    try {
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
router.patch('/:id/feedback', async (req, res) => {
    try {
        const { feedback } = req.body;

        if (!feedback || !['none', 'liked', 'disliked'].includes(feedback)) {
            return res.status(400).json({
                error: 'feedback must be "none", "liked", or "disliked"'
            });
        }

        const message = await Message.findByIdAndUpdate(
            req.params.id,
            { feedback },
            { new: true }
        );

        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        res.json(message);
    } catch (err) {
        console.error('Error updating feedback:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
