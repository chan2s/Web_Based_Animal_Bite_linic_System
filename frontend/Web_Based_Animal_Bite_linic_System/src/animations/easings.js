/**
 * Easing Vocabulary — Blueprint-specified easing map.
 *
 * power3.out  → Load-in / bookend moments (Hero, CTA)
 * power2.out  → Discrete viewport-entry reveals (Problem, Features)
 * power1.inOut → Mechanical assembly sequence (Solution)
 * none         → Scrubbed / marquee animations (color bridges, counters)
 */
export const EASINGS = {
  // ——— Bookend load-ins ———
  HERO_LOAD: 'power3.out',
  CTA_LOAD: 'power3.out',

  // ——— Viewport-entry reveals ———
  PROBLEM_REVEAL: 'power2.out',
  FEATURE_REVEAL: 'power2.out',
  TESTIMONIAL_REVEAL: 'power2.out',

  // ——— Mechanical / assembly ———
  SOLUTION_ASSEMBLY: 'power1.inOut',
  STEP_TRANSITION: 'power1.inOut',

  // ——— Scrubbed / continuous ———
  COLOR_BRIDGE: 'none',
  COUNTER: 'none',
  MARQUEE: 'none',
  PARALLAX: 'none',

  // ——— Micro-interactions ———
  HOVER_LIFT: 'power2.out',
  BUTTON_CLICK: 'back.out(1.7)',
};
