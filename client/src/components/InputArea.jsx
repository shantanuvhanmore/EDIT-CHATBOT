import React from 'react';
import { Send, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function InputArea({ input, setInput, sendMessage, isLoading, isSessionExhausted, tokensUsed, totalTokens, hasStarted }) {
    const progress = Math.min((tokensUsed / totalTokens) * 100, 100);
    const isNearLimit = progress > 90;

    // Hero Mode (before first message)
    if (!hasStarted) {
        return (
            <div style={{
                position: 'absolute',
                top: '40%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '75%',
                maxWidth: '550px',
                zIndex: 20,
                padding: '24px'
            }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Title - Anime Style */}
                    <h1 style={{
                        fontSize: '56px',
                        fontWeight: '800',
                        color: 'white',
                        textAlign: 'center',
                        marginBottom: '12px',
                        letterSpacing: '0.2em',
                        fontFamily: '"Orbitron", sans-serif',
                        textTransform: 'uppercase',
                        textShadow: '0 0 30px rgba(0, 255, 245, 0.4)'
                    }}>
                        <span style={{
                            color: '#00fff5',
                            textShadow: '0 0 40px rgba(0, 255, 245, 0.6), 0 0 80px rgba(0, 255, 245, 0.3)'
                        }}>AI</span>NIME
                    </h1>

                    {/* Subtitle */}
                    <p style={{
                        fontSize: '16px',
                        color: 'rgba(255, 255, 255, 0.6)',
                        textAlign: 'center',
                        marginBottom: '32px',
                        fontWeight: '300',
                        letterSpacing: '0.15em',
                        fontFamily: '"Rajdhani", sans-serif',
                        textTransform: 'uppercase'
                    }}>
                        Your anime & manga expert
                    </p>

                    {/* Search Input */}
                    <form onSubmit={sendMessage} style={{ position: 'relative' }}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about any anime..."
                            disabled={isLoading || isSessionExhausted}
                            style={{
                                width: '100%',
                                background: 'rgba(255, 255, 255, 0.08)',
                                backdropFilter: 'blur(20px)',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                color: 'white',
                                fontSize: '15px',
                                fontFamily: '"Outfit", sans-serif',
                                letterSpacing: '0.03em',
                                borderRadius: '50px',
                                padding: '18px 56px 18px 24px',
                                outline: 'none',
                                transition: 'all 0.3s',
                                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#00fff5';
                                e.target.style.boxShadow = '0 0 25px rgba(0, 255, 245, 0.2), inset 0 0 20px rgba(0, 255, 245, 0.05)';
                                e.target.style.background = 'rgba(255, 255, 255, 0.12)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                                e.target.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.2)';
                                e.target.style.background = 'rgba(255, 255, 255, 0.08)';
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
                                background: input.trim() ? 'linear-gradient(135deg, #00fff5, #00cccc)' : 'rgba(255, 255, 255, 0.1)',
                                color: input.trim() ? '#0f0c29' : 'rgba(255, 255, 255, 0.3)',
                                padding: '12px',
                                borderRadius: '50%',
                                border: 'none',
                                cursor: input.trim() ? 'pointer' : 'default',
                                transition: 'all 0.3s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: input.trim() ? '0 0 20px rgba(0, 255, 245, 0.4)' : 'none'
                            }}
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    // Chat Mode - Fixed at bottom of viewport
    return (
        <div style={{
            flexShrink: 0,
            padding: '8px 0 12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, transparent 100%)',
            paddingTop: '8px'
        }}>
            {/* Token Counter */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '11px',
                color: 'rgba(255, 255, 255, 0.5)',
                fontFamily: '"Rajdhani", monospace',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                background: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(10px)',
                padding: '8px 16px',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
                <Zap size={11} color={isNearLimit ? '#ef4444' : '#00fff5'} />
                <span>Tokens</span>
                <div style={{
                    width: '60px',
                    height: '3px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '2px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        background: isNearLimit ? '#ef4444' : 'linear-gradient(90deg, #00fff5, #00cccc)',
                        transition: 'width 0.5s',
                        boxShadow: isNearLimit ? '0 0 10px #ef4444' : '0 0 10px rgba(0, 255, 245, 0.5)'
                    }} />
                </div>
                <span style={{
                    color: isNearLimit ? '#ef4444' : 'rgba(255, 255, 255, 0.7)',
                    fontWeight: '600'
                }}>
                    {tokensUsed}/{totalTokens}
                </span>
            </div>

            {/* Input - Fixed width */}
            <form onSubmit={sendMessage} style={{
                position: 'relative',
                width: '75%',
                maxWidth: '600px'
            }}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Continue the conversation..."
                    disabled={isLoading || isSessionExhausted}
                    style={{
                        width: '100%',
                        background: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: 'white',
                        fontSize: '14px',
                        fontFamily: '"Outfit", sans-serif',
                        letterSpacing: '0.03em',
                        borderRadius: '50px',
                        padding: '16px 56px 16px 24px',
                        outline: 'none',
                        transition: 'all 0.3s',
                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4)'
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = '#00fff5';
                        e.target.style.boxShadow = '0 0 25px rgba(0, 255, 245, 0.2)';
                        e.target.style.background = 'rgba(0, 0, 0, 0.7)';
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                        e.target.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.4)';
                        e.target.style.background = 'rgba(0, 0, 0, 0.6)';
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
                        background: input.trim() ? 'linear-gradient(135deg, #00fff5, #00cccc)' : 'rgba(255, 255, 255, 0.1)',
                        color: input.trim() ? '#0f0c29' : 'rgba(255, 255, 255, 0.3)',
                        padding: '12px',
                        borderRadius: '50%',
                        border: 'none',
                        cursor: input.trim() ? 'pointer' : 'default',
                        transition: 'all 0.3s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: input.trim() ? '0 0 15px rgba(0, 255, 245, 0.4)' : 'none'
                    }}
                >
                    <Send size={16} />
                </button>
            </form>
        </div>
    );
}
