import { useState, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * LoadingButton - A premium animated submit button featuring:
 * - Hover lift with soft shadow glow
 * - Ripple effect on click
 * - Loading spinner animation
 * - Success transition with checkmark morph
 * - Disabled state
 * - Accessibility support
 */
function LoadingButton({
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

      // Create ripple effect
      const button = buttonRef.current;
      if (button) {
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const id = ++rippleIdRef.current;

        setRipples((prev) => [...prev, { id, x, y }]);

        // Remove ripple after animation
        setTimeout(() => {
          setRipples((prev) => prev.filter((r) => r.id !== id));
        }, 600);
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
      whileHover={!disabled && !loading && !success ? { y: -2, scale: 1.01 } : {}}
      whileTap={!disabled && !loading && !success ? { y: 0, scale: 0.99 } : {}}
      className={`
        relative w-full overflow-hidden rounded-xl font-semibold text-[15px]
        py-3.5 px-6 transition-colors duration-300
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2
        ${success
          ? 'bg-emerald-500 text-white cursor-default'
          : loading
          ? 'bg-blue-500 text-white cursor-wait'
          : disabled
          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 cursor-pointer shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30'
        }
        ${className}
      `}
      layout
    >
      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 pointer-events-none"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            animation: 'ripple 0.6s ease-out forwards',
          }}
        />
      ))}

      {/* Content */}
      <AnimatePresence mode="wait">
        {success ? (
          <motion.span
            key="success"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="flex items-center justify-center gap-2"
          >
            <motion.svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            >
              <path d="M20 6L9 17l-5-5" />
            </motion.svg>
            <span>Signed In</span>
          </motion.span>
        ) : loading ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center gap-3"
          >
            <motion.span
              className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
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

      {/* Ambient glow effect */}
      {!disabled && !success && (
        <motion.div
          className="absolute inset-0 bg-white/5 opacity-0 rounded-xl pointer-events-none"
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.button>
  );
}

export default memo(LoadingButton);
