
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
import { useChat } from './hooks/useChat';
import { useAuth } from './contexts/AuthContext';

function ChatApp() {
  const { user, isAuthenticated, loading } = useAuth();
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
  const hasStarted = messages.length > 1;

  // Background State Management
  const [currentBackground, setCurrentBackground] = useState(null);
  const [likedBackgrounds, setLikedBackgrounds] = useState([]);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [availableVideos, setAvailableVideos] = useState([]);

  // Load saved preferences on mount
  useEffect(() => {
    const savedBackground = localStorage.getItem('selectedBackground');
    const savedLiked = JSON.parse(localStorage.getItem('likedBackgrounds') || '[]');
    const savedShuffle = localStorage.getItem('shuffleEnabled') === 'true';

    if (savedBackground) {
      setCurrentBackground(savedBackground);
    } else {
      import('./videos.json').then(module => {
        const videos = module.default || module;
        if (videos.length > 0 && !savedBackground) {
          setCurrentBackground(videos[0].videoUrl);
        }
      }).catch(err => console.log("Videos not loaded yet"));
    }

    if (savedLiked) {
      setLikedBackgrounds(savedLiked);
    }

    setShuffleEnabled(savedShuffle);

    // Load videos for shuffle
    import('./videos.json').then(module => {
      setAvailableVideos(module.default || module);
    });
  }, []);

  // Auto-rotate backgrounds when shuffle is enabled
  useEffect(() => {
    if (!shuffleEnabled || availableVideos.length === 0) return;

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * availableVideos.length);
      const randomVideo = availableVideos[randomIndex];
      setCurrentBackground(randomVideo.videoUrl);
      localStorage.setItem('selectedBackground', randomVideo.videoUrl);
    }, 30000); // Change every 30 seconds

    return () => clearInterval(interval);
  }, [shuffleEnabled, availableVideos]);

  // Handle shuffle toggle
  const handleShuffleToggle = (enabled) => {
    setShuffleEnabled(enabled);
    localStorage.setItem('shuffleEnabled', enabled.toString());
  };

  // Update background handler
  const handleSelectBackground = (url, save = false) => {
    setCurrentBackground(url);
    if (save) {
      localStorage.setItem('selectedBackground', url);
    }
  };

  // Toggle Like handler
  const handleToggleLike = (url) => {
    let newLiked;
    if (likedBackgrounds.includes(url)) {
      newLiked = likedBackgrounds.filter(l => l !== url);
    } else {
      newLiked = [...likedBackgrounds, url];
    }
    setLikedBackgrounds(newLiked);
    localStorage.setItem('likedBackgrounds', JSON.stringify(newLiked));
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
