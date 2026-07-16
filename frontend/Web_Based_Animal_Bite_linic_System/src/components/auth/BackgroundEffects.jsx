import { useMemo } from 'react';
import { motion } from 'framer-motion';

const GRADIENT_CIRCLES = [
  { size: 500, top: '-10%', left: '-20%', color: 'rgba(59,130,246,0.04)', duration: 20, delay: 0 },
  { size: 400, bottom: '-15%', right: '-10%', color: 'rgba(6,182,212,0.03)', duration: 25, delay: 2 },
  { size: 300, top: '40%', right: '-5%', color: 'rgba(59,130,246,0.03)', duration: 22, delay: 4 },
  { size: 200, bottom: '30%', left: '10%', color: 'rgba(6,182,212,0.02)', duration: 28, delay: 1 },
];

export default function BackgroundEffects() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Base white with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/20 to-cyan-50/10" />

      {/* Floating gradient orbs */}
      {GRADIENT_CIRCLES.map((circle, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: circle.size,
            height: circle.size,
            top: circle.top,
            left: circle.left,
            bottom: circle.bottom,
            right: circle.right,
            background: `radial-gradient(circle, ${circle.color}, transparent 70%)`,
            willChange: 'transform',
          }}
          animate={{
            x: [0, 20, -15, 10, 0],
            y: [0, -15, 10, -5, 0],
            scale: [1, 1.03, 0.98, 1.01, 1],
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

      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.2) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Floating plus signs */}
      {[
        { top: '20%', left: '15%', size: 16, delay: 0 },
        { top: '60%', left: '80%', size: 12, delay: 3 },
        { top: '80%', left: '25%', size: 14, delay: 1 },
        { top: '30%', left: '70%', size: 10, delay: 5 },
      ].map((plus, i) => (
        <motion.div
          key={`plus-${i}`}
          className="absolute text-blue-200/30 select-none font-light"
          style={{
            top: plus.top,
            left: plus.left,
            fontSize: plus.size,
            fontFamily: "'Georgia', serif",
          }}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.3, 0.5, 0.3, 0],
            y: [0, -20, -40, -60, -80],
            rotate: [0, 15, -10, 5, 0],
          }}
          transition={{
            duration: 15,
            delay: plus.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          +
        </motion.div>
      ))}
    </div>
  );
}
