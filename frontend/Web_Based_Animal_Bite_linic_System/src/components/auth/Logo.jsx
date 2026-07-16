import { motion } from 'framer-motion';

/**
 * Logo - Animated medical logo with a clean, trustworthy appearance.
 * Features a cross icon inside a rounded container with pulse animation.
 */
export default function Logo({ isAnimating = true, size = 'md' }) {
  const sizes = {
    sm: 'w-10 h-10 text-lg',
    md: 'w-14 h-14 text-2xl',
    lg: 'w-16 h-16 text-3xl',
  };

  const iconSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-[28px]',
  };

  return (
    <motion.div
      className={`relative ${sizes[size] || sizes.md} mx-auto`}
      initial={isAnimating ? { opacity: 0, scale: 0.6 } : { opacity: 1, scale: 1 }}
      animate={isAnimating ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, ease: 'easeOut', type: 'spring', damping: 15, stiffness: 200 }}
      role="img"
      aria-label="Animal Bite Clinic Logo"
    >
      {/* Logo container */}
      <div
        className={`
          ${sizes[size] || sizes.md}
          rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500
          flex items-center justify-center
          shadow-lg shadow-blue-500/20
          relative overflow-hidden
        `}
      >
        {/* Inner glow */}
        <div className="absolute inset-0 bg-white/10 rounded-2xl" />

        {/* Medical cross icon */}
        <span
          className={`${iconSizes[size] || iconSizes.md} relative z-10 select-none`}
          style={{ lineHeight: 1 }}
        >
          ✚
        </span>

        {/* Subtle pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-white/20"
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Shadow ring */}
      <motion.div
        className="absolute -inset-2 rounded-3xl bg-blue-400/5 blur-md -z-10"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </motion.div>
  );
}
