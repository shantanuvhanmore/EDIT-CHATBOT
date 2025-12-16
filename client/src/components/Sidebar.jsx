import React from 'react';
import { MessageSquare, Trash2, X, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ isOpen, onClose, resetSession, onChangeBackground }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
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
                            background: 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(4px)',
                            zIndex: 40
                        }}
                    />

                    {/* Sidebar Panel */}
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
                            width: '280px',
                            background: 'rgba(15, 12, 41, 0.95)',
                            backdropFilter: 'blur(20px)',
                            borderRight: '1px solid rgba(255, 255, 255, 0.1)',
                            zIndex: 50,
                            padding: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 0 60px rgba(0, 0, 0, 0.5)',
                            fontFamily: '"Outfit", sans-serif'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '32px'
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

                        {/* Chat History Section */}
                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            <div style={{
                                fontSize: '11px',
                                color: 'rgba(255, 255, 255, 0.4)',
                                fontFamily: '"Rajdhani", sans-serif',
                                marginBottom: '12px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.2em',
                                fontWeight: '600'
                            }}>
                                Chat History
                            </div>

                            {/* Current Session */}
                            <div style={{
                                padding: '14px 16px',
                                background: 'rgba(0, 255, 245, 0.08)',
                                borderRadius: '12px',
                                border: '1px solid rgba(0, 255, 245, 0.2)',
                                fontSize: '14px',
                                color: 'white',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginBottom: '8px'
                            }}>
                                <MessageSquare size={16} color="#00fff5" />
                                <span style={{ fontWeight: '500' }}>Current Session</span>
                            </div>

                            {/* Previous Sessions Placeholder */}
                            <div style={{
                                fontSize: '12px',
                                color: 'rgba(255, 255, 255, 0.3)',
                                marginTop: '16px',
                                fontStyle: 'italic'
                            }}>
                                No previous sessions
                            </div>
                        </div>

                        {/* Bottom Actions */}
                        <div style={{
                            marginTop: 'auto',
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
                                        padding: '14px',
                                        background: 'rgba(0, 255, 245, 0.1)',
                                        border: '1px solid rgba(0, 255, 245, 0.3)',
                                        color: '#00fff5',
                                        borderRadius: '12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        fontFamily: '"Rajdhani", sans-serif',
                                        letterSpacing: '0.1em',
                                        textTransform: 'uppercase'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(0, 255, 245, 0.2)';
                                        e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 245, 0.2)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(0, 255, 245, 0.1)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <Video size={16} />
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
                                    padding: '14px',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    color: '#ef4444',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    fontFamily: '"Rajdhani", sans-serif',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                    e.currentTarget.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <Trash2 size={16} />
                                <span>Reset Session</span>
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
