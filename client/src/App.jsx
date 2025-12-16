import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import BackgroundVideo from './components/BackgroundVideo';
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
    setVideoIndex((prev) => (prev + 1) % 3); // Cycle through 3 videos
  };

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      background: '#0f0c29'
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

      {/* Main Content Overlay */}
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

        {/* Header */}
        <AnimatePresence>
          {hasStarted && (
            <motion.header
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                padding: '20px 24px',
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <button
                onClick={() => setSidebarOpen(true)}
                style={{
                  padding: '10px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  marginRight: '16px',
                  color: '#00fff5',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Menu size={26} />
              </button>
              <h1 style={{
                fontSize: '22px',
                fontWeight: 'bold',
                letterSpacing: '0.1em',
                color: 'white'
              }}>
                <span style={{ color: '#00fff5' }}>AI</span>NIME
              </h1>
            </motion.header>
          )}
        </AnimatePresence>

        {/* Chat Area */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          paddingTop: hasStarted ? '70px' : '0'
        }}>

          {/* Messages */}
          {hasStarted && (
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <MessageList messages={messages} />
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

export default App;
