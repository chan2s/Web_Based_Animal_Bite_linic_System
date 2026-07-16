import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, CheckCircle, XCircle, X } from 'lucide-react';

const modalConfig = {
  danger: {
    icon: AlertTriangle,
    bg: '#fee2e2',
    color: '#ef4444',
    title: 'Confirm Action',
  },
  warning: {
    icon: AlertTriangle,
    bg: '#fef3c7',
    color: '#f59e0b',
    title: 'Warning',
  },
  info: {
    icon: Info,
    bg: '#dbeafe',
    color: '#3b82f6',
    title: 'Information',
  },
  success: {
    icon: CheckCircle,
    bg: '#d1fae5',
    color: '#10b981',
    title: 'Success',
  },
};

export default function ConfirmModal({
  show,
  onConfirm,
  onCancel,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}) {
  const config = modalConfig[variant] || modalConfig.danger;
  const Icon = config.icon;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onCancel}
        >
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div
                className="modal-icon"
                style={{ background: config.bg, color: config.color }}
              >
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="modal-title">{title || config.title}</h3>
              <button
                onClick={onCancel}
                className="ml-auto p-1 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="modal-body">
              {message}
            </div>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={onCancel}
                disabled={loading}
              >
                {cancelText}
              </button>
              <button
                className={variant === 'danger' ? 'btn-danger' : variant === 'success' ? 'btn-success' : 'btn-primary'}
                onClick={onConfirm}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="spinner" />
                    Processing...
                  </span>
                ) : confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
