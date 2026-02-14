import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, User, AlertCircle, Eye, X } from 'lucide-react';

export default function TokenRequestsPanel({ token }) {
    const [requests, setRequests] = useState([]);
    const [filter, setFilter] = useState('pending');
    const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

    useEffect(() => {
        fetchRequests();
        fetchStats();
    }, [filter]);

    const fetchRequests = async () => {
        try {
            const res = await fetch(`${API_BASE}/api/admin/token-requests?status=${filter}`, {
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
            const res = await fetch(`${API_BASE}/api/admin/token-requests/stats`, {
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
            const res = await fetch(`${API_BASE}/api/admin/token-requests/${requestId}/approve`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ adminResponse })
            });

            if (res.ok) {
                alert('✅ Request approved!\n\nUser limits have been reset. The user can continue chatting immediately.');
                setSelectedRequest(null);
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
            const res = await fetch(`${API_BASE}/api/admin/token-requests/${requestId}/reject`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ adminResponse })
            });

            if (res.ok) {
                alert('Request rejected');
                setSelectedRequest(null);
                fetchRequests();
                fetchStats();
            }
        } catch (error) {
            alert('Failed to reject request');
        }
    };

    return (
        <div>
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                <div style={{ background: 'rgba(255, 193, 7, 0.1)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255, 193, 7, 0.3)' }}>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Pending</div>
                    <div style={{ fontSize: '28px', color: '#ffc107', fontWeight: 'bold', fontFamily: '"Orbitron", sans-serif' }}>{stats.pending}</div>
                </div>
                <div style={{ background: 'rgba(76, 175, 80, 0.1)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(76, 175, 80, 0.3)' }}>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Approved</div>
                    <div style={{ fontSize: '28px', color: '#4caf50', fontWeight: 'bold', fontFamily: '"Orbitron", sans-serif' }}>{stats.approved}</div>
                </div>
                <div style={{ background: 'rgba(244, 67, 54, 0.1)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(244, 67, 54, 0.3)' }}>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Rejected</div>
                    <div style={{ fontSize: '28px', color: '#f44336', fontWeight: 'bold', fontFamily: '"Orbitron", sans-serif' }}>{stats.rejected}</div>
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
                            borderRadius: '6px',
                            color: 'white',
                            cursor: 'pointer',
                            textTransform: 'capitalize',
                            fontSize: '13px',
                            fontWeight: '600',
                            transition: 'all 0.2s'
                        }}
                    >
                        {status}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                overflow: 'hidden'
            }}>
                <div style={{ overflowX: 'auto', maxHeight: '600px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: 'rgba(0, 255, 245, 0.05)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#00fff5', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>User</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#00fff5', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Date</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#00fff5', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Usage</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', color: '#00fff5', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Status</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center', color: '#00fff5', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                                        <Clock size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                                        <div>Loading...</div>
                                    </td>
                                </tr>
                            ) : requests.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                                        <AlertCircle size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
                                        <div>No {filter} requests</div>
                                    </td>
                                </tr>
                            ) : (
                                requests.map((request, index) => (
                                    <tr
                                        key={request._id}
                                        style={{
                                            borderBottom: index < requests.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={{ padding: '12px 16px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                {request.userId?.profilePicture ? (
                                                    <img src={request.userId.profilePicture} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(0, 255, 245, 0.3)' }} />
                                                ) : (
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(0,255,245,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <User size={16} color="#00fff5" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>{request.userId?.name || 'Unknown'}</div>
                                                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{request.userId?.email || 'N/A'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                                            {new Date(request.requestedAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                                            <div>{request.currentUsage?.tokenCount || 0} tokens</div>
                                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>{request.currentUsage?.requestCount || 0} requests</div>
                                        </td>
                                        <td style={{ padding: '12px 16px' }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '4px',
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                background: request.status === 'approved' ? 'rgba(76, 175, 80, 0.2)' : request.status === 'rejected' ? 'rgba(244, 67, 54, 0.2)' : 'rgba(255, 193, 7, 0.2)',
                                                color: request.status === 'approved' ? '#4caf50' : request.status === 'rejected' ? '#f44336' : '#ffc107',
                                                fontSize: '11px',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.05em'
                                            }}>
                                                {request.status === 'approved' ? <CheckCircle size={12} /> : request.status === 'rejected' ? <XCircle size={12} /> : <Clock size={12} />}
                                                {request.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => setSelectedRequest(request)}
                                                style={{
                                                    background: 'rgba(0, 255, 245, 0.1)',
                                                    border: '1px solid rgba(0, 255, 245, 0.3)',
                                                    borderRadius: '6px',
                                                    color: '#00fff5',
                                                    padding: '6px 12px',
                                                    cursor: 'pointer',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'rgba(0, 255, 245, 0.2)';
                                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'rgba(0, 255, 245, 0.1)';
                                                    e.currentTarget.style.transform = 'translateY(0)';
                                                }}
                                            >
                                                <Eye size={14} />
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Preview Modal */}
            {selectedRequest && (
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
                    zIndex: 1000,
                    padding: '20px'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, rgba(15, 12, 41, 0.98), rgba(48, 43, 99, 0.98))',
                        border: '1px solid rgba(0, 255, 245, 0.3)',
                        borderRadius: '16px',
                        padding: '32px',
                        maxWidth: '600px',
                        width: '100%',
                        maxHeight: '80vh',
                        overflow: 'auto',
                        boxShadow: '0 0 50px rgba(0, 255, 245, 0.2)'
                    }}>
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ color: '#00fff5', fontSize: '20px', fontFamily: '"Orbitron", sans-serif', margin: 0 }}>
                                Token Request Details
                            </h3>
                            <button
                                onClick={() => setSelectedRequest(null)}
                                style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: '4px' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* User Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', padding: '16px', background: 'rgba(0, 0, 0, 0.3)', borderRadius: '8px' }}>
                            {selectedRequest.userId?.profilePicture ? (
                                <img src={selectedRequest.userId.profilePicture} alt="" style={{ width: '48px', height: '48px', borderRadius: '50%', border: '2px solid rgba(0, 255, 245, 0.3)' }} />
                            ) : (
                                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(0,255,245,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={24} color="#00fff5" />
                                </div>
                            )}
                            <div>
                                <div style={{ color: 'white', fontWeight: '600', fontSize: '16px' }}>{selectedRequest.userId?.name || 'Unknown User'}</div>
                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>{selectedRequest.userId?.email || 'No email'}</div>
                            </div>
                        </div>

                        {/* Details */}
                        <div style={{ marginBottom: '20px' }}>
                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Requested</div>
                            <div style={{ color: 'white', fontSize: '14px', marginBottom: '16px' }}>{new Date(selectedRequest.requestedAt).toLocaleString()}</div>

                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Current Usage</div>
                            <div style={{ color: 'white', fontSize: '14px', marginBottom: '16px' }}>
                                {selectedRequest.currentUsage?.tokenCount || 0} tokens • {selectedRequest.currentUsage?.requestCount || 0} requests
                            </div>

                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Reason</div>
                            <div style={{
                                color: 'white',
                                padding: '16px',
                                background: 'rgba(0,0,0,0.3)',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                fontSize: '14px',
                                lineHeight: '1.6',
                                marginBottom: '16px'
                            }}>
                                {selectedRequest.reason || 'No reason provided'}
                            </div>

                            {selectedRequest.adminResponse && (
                                <>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin Response</div>
                                    <div style={{
                                        padding: '16px',
                                        background: 'rgba(0,255,245,0.05)',
                                        borderRadius: '8px',
                                        borderLeft: '3px solid #00fff5',
                                        color: 'white',
                                        fontSize: '14px',
                                        marginBottom: '16px'
                                    }}>
                                        {selectedRequest.adminResponse}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Actions */}
                        {selectedRequest.status === 'pending' && (
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => handleApprove(selectedRequest._id)}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: 'linear-gradient(135deg, #4caf50, #45a049)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '14px',
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
                                    onClick={() => handleReject(selectedRequest._id)}
                                    style={{
                                        flex: 1,
                                        padding: '12px',
                                        background: 'linear-gradient(135deg, #f44336, #e53935)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        fontSize: '14px',
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
                    </div>
                </div>
            )}
        </div>
    );
}
