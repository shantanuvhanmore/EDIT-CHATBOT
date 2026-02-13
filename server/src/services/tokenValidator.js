import User from '../models/User.js';

const RATE_LIMITS = {
    user: {
        requests: 20,
        tokens: 2000
    },
    admin: {
        requests: 100,
        tokens: 10000
    }
};

export async function checkRateLimit(userId) {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    // Check if banned
    if (user.rateLimits.isBanned) {
        if (user.rateLimits.banExpiresAt && user.rateLimits.banExpiresAt > new Date()) {
            throw new Error(`User is banned: ${user.rateLimits.banReason}`);
        } else {
            // Unban if expired
            user.rateLimits.isBanned = false;
            user.rateLimits.banReason = null;
            user.rateLimits.banExpiresAt = null;
            await user.save();
        }
    }

    const now = new Date();
    const windowStart = user.rateLimits.requestWindowStart;
    const hoursSinceWindowStart = (now - windowStart) / (1000 * 60 * 60);

    // Reset window if 24 hours passed
    if (hoursSinceWindowStart >= 24) {
        user.rateLimits.requestCount = 0;
        user.rateLimits.requestWindowStart = now;
    }

    // Check request limit
    const maxRequests = user.role === 'admin' ? RATE_LIMITS.admin.requests : RATE_LIMITS.user.requests;
    if (user.rateLimits.requestCount >= maxRequests) {
        user.rateLimits.violationCount += 1;
        await user.save();
        throw new Error('Request rate limit exceeded. Please try again in 24 hours.');
    }

    // Increment request count
    user.rateLimits.requestCount += 1;
    user.rateLimits.lastRequestAt = now;
    user.lastActiveAt = now;
    await user.save();

    return user;
}

export async function checkTokenLimit(userId, estimatedTokens) {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    const now = new Date();
    const resetDate = user.rateLimits.tokenResetDate;
    const hoursSinceReset = (now - resetDate) / (1000 * 60 * 60);

    // Reset token usage if 24 hours passed
    if (hoursSinceReset >= 24) {
        user.rateLimits.tokenUsage = 0;
        user.rateLimits.tokenResetDate = now;
    }

    // Check token limit
    const maxTokens = user.role === 'admin' ? RATE_LIMITS.admin.tokens : RATE_LIMITS.user.tokens;
    if (user.rateLimits.tokenUsage + estimatedTokens > maxTokens) {
        throw new Error('Token limit exceeded. Please try again in 24 hours.');
    }

    return user;
}

export async function trackTokenUsage(userId, tokensUsed) {
    const user = await User.findById(userId);

    if (!user) {
        return;
    }

    // Validate tokensUsed is a valid number
    if (typeof tokensUsed !== 'number' || isNaN(tokensUsed) || tokensUsed < 0) {
        console.error(`Invalid tokensUsed value: ${tokensUsed}`);
        return;
    }

    user.rateLimits.tokenUsage += tokensUsed;
    await user.save();
}

export async function getRateLimitStatus(userId) {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    const maxRequests = user.role === 'admin' ? RATE_LIMITS.admin.requests : RATE_LIMITS.user.requests;
    const maxTokens = user.role === 'admin' ? RATE_LIMITS.admin.tokens : RATE_LIMITS.user.tokens;

    return {
        requests: {
            used: user.rateLimits.requestCount,
            limit: maxRequests,
            remaining: maxRequests - user.rateLimits.requestCount,
            resetAt: new Date(user.rateLimits.requestWindowStart.getTime() + 24 * 60 * 60 * 1000)
        },
        tokens: {
            used: user.rateLimits.tokenUsage,
            limit: maxTokens,
            remaining: maxTokens - user.rateLimits.tokenUsage,
            resetAt: new Date(user.rateLimits.tokenResetDate.getTime() + 24 * 60 * 60 * 1000)
        },
        isBanned: user.rateLimits.isBanned,
        banReason: user.rateLimits.banReason,
        banExpiresAt: user.rateLimits.banExpiresAt
    };
}
