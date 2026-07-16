/**
 * Depth Plane Constants — Strict z-index + parallax speed differential.
 *
 * background  0.3–0.5x  (farthest, slowest)
 * midground   0.6–0.8x  (middle)
 * foreground  1.0x       (natural scroll)
 * overlay     1.2x       (closest, fastest)
 *
 * Every scene MUST reference these constants; ad‑hoc values are forbidden.
 */
export const DEPTH = {
  BACKGROUND: {
    id: 'background',
    speed: 0.4,
    zIndex: 0,
    label: 'Farthest layer — sky, distant environment',
  },
  MIDGROUND: {
    id: 'midground',
    speed: 0.7,
    zIndex: 1,
    label: 'Middle layer — buildings, trees, mid-ground characters',
  },
  FOREGROUND: {
    id: 'foreground',
    speed: 1.0,
    zIndex: 2,
    label: 'Natural scroll layer — heroes, UI, primary content',
  },
  OVERLAY: {
    id: 'overlay',
    speed: 1.2,
    zIndex: 3,
    label: 'Closest layer — particles, overlays, vignette',
  },
};

/**
 * Resolve a depth configuration by key.
 */
export function getDepth(key) {
  return DEPTH[key?.toUpperCase()] || DEPTH.FOREGROUND;
}

/**
 * Return all depth keys for iteration.
 */
export const DEPTH_KEYS = Object.keys(DEPTH);
