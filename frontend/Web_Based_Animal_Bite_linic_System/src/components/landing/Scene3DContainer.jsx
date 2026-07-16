import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

gsap.registerPlugin(ScrollTrigger);

/**
 * Scene3DContainer - Wraps a scene with CSS 3D perspective, parallax depth layers,
 * enhanced ambient lighting, and floating depth particles.
 *
 * Creates a cinematic depth feel by:
 * - Applying CSS perspective to the container
 * - Adding separate foreground/midground/background parallax layers
 * - Rendering ambient depth particles that float independently
 * - Adding a subtle vignette overlay for depth
 */
export default function Scene3DContainer({ children, depthLayers = { bg: true, mg: true, fg: true } }) {
  const containerRef = useRef(null);
  const bgLayerRef = useRef(null);
  const mgLayerRef = useRef(null);
  const depthParticleRef = useRef(null);
  const fgLayerRef = useRef(null);
  const particlesRef = useRef([]);
  const reducedMotion = usePrefersReducedMotion();

  // Parallax layers move at different speeds on scroll
  useEffect(() => {
    if (reducedMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const speed = { bg: -0.15, depth: -0.1, mg: -0.05, fg: 0.08 };

      const parallaxConfig = {
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
          invalidateOnRefresh: true,
        },
      };

      if (bgLayerRef.current && depthLayers.bg) {
        gsap.to(bgLayerRef.current, {
          y: () => window.innerHeight * speed.bg,
          ...parallaxConfig,
        });
      }

      if (depthParticleRef.current && depthLayers.mg) {
        gsap.to(depthParticleRef.current, {
          y: () => window.innerHeight * speed.depth,
          ...parallaxConfig,
        });
      }

      if (mgLayerRef.current && depthLayers.mg) {
        gsap.to(mgLayerRef.current, {
          y: () => window.innerHeight * speed.mg,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
            invalidateOnRefresh: true,
          },
        });
      }

      if (fgLayerRef.current && depthLayers.fg) {
        gsap.to(fgLayerRef.current, {
          y: () => window.innerHeight * speed.fg,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
            invalidateOnRefresh: true,
          },
        });
      }

      // Floating depth particles
      particlesRef.current.forEach((p, i) => {
        if (!p) return;
        gsap.to(p, {
          y: -15 - (i % 3) * 10,
          x: (i % 2 === 0 ? 1 : -1) * (8 + i * 2),
          rotation: (i % 2 === 0 ? 1 : -1) * (5 + i),
          duration: 4 + (i % 5) * 1.5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: i * 0.3,
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [reducedMotion, depthLayers.bg, depthLayers.mg, depthLayers.fg]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      style={{
        perspective: '1200px',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Background depth layer */}
      {depthLayers.bg && (
        <div ref={bgLayerRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          {/* Ambient glow orbs */}
          <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-blue-200/5 blur-[80px]" />
          <div className="absolute bottom-1/3 right-1/4 w-[250px] h-[250px] rounded-full bg-cyan-200/5 blur-[60px]" />
        </div>
      )}

      {/* Midground depth layer - particles */}
      {depthLayers.mg && (
        <div ref={depthParticleRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 1, transform: 'translateZ(-100px)' }}>
          {/* Floating depth particles */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`depth-particle-${i}`}
              ref={(el) => (particlesRef.current[i] = el)}
              className="absolute rounded-full"
              style={{
                width: `${3 + (i % 3) * 2}px`,
                height: `${3 + (i % 3) * 2}px`,
                background: i % 2 === 0 ? 'rgba(59, 130, 246, 0.15)' : 'rgba(6, 182, 212, 0.1)',
                left: `${15 + i * 11}%`,
                top: `${20 + (i * 7) % 60}%`,
                filter: 'blur(1px)',
              }}
            />
          ))}
        </div>
      )}

      {/* Main content */}
      <div ref={mgLayerRef} className="relative" style={{ zIndex: 2, transform: 'translateZ(0px)' }}>
        {children}
      </div>

      {/* Foreground depth layer - subtle floating accents */}
      {depthLayers.fg && (
        <div ref={fgLayerRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 3, transform: 'translateZ(100px)' }}>
          {/* Subtle warm light overlay on bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-amber-50/10 to-transparent" />
        </div>
      )}

      {/* Vignette overlay for cinematic depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 4,
          background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.03) 100%)',
        }}
      />
    </div>
  );
}
