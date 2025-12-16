import React from 'react';
import { Send, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InputArea({ input, setInput, sendMessage, isLoading, isSessionExhausted, tokensUsed, totalTokens, hasStarted }) {
    const progress = Math.min((tokensUsed / totalTokens) * 100, 100);
    const isNearLimit = progress > 90;

    // Hero Mode (before first message) - Smaller, cleaner
    if (!hasStarted) {
        return (
            <div style={{
                position: 'absolute',
                top: '40%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '90%',
                maxWidth: '600px',
                zIndex: 20,
                padding: '24px'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Title */}
                    <h1 style={{
                        fontSize: '56px',
                        fontWeight: '900',
                        color: 'white',
                        textAlign: 'center',
                        marginBottom: '16px',
                        letterSpacing: '-0.02em'
                    }}>
                        <span style={{ color: '#00fff5' }}>AI</span>NIME
                    </h1>

                    {/* Subtitle */}
                    <p style={{
                        fontSize: '18px',
                        color: 'rgba(255, 255, 255, 0.6)',
                        textAlign: 'center',
                        marginBottom: '32px',
                        fontWeight: '300'
                    }}>
                        Your anime & manga expert
                    </p>

                    {/* Compact Input */}
                    <form onSubmit={sendMessage} style={{ position: 'relative' }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about any anime..."
                            disabled={isLoading || isSessionExhausted}
                            style={{
                                width: '100%',
                                background: 'rgba(0, 0, 0, 0.5)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                fontSize: '16px',
                                borderRadius: '12px',
                                padding: '16px 60px 16px 20px',
                                outline: 'none',
                                transition: 'all 0.3s'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#00fff5';
                                e.target.style.boxShadow = '0 0 20px rgba(0, 255, 245, 0.2)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                                e.target.style.boxShadow = 'none';
                            }}
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading || isSessionExhausted}
                            style={{
                                position: 'absolute',
                                right: '8px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: '#00fff5',
                                color: '#0f0c29',
                                padding: '10px',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: input.trim() ? 'pointer' : 'not-allowed',
                                opacity: input.trim() ? 1 : 0.3,
                                transition: 'all 0.3s'
                            }}
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    // Chat Mode - Compact bottom bar
    return (
        <div style={{
            position: 'relative',
            zIndex: 30,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(30px)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
            {/* Progress Bar */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '2px',
                background: 'rgba(255, 255, 255, 0.05)'
            }}>
                <div style={{
                    height: '100%',
                    width: `${progress}%`,
                    background: isNearLimit ? '#ef4444' : '#00fff5',
                    transition: 'width 0.5s'
                }} />
            </div>

            {/* Token Counter - Compact */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.5)',
                padding: '8px 20px 6px',
                fontFamily: 'monospace'
            }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={12} color={isNearLimit ? '#ef4444' : '#00fff5'} />
                    Tokens
                </span>
                <span style={{ color: isNearLimit ? '#ef4444' : 'rgba(255, 255, 255, 0.7)' }}>
                    {tokensUsed} / {totalTokens}
                </span>
            </div>

            {/* Compact Input */}
            <div style={{ padding: '0 20px 16px' }}>
                <form onSubmit={sendMessage} style={{ position: 'relative' }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Continue the conversation..."
                        disabled={isLoading || isSessionExhausted}
                        style={{
                            width: '100%',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            color: 'white',
                            fontSize: '15px',
                            borderRadius: '10px',
                            padding: '14px 60px 14px 16px',
                            outline: 'none',
                            transition: 'all 0.3s'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#00fff5';
                            e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                            e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                        }}
                        autoFocus
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading || isSessionExhausted}
                        style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: '#00fff5',
                            color: '#0f0c29',
                            padding: '10px',
                            borderRadius: '8px',
                            border: 'none',
                            cursor: input.trim() ? 'pointer' : 'not-allowed',
                            opacity: input.trim() ? 1 : 0.3,
                            transition: 'all 0.3s'
                        }}
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
}
