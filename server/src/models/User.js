import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    googleId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    rateLimits: {
        requestCount: {
            type: Number,
            default: 0
        },
        requestWindowStart: {
            type: Date,
            default: Date.now
        },
        tokenUsage: {
            type: Number,
            default: 0
        },
        tokenResetDate: {
            type: Date,
            default: Date.now
        },
        lastRequestAt: {
            type: Date
        },
        violationCount: {
            type: Number,
            default: 0
        },
        isBanned: {
            type: Boolean,
            default: false
        },
        banReason: {
            type: String
        },
        banExpiresAt: {
            type: Date
        }
    },
    hasPendingTokenRequest: {
        type: Boolean,
        default: false
    },
    tokenRequestCount: {
        type: Number,
        default: 0
    },
    lastTokenRequestAt: {
        type: Date
    },
    lastActiveAt: {
        type: Date,
        default: Date.now
    },
    lastLoginAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('User', UserSchema);
