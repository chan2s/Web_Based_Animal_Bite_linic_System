import { useRef, memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

/**
 * AuthCard - A premium card container for authentication forms.
 * Features:
 * - Smooth fade-in with slight scale entrance
 * - Subtle floating animation while idle
 * - Soft shadow with rounded corners
 * - Clean spacing
 * - Responsive sizing
 */
function AuthCard({ children, className = '' }) {
  const cardRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      ref={cardRef}
      className="relative"
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 40, scale: prefersReducedMotion ? 1 : 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {/* Subtle floating animation while idle (disabled when prefers-reduced-motion) */}
      <motion.div
        className={`
          relative bg-white rounded-2xl
          shadow-[0_8px_40px_rgba(0,0,0,0.06),0_2px_8px_rgba(0,0,0,0.04)]
          hover:shadow-[0_12px_48px_rgba(59,130,246,0.08),0_4px_12px_rgba(0,0,0,0.04)]
          transition-shadow duration-500
          ${className}
        `}
        style={{ willChange: prefersReducedMotion ? 'auto' : 'transform' }}
        animate={prefersReducedMotion ? {} : {
          y: [0, -3, 0],
        }}
        transition={prefersReducedMotion ? {} : {
          y: {
            duration: 4,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
          },
        }}
      >
        {/* Subtle border glow */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, rgba(59,130,246,0.03), rgba(6,182,212,0.02))',
            mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            maskComposite: 'exclude',
            WebkitMaskComposite: 'xor',
            padding: '1px',
          }}
        />

        {/* Content area with responsive padding */}
        <div className="px-6 py-8 sm:px-8 sm:py-10 md:px-10">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default memo(AuthCard);
