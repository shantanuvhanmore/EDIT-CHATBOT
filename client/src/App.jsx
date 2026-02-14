
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundVideo from './components/BackgroundVideo'; // No VIDEO_COUNT needed
import Sidebar from './components/Sidebar';
import MessageList from './components/MessageList';
import InputArea from './components/InputArea';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import BackgroundGallery from './components/BackgroundGallery'; // Import Gallery
import RequestTokensModal from './components/RequestTokensModal';
import { useChat } from './hooks/useChat';
import { useAuth } from './contexts/AuthContext';

function ChatApp() {
  const { user, isAuthenticated, loading, token } = useAuth();
  const {
    messages,
    input,
    setInput,
    sendMessage,
    isLoading,
    tokensUsed,
    totalTokens,
    isSessionExhausted,
    resetSession,
    conversations,
    currentConversationId,
    selectConversation,
    deleteConversation,
    updateFeedback,
    startNewChat
  } = useChat(user, null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false); // Gallery Modal state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const hasStarted = messages.length > 1;

  // Background State Management
  const [currentBackground, setCurrentBackground] = useState(null);
  const [likedBackgrounds, setLikedBackgrounds] = useState([]);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [availableVideos, setAvailableVideos] = useState([]);

  // Listen for token request event
  useEffect(() => {
    const handleOpenRequest = () => setShowRequestModal(true);
    window.addEventListener('openTokenRequest', handleOpenRequest);
    return () => window.removeEventListener('openTokenRequest', handleOpenRequest);
  }, []);

  // Handle token request submission
  const handleRequestTokens = async (reason) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const res = await fetch(`${API_BASE}/api/token-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ reason })
      });

      if (res.ok) {
        alert('Token request submitted! Admin will review shortly.');
        setShowRequestModal(false);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to submit request');
      }
    } catch (error) {
      alert('Failed to submit token request');
    }
  };

  // Load saved preferences on mount
  useEffect(() => {
    const loadPreferences = async () => {
      if (isAuthenticated && token) {
        try {
          const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
          const res = await fetch(`${API_BASE}/api/preferences`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (res.ok) {
            const prefs = await res.json();

            if (prefs.selectedBackground) {
              setCurrentBackground(prefs.selectedBackground);
            } else {
              // Load default background if no preference saved
              import('./videos.json').then(module => {
                const videos = module.default || module;
                if (videos.length > 0) {
                  setCurrentBackground(videos[0].videoUrl);
                }
              }).catch(err => console.log("Videos not loaded yet"));
            }

            if (prefs.likedBackgrounds) {
              setLikedBackgrounds(prefs.likedBackgrounds);
            }
          }
        } catch (error) {
          console.error('Error loading preferences:', error);
          // Fallback to default background
          import('./videos.json').then(module => {
            const videos = module.default || module;
            if (videos.length > 0) {
              setCurrentBackground(videos[0].videoUrl);
            }
          }).catch(err => console.log("Videos not loaded yet"));
        }
      } else {
        // For non-authenticated users, use localStorage as fallback
        const savedBackground = localStorage.getItem('selectedBackground');
        const savedLiked = JSON.parse(localStorage.getItem('likedBackgrounds') || '[]');

        if (savedBackground) {
          setCurrentBackground(savedBackground);
        } else {
          import('./videos.json').then(module => {
            const videos = module.default || module;
            if (videos.length > 0) {
              setCurrentBackground(videos[0].videoUrl);
            }
          }).catch(err => console.log("Videos not loaded yet"));
        }

        setLikedBackgrounds(savedLiked);
      }
    };

    loadPreferences();

    // Load videos for shuffle
    import('./videos.json').then(module => {
      setAvailableVideos(module.default || module);
    });
  }, [isAuthenticated, token]);

  // Auto-rotate backgrounds when shuffle is enabled
  useEffect(() => {
    if (!shuffleEnabled || availableVideos.length === 0) return;

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * availableVideos.length);
      const randomVideo = availableVideos[randomIndex];
      setCurrentBackground(randomVideo.videoUrl);

      // Save to database or localStorage
      if (isAuthenticated && token) {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        fetch(`${API_BASE}/api/preferences`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ selectedBackground: randomVideo.videoUrl })
        }).catch(err => console.error('Error saving background:', err));
      } else {
        localStorage.setItem('selectedBackground', randomVideo.videoUrl);
      }
    }, 30000); // Change every 30 seconds

    return () => clearInterval(interval);
  }, [shuffleEnabled, availableVideos, isAuthenticated, token]);

  // Handle shuffle toggle
  const handleShuffleToggle = (enabled) => {
    setShuffleEnabled(enabled);
  };

  // Update background handler
  const handleSelectBackground = async (url, save = false) => {
    setCurrentBackground(url);
    if (save) {
      if (isAuthenticated && token) {
        try {
          const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
          await fetch(`${API_BASE}/api/preferences`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ selectedBackground: url })
          });
        } catch (error) {
          console.error('Error saving background preference:', error);
        }
      } else {
        localStorage.setItem('selectedBackground', url);
      }
    }
  };

  // Toggle Like handler
  const handleToggleLike = async (url) => {
    let newLiked;
    if (likedBackgrounds.includes(url)) {
      newLiked = likedBackgrounds.filter(l => l !== url);
    } else {
      newLiked = [...likedBackgrounds, url];
    }
    setLikedBackgrounds(newLiked);

    if (isAuthenticated && token) {
      try {
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
        await fetch(`${API_BASE}/api/preferences`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ likedBackgrounds: newLiked })
        });
      } catch (error) {
        console.error('Error saving liked backgrounds:', error);
      }
    } else {
      localStorage.setItem('likedBackgrounds', JSON.stringify(newLiked));
    }
  };


  // Show loading while checking auth
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#0f0c29',
        color: '#00fff5',
        fontSize: '18px',
        fontFamily: '"Outfit", sans-serif'
      }}>
        Loading...
      </div>
    );
  }

  // Redirect to landing page if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/landing" replace />;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: '#0f0c29',
      fontFamily: '"Outfit", sans-serif'
    }}>
      {/* Video Background */}
      <BackgroundVideo videoUrl={currentBackground} />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        resetSession={resetSession}
        onChangeBackground={() => {
          setSidebarOpen(false); // Close sidebar
          setGalleryOpen(true); // Open gallery
        }}
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={selectConversation}
        onDeleteConversation={deleteConversation}
        onNewChat={startNewChat}
      />

      {/* Background Gallery Modal */}
      <BackgroundGallery
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        onSelectBackground={handleSelectBackground}
        currentBackground={currentBackground}
        likedBackgrounds={likedBackgrounds}
        onToggleLike={handleToggleLike}
        shuffleEnabled={shuffleEnabled}
        onShuffleToggle={handleShuffleToggle}
      />

      {/* Floating Header Elements */}
      <AnimatePresence>
        {!sidebarOpen && (
          <>
            {/* Floating Menu Button - Top Left */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(true)}
              style={{
                position: 'fixed',
                top: '20px',
                left: '20px',
                zIndex: 100,
                padding: '14px',
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                borderRadius: '12px',
                cursor: 'pointer',
                color: '#00fff5',
                transition: 'all 0.3s',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 255, 245, 0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
                e.currentTarget.style.borderColor = 'rgba(0, 255, 245, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
              }}
            >
              <Menu size={24} />
            </motion.button>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Chat Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          paddingTop: hasStarted ? '60px' : '0',
          overflow: 'hidden',
          minHeight: 0
        }}>
          {/* Messages */}
          {hasStarted && (
            <div style={{
              flex: 1,
              overflow: 'hidden',
              minHeight: 0
            }}>
              <MessageList messages={messages} onUpdateFeedback={updateFeedback} />
            </div>
          )}

          {/* Input Area */}
          <InputArea
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
            isLoading={isLoading}
            isSessionExhausted={isSessionExhausted}
            tokensUsed={tokensUsed}
            totalTokens={totalTokens}
            hasStarted={hasStarted}
          />
        </div>
      </div>

      {/* Request Tokens Modal */}
      <RequestTokensModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        onSubmit={handleRequestTokens}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/landing" element={<LandingPage />} />
        <Route path="/" element={<ChatApp />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
