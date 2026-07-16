import { useRef, useCallback, useEffect } from 'react';
import { gsap } from 'gsap';

/**
 * useHoverTilt - Adds 3D mouse-tracked tilt rotation to a reference element.
 * Creates an Apple-style product hover effect with spring physics.
 */
export default function useHoverTilt(options = {}) {
  const {
    maxTiltX = 8,       // Max rotation on X axis (degrees)
    maxTiltY = 12,      // Max rotation on Y axis (degrees)
    scale = 1.03,       // Scale on hover
    shadowIntensity = 1.2, // Shadow multiplier on hover
    springConfig = { duration: 0.6, ease: 'power2.out' },
    resetConfig = { duration: 0.8, ease: 'elastic.out(1, 0.4)' },
  } = options;

  const elementRef = useRef(null);
  const shadowElRef = useRef(null);
  const stateRef = useRef({ isHovering: false, rect: null });

  const onMouseEnter = useCallback((e) => {
    const el = elementRef.current;
    if (!el) return;
    stateRef.current.isHovering = true;
    stateRef.current.rect = el.getBoundingClientRect();
    // Scale up
    gsap.to(el, {
      scale,
      duration: springConfig.duration,
      ease: springConfig.ease,
    });
    if (shadowElRef.current) {
      gsap.to(shadowElRef.current, {
        scale: shadowIntensity,
        opacity: 0.15,
        duration: springConfig.duration,
        ease: springConfig.ease,
      });
    }
  }, [scale, shadowIntensity, springConfig]);

  const onMouseMove = useCallback((e) => {
    const el = elementRef.current;
    const state = stateRef.current;
    if (!el || !state.isHovering || !state.rect) return;

    const { left, top, width, height } = state.rect;
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;

    const tiltY = (x - 0.5) * maxTiltY * 2;
    const tiltX = (0.5 - y) * maxTiltX * 2;

    gsap.to(el, {
      rotateX: tiltX,
      rotateY: tiltY,
      duration: 0.15,
      ease: 'power1.out',
      overwrite: 'auto',
    });
  }, [maxTiltX, maxTiltY]);

  const onMouseLeave = useCallback(() => {
    const el = elementRef.current;
    if (!el) return;
    stateRef.current.isHovering = false;
    stateRef.current.rect = null;

    gsap.to(el, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: resetConfig.duration,
      ease: resetConfig.ease,
      overwrite: 'auto',
    });
    if (shadowElRef.current) {
      gsap.to(shadowElRef.current, {
        scale: 1,
        opacity: 0.08,
        duration: resetConfig.duration,
        ease: resetConfig.ease,
      });
    }
  }, [resetConfig]);

  const bind = {
    ref: elementRef,
    shadowRef: shadowElRef,
    onMouseEnter,
    onMouseMove,
    onMouseLeave,
  };

  return bind;
}

/**
 * useCharacterBreathing - Adds subtle breathing animation to character elements.
 */
export function useCharacterBreathing(ref, options = {}) {
  const {
    amplitude = 0.008,
    duration = 3.5,
    disabled = false,  // Respect reduced motion
  } = options;

  useEffect(() => {
    if (disabled) return;
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.to(el, {
        scale: 1 + amplitude,
        duration,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        transformOrigin: 'center bottom',
      });
    }, el);

    return () => ctx.revert();
  }, [ref, amplitude, duration, disabled]);
}

/**
 * useBlinking - Adds periodic blinking animation to SVG eyes.
 */
export function useBlinking(eyeRefs, options = {}) {
  const {
    minInterval = 2000,
    maxInterval = 6000,
    blinkDuration = 0.12,
    disabled = false,
  } = options;

  useEffect(() => {
    if (disabled) return;
    const eyes = eyeRefs.current?.filter(Boolean);
    if (!eyes?.length) return;

    const ctx = gsap.context(() => {
      function blink() {
        gsap.to(eyes, {
          scaleY: 0.1,
          duration: blinkDuration,
          ease: 'power1.inOut',
          yoyo: true,
          repeat: 1,
          transformOrigin: 'center center',
        });
        scheduleNext();
      }

      function scheduleNext() {
        const delay = minInterval + Math.random() * (maxInterval - minInterval);
        gsap.delayedCall(delay, blink);
      }

      scheduleNext();
    }, eyes);

    return () => ctx.revert();
  }, [eyeRefs, minInterval, maxInterval, blinkDuration, disabled]);
}
