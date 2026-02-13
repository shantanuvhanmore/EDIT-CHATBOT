import mongoose from 'mongoose';

const TokenRequestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    requestedAt: { type: Date, default: Date.now, index: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    reason: { type: String, maxlength: 500 },
    adminResponse: { type: String, maxlength: 500 },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    processedAt: Date,
    currentUsage: {
        tokenCount: Number,
        requestCount: Number
    }
});

TokenRequestSchema.index({ status: 1, requestedAt: -1 });
export default mongoose.model('TokenRequest', TokenRequestSchema);
