import { useState, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Check } from 'lucide-react';

function AnimatedButton({
  children,
  loading = false,
  success = false,
  disabled = false,
  onClick,
  type = 'submit',
  className = '',
}) {
  const [ripples, setRipples] = useState([]);
  const buttonRef = useRef(null);
  const rippleIdRef = useRef(0);

  const handleClick = useCallback(
    (e) => {
      if (loading || disabled || success) return;

      const button = buttonRef.current;
      if (button) {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = ++rippleIdRef.current;

        setRipples((prev) => [...prev, { id, x, y }]);
        setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 600);
      }

      onClick?.(e);
    },
    [loading, disabled, success, onClick]
  );

  return (
    <motion.button
      ref={buttonRef}
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading && !success ? { y: -1, scale: 1.005 } : {}}
      whileTap={!disabled && !loading && !success ? { y: 0, scale: 0.99 } : {}}
      className={`
        relative w-full overflow-hidden rounded-xl font-semibold text-sm
        py-3 px-5 transition-colors duration-300
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
        ${success
          ? 'bg-emerald-500 text-white cursor-default'
          : loading
          ? 'bg-blue-600 text-white cursor-wait'
          : disabled
          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer shadow-sm hover:shadow-md hover:shadow-blue-200/50'
        }
        ${className}
      `}
    >
      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/25 pointer-events-none"
          style={{
            left: ripple.x - 8,
            top: ripple.y - 8,
            width: 16,
            height: 16,
            animation: 'ripple 0.6s ease-out forwards',
          }}
        />
      ))}

      <AnimatePresence mode="wait">
        {success ? (
          <motion.span
            key="success"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Signed In</span>
          </motion.span>
        ) : loading ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2.5"
          >
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Signing in...</span>
          </motion.span>
        ) : (
          <motion.span
            key="default"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-2"
          >
            {children || 'Sign In'}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export default memo(AnimatedButton);
