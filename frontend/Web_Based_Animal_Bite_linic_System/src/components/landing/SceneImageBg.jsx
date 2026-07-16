import { useRef, useEffect, useState, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * SceneImageBg - Full-bleed CDN background image with:
 * - Lazy loading via native loading="lazy"
 * - GSAP fade-in on scroll
 * - Subtle gradient overlays for text readability
 * - Shadow/glow accents
 * - Responsive sizing with object-cover
 * - Graceful fallback on broken image URLs
 */
export default function SceneImageBg({
  src,
  alt = 'Healthcare scene',
  overlay = 'dark',
  overlayOpacity = 0.3,
  className = '',
  reducedMotion = false,
  children,
}) {
  const imgRef = useRef(null);
  const overlayRef = useRef(null);
  const containerRef = useRef(null);
  const [imgStatus, setImgStatus] = useState('loading'); // 'loading' | 'loaded' | 'error'
  const loaded = imgStatus === 'loaded';

  // Fallback gradient matching overlay mood
  const fallbackGradient = useMemo(() => {
    const gradients = {
      dark: 'from-gray-100 via-gray-50 to-white',
      warm: 'from-amber-50 via-orange-50 to-white',
      clinical: 'from-blue-50 via-sky-50 to-white',
    };
    return gradients[overlay] || gradients.dark;
  }, [overlay]);

  // GSAP fade-in on load + scroll
  useEffect(() => {
    if (!loaded) return;

    const ctx = gsap.context(() => {
      // Image fade in
      gsap.fromTo(
        imgRef.current,
        { opacity: 0, scale: 1.05 },
        {
          opacity: 1,
          scale: 1,
          duration: reducedMotion ? 0.4 : 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'center center',
            toggleActions: 'play none none reverse',
          },
        }
      );

      // Overlay fades in after image
      if (overlayRef.current) {
        gsap.fromTo(
          overlayRef.current,
          { opacity: 0 },
          {
            opacity: 1,
            duration: reducedMotion ? 0.3 : 0.8,
            ease: 'power1.out',
            delay: 0.2,
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top bottom',
              end: 'center center',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [loaded, reducedMotion]);

  const overlayGradient =
    overlay === 'dark'
      ? `linear-gradient(to bottom, rgba(0,0,0,${overlayOpacity}) 0%, rgba(0,0,0,${overlayOpacity * 0.5}) 40%, transparent 60%)`
      : overlay === 'warm'
        ? `linear-gradient(to bottom, rgba(251, 191, 36, ${overlayOpacity * 0.3}) 0%, rgba(251, 191, 36, ${overlayOpacity * 0.1}) 50%, transparent 70%)`
        : overlay === 'clinical'
          ? `linear-gradient(to bottom, rgba(59, 130, 246, ${overlayOpacity * 0.2}) 0%, transparent 50%)`
          : `linear-gradient(to bottom, rgba(0,0,0,${overlayOpacity}) 0%, transparent 50%)`;

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden ${className}`}
    >
      {/* Persistent fallback gradient behind image for smooth transitions */}
      <div className={`absolute inset-0 bg-gradient-to-b ${fallbackGradient}`} />

      {/* Image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setImgStatus('loaded')}
        onError={() => setImgStatus('error')}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: imgStatus === 'loaded' ? undefined : 0 }}
      />

      {/* Gradient overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 pointer-events-none"
        style={{ background: overlayGradient, opacity: 0 }}
      />

      {/* Subtle shadow vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.25) 100%)',
        }}
      />

      {/* Content overlay */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}

/**
 * SceneImageCard - A floating image card with 3D shadow, rounded corners, and hover lift.
 * Used for inset images within scenes (not full-bleed).
 */
export function SceneImageCard({ src, alt, className = '', children }) {
  const cardRef = useRef(null);

  // Hover lift effect
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const onEnter = () => {
      gsap.to(card, { y: -6, scale: 1.02, duration: 0.4, ease: 'power2.out' });
    };
    const onLeave = () => {
      gsap.to(card, { y: 0, scale: 1, duration: 0.6, ease: 'power2.out' });
    };

    card.addEventListener('mouseenter', onEnter);
    card.addEventListener('mouseleave', onLeave);
    return () => {
      card.removeEventListener('mouseenter', onEnter);
      card.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden rounded-2xl shadow-xl shadow-black/10 ${className}`}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="w-full h-full object-cover"
      />
      {children && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
      )}
      {children && <div className="absolute bottom-0 left-0 right-0 p-4">{children}</div>}
    </div>
  );
}
