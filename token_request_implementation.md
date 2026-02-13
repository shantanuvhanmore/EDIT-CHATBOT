# CODING AGENT INSTRUCTIONS: TOKEN REQUEST FEATURE

## TASK
Implement "Request More Tokens" feature where users hitting limits can request token reset from admin.

## DATABASE

### Create: server/src/models/TokenRequest.js
```javascript
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
```

### Update: server/src/models/User.js
Add these fields to UserSchema:
```javascript
rateLimits: {
    requestCount: { type: Number, default: 0 },
    requestWindowStart: { type: Date, default: Date.now },
    tokenUsage: { type: Number, default: 0 },
    tokenResetDate: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
    lastRequestAt: Date,
    isRateLimited: { type: Boolean, default: false }
},
hasPendingTokenRequest: { type: Boolean, default: false },
tokenRequestCount: { type: Number, default: 0 },
lastTokenRequestAt: Date
```

## BACKEND ROUTES

### Create: server/src/routes/tokenRequests.js
```javascript
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
```

### Update: server/src/routes/admin.js
Add these routes:
```javascript
// GET /token-requests - All token requests
router.get('/token-requests', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};
        
        const requests = await TokenRequest.find(filter)
            .populate('userId', 'name email profilePicture')
            .populate('processedBy', 'name email')
            .sort({ requestedAt: -1 });
        
        res.json(requests);
    } catch (error) {
        res.status(500).json({ error: 'Failed to get token requests' });
    }
});

// PUT /token-requests/:id/approve - Approve request
router.put('/token-requests/:id/approve', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { adminResponse } = req.body;
        
        const request = await TokenRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }
        
        if (request.status !== 'pending') {
            return res.status(400).json({ error: 'Request already processed' });
        }

        // Reset user's rate limits
        await User.findByIdAndUpdate(request.userId, {
            'rateLimits.requestCount': 0,
            'rateLimits.tokenUsage': 0,
            'rateLimits.requestWindowStart': new Date(),
            'rateLimits.tokenResetDate': new Date(Date.now() + 24 * 60 * 60 * 1000),
            'rateLimits.isRateLimited': false,
            hasPendingTokenRequest: false
        });

        // Update request
        request.status = 'approved';
        request.adminResponse = adminResponse;
        request.processedBy = req.user.id;
        request.processedAt = new Date();
        await request.save();

        res.json({ message: 'Request approved and user limits reset', request });
    } catch (error) {
        res.status(500).json({ error: 'Failed to approve request' });
    }
});

// PUT /token-requests/:id/reject - Reject request
router.put('/token-requests/:id/reject', verifyToken, requireAdmin, async (req, res) => {
    try {
        const { adminResponse } = req.body;
        
        const request = await TokenRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }
        
        if (request.status !== 'pending') {
            return res.status(400).json({ error: 'Request already processed' });
        }

        // Update user
        await User.findByIdAndUpdate(request.userId, {
            hasPendingTokenRequest: false
        });

        // Update request
        request.status = 'rejected';
        request.adminResponse = adminResponse;
        request.processedBy = req.user.id;
        request.processedAt = new Date();
        await request.save();

        res.json({ message: 'Request rejected', request });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reject request' });
    }
});

// GET /token-requests/stats - Request statistics
router.get('/token-requests/stats', verifyToken, requireAdmin, async (req, res) => {
    try {
        const [pending, approved, rejected] = await Promise.all([
            TokenRequest.countDocuments({ status: 'pending' }),
            TokenRequest.countDocuments({ status: 'approved' }),
            TokenRequest.countDocuments({ status: 'rejected' })
        ]);

        res.json({ pending, approved, rejected, total: pending + approved + rejected });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get stats' });
    }
});
```

### Update: server/src/index.js
Add route import and use:
```javascript
import tokenRequestRoutes from './routes/tokenRequests.js';

app.use('/api/token-requests', tokenRequestRoutes);
```

## FRONTEND

