import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import usePrefersReducedMotion from '../../../hooks/usePrefersReducedMotion';
import { useCharacterBreathing } from '../../../hooks/useHoverTilt';
import SceneImageBg from '../SceneImageBg';

gsap.registerPlugin(ScrollTrigger);

export default function SceneOne() {
  const sectionRef = useRef(null);
  const bgRef = useRef(null);
  const sunRef = useRef(null);
  const cloudsRef = useRef([]);
  const birdsRef = useRef([]);
  const treesRef = useRef([]);
  const fatherRef = useRef(null);
  const daughterRef = useRef(null);
  const houseRef = useRef(null);
  const textRef = useRef(null);
  const groundRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  // Character breathing animations (respects reduced motion)
  useCharacterBreathing(fatherRef, { amplitude: 0.006, duration: 3.2, disabled: reducedMotion });
  useCharacterBreathing(daughterRef, { amplitude: 0.008, duration: 2.8, disabled: reducedMotion });

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Background gradient subtle pulse
      if (!reducedMotion) {
        gsap.to(bgRef.current, {
          attr: { 'stop-opacity': 0.15 },
          duration: 4,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });

        // Sun glow pulse
        gsap.to(sunRef.current, {
          scale: 1.08,
          duration: 3,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
        });

        // Floating clouds
        cloudsRef.current.forEach((cloud, i) => {
          gsap.to(cloud, {
            x: i % 2 === 0 ? 30 : -30,
            duration: 8 + i * 2,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          });
        });

        // Flying birds
        birdsRef.current.forEach((bird, i) => {
          gsap.to(bird, {
            y: -20,
            x: 40 + i * 20,
            duration: 6 + i,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          });
        });

        // Gentle tree sway
        treesRef.current.forEach((tree, i) => {
          gsap.to(tree, {
            rotation: i % 2 === 0 ? 1.5 : -1.5,
            duration: 4 + i,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            transformOrigin: 'bottom center',
          });
        });
      }

      // Scroll-triggered entrance animations
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'center center',
          toggleActions: 'play none none reverse',
        },
      });

      if (!reducedMotion) {
        tl.fromTo(
          [sunRef.current, ...cloudsRef.current],
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 1, stagger: 0.3, ease: 'power2.out' }
        )
          .fromTo(
            [houseRef.current, ...treesRef.current],
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: 'back.out(1.4)' },
            '-=0.4'
          )
          .fromTo(
            groundRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.6 },
            '-=0.3'
          )
          .fromTo(
            fatherRef.current,
            { x: -80, opacity: 0 },
            { x: 0, opacity: 1, duration: 1.2, ease: 'power2.out' },
            '-=0.5'
          )
          .fromTo(
            daughterRef.current,
            { x: -80, opacity: 0 },
            { x: 0, opacity: 1, duration: 1, ease: 'power2.out' },
            '-=0.8'
          )
          .fromTo(
            textRef.current,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
            '-=0.3'
          );
      } else {
        gsap.set(
          [
            sunRef.current,
            ...cloudsRef.current,
            houseRef.current,
            ...treesRef.current,
            groundRef.current,
            fatherRef.current,
            daughterRef.current,
            textRef.current,
          ],
          { opacity: 1 }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Real image background */}
      <SceneImageBg
        src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1920&q=80"
        alt="Family walking in a peaceful neighborhood"
        overlay="warm"
        overlayOpacity={0.25}
        reducedMotion={reducedMotion}
      />

      {/* Main SVG Illustration overlay */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="scene1-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="40%" stopColor="#FBBF24" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#FEF3C7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FDF2E9" />
          </linearGradient>
          <linearGradient id="scene1-ground" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#D4E7C5" />
            <stop offset="100%" stopColor="#A8C89A" />
          </linearGradient>
          <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDE047" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#FDE047" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#FDE047" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="path-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#E8D5C4" />
            <stop offset="100%" stopColor="#D4BFA8" />
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect ref={bgRef} width="1440" height="900" fill="url(#scene1-sky)" />

        {/* Sun glow */}
        <circle cx="1100" cy="180" r="200" fill="url(#sun-glow)" />
        <circle
          ref={sunRef}
          cx="1100"
          cy="180"
          r="55"
          fill="#FDE047"
          opacity="0.9"
        />

        {/* Clouds */}
        {[
          { x: 200, y: 120, scale: 1 },
          { x: 600, y: 80, scale: 0.8 },
          { x: 1000, y: 100, scale: 1.1 },
          { x: 1300, y: 140, scale: 0.7 },
        ].map((c, i) => (
          <g
            key={`cloud-${i}`}
            ref={(el) => (cloudsRef.current[i] = el)}
            transform={`translate(${c.x},${c.y}) scale(${c.scale})`}
            opacity="0.6"
          >
            <ellipse cx="0" cy="0" rx="50" ry="20" fill="white" opacity="0.8" />
            <ellipse cx="-20" cy="-5" rx="30" ry="15" fill="white" opacity="0.8" />
            <ellipse cx="25" cy="-3" rx="35" ry="16" fill="white" opacity="0.7" />
          </g>
        ))}

        {/* Birds */}
        {[
          { x: 400, y: 200 },
          { x: 500, y: 170 },
          { x: 450, y: 230 },
        ].map((b, i) => (
          <g
            key={`bird-${i}`}
            ref={(el) => (birdsRef.current[i] = el)}
            transform={`translate(${b.x},${b.y})`}
            opacity="0.4"
          >
            <path
              d="M0,0 Q12,-10 25,0 Q12,-4 0,0"
              fill="none"
              stroke="#78716C"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </g>
        ))}

        {/* Houses in background */}
        <g ref={houseRef} transform="translate(150, 380)">
          <rect x="0" y="40" width="120" height="100" rx="4" fill="#F5E6CC" stroke="#D4BFA8" strokeWidth="1" />
          <polygon points="-10,40 60,-10 130,40" fill="#E8A87C" stroke="#D4956A" strokeWidth="1" />
          <rect x="45" y="80" width="30" height="60" rx="2" fill="#BFA67A" />
          <rect x="15" y="60" width="25" height="25" rx="3" fill="#BFDBFE" stroke="#93C5FD" strokeWidth="1" />
          <rect x="80" y="60" width="25" height="25" rx="3" fill="#BFDBFE" stroke="#93C5FD" strokeWidth="1" />
        </g>

        {/* Trees */}
        {[
          { x: 350, y: 400, scale: 1 },
          { x: 950, y: 390, scale: 1.2 },
          { x: 1200, y: 410, scale: 0.9 },
          { x: 100, y: 420, scale: 1.1 },
        ].map((t, i) => (
          <g
            key={`tree-${i}`}
            ref={(el) => (treesRef.current[i] = el)}
            transform={`translate(${t.x},${t.y}) scale(${t.scale})`}
          >
            <rect x="-4" y="20" width="8" height="40" rx="3" fill="#8B6914" />
            <ellipse cx="0" cy="10" rx="25" ry="22" fill="#6BAF5D" />
            <ellipse cx="-10" cy="15" rx="18" ry="16" fill="#7BC36A" opacity="0.7" />
            <ellipse cx="10" cy="8" rx="16" ry="14" fill="#5CA34F" opacity="0.5" />
          </g>
        ))}

        {/* Ground / road */}
        <g ref={groundRef}>
          <rect x="0" y="530" width="1440" height="370" fill="url(#scene1-ground)" />
          {/* Walking path */}
          <path d="M0,580 Q360,560 720,570 Q1080,580 1440,565" fill="none" stroke="url(#path-grad)" strokeWidth="60" opacity="0.5" />
          {/* Fence */}
          <g opacity="0.3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <rect key={i} x={200 + i * 100} y="460" width="4" height="70" rx="2" fill="#A8A29E" />
            ))}
            <rect x="190" y="480" width="520" height="3" rx="1" fill="#A8A29E" />
            <rect x="190" y="510" width="520" height="3" rx="1" fill="#A8A29E" />
          </g>
        </g>

        {/* Father character */}
        <g
          ref={fatherRef}
          transform="translate(580, 320)"
        >
          {/* Shadow */}
          <ellipse cx="0" cy="160" rx="30" ry="8" fill="rgba(0,0,0,0.08)" />
          {/* Body */}
          <rect x="-18" y="40" width="36" height="55" rx="8" fill="#4F46E5" />
          {/* Legs */}
          <rect x="-14" y="92" width="12" height="55" rx="5" fill="#1F2937" />
          <rect x="2" y="92" width="12" height="55" rx="5" fill="#1F2937" />
          {/* Head */}
          <circle cx="0" cy="18" r="22" fill="#FDE8D0" />
          {/* Hair */}
          <path d="M-22,10 Q0,-10 22,10 Q22,0 0,-18 Q-22,0 -22,10" fill="#374151" />
          {/* Arm reaching down to hold daughter's hand */}
          <path d="M-18,55 Q-35,75 -25,100" stroke="#FDE8D0" strokeWidth="8" strokeLinecap="round" fill="none" />
          {/* Shirt sleeve */}
          <path d="M-18,50 Q-28,60 -30,72" stroke="#4F46E5" strokeWidth="10" strokeLinecap="round" fill="none" />
          {/* Eye */}
          <circle cx="-6" cy="15" r="2.5" fill="#374151" />
          {/* Smile */}
          <path d="M-6,22 Q0,28 6,22" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Daughter character */}
        <g
          ref={daughterRef}
          transform="translate(640, 350)"
        >
          {/* Shadow */}
          <ellipse cx="0" cy="130" rx="20" ry="6" fill="rgba(0,0,0,0.08)" />
          {/* Body (dress) */}
          <path d="M-15,30 L-18,80 Q0,90 18,80 L15,30 Z" fill="#F472B6" />
          {/* Legs */}
          <rect x="-10" y="78" width="8" height="40" rx="4" fill="#FDE8D0" />
          <rect x="2" y="78" width="8" height="40" rx="4" fill="#FDE8D0" />
          {/* Shoes */}
          <ellipse cx="-6" cy="120" rx="7" ry="4" fill="#EF4444" />
          <ellipse cx="6" cy="120" rx="7" ry="4" fill="#EF4444" />
          {/* Head */}
          <circle cx="0" cy="14" r="18" fill="#FDE8D0" />
          {/* Hair (with pigtails) */}
          <path d="M-18,8 Q-8,-12 8,-12 Q18,-8 18,8 Q18,0 8,-6 Q-8,-6 -18,8" fill="#92400E" />
          <circle cx="-16" cy="12" r="6" fill="#92400E" />
          <circle cx="16" cy="12" r="6" fill="#92400E" />
          {/* Arm holding father's hand */}
          <path d="M18,50 Q30,70 25,88" stroke="#FDE8D0" strokeWidth="6" strokeLinecap="round" fill="none" />
          {/* Eye */}
          <circle cx="-5" cy="12" r="2" fill="#374151" />
          {/* Smile */}
          <path d="M-4,19 Q0,24 4,19" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Decorative flowers */}
        {[
          { x: 300, y: 600 },
          { x: 800, y: 620 },
          { x: 1100, y: 590 },
          { x: 500, y: 640 },
          { x: 1300, y: 610 },
        ].map((f, i) => (
          <g key={`flower-${i}`} transform={`translate(${f.x},${f.y})`} opacity="0.6">
            <line x1="0" y1="0" x2="0" y2="15" stroke="#4A7C3F" strokeWidth="2" />
            <circle cx="0" cy="-3" r="4" fill="#FBBF24" />
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <circle
                key={angle}
                cx={Math.cos((angle * Math.PI) / 180) * 5}
                cy={Math.sin((angle * Math.PI) / 180) * 5}
                r="3"
                fill="#FDE68A"
                opacity="0.7"
              />
            ))}
          </g>
        ))}
      </svg>

      {/* Minimal text overlay */}
      <div className="relative z-10 text-center max-w-2xl mx-auto px-6">
        <p
          ref={textRef}
          className="text-xl sm:text-2xl text-amber-900/60 font-light tracking-wide"
        >
          A peaceful morning in the neighborhood
        </p>
      </div>
    </section>
  );
}
