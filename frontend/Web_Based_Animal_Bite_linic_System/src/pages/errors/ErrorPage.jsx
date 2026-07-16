import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Cross, Home, ArrowLeft, Shield } from 'lucide-react';

const errorConfig = {
  401: {
    title: 'Unauthorized',
    description: 'You need to sign in to access this page.',
    icon: '🔒',
    gradient: 'from-blue-500 to-cyan-500',
  },
  403: {
    title: 'Access Denied',
    description: 'You don\'t have permission to access this page.',
    icon: '🚫',
    gradient: 'from-orange-500 to-red-500',
  },
  404: {
    title: 'Page Not Found',
    description: 'The page you\'re looking for doesn\'t exist or has been moved.',
    icon: '🔍',
    gradient: 'from-blue-500 to-purple-500',
  },
  500: {
    title: 'Server Error',
    description: 'Something went wrong on our end. Please try again later.',
    icon: '⚙️',
    gradient: 'from-red-500 to-pink-500',
  },
};

export default function ErrorPage({ code = 404 }) {
  const config = errorConfig[code] || errorConfig[404];

  return (
    <div className="relative min-h-screen flex bg-white overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/20 to-cyan-50/10" />
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `linear-gradient(rgba(59,130,246,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.2) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }} />

      <div className="relative z-10 flex-1 flex items-center justify-center px-6">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2 justify-center mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
              <Cross className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">Animal Bite Clinic</span>
          </motion.div>

          {/* Error Code */}
          <motion.div
            className="text-[120px] font-black leading-none mb-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              background: `linear-gradient(135deg, #3b82f6, #06b6d4)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {code}
          </motion.div>

          {/* Error Icon */}
          <motion.div
            className="text-5xl mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {config.icon}
          </motion.div>

          {/* Title & Description */}
          <motion.h2
            className="text-2xl font-bold text-slate-900 mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {config.title}
          </motion.h2>
          <motion.p
            className="text-sm text-slate-500 leading-relaxed mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            {config.description}
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            className="flex items-center justify-center gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Link to="/" className="btn-primary">
              <Home className="w-4 h-4" />
              Go Home
            </Link>
            <button onClick={() => window.history.back()} className="btn-secondary">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </button>
          </motion.div>

          {code === 401 && (
            <motion.div
              className="mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link to="/login" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Sign in to your account
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
