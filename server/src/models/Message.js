import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true,
        index: true
    },
    sender: {
        type: String,
        enum: ['user', 'bot'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    feedback: {
        type: String,
        enum: ['none', 'liked', 'disliked'],
        default: 'none'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Message', MessageSchema);
