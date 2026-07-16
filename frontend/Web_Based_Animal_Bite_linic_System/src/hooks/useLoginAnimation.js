import { useAnimation, useInView } from 'framer-motion';
import { useRef, useEffect } from 'react';

/**
 * useLoginAnimation - Orchestrates the staggered entrance animations
 * for the login page components.
 *
 * Returns refs and controls for coordinating the entrance sequence:
 * 1. Background fades in
 * 2. Decorations begin floating
 * 3. Auth card fades upward
 * 4. Logo scales in
 * 5. Heading appears
 * 6. Input fields appear sequentially
 * 7. Submit button appears last
 */
export function useLoginAnimation() {
  const containerRef = useRef(null);
  const controls = {
    background: useAnimation(),
    decorations: useAnimation(),
    card: useAnimation(),
    logo: useAnimation(),
    heading: useAnimation(),
    fields: [useAnimation(), useAnimation()],
    button: useAnimation(),
  };

  const isInView = useInView(containerRef, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!isInView) return;

    const sequence = async () => {
      // 1. Background elements fade in
      await controls.background.start({
        opacity: 1,
        transition: { duration: 0.8, ease: 'easeOut' },
      });

      // 2. Floating decorations begin (fires in parallel)
      controls.decorations.start({
        opacity: 1,
        transition: { duration: 0.6, delay: 0.1 },
      });

      // 3. Card fades upward
      await controls.card.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
      });

      // 4. Logo appears
      await controls.logo.start({
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: 'easeOut' },
      });

      // 5. Heading appears
      await controls.heading.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' },
      });

      // 6. Input fields appear one after another
      for (const field of controls.fields) {
        await field.start({
          opacity: 1,
          y: 0,
          transition: { duration: 0.4, ease: 'easeOut' },
        });
      }

      // 7. Button appears last
      await controls.button.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut', delay: 0.1 },
      });
    };

    sequence();
  }, [isInView, controls]);

  const initialStates = {
    background: { opacity: 0 },
    decorations: { opacity: 0 },
    card: { opacity: 0, y: 40 },
    logo: { opacity: 0, scale: 0.6 },
    heading: { opacity: 0, y: 20 },
    fields: [
      { opacity: 0, y: 20 },
      { opacity: 0, y: 20 },
    ],
    button: { opacity: 0, y: 20 },
  };

  return { containerRef, controls, initialStates };
}

/**
 * Variants for reusable staggered animations
 */
export const staggerVariants = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.3,
        ease: 'easeOut',
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  },
};

/**
 * Shake animation variant for error states
 */
export const shakeVariants = {
  shake: {
    x: [0, -8, 8, -6, 6, -3, 3, 0],
    transition: { duration: 0.4, ease: 'easeInOut' },
  },
};

/**
 * Pulse glow variant for focus states
 */
export const glowVariants = {
  idle: { boxShadow: '0 0 0 0 rgba(6, 182, 212, 0)' },
  focus: {
    boxShadow: '0 0 0 3px rgba(6, 182, 212, 0.15), 0 0 12px rgba(6, 182, 212, 0.08)',
    transition: { duration: 0.3, ease: 'easeOut' },
  },
};

/**
 * Float animation for idle card state
 */
export const floatVariants = {
  animate: {
    y: [0, -6, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      repeatType: 'reverse',
      ease: 'easeInOut',
    },
  },
};
