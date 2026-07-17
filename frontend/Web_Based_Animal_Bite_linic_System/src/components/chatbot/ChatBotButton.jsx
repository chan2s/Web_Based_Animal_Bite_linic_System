import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

export default function ChatBotButton({ onClick }) {
  return (
    <div className="relative">
      {/* Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.3, delay: 0.5, ease: 'easeOut' }}
        className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 whitespace-nowrap mb-2"
      >
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          {/* <span className="text-sm text-gray-700 font-medium">Need help? Chat with us!</span> */}
        </div>
        {/* Arrow */}
        <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-r border-b border-gray-100 rotate-45 rounded-br-sm" />
      </motion.div>

      {/* Button */}
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="
          relative w-14 h-14
          rounded-full
          bg-gradient-to-br from-blue-600 to-blue-700
          text-white
          shadow-lg shadow-blue-500/30
          flex items-center justify-center
          transition-shadow duration-200
          hover:shadow-xl hover:shadow-blue-500/40
          focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
        "
        aria-label="Open chatbot"
      >
        <MessageCircle className="w-6 h-6" />

        {/* Pulse ring */}
        <span className="absolute inset-0 rounded-full animate-ping bg-blue-400 opacity-20" />
      </motion.button>
    </div>
  );
}