### Create: client/src/components/RequestTokensModal.jsx
```jsx
import { useState } from 'react';
import { X, Send } from 'lucide-react';

export default function RequestTokensModal({ isOpen, onClose, onSubmit }) {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!reason.trim()) return;

        setIsSubmitting(true);
        await onSubmit(reason);
        setIsSubmitting(false);
        setReason('');
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: 'linear-gradient(135deg, rgba(15, 12, 41, 0.95), rgba(48, 43, 99, 0.95))',
                border: '1px solid rgba(0, 255, 245, 0.3)',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '500px',
                width: '90%',
                boxShadow: '0 0 50px rgba(0, 255, 245, 0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ color: '#00fff5', fontSize: '24px', fontFamily: '"Orbitron", sans-serif' }}>
                        Request More Tokens
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '20px', fontSize: '14px' }}>
                    You've reached your token limit. Explain why you need more tokens and an admin will review your request.
                </p>

                <form onSubmit={handleSubmit}>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Explain your reason (required)..."
                        maxLength={500}
                        required
                        style={{
                            width: '100%',
                            minHeight: '120px',
                            background: 'rgba(0, 0, 0, 0.4)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '8px',
                            padding: '12px',
                            color: 'white',
                            fontSize: '14px',
                            fontFamily: '"Outfit", sans-serif',
                            marginBottom: '20px',
                            resize: 'vertical'
                        }}
                    />

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{
                                padding: '12px 24px',
                                background: 'rgba(255, 255, 255, 0.1)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                borderRadius: '8px',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '14px'
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!reason.trim() || isSubmitting}
                            style={{
                                padding: '12px 24px',
                                background: reason.trim() ? 'linear-gradient(135deg, #00fff5, #00cccc)' : 'rgba(255, 255, 255, 0.1)',
                                border: 'none',
                                borderRadius: '8px',
                                color: reason.trim() ? '#0f0c29' : 'rgba(255, 255, 255, 0.3)',
                                cursor: reason.trim() ? 'pointer' : 'not-allowed',
                                fontSize: '14px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <Send size={16} />
                            {isSubmitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
```

### Update: client/src/App.jsx (or main chat component)
Add button and modal logic:
```jsx
import { useState, useEffect } from 'react';
import RequestTokensModal from './components/RequestTokensModal';

// Inside component:
const [showRequestModal, setShowRequestModal] = useState(false);
const [canRequestTokens, setCanRequestTokens] = useState(false);

// Check if user can request tokens
useEffect(() => {
    const checkCanRequest = async () => {
        try {
            const res = await fetch('/api/token-requests/can-request', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setCanRequestTokens(data.canRequest);
        } catch (error) {
            console.error('Check can request error:', error);
        }
    };

    if (isSessionExhausted) {
        checkCanRequest();
    }
}, [isSessionExhausted, token]);

// Handle token request submission
const handleRequestTokens = async (reason) => {
    try {
        const res = await fetch('/api/token-requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ reason })
        });

        if (res.ok) {
            alert('Token request submitted! Admin will review shortly.');
            setShowRequestModal(false);
            setCanRequestTokens(false);
        } else {
            const data = await res.json();
            alert(data.error || 'Failed to submit request');
        }
    } catch (error) {
        alert('Failed to submit token request');
    }
};

// Add button when session exhausted
{isSessionExhausted && canRequestTokens && (
    <button
        onClick={() => setShowRequestModal(true)}
        style={{
            background: 'linear-gradient(135deg, #00fff5, #00cccc)',
            color: '#0f0c29',
            padding: '12px 24px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 0 20px rgba(0, 255, 245, 0.4)',
            marginTop: '16px'
        }}
    >
        Request More Tokens
    </button>
)}

<RequestTokensModal
    isOpen={showRequestModal}
    onClose={() => setShowRequestModal(false)}
    onSubmit={handleRequestTokens}
/>
```

