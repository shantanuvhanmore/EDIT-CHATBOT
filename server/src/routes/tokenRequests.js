import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import TokenRequest from '../models/TokenRequest.js';
import User from '../models/User.js';

const router = express.Router();

// POST / - User submits request
router.post('/', verifyToken, async (req, res) => {
    try {
        const { reason } = req.body;
        const userId = req.user.id;

        const user = await User.findById(userId);
        if (user.hasPendingTokenRequest) {
            return res.status(400).json({ error: 'You already have a pending token request' });
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const requestsToday = await TokenRequest.countDocuments({
            userId,
            requestedAt: { $gte: today }
        });

        if (requestsToday >= 3) {
            return res.status(429).json({ error: 'Maximum 3 token requests per day' });
        }

        const tokenRequest = new TokenRequest({
            userId,
            reason,
            currentUsage: {
                tokenCount: user.rateLimits?.tokenUsage || 0,
                requestCount: user.rateLimits?.requestCount || 0
            }
        });

        await tokenRequest.save();
        await User.findByIdAndUpdate(userId, {
            hasPendingTokenRequest: true,
            $inc: { tokenRequestCount: 1 },
            lastTokenRequestAt: new Date()
        });

        res.json({ message: 'Token request submitted', request: tokenRequest });
    } catch (error) {
        console.error('Submit token request error:', error);
        res.status(500).json({ error: 'Failed to submit token request' });
    }
});

// GET /my-requests - User's own requests
router.get('/my-requests', verifyToken, async (req, res) => {
    try {
        const requests = await TokenRequest.find({ userId: req.user.id })
            .sort({ requestedAt: -1 })
            .limit(10);
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get requests' });
    }
});

// GET /can-request - Check if user can request
router.get('/can-request', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const requestsToday = await TokenRequest.countDocuments({
            userId: req.user.id,
            requestedAt: { $gte: today }
        });

        res.json({
            canRequest: !user.hasPendingTokenRequest && requestsToday < 3,
            hasPending: user.hasPendingTokenRequest,
            requestsToday,
            maxRequestsPerDay: 3
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to check status' });
    }
});

export default router;
