import { useMemo } from 'react';
import { motion } from 'framer-motion';

const FLOATING_ICONS = [
  { icon: '+', size: 24, color: 'rgba(59,130,246,0.08)', top: '15%', left: '8%', duration: 18, delay: 0 },
  { icon: '+', size: 18, color: 'rgba(6,182,212,0.07)', top: '25%', right: '12%', duration: 22, delay: 1 },
  { icon: '+', size: 32, color: 'rgba(16,185,129,0.06)', top: '60%', left: '5%', duration: 20, delay: 2 },
  { icon: '+', size: 20, color: 'rgba(99,102,241,0.07)', top: '75%', right: '8%', duration: 24, delay: 0.5 },
  { icon: '+', size: 14, color: 'rgba(59,130,246,0.06)', top: '40%', left: '92%', duration: 26, delay: 3 },
  { icon: '+', size: 16, color: 'rgba(6,182,212,0.06)', top: '10%', left: '50%', duration: 19, delay: 1.5 },
  { icon: '♦', size: 12, color: 'rgba(16,185,129,0.05)', top: '50%', left: '15%', duration: 28, delay: 0 },
  { icon: '○', size: 10, color: 'rgba(59,130,246,0.05)', top: '80%', left: '40%', duration: 30, delay: 2 },
  { icon: '○', size: 14, color: 'rgba(6,182,212,0.04)', top: '20%', left: '75%', duration: 25, delay: 1 },
  { icon: '◇', size: 16, color: 'rgba(16,185,129,0.05)', top: '65%', left: '88%', duration: 22, delay: 3 },
];

/**
 * FloatingElements - Renders slow-moving decorative shapes and icons
 * that float elegantly in the background to create visual depth.
 */
export default function FloatingElements() {
  const icons = useMemo(() => FLOATING_ICONS, []);

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none z-[1]"
      aria-hidden="true"
    >
      {icons.map((item, i) => (
        <motion.div
          key={i}
          className="absolute select-none"
          style={{
            top: item.top,
            left: item.left,
            right: item.right,
            fontSize: item.size,
            color: item.color,
            fontWeight: 300,
            fontFamily: "'Georgia', serif",
            willChange: 'transform',
          }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{
            opacity: [0, 0.4, 0.6, 0.4, 0],
            y: [0, -40, -80, -120, -160],
            x: [0, 15, -10, 20, -5],
            rotate: [0, 10, -5, 8, 0],
            scale: [0.5, 1, 1.1, 1, 0.7],
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Subtle scanning light effect */}
      <motion.div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(59,130,246,0.15) 50%, transparent 100%)',
        }}
        animate={{ top: ['-100%', '100%'] }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}
