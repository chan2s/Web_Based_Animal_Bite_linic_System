import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const errors = {
  401: {
    icon: '🔒',
    title: 'Unauthorized Access',
    description: 'You need to log in to access this page. Please sign in with your credentials to continue.',
    action: { to: '/login', text: 'Go to Login' },
  },
  403: {
    icon: '🚫',
    title: 'Access Denied',
    description: 'You don\'t have permission to access this page. If you think this is a mistake, please contact your administrator.',
    action: { to: '/dashboard', text: 'Back to Dashboard' },
  },
  404: {
    icon: '🔍',
    title: 'Page Not Found',
    description: 'The page you\'re looking for doesn\'t exist or has been moved. Please check the URL or navigate back.',
    action: { to: '/', text: 'Back to Home' },
  },
  500: {
    icon: '⚡',
    title: 'Server Error',
    description: 'Something went wrong on our end. Please try again later or contact support if the problem persists.',
    action: { to: '/dashboard', text: 'Back to Dashboard' },
  },
};

export default function ErrorPage({ code = 404 }) {
  const error = errors[code] || errors[404];

  return (
    <div className="error-page">
      <motion.div
        className="error-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.span
          className="error-icon"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
        >
          {error.icon}
        </motion.span>

        <motion.div
          className="error-code"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {code}
        </motion.div>

        <motion.h1
          className="error-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {error.title}
        </motion.h1>

        <motion.p
          className="error-description"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {error.description}
        </motion.p>

        <motion.div
          className="error-actions"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Link to={error.action.to} className="hero-btn-primary">
            {error.action.text} →
          </Link>
          {code === 401 && (
            <Link to="/register" className="hero-btn-secondary">
              Create Account
            </Link>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
