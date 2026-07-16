import { useMemo } from 'react';
import { motion } from 'framer-motion';

const GRADIENT_CIRCLES = [
  {
    size: 600,
    gradient: 'radial-gradient(circle, rgba(59,130,246,0.08), transparent 70%)',
    position: 'top-[-180px] right-[-180px]',
    duration: 25,
    delay: 0,
  },
  {
    size: 500,
    gradient: 'radial-gradient(circle, rgba(6,182,212,0.06), transparent 70%)',
    position: 'bottom-[-120px] left-[-120px]',
    duration: 30,
    delay: 2,
  },
  {
    size: 350,
    gradient: 'radial-gradient(circle, rgba(16,185,129,0.05), transparent 70%)',
    position: 'top-[40%] left-[-80px]',
    duration: 35,
    delay: 4,
  },
  {
    size: 400,
    gradient: 'radial-gradient(circle, rgba(99,102,241,0.06), transparent 70%)',
    position: 'bottom-[20%] right-[-100px]',
    duration: 28,
    delay: 1,
  },
];

/**
 * AnimatedBackground - Creates a subtle, professional animated background
 * with slow-moving gradient orbs that convey a calm medical environment.
 */
export default function AnimatedBackground() {
  const circles = useMemo(() => GRADIENT_CIRCLES, []);

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden="true"
    >
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/20" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Floating gradient orbs */}
      {circles.map((circle, i) => (
        <motion.div
          key={i}
          className={`absolute ${circle.position} rounded-full`}
          style={{
            width: circle.size,
            height: circle.size,
            background: circle.gradient,
            willChange: 'transform',
          }}
          animate={{
            x: [0, 30, -20, 15, 0],
            y: [0, -25, 15, -10, 0],
            scale: [1, 1.05, 0.97, 1.02, 1],
          }}
          transition={{
            duration: circle.duration,
            delay: circle.delay,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'linear',
          }}
        />
      ))}

      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(6,182,212,0.5) 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
}
