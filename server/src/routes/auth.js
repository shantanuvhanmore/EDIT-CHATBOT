import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google OAuth login
router.post('/google', async (req, res) => {
    try {
        const { credential } = req.body;

        if (!credential) {
            return res.status(400).json({ error: 'Credential is required' });
        }

        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        // Check if email is in admin whitelist
        const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || [];
        const isAdmin = ADMIN_EMAILS.includes(email);
        const role = isAdmin ? 'admin' : 'user';

        // Find or create user
        let user = await User.findOne({ googleId });

        if (user) {
            // Update existing user
            user.email = email;
            user.name = name;
            user.profilePicture = picture;
            user.role = role;
            user.isAdmin = isAdmin;
            user.lastLoginAt = new Date();
            user.lastActiveAt = new Date();
            await user.save();
        } else {
            // Create new user
            user = await User.create({
                googleId,
                email,
                name,
                profilePicture: picture,
                role,
                isAdmin
            });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                googleId: user.googleId,
                email: user.email,
                name: user.name,
                profilePicture: user.profilePicture,
                role: user.role,
                isAdmin: user.isAdmin
            }
        });
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

// Get current user
router.get('/me', verifyToken, async (req, res) => {
    try {
        res.json({
            user: {
                id: req.user._id,
                googleId: req.user.googleId,
                email: req.user.email,
                name: req.user.name,
                profilePicture: req.user.profilePicture,
                role: req.user.role,
                isAdmin: req.user.isAdmin
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

export default router;
