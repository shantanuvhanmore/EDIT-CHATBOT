import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Download, TrendingUp, Users, MessageSquare, ThumbsUp, ThumbsDown, Eye, Trash2, UserCog } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('analytics');
    const [loading, setLoading] = useState(false);

    // Analytics state
    const [overview, setOverview] = useState(null);
    const [feedbackTrends, setFeedbackTrends] = useState([]);
    const [userActivity, setUserActivity] = useState([]);

    // Conversations state
    const [conversations, setConversations] = useState([]);
    const [conversationFilters, setConversationFilters] = useState({
        startDate: '',
        endDate: '',
        minMessages: '',
        maxMessages: ''
    });
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [conversationPreview, setConversationPreview] = useState([]);

    // Users state
    const [users, setUsers] = useState([]);
    const [userFilters, setUserFilters] = useState({
        role: 'all',
        activeFilter: 'all'
    });
    const [selectedUser, setSelectedUser] = useState(null);
    const [userConversations, setUserConversations] = useState([]);

    const API_BASE = 'http://localhost:3000';

    useEffect(() => {
        if (activeTab === 'analytics') {
            fetchAnalytics();
        } else if (activeTab === 'conversations') {
            fetchConversations();
        } else if (activeTab === 'users') {
            fetchUsers();
        }
    }, [activeTab]);

    useEffect(() => {
        if (activeTab === 'conversations') {
            fetchConversations();
        }
    }, [conversationFilters]);

    useEffect(() => {
        if (activeTab === 'users') {
            fetchUsers();
        }
    }, [userFilters]);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const [overviewRes, trendsRes, activityRes] = await Promise.all([
                fetch(`${API_BASE}/api/admin/analytics/overview`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_BASE}/api/admin/analytics/feedback-trends`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                }),
                fetch(`${API_BASE}/api/admin/analytics/user-activity`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ]);

            if (overviewRes.ok) setOverview(await overviewRes.json());
            if (trendsRes.ok) setFeedbackTrends(await trendsRes.json());
            if (activityRes.ok) setUserActivity(await activityRes.json());
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchConversations = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            Object.entries(conversationFilters).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            const res = await fetch(`${API_BASE}/api/admin/conversations?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setConversations(data);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchConversationPreview = async (conversationId) => {
        try {
            const res = await fetch(`${API_BASE}/api/admin/conversations/${conversationId}/preview`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setConversationPreview(data);
                setSelectedConversation(conversationId);
            }
        } catch (error) {
            console.error('Error fetching conversation preview:', error);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            Object.entries(userFilters).forEach(([key, value]) => {
                if (value && value !== 'all') params.append(key, value);
            });

            const res = await fetch(`${API_BASE}/api/admin/users?${params}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchUserConversations = async (userId) => {
        try {
            const res = await fetch(`${API_BASE}/api/admin/users/${userId}/conversations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setUserConversations(data);
                setSelectedUser(userId);
            }
        } catch (error) {
            console.error('Error fetching user conversations:', error);
        }
    };

    const deleteConversation = async (id) => {
        if (!confirm('Are you sure you want to delete this conversation?')) return;

        try {
            const res = await fetch(`${API_BASE}/api/admin/conversations/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchConversations();
            }
        } catch (error) {
            console.error('Error deleting conversation:', error);
        }
    };

    const deleteUser = async (id) => {
        if (!confirm('Are you sure you want to delete this user and all their data?')) return;

        try {
            const res = await fetch(`${API_BASE}/api/admin/users/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    const updateUserRole = async (userId, newRole) => {
        try {
            const res = await fetch(`${API_BASE}/api/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role: newRole })
            });
            if (res.ok) {
                fetchUsers();
            }
        } catch (error) {
            console.error('Error updating user role:', error);
        }
    };

    const exportData = (data, filename) => {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div style={{
            height: '100vh',
            background: '#0f0c29',
            color: 'white',
            fontFamily: '"Outfit", sans-serif',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                maxWidth: '1600px',
                width: '100%',
                margin: '0 auto',
                padding: '20px 24px',
                flexShrink: 0
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    marginBottom: '16px'
                }}>
                    <button
                        onClick={() => navigate('/')}
                        style={{
                            background: 'rgba(0, 255, 245, 0.1)',
                            border: '1px solid rgba(0, 255, 245, 0.3)',
                            color: '#00fff5',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            flexShrink: 0
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0, 255, 245, 0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0, 255, 245, 0.1)'}
                    >
                        <ArrowLeft size={16} />
                        Back to Chat
                    </button>

                    <h1 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        letterSpacing: '0.1em',
                        fontFamily: '"Orbitron", sans-serif',
                        margin: 0
                    }}>
                        <span style={{ color: '#00fff5' }}>ADMIN</span> DASHBOARD
                    </h1>
                </div>
            </div>

            {/* Tabs */}
            <div style={{
                maxWidth: '1600px',
                width: '100%',
                margin: '0 auto',
                padding: '0 24px',
                display: 'flex',
                gap: '12px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                paddingBottom: '12px',
                flexShrink: 0
            }}>
                {[
                    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
                    { id: 'conversations', label: 'Conversations', icon: MessageSquare },
                    { id: 'users', label: 'Users', icon: Users }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            background: activeTab === tab.id ? 'rgba(0, 255, 245, 0.1)' : 'transparent',
                            border: activeTab === tab.id ? '1px solid rgba(0, 255, 245, 0.3)' : '1px solid transparent',
                            color: activeTab === tab.id ? '#00fff5' : 'rgba(255, 255, 255, 0.6)',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content - Scrollable */}
            <div style={{
                flex: 1,
                overflow: 'auto',
                padding: '24px'
            }}>
                <div style={{
                    maxWidth: '1600px',
                    margin: '0 auto'
                }}>
                    {activeTab === 'analytics' && (
                        <AnalyticsTab
                            overview={overview}
                            feedbackTrends={feedbackTrends}
                            userActivity={userActivity}
                            loading={loading}
                        />
                    )}
                    {activeTab === 'conversations' && (
                        <ConversationsTab
                            conversations={conversations}
                            loading={loading}
                            filters={conversationFilters}
                            setFilters={setConversationFilters}
                            onDelete={deleteConversation}
                            onViewPreview={fetchConversationPreview}
                            selectedConversation={selectedConversation}
                            conversationPreview={conversationPreview}
                            onClosePreview={() => setSelectedConversation(null)}
                            onExport={() => exportData(conversations, 'conversations')}
                        />
                    )}
                    {activeTab === 'users' && (
                        <UsersTab
                            users={users}
                            loading={loading}
                            filters={userFilters}
                            setFilters={setUserFilters}
                            onDelete={deleteUser}
                            onUpdateRole={updateUserRole}
                            onViewConversations={fetchUserConversations}
                            selectedUser={selectedUser}
                            userConversations={userConversations}
                            onCloseUserView={() => setSelectedUser(null)}
                            onExport={() => exportData(users, 'users')}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

// ==================== ANALYTICS TAB ====================

function AnalyticsTab({ overview, feedbackTrends, userActivity, loading }) {
    if (loading || !overview) {
        return <div style={{ textAlign: 'center', padding: '40px', color: '#00fff5' }}>Loading analytics...</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Metrics Cards - Smaller */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px'
            }}>
                <MetricCard
                    icon={Users}
                    label="Total Users"
                    value={overview.totalUsers}
                    color="#00fff5"
                />
                <MetricCard
                    icon={MessageSquare}
                    label="Total Conversations"
                    value={overview.totalConversations}
                    color="#ff007a"
                />
                <MetricCard
                    icon={MessageSquare}
                    label="Total Messages"
                    value={overview.totalMessages}
                    color="#7c3aed"
                />
                <MetricCard
                    icon={TrendingUp}
                    label="Active Users (7d)"
                    value={overview.activeUsers}
                    color="#4ade80"
                />
                <MetricCard
                    icon={ThumbsUp}
                    label="Liked Messages"
                    value={overview.feedbackStats.liked}
                    color="#4ade80"
                />
                <MetricCard
                    icon={ThumbsDown}
                    label="Disliked Messages"
                    value={overview.feedbackStats.disliked}
                    color="#f87171"
                />
                <MetricCard
                    icon={TrendingUp}
                    label="Avg Messages/Conv"
                    value={overview.avgMessagesPerConversation}
                    color="#00fff5"
                />
                <MetricCard
                    icon={TrendingUp}
                    label="Feedback Ratio"
                    value={`${overview.feedbackStats.feedbackRatio}%`}
                    color="#ff007a"
                />
            </div>

            {/* Charts - Side by Side */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '16px'
            }}>
                {/* Messages Per Day Chart */}
                <ChartCard title="Messages Per Day (Last 30 Days)">
                    <SimpleBarChart data={userActivity} />
                </ChartCard>

                {/* Feedback Distribution */}
                <ChartCard title="Feedback Distribution">
                    <FeedbackPieChart
                        liked={overview.feedbackStats.liked}
                        disliked={overview.feedbackStats.disliked}
                        noFeedback={overview.feedbackStats.noFeedback}
                    />
                </ChartCard>
            </div>
        </div>
    );
}

function MetricCard({ icon: Icon, label, value, color }) {
    return (
        <div style={{
            background: 'rgba(20, 20, 40, 0.6)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
        }}>
            <div style={{
                background: `${color}20`,
                borderRadius: '8px',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Icon size={18} style={{ color }} />
            </div>
            <div>
                <div style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '10px', marginBottom: '2px' }}>
                    {label}
                </div>
                <div style={{ fontSize: '20px', fontWeight: '700', color }}>
                    {value}
                </div>
            </div>
        </div>
    );
}

function ChartCard({ title, children }) {
    return (
        <div style={{
            background: 'rgba(20, 20, 40, 0.6)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '16px'
        }}>
            <h3 style={{ color: '#00fff5', marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>{title}</h3>
            {children}
        </div>
    );
}

function SimpleBarChart({ data }) {
    if (!data || data.length === 0) {
        return <div style={{ color: 'rgba(255, 255, 255, 0.4)', textAlign: 'center', padding: '20px' }}>No data available</div>;
    }

    const maxCount = Math.max(...data.map(d => d.count));

    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '150px' }}>
            {data.map((item, idx) => (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{
                        width: '100%',
                        height: `${(item.count / maxCount) * 130}px`,
                        background: 'linear-gradient(180deg, #00fff5, #7c3aed)',
                        borderRadius: '3px 3px 0 0',
                        position: 'relative'
                    }}>
                        <div style={{
                            position: 'absolute',
                            top: '-18px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            fontSize: '9px',
                            color: '#00fff5',
                            fontWeight: '600'
                        }}>
                            {item.count}
                        </div>
                    </div>
                    <div style={{ fontSize: '8px', color: 'rgba(255, 255, 255, 0.5)', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>
                        {item._id.split('-').slice(1).join('/')}
                    </div>
                </div>
            ))}
        </div>
    );
}

function FeedbackPieChart({ liked, disliked, noFeedback }) {
    const total = liked + disliked + noFeedback;
    if (total === 0) {
        return <div style={{ color: 'rgba(255, 255, 255, 0.4)', textAlign: 'center', padding: '20px' }}>No feedback data</div>;
    }

    const likedPercent = ((liked / total) * 100).toFixed(1);
    const dislikedPercent = ((disliked / total) * 100).toFixed(1);
    const noFeedbackPercent = ((noFeedback / total) * 100).toFixed(1);

    return (
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: `conic-gradient(
                    #4ade80 0% ${likedPercent}%,
                    #f87171 ${likedPercent}% ${parseFloat(likedPercent) + parseFloat(dislikedPercent)}%,
                    rgba(255, 255, 255, 0.2) ${parseFloat(likedPercent) + parseFloat(dislikedPercent)}% 100%
                )`
            }} />
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ width: '10px', height: '10px', background: '#4ade80', borderRadius: '2px' }} />
                    <span style={{ fontSize: '12px' }}>Liked: {likedPercent}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ width: '10px', height: '10px', background: '#f87171', borderRadius: '2px' }} />
                    <span style={{ fontSize: '12px' }}>Disliked: {dislikedPercent}%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '2px' }} />
                    <span style={{ fontSize: '12px' }}>No Feedback: {noFeedbackPercent}%</span>
                </div>
            </div>
        </div>
    );
}

// ==================== CONVERSATIONS TAB ====================

function ConversationsTab({ conversations, loading, filters, setFilters, onDelete, onViewPreview, selectedConversation, conversationPreview, onClosePreview, onExport }) {
    return (
        <div>
            {/* Filters */}
            <div style={{
                background: 'rgba(20, 20, 40, 0.6)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '20px',
                marginBottom: '16px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ color: '#00fff5', fontSize: '16px' }}>Filters</h3>
                    <button
                        onClick={onExport}
                        style={{
                            background: 'rgba(0, 255, 245, 0.1)',
                            border: '1px solid rgba(0, 255, 245, 0.3)',
                            color: '#00fff5',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <Download size={14} />
                        Export
                    </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <input
                        type="date"
                        placeholder="Start Date"
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        style={inputStyle}
                    />
                    <input
                        type="date"
                        placeholder="End Date"
                        value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        style={inputStyle}
                    />
                    <input
                        type="number"
                        placeholder="Min Messages"
                        value={filters.minMessages}
                        onChange={(e) => setFilters({ ...filters, minMessages: e.target.value })}
                        style={inputStyle}
                    />
                    <input
                        type="number"
                        placeholder="Max Messages"
                        value={filters.maxMessages}
                        onChange={(e) => setFilters({ ...filters, maxMessages: e.target.value })}
                        style={inputStyle}
                    />
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#00fff5' }}>Loading...</div>
            ) : (
                <div style={{
                    background: 'rgba(20, 20, 40, 0.6)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden'
                }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{
                                    background: 'rgba(0, 255, 245, 0.05)',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                                }}>
                                    <th style={tableHeaderStyle}>User</th>
                                    <th style={tableHeaderStyle}>Title</th>
                                    <th style={tableHeaderStyle}>Messages</th>
                                    <th style={tableHeaderStyle}>Created</th>
                                    <th style={tableHeaderStyle}>Last Activity</th>
                                    <th style={tableHeaderStyle}>Duration</th>
                                    <th style={tableHeaderStyle}>👍 Liked</th>
                                    <th style={tableHeaderStyle}>👎 Disliked</th>
                                    <th style={tableHeaderStyle}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {conversations.map((conv) => (
                                    <tr key={conv._id} style={{
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                        transition: 'background 0.2s'
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={tableCellStyle}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <img
                                                    src={conv.user.profilePicture}
                                                    alt={conv.user.name}
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        border: '2px solid #00fff5'
                                                    }}
                                                />
                                                <div>
                                                    <div style={{ fontSize: '14px' }}>{conv.user.name}</div>
                                                    <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>
                                                        {conv.user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={tableCellStyle}>{conv.title}</td>
                                        <td style={tableCellStyle}>
                                            <span style={{
                                                background: 'rgba(0, 255, 245, 0.2)',
                                                color: '#00fff5',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                fontWeight: '600'
                                            }}>
                                                {conv.messageCount}
                                            </span>
                                        </td>
                                        <td style={tableCellStyle}>{new Date(conv.createdAt).toLocaleDateString()}</td>
                                        <td style={tableCellStyle}>
                                            {conv.lastActivity ? new Date(conv.lastActivity).toLocaleString() : 'N/A'}
                                        </td>
                                        <td style={tableCellStyle}>
                                            {conv.duration ? formatDuration(conv.duration) : 'N/A'}
                                        </td>
                                        <td style={{ ...tableCellStyle, color: '#4ade80' }}>{conv.feedbackStats.liked}</td>
                                        <td style={{ ...tableCellStyle, color: '#f87171' }}>{conv.feedbackStats.disliked}</td>
                                        <td style={tableCellStyle}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => onViewPreview(conv._id)}
                                                    style={actionButtonStyle}
                                                    title="View Preview"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(conv._id)}
                                                    style={{ ...actionButtonStyle, borderColor: 'rgba(248, 113, 113, 0.3)' }}
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} style={{ color: '#f87171' }} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {conversations.length === 0 && (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.4)' }}>
                            No conversations found
                        </div>
                    )}
                </div>
            )}

            {/* Preview Modal */}
            {selectedConversation && (
                <Modal onClose={onClosePreview} title="Conversation Preview">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {conversationPreview.map((msg, idx) => (
                            <div key={idx} style={{
                                background: msg.sender === 'user' ? 'rgba(255, 0, 122, 0.1)' : 'rgba(0, 255, 245, 0.1)',
                                border: `1px solid ${msg.sender === 'user' ? 'rgba(255, 0, 122, 0.3)' : 'rgba(0, 255, 245, 0.3)'}`,
                                borderRadius: '8px',
                                padding: '12px'
                            }}>
                                <div style={{
                                    fontSize: '11px',
                                    color: msg.sender === 'user' ? '#ff007a' : '#00fff5',
                                    marginBottom: '6px',
                                    fontWeight: '600',
                                    textTransform: 'uppercase'
                                }}>
                                    {msg.sender}
                                </div>
                                <div style={{ fontSize: '14px', lineHeight: '1.5' }}>{msg.content}</div>
                            </div>
                        ))}
                        {conversationPreview.length === 0 && (
                            <div style={{ color: 'rgba(255, 255, 255, 0.4)', textAlign: 'center', padding: '20px' }}>
                                No messages in this conversation
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
}

// ==================== USERS TAB ====================

function UsersTab({ users, loading, filters, setFilters, onDelete, onUpdateRole, onViewConversations, selectedUser, userConversations, onCloseUserView, onExport }) {
    return (
        <div>
            {/* Filters */}
            <div style={{
                background: 'rgba(20, 20, 40, 0.6)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '20px',
                marginBottom: '16px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ color: '#00fff5', fontSize: '16px' }}>Filters</h3>
                    <button
                        onClick={onExport}
                        style={{
                            background: 'rgba(0, 255, 245, 0.1)',
                            border: '1px solid rgba(0, 255, 245, 0.3)',
                            color: '#00fff5',
                            padding: '8px 16px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <Download size={14} />
                        Export
                    </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                    <select
                        value={filters.role}
                        onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                        style={inputStyle}
                    >
                        <option value="all">All Roles</option>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                    <select
                        value={filters.activeFilter}
                        onChange={(e) => setFilters({ ...filters, activeFilter: e.target.value })}
                        style={inputStyle}
                    >
                        <option value="all">All Activity</option>
                        <option value="active">Active (Last 7 Days)</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#00fff5' }}>Loading...</div>
            ) : (
                <div style={{
                    background: 'rgba(20, 20, 40, 0.6)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    overflow: 'hidden'
                }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{
                                    background: 'rgba(0, 255, 245, 0.05)',
                                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                                }}>
                                    <th style={tableHeaderStyle}>User</th>
                                    <th style={tableHeaderStyle}>Email</th>
                                    <th style={tableHeaderStyle}>Role</th>
                                    <th style={tableHeaderStyle}>Conversations</th>
                                    <th style={tableHeaderStyle}>Messages</th>
                                    <th style={tableHeaderStyle}>Last Active</th>
                                    <th style={tableHeaderStyle}>Joined</th>
                                    <th style={tableHeaderStyle}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id} style={{
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                        transition: 'background 0.2s'
                                    }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <td style={tableCellStyle}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <img
                                                    src={user.profilePicture}
                                                    alt={user.name}
                                                    style={{
                                                        width: '32px',
                                                        height: '32px',
                                                        borderRadius: '50%',
                                                        border: '2px solid #00fff5'
                                                    }}
                                                />
                                                <span>{user.name}</span>
                                            </div>
                                        </td>
                                        <td style={tableCellStyle}>{user.email}</td>
                                        <td style={tableCellStyle}>
                                            <select
                                                value={user.role}
                                                onChange={(e) => onUpdateRole(user._id, e.target.value)}
                                                style={{
                                                    background: user.role === 'admin' ? 'rgba(255, 0, 122, 0.2)' : 'rgba(0, 255, 245, 0.2)',
                                                    color: user.role === 'admin' ? '#ff007a' : '#00fff5',
                                                    border: `1px solid ${user.role === 'admin' ? 'rgba(255, 0, 122, 0.3)' : 'rgba(0, 255, 245, 0.3)'}`,
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    fontWeight: '600',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="user">User</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td style={tableCellStyle}>{user.totalConversations}</td>
                                        <td style={tableCellStyle}>{user.totalMessages}</td>
                                        <td style={tableCellStyle}>
                                            {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td style={tableCellStyle}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td style={tableCellStyle}>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    onClick={() => onViewConversations(user._id)}
                                                    style={actionButtonStyle}
                                                    title="View Conversations"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                                <button
                                                    onClick={() => onDelete(user._id)}
                                                    style={{ ...actionButtonStyle, borderColor: 'rgba(248, 113, 113, 0.3)' }}
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={14} style={{ color: '#f87171' }} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {users.length === 0 && (
                        <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255, 255, 255, 0.4)' }}>
                            No users found
                        </div>
                    )}
                </div>
            )}

            {/* User Conversations Modal */}
            {selectedUser && (
                <Modal onClose={onCloseUserView} title="User's Conversations">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {userConversations.map((conv) => (
                            <div key={conv._id} style={{
                                background: 'rgba(0, 255, 245, 0.1)',
                                border: '1px solid rgba(0, 255, 245, 0.3)',
                                borderRadius: '8px',
                                padding: '12px'
                            }}>
                                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                                    {conv.title}
                                </div>
                                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                                    Created: {new Date(conv.createdAt).toLocaleString()}
                                </div>
                            </div>
                        ))}
                        {userConversations.length === 0 && (
                            <div style={{ color: 'rgba(255, 255, 255, 0.4)', textAlign: 'center', padding: '20px' }}>
                                No conversations found
                            </div>
                        )}
                    </div>
                </Modal>
            )}
        </div>
    );
}

// ==================== SHARED COMPONENTS ====================

function Modal({ onClose, title, children }) {
    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }} onClick={onClose}>
            <div style={{
                background: '#0f0c29',
                border: '1px solid rgba(0, 255, 245, 0.3)',
                borderRadius: '12px',
                padding: '24px',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto'
            }} onClick={(e) => e.stopPropagation()}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <h3 style={{ color: '#00fff5', fontSize: '18px' }}>{title}</h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontSize: '24px',
                            cursor: 'pointer',
                            padding: '0',
                            lineHeight: '1'
                        }}
                    >
                        ×
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

// ==================== STYLES ====================

const tableHeaderStyle = {
    padding: '16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#00fff5',
    textTransform: 'uppercase',
    letterSpacing: '0.1em'
};

const tableCellStyle = {
    padding: '16px',
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.9)'
};

const inputStyle = {
    background: 'rgba(20, 20, 40, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: 'white',
    padding: '10px 12px',
    borderRadius: '6px',
    fontSize: '14px',
    outline: 'none'
};

const actionButtonStyle = {
    background: 'rgba(0, 255, 245, 0.1)',
    border: '1px solid rgba(0, 255, 245, 0.3)',
    color: '#00fff5',
    padding: '6px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s'
};

// ==================== UTILITY FUNCTIONS ====================

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m`;
    return `${seconds}s`;
}
