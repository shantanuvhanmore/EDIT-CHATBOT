import rateLimit from 'express-rate-limit';

// Supervisor Instruction: Redis disabled for demo. Using memory store.
console.log('✓ Using in-memory rate limiting (Demo Mode)');

export const chatRateLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: async (req) => {
        if (!req.user) return 0; // No guest access
        if (req.user.role === 'admin') return 1000;
        return 20; // authenticated users - 20 requests per day
    },
    // store property removed to use default in-memory store
    keyGenerator: (req) => {
        // Use userId for authenticated users, fall back to IP
        return req.userId || req.ip;
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