### Create: client/src/components/admin/TokenRequestsPanel.jsx
```jsx
import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User } from 'lucide-react';

export default function TokenRequestsPanel({ token }) {
    const [requests, setRequests] = useState([]);
    const [filter, setFilter] = useState('pending');
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
        fetchStats();
    }, [filter]);

    const fetchRequests = async () => {
        try {
            const res = await fetch(`/api/admin/token-requests?status=${filter}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setRequests(data);
        } catch (error) {
            console.error('Fetch requests error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/admin/token-requests/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            setStats(data);
        } catch (error) {
            console.error('Fetch stats error:', error);
        }
    };

    const handleApprove = async (requestId) => {
        const adminResponse = prompt('Add optional message for user:');
        try {
            const res = await fetch(`/api/admin/token-requests/${requestId}/approve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ adminResponse })
            });

            if (res.ok) {
                alert('Request approved and user limits reset!');
                fetchRequests();
                fetchStats();
            }
        } catch (error) {
            alert('Failed to approve request');
        }
    };

    const handleReject = async (requestId) => {
        const adminResponse = prompt('Add reason for rejection (required):');
        if (!adminResponse) return;

        try {
            const res = await fetch(`/api/admin/token-requests/${requestId}/reject`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ adminResponse })
            });

            if (res.ok) {
                alert('Request rejected');
                fetchRequests();
                fetchStats();
            }
        } catch (error) {
            alert('Failed to reject request');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ color: '#00fff5', fontSize: '24px', marginBottom: '20px' }}>
                Token Requests
            </h2>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(255, 193, 7, 0.1)', padding: '16px', borderRadius: '8px', flex: 1 }}>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>PENDING</div>
                    <div style={{ fontSize: '32px', color: '#ffc107', fontWeight: 'bold' }}>{stats.pending}</div>
                </div>
                <div style={{ background: 'rgba(76, 175, 80, 0.1)', padding: '16px', borderRadius: '8px', flex: 1 }}>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>APPROVED</div>
                    <div style={{ fontSize: '32px', color: '#4caf50', fontWeight: 'bold' }}>{stats.approved}</div>
                </div>
                <div style={{ background: 'rgba(244, 67, 54, 0.1)', padding: '16px', borderRadius: '8px', flex: 1 }}>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>REJECTED</div>
                    <div style={{ fontSize: '32px', color: '#f44336', fontWeight: 'bold' }}>{stats.rejected}</div>
                </div>
            </div>

            {/* Filter */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                {['pending', 'approved', 'rejected'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        style={{
                            padding: '8px 16px',
                            background: filter === status ? 'rgba(0, 255, 245, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                            border: filter === status ? '1px solid #00fff5' : '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '8px',
                            color: 'white',
                            cursor: 'pointer',
                            textTransform: 'capitalize'
                        }}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Requests List */}
            {loading ? (
                <div style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', padding: '40px' }}>
                    Loading...
                </div>
            ) : requests.length === 0 ? (
                <div style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', padding: '40px' }}>
                    No {filter} requests
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {requests.map(request => (
                        <div
                            key={request._id}
                            style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: '12px',
                                padding: '20px'
                            }}
                        >
                            {/* User Info */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                                {request.userId.profilePicture ? (
                                    <img src={request.userId.profilePicture} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                                ) : (
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(0,255,245,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <User size={20} color="#00fff5" />
                                    </div>
                                )}
                                <div>
                                    <div style={{ color: 'white', fontWeight: '600' }}>{request.userId.name}</div>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>{request.userId.email}</div>
                                </div>
                            </div>

                            {/* Request Details */}
                            <div style={{ marginBottom: '12px' }}>
                                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '8px' }}>
                                    Requested: {new Date(request.requestedAt).toLocaleString()}
                                </div>
                                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '8px' }}>
                                    Current Usage: {request.currentUsage.tokenCount} tokens, {request.currentUsage.requestCount} requests
                                </div>
                                <div style={{ color: 'white', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px' }}>
                                    {request.reason}
                                </div>
                            </div>

                            {/* Admin Response */}
                            {request.adminResponse && (
                                <div style={{ marginBottom: '12px', padding: '12px', background: 'rgba(0,255,245,0.05)', borderRadius: '8px', borderLeft: '3px solid #00fff5' }}>
                                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '12px', marginBottom: '4px' }}>
                                        Admin Response:
                                    </div>
                                    <div style={{ color: 'white' }}>{request.adminResponse}</div>
                                </div>
                            )}

                            {/* Actions */}
                            {request.status === 'pending' && (
                                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                                    <button
                                        onClick={() => handleApprove(request._id)}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            background: 'linear-gradient(135deg, #4caf50, #45a049)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <CheckCircle size={18} />
                                        Approve & Reset
                                    </button>
                                    <button
                                        onClick={() => handleReject(request._id)}
                                        style={{
                                            flex: 1,
                                            padding: '10px',
                                            background: 'linear-gradient(135deg, #f44336, #e53935)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <XCircle size={18} />
                                        Reject
                                    </button>
                                </div>
                            )}

                            {/* Status Badge */}
                            {request.status !== 'pending' && (
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    background: request.status === 'approved' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                                    color: request.status === 'approved' ? '#4caf50' : '#f44336',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    marginTop: '12px'
                                }}>
                                    {request.status === 'approved' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                    {request.status.toUpperCase()}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
```

### Update: client/src/components/AdminDashboard.jsx
Add new tab:
```jsx
// Add to tabs array
const tabs = ['overview', 'users', 'conversations', 'messages', 'requests'];

// Add to tab content rendering
{activeTab === 'requests' && <TokenRequestsPanel token={token} />}
```

## TESTING CHECKLIST
- [ ] User can submit token request when limit reached
- [ ] User sees "Request More Tokens" button only when eligible
- [ ] User cannot submit multiple pending requests
- [ ] User limited to 3 requests per day
- [ ] Admin sees all pending requests
- [ ] Admin can approve request (resets user limits)
- [ ] Admin can reject request with reason
- [ ] User notified of approval/rejection
- [ ] Stats update correctly
- [ ] Filters work (pending/approved/rejected)

## IMPLEMENTATION ORDER
1. Create TokenRequest model
2. Update User model
3. Create tokenRequests routes
4. Update admin routes
5. Add routes to index.js
6. Create RequestTokensModal component
7. Update main chat component
8. Create TokenRequestsPanel component
9. Update AdminDashboard component
10. Test complete flow
