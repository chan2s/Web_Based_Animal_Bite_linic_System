import toast from 'react-hot-toast';

// Custom styled toast notifications
export const showSuccess = (message) => {
  toast.success(message, {
    duration: 3000,
    position: 'top-right',
    style: {
      borderRadius: '12px',
      background: '#10b981',
      color: '#fff',
      fontSize: '14px',
      fontWeight: 500,
      padding: '12px 20px',
      boxShadow: '0 8px 32px rgba(16,185,129,0.3)',
    },
    iconTheme: { primary: '#fff', secondary: '#10b981' },
  });
};

export const showError = (message) => {
  toast.error(message, {
    duration: 4000,
    position: 'top-right',
    style: {
      borderRadius: '12px',
      background: '#ef4444',
      color: '#fff',
      fontSize: '14px',
      fontWeight: 500,
      padding: '12px 20px',
      boxShadow: '0 8px 32px rgba(239,68,68,0.3)',
    },
    iconTheme: { primary: '#fff', secondary: '#ef4444' },
  });
};

export const showWarning = (message) => {
  toast(message, {
    duration: 4000,
    position: 'top-right',
    icon: '⚠️',
    style: {
      borderRadius: '12px',
      background: '#f59e0b',
      color: '#fff',
      fontSize: '14px',
      fontWeight: 500,
      padding: '12px 20px',
      boxShadow: '0 8px 32px rgba(245,158,11,0.3)',
    },
  });
};

export const showInfo = (message) => {
  toast(message, {
    duration: 3000,
    position: 'top-right',
    icon: 'ℹ️',
    style: {
      borderRadius: '12px',
      background: '#3b82f6',
      color: '#fff',
      fontSize: '14px',
      fontWeight: 500,
      padding: '12px 20px',
      boxShadow: '0 8px 32px rgba(59,130,246,0.3)',
    },
  });
};

// Loading toast — returns toast ID for dismissal
export const showLoading = (message = 'Loading...') => {
  return toast.loading(message, {
    position: 'top-right',
    style: {
      borderRadius: '12px',
      background: '#6366f1',
      color: '#fff',
      fontSize: '14px',
      fontWeight: 500,
      padding: '12px 20px',
    },
  });
};

// Dismiss a loading toast by ID
export const dismissToast = (toastId) => {
  toast.dismiss(toastId);
};
