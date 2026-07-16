import { useState, useCallback, lazy, Suspense } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ChatBotButton from './ChatBotButton';

const ChatBotWindow = lazy(() => import('./ChatBotWindow'));

// Animation variants for the chat window
const windowVariants = {
  hidden: {
    opacity: 0,
    scale: 0.85,
    y: 20,
    x: 20,
    transformOrigin: 'bottom right',
    transition: { duration: 0.2, ease: 'easeIn' },
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    x: 0,
    transformOrigin: 'bottom right',
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.85,
    y: 20,
    x: 20,
    transformOrigin: 'bottom right',
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

export default function ChatBotFloating() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev);
    setIsMinimized(false);
  }, []);

  const handleMinimize = useCallback(() => {
    setIsMinimized(true);
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setIsMinimized(false);
  }, []);

  const showWindow = isOpen && !isMinimized;

  return (
    <div className="fixed bottom-0 right-0 z-[9999] flex flex-col items-end justify-end pointer-events-none">
      {/* Chat Window */}
      <AnimatePresence>
        {showWindow && (
          <motion.div
            key="chat-window"
            variants={windowVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="
              pointer-events-auto
              bg-white
              overflow-hidden
              flex flex-col
              shadow-2xl
              border border-gray-200/80

              /* Mobile: ~90% width, centered, rounded top sheet */
              fixed left-4 right-4 bottom-0 mx-auto
              h-[75vh]
              max-w-[440px]
              rounded-t-2xl rounded-b-none

              /* Tablet+ : floating widget positioned 24px from edges */
              sm:relative sm:left-auto sm:right-auto sm:bottom-auto
              sm:mb-6 sm:mr-6
              sm:rounded-2xl
              sm:w-[380px] sm:h-[600px] sm:max-h-[85vh]
            "
          >
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-full bg-gray-50">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              }
            >
              <ChatBotWindow onClose={handleClose} onMinimize={handleMinimize} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button - only visible when chat is closed */}
      <motion.div
        className="pointer-events-auto relative mb-6 mr-6 z-10"
        animate={{ scale: isOpen ? 0 : 1, opacity: isOpen ? 0 : 1 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        style={{ pointerEvents: isOpen ? 'none' : 'auto' }}
      >
        <ChatBotButton onClick={handleToggle} />
      </motion.div>
    </div>
  );
}
