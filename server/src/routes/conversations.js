import express from 'express';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

const router = express.Router();

// Create a new conversation
router.post('/', async (req, res) => {
    try {
        const { userId, title } = req.body;

        if (!userId || !title) {
            return res.status(400).json({ error: 'userId and title are required' });
        }

        const conversation = await Conversation.create({ userId, title });
        res.status(201).json(conversation);
    } catch (err) {
        console.error('Error creating conversation:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all conversations for a user
router.get('/:userId', async (req, res) => {
    try {
        const conversations = await Conversation
            .find({ userId: req.params.userId })
            .sort({ createdAt: -1 });

        res.json(conversations);
    } catch (err) {
        console.error('Error fetching conversations:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a conversation and all its messages
router.delete('/:id', async (req, res) => {
    try {
        const conversationId = req.params.id;

        // Delete all messages in this conversation
        await Message.deleteMany({ conversationId });

        // Delete the conversation
        const conversation = await Conversation.findByIdAndDelete(conversationId);

        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        res.json({ message: 'Conversation deleted successfully' });
    } catch (err) {
        console.error('Error deleting conversation:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
