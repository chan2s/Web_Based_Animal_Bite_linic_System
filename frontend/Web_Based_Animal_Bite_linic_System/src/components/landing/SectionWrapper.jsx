import { useRef } from 'react';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import { getDepth } from '../../animations/depthPlanes';

/**
 * SectionWrapper — Core scene wrapper with:
 * - CSS custom-property theming via data attributes
 * - aspect-ratio reservation on the container
 * - child slot for depth-plane content
 * - will-change management (applied via GSAP at runtime)
 */
export default function SectionWrapper({
  id,
  theme = 'light',
  as = 'section',
  className = '',
  children,
  ...props
}) {
  const sectionRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const Tag = as;

  return (
    <Tag
      ref={sectionRef}
      id={id}
      data-theme={theme}
      className={`
        section-wrapper relative w-full overflow-hidden
        ${reducedMotion ? 'motion-reduce' : ''}
        ${className}
      `}
      style={{
        aspectRatio: 'auto',
        willChange: 'auto',
      }}
      {...props}
    >
      {children}
    </Tag>
  );
}

/**
 * DepthPlane — A single parallax layer with fixed z-index and speed offset.
 * Rendered as a direct child of SectionWrapper.
 * speedMultiplier is multiplied against the scene's base parallax speed.
 */
export function DepthPlane({
  as = 'div',
  depth = 'midground',
  className = '',
  children,
  ...props
}) {
  const Tag = as;
  const config = getDepth(depth);

  return (
    <Tag
      className={`depth-plane depth-${depth} ${className}`}
      data-depth={depth}
      data-speed={config.speed}
      style={{
        zIndex: config.zIndex,
        willChange: 'transform',
      }}
      {...props}
    >
      {children}
    </Tag>
  );
}
