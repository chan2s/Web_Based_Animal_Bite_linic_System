/**
 * ScrollTrigger Defaults — Blueprint-specified configuration presets.
 *
 * Toggle actions:
 *   Problem section → play none none reverse  (reverses on scroll‑up)
 *   Feature blocks  → play none none none      (does NOT reverse)
 *   Solution        → pinned, never reverses
 */
export const ST_DEFAULTS = {
  // ——— Viewport reveals (reversible) ———
  VIEWPORT_REVEAL: {
    start: 'top 85%',
    end: 'center center',
    toggleActions: 'play none none reverse',
    scrub: false,
  },

  // ——— Viewport reveals (non‑reversible) ———
  VIEWPORT_REVEAL_ONCE: {
    start: 'top 85%',
    end: 'center center',
    toggleActions: 'play none none none',
    scrub: false,
  },

  // ——— Pinned assembly sequence (Solution) ———
  PINNED_ASSEMBLY: {
    start: 'top top',
    end: '+=150vh',
    pin: true,
    scrub: 1,
    toggleActions: 'play none none none',
    invalidateOnRefresh: true,
  },

  // ——— Color bridges ———
  COLOR_BRIDGE: {
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
    toggleActions: 'play none none none',
  },

  // ——— Parallax (continuous) ———
  PARALLAX: {
    start: 'top bottom',
    end: 'bottom top',
    scrub: 1,
    toggleActions: 'play none none none',
    invalidateOnRefresh: true,
  },

  // ——— Count-up ———
  COUNTER: {
    start: 'top 85%',
    end: 'center center',
    toggleActions: 'play none none reverse',
    scrub: false,
  },

  // ——— Marquee ———
  MARQUEE: {
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
    toggleActions: 'play none none none',
  },

  // ——— Footer entrance ———
  FOOTER: {
    start: 'top bottom',
    end: 'center center',
    toggleActions: 'play none none none',
    scrub: false,
  },
};
