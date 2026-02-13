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
