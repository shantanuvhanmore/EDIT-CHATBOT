// Responsive hook
function useIsMobile() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    React.useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return isMobile;
}

export default function InputArea({ input, setInput, sendMessage, isLoading, isSessionExhausted, tokensUsed, totalTokens, hasStarted }) {
    const progress = Math.min((tokensUsed / totalTokens) * 100, 100);
    const isNearLimit = progress > 90;
    const isMobile = useIsMobile();

    // Hero Mode (before first message)
    if (!hasStarted) {
        return (
            <div style={{
                position: 'absolute',
                top: '40%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: isMobile ? '90%' : '75%',
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
                        fontSize: isMobile ? '40px' : '56px',
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
                        fontSize: isMobile ? '14px' : '16px',
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
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    sendMessage(e);
                                }
                            }}
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
                                borderRadius: '24px',
                                padding: '18px 56px 18px 24px',
                                outline: 'none',
                                transition: 'all 0.3s',
                                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
                                resize: 'none',
                                minHeight: '56px',
                                maxHeight: '150px',
                                overflowY: 'auto'
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
                            rows={1}
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
            paddingBottom: 'calc(12px + env(safe-area-inset-bottom))', // Safe area for mobile
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 100%)', // Darker background for visibility
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
                padding: '4px 12px',
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
                <Zap size={10} color={isNearLimit ? '#ef4444' : '#00fff5'} />
                <span>Tokens</span>
                <div style={{
                    width: '40px', // Smaller on mobile
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

            {/* Request Tokens Button - Show when exhausted */}
            {isSessionExhausted && (
                <button
                    onClick={() => window.dispatchEvent(new CustomEvent('openTokenRequest'))}
                    style={{
                        background: 'linear-gradient(135deg, #00fff5, #00cccc)',
                        color: '#0f0c29',
                        padding: '10px 20px',
                        borderRadius: '20px',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '600',
                        fontFamily: '"Outfit", sans-serif',
                        boxShadow: '0 0 20px rgba(0, 255, 245, 0.4)',
                        transition: 'all 0.3s',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}
                >
                    Request More Tokens
                </button>
            )}

            {/* Input - Responsive width */}
            <form onSubmit={sendMessage} style={{
                position: 'relative',
                width: isMobile ? '95%' : '75%', // Wider on mobile
                maxWidth: '600px'
            }}>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage(e);
                        }
                    }}
                    placeholder="Continue..."
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
                        borderRadius: '24px',
                        padding: '16px 50px 16px 20px',
                        outline: 'none',
                        transition: 'all 0.3s',
                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.4)',
                        resize: 'none',
                        minHeight: '52px',
                        maxHeight: '150px',
                        overflowY: 'auto'
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
                    rows={1}
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
                        padding: '10px',
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
