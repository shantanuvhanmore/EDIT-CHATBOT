import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

export default function GoogleLoginButton() {
    const { user, login, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleSuccess = async (credentialResponse) => {
        const result = await login(credentialResponse.credential);
        if (result.success) {
            // Redirect to chat after successful login
            navigate('/');
        } else {
            alert('Login failed: ' + result.error);
        }
    };

    const handleError = () => {
        console.error('Google login failed');
        alert('Google login failed');
    };

    if (isAuthenticated) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 16px',
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(15px)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.15)'
            }}>
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
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                }}>
                    <span style={{
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600'
                    }}>
                        {user.name}
                    </span>
                    {user.isAdmin && (
                        <span style={{
                            color: '#00fff5',
                            fontSize: '11px',
                            fontWeight: '600',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em'
                        }}>
                            Admin
                        </span>
                    )}
                </div>
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
                    onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)'}
                >
                    <LogOut size={16} />
                </button>
            </div>
        );
    }

    return (
        <div style={{
            background: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        }}>
            <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                theme="filled_blue"
                size="large"
                text="signup_with"
                shape="rectangular"
                width="280"
            />
        </div>
    );
}
