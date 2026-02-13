import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Verify JWT token and attach user to request
 * This middleware should be applied to all protected routes
 */
export const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user from database
        // FIX: Use decoded.userId matching the sign payload
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        // Check if user is banned
        if (user.rateLimits.isBanned) {
            const banExpired = user.rateLimits.banExpiresAt && user.rateLimits.banExpiresAt < new Date();
            if (!banExpired) {
                return res.status(403).json({
                    error: 'Account banned',
                    reason: user.rateLimits.banReason,
                    expiresAt: user.rateLimits.banExpiresAt
                });
            }
        }

        // Attach user to request
        req.user = user;
        req.userId = user._id.toString();

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        console.error('Token verification error:', error);
        return res.status(401).json({ error: 'Authentication failed' });
    }
};

/**
 * Verify user can only access their own resources
 */
export const verifyOwnership = (req, res, next) => {
    const requestedUserId = req.params.userId || req.body.userId || req.query.userId;

    if (requestedUserId && requestedUserId !== req.userId) {
        return res.status(403).json({
            error: 'Access denied: You can only access your own resources'
        });
    }

    next();
};

/**
 * Require admin role
 */
export const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

/**
 * Optional authentication
 */
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId);
        if (user) {
            req.user = user;
            req.userId = user._id.toString();
        }

        next();
    } catch (error) {
        next();
    }
};
