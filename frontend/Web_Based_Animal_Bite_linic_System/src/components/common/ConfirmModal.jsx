import { motion, AnimatePresence } from 'framer-motion';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
  children,
}) {
  const theme = {
    danger: { bg: '#ef4444', hover: '#dc2626', light: '#fef2f2', icon: '🗑️' },
    warning: { bg: '#f59e0b', hover: '#d97706', light: '#fffbeb', icon: '⚠️' },
    primary: { bg: '#6366f1', hover: '#4f46e5', light: '#eef2ff', icon: 'ℹ️' },
    success: { bg: '#10b981', hover: '#059669', light: '#f0fdf4', icon: '✅' },
  };

  const colors = theme[variant] || theme.danger;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{ backdropFilter: 'blur(4px)' }}
        >
          <motion.div
            className="modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: 440 }}
          >
            <div style={{ padding: '24px 24px 0', textAlign: 'center' }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: colors.light,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: 28,
                }}
              >
                {colors.icon}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
                {title}
              </h3>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 4 }}>
                {message}
              </p>
              {children}
            </div>

            <div
              style={{
                display: 'flex',
                gap: 12,
                justifyContent: 'center',
                padding: '20px 24px 24px',
              }}
            >
              <button
                className={`btn-primary confirm-btn-${variant}`}
                onClick={onConfirm}
                disabled={loading}
                style={{ minWidth: 120, padding: '10px 24px' }}
              >
                {loading ? (
                  <span className="btn-loading">
                    <span className="spinner"></span> Processing...
                  </span>
                ) : (
                  confirmText
                )}
              </button>
              <button
                className="btn-secondary"
                onClick={onClose}
                disabled={loading}
                style={{ minWidth: 100 }}
              >
                {cancelText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
