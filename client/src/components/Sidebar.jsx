import React from 'react';
import { MessageSquare, Trash2, X, Video, Settings, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar({
    isOpen,
    onClose,
    resetSession,
    onChangeBackground,
    conversations = [],
    currentConversationId,
    onSelectConversation,
    onDeleteConversation,
    onNewChat
}) {
    const { user, logout, isAdmin } = useAuth();

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop - Transparent (no blur) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'transparent',
                            zIndex: 40
                        }}
                    />

                    {/* Sidebar Panel with Light Blur (not blue) */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{
                            position: 'fixed',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: '320px',
                            background: 'rgba(0, 0, 0, 0.5)',
                            backdropFilter: 'blur(20px)',
                            borderRight: '1px solid rgba(0, 255, 245, 0.2)',
                            zIndex: 50,
                            padding: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                            fontFamily: '"Outfit", sans-serif'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '24px'
                        }}>
                            <h2 style={{
                                fontSize: '22px',
                                fontWeight: '700',
                                color: 'white',
                                letterSpacing: '0.15em',
                                fontFamily: '"Orbitron", sans-serif',
                                textTransform: 'uppercase'
                            }}>
                                <span style={{ color: '#00fff5' }}>AI</span>NIME
                            </h2>
                            <button
                                onClick={onClose}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'rgba(255, 255, 255, 0.5)',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#00fff5'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* New Chat Button */}
                        {onNewChat && (
                            <button
                                onClick={() => { onNewChat(); onClose(); }}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    padding: '14px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    backdropFilter: 'blur(10px)',
                                    border: '1px solid rgba(0, 255, 245, 0.3)',
                                    color: '#00fff5',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    fontFamily: '"Rajdhani", sans-serif',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase',
                                    marginBottom: '24px'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                    e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 245, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <span style={{ fontSize: '18px' }}>+</span>
                                <span>New Chat</span>
                            </button>
                        )}

                        {/* Chat History Section with Drawer */}
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: 0
                        }}>
                            <div style={{
                                fontSize: '11px',
                                color: 'rgba(255, 255, 255, 0.4)',
                                fontFamily: '"Rajdhani", sans-serif',
                                marginBottom: '12px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.2em',
                                fontWeight: '600'
                            }}>
                                Your Chats
                            </div>

                            {/* Scrollable Conversations Drawer */}
                            <div style={{
                                flex: 1,
                                overflowY: 'auto',
                                overflowX: 'hidden',
                                minHeight: 0,
                                paddingRight: '4px',
                                // Custom scrollbar
                                scrollbarWidth: 'thin',
                                scrollbarColor: 'rgba(0, 255, 245, 0.3) rgba(255, 255, 255, 0.05)'
                            }}>
                                {conversations.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {conversations.map((conversation) => {
                                            const isActive = conversation._id === currentConversationId;
                                            return (
                                                <div
                                                    key={conversation._id}
                                                    style={{
                                                        padding: '12px 14px',
                                                        background: isActive
                                                            ? 'rgba(255, 255, 255, 0.1)'
                                                            : 'rgba(255, 255, 255, 0.03)',
                                                        backdropFilter: 'blur(10px)',
                                                        borderRadius: '10px',
                                                        border: isActive
                                                            ? '1px solid rgba(0, 255, 245, 0.2)'
                                                            : '1px solid rgba(255, 255, 255, 0.05)',
                                                        fontSize: '13px',
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '10px',
                                                        position: 'relative'
                                                    }}
                                                    onClick={() => onSelectConversation(conversation._id)}
                                                    onMouseEnter={(e) => {
                                                        if (!isActive) {
                                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!isActive) {
                                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                                                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                                                        }
                                                    }}
                                                >
                                                    <MessageSquare
                                                        size={14}
                                                        color={isActive ? '#00fff5' : 'rgba(255, 255, 255, 0.5)'}
                                                    />
                                                    <span style={{
                                                        fontWeight: '500',
                                                        flex: 1,
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}>
                                                        {conversation.title}
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDeleteConversation(conversation._id);
                                                        }}
                                                        style={{
                                                            background: 'transparent',
                                                            border: 'none',
                                                            color: 'rgba(255, 255, 255, 0.3)',
                                                            cursor: 'pointer',
                                                            padding: '4px',
                                                            borderRadius: '4px',
                                                            transition: 'all 0.2s',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.color = '#ef4444';
                                                            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.3)';
                                                            e.currentTarget.style.background = 'transparent';
                                                        }}
                                                    >
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div style={{
                                        fontSize: '12px',
                                        color: 'rgba(255, 255, 255, 0.3)',
                                        marginTop: '16px',
                                        fontStyle: 'italic',
                                        textAlign: 'center'
                                    }}>
                                        No saved conversations
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Bottom Actions */}
                        <div style={{
                            marginTop: '20px',
                            paddingTop: '20px',
                            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '10px'
                        }}>
                            {/* Change Background Button */}
                            {onChangeBackground && (
                                <button
                                    onClick={() => { onChangeBackground(); }}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        padding: '12px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(0, 255, 245, 0.2)',
                                        color: '#00fff5',
                                        borderRadius: '10px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        fontFamily: '"Rajdhani", sans-serif',
                                        letterSpacing: '0.05em',
                                        textTransform: 'uppercase'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                    }}
                                >
                                    <Video size={14} />
                                    <span>Change Background</span>
                                </button>
                            )}

                            {/* Reset Session Button */}
                            <button
                                onClick={() => { resetSession(); onClose(); }}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    padding: '12px',
                                    background: 'rgba(239, 68, 68, 0.05)',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    color: '#ef4444',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    fontFamily: '"Rajdhani", sans-serif',
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
                                }}
                            >
                                <Trash2 size={14} />
                                <span>Reset Session</span>
                            </button>
                        </div>

                        {/* Account Section */}
                        {user && (
                            <div style={{
                                marginTop: '16px',
                                paddingTop: '16px',
                                borderTop: '1px solid rgba(255, 255, 255, 0.08)'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    backdropFilter: 'blur(10px)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(0, 255, 245, 0.1)'
                                }}>
                                    <img
                                        src={user.profilePicture}
                                        alt={user.name}
                                        style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            border: '2px solid #00fff5'
                                        }}
                                    />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{
                                            color: 'white',
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {user.name}
                                        </div>
                                        <div style={{
                                            color: 'rgba(255, 255, 255, 0.5)',
                                            fontSize: '11px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {user.email}
                                        </div>
                                        {user.isAdmin && (
                                            <div style={{
                                                color: '#00fff5',
                                                fontSize: '10px',
                                                fontWeight: '600',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em',
                                                marginTop: '2px'
                                            }}>
                                                Admin
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button
                                            onClick={logout}
                                            style={{
                                                background: 'transparent',
                                                border: 'none',
                                                color: 'rgba(255, 255, 255, 0.5)',
                                                cursor: 'pointer',
                                                padding: '6px',
                                                borderRadius: '6px',
                                                transition: 'all 0.2s',
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}
                                            title="Logout"
                                            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                                            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'}
                                        >
                                            <LogOut size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Admin Dashboard Link */}
                                {isAdmin && (
                                    <a
                                        href="/admin/dashboard"
                                        style={{
                                            display: 'block',
                                            marginTop: '8px',
                                            padding: '10px',
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            backdropFilter: 'blur(10px)',
                                            border: '1px solid rgba(0, 255, 245, 0.2)',
                                            borderRadius: '8px',
                                            color: '#00fff5',
                                            textDecoration: 'none',
                                            fontSize: '12px',
                                            fontWeight: '600',
                                            textAlign: 'center',
                                            transition: 'all 0.2s',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                                    >
                                        ⚙️ Admin Dashboard
                                    </a>
                                )}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
