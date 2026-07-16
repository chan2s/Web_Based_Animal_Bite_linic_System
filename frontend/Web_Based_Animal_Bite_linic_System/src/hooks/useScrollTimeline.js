import { useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * useScrollTimeline — Orchestrate a ScrollTrigger‑driven GSAP timeline with
 * automatic cleanup on unmount and a `.clear()`‑style reset for hot‑reloading.
 *
 * Usage:
 *   const { add, clear } = useScrollTimeline(sectionRef);
 *
 *   add('tl-1', (tl) => {
 *     tl.fromTo(el, {…}, {…})
 *       .to(el2, {…});
 *   }, scrollTriggerConfig);
 */
export default function useScrollTimeline(sectionRef) {
  const ctxRef = useRef(null);
  const timelinesRef = useRef([]);

  // ——— Register ———
  useEffect(() => {
    return () => {
      // Clean up everything on unmount
      timelinesRef.current.forEach((t) => {
        if (t.scrollTrigger) t.scrollTrigger.kill();
        t.kill();
      });
      timelinesRef.current = [];
      if (ctxRef.current) {
        ctxRef.current.revert();
        ctxRef.current = null;
      }
    };
  }, []);

  const add = useCallback(
    (name, builderFn, scrollTriggerConfig = {}) => {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            ...scrollTriggerConfig,
            id: name,
          },
        });

        builderFn(tl);

        timelinesRef.current.push(tl);
      }, sectionRef.current || undefined);

      ctxRef.current = ctx;

      return timelinesRef.current[timelinesRef.current.length - 1];
    },
    [sectionRef]
  );

  const clear = useCallback(() => {
    timelinesRef.current.forEach((t) => {
      if (t.scrollTrigger) t.scrollTrigger.kill();
      t.kill();
    });
    timelinesRef.current = [];
    if (ctxRef.current) {
      ctxRef.current.revert();
      ctxRef.current = null;
    }
  }, []);

  return { add, clear };
}
