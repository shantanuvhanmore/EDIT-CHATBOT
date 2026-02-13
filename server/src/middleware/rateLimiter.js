import rateLimit from 'express-rate-limit';

// In-memory store (use Redis in production)
export const chatRateLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: async (req) => {
        if (!req.user) return 0; // No guest access
        if (req.user.role === 'admin') return 1000;
        return 20; // authenticated users - 20 requests per day
    },
    keyGenerator: (req) => {
        return req.user?.id || req.ip;
    },
    handler: (req, res) => {
        res.status(429).json({
            error: 'Rate limit exceeded',
            message: 'You have exceeded the maximum number of requests. Please try again later.',
            resetTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
        });
    },
    standardHeaders: true,
    legacyHeaders: false,
});

export const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: 'Too many authentication attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
