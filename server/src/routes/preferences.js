import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import User from '../models/User.js';

const router = express.Router();

// Get user preferences
router.get('/preferences', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user.preferences || {
            selectedBackground: null,
            likedBackgrounds: [],
            shuffleEnabled: false
        });
    } catch (error) {
        console.error('Error fetching preferences:', error);
        res.status(500).json({ error: 'Failed to fetch preferences' });
    }
});

// Update user preferences
router.patch('/preferences', verifyToken, async (req, res) => {
    try {
        const { selectedBackground, likedBackgrounds, shuffleEnabled } = req.body;

        const updateData = {};
        if (selectedBackground !== undefined) {
            updateData['preferences.selectedBackground'] = selectedBackground;
        }
        if (likedBackgrounds !== undefined) {
            updateData['preferences.likedBackgrounds'] = likedBackgrounds;
        }
        if (shuffleEnabled !== undefined) {
            updateData['preferences.shuffleEnabled'] = shuffleEnabled;
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            { $set: updateData },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user.preferences);
    } catch (error) {
        console.error('Error updating preferences:', error);
        res.status(500).json({ error: 'Failed to update preferences' });
    }
});

export default router;
