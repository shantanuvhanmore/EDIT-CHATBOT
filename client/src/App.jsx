import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundVideo, { VIDEO_COUNT } from './components/BackgroundVideo';
import Sidebar from './components/Sidebar';
import MessageList from './components/MessageList';
import InputArea from './components/InputArea';
import { useChat } from './hooks/useChat';

function App() {
  const {
    messages,
    input,
    setInput,
    sendMessage,
    isLoading,
    tokensUsed,
    totalTokens,
    isSessionExhausted,
    resetSession
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [videoIndex, setVideoIndex] = useState(0);
  const hasStarted = messages.length > 1;

  const handleChangeBackground = () => {
    setVideoIndex((prev) => (prev + 1) % VIDEO_COUNT);
  };

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: '#0f0c29',
      fontFamily: '"Outfit", sans-serif'
    }}>
      {/* Video Background */}
      <BackgroundVideo videoIndex={videoIndex} />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        resetSession={resetSession}
        onChangeBackground={handleChangeBackground}
      />

      {/* Floating Header Elements */}
      <AnimatePresence>
        {hasStarted && !sidebarOpen && (
          <>
            {/* Floating Menu Button */}
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(true)}
              style={{
                position: 'fixed',
                top: '24px',
                left: '24px',
                zIndex: 50,
                padding: '14px',
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                cursor: 'pointer',
                color: '#00fff5',
                transition: 'all 0.3s',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                e.currentTarget.style.borderColor = 'rgba(0, 255, 245, 0.4)';
                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 255, 245, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
              }}
            >
              <Menu size={24} />
            </motion.button>

            {/* Floating Logo - Anime Style */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'fixed',
                top: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 50
              }}
            >
              <h1 style={{
                fontSize: '26px',
                fontWeight: '700',
                letterSpacing: '0.2em',
                color: 'white',
                fontFamily: '"Orbitron", sans-serif',
                textTransform: 'uppercase',
                textShadow: '0 0 30px rgba(0, 255, 245, 0.4)'
              }}>
                <span style={{
                  color: '#00fff5',
                  textShadow: '0 0 30px rgba(0, 255, 245, 0.6)'
                }}>AI</span>NIME
              </h1>
            </motion.div>
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
        flexDirection: 'column'
      }}>
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          paddingTop: hasStarted ? '80px' : '0',
          position: 'relative'
        }}>
          {hasStarted && (
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <MessageList messages={messages} />
            </div>
          )}

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

export default App;
