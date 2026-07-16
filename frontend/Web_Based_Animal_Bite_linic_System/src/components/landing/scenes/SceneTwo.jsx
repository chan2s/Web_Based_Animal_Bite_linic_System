import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import usePrefersReducedMotion from '../../../hooks/usePrefersReducedMotion';
import { useCharacterBreathing } from '../../../hooks/useHoverTilt';
import SceneImageBg from '../SceneImageBg';

gsap.registerPlugin(ScrollTrigger);

export default function SceneTwo() {
  const sectionRef = useRef(null);
  const skyRef = useRef(null);
  const dogRef = useRef(null);
  const fatherRef = useRef(null);
  const daughterRef = useRef(null);
  const impactRef = useRef(null);
  const textRef = useRef(null);
  const treeRefs = useRef([]);
  const reducedMotion = usePrefersReducedMotion();

  // Character breathing (respects reduced motion)
  useCharacterBreathing(fatherRef, { amplitude: 0.008, duration: 2.5, disabled: reducedMotion });
  useCharacterBreathing(daughterRef, { amplitude: 0.01, duration: 2.0, disabled: reducedMotion });

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'center center',
          toggleActions: 'play none none reverse',
        },
      });

      if (!reducedMotion) {
        // Sky darkens slightly
        tl.to(skyRef.current, {
          attr: { 'stop-color': '#D6D3D1' },
          duration: 2,
          ease: 'power1.inOut',
        }, 0);

        // Dog runs in from the right
        tl.fromTo(dogRef.current,
          { x: 200, opacity: 0 },
          { x: 0, opacity: 1, duration: 1.2, ease: 'power3.out' },
          0.2
        )
        .fromTo(
          fatherRef.current,
          { x: 20, opacity: 1 },
          { x: -5, opacity: 1, duration: 0.6, ease: 'back.out(2)' },
          1.2
        )
        .fromTo(
          daughterRef.current,
          { scale: 1, opacity: 1 },
          { scale: 0.85, opacity: 0.7, duration: 0.4 },
          1.3
        )
        // Impact flash
        .fromTo(
          impactRef.current,
          { opacity: 0, scale: 0.5 },
          { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' },
          1.5
        )
        .to(impactRef.current, { opacity: 0, duration: 0.8 }, 2.0)
        // Trees shake
        .to(treeRefs.current, {
          rotation: 3,
          duration: 0.4,
          ease: 'power2.inOut',
          yoyo: true,
          repeat: 3,
          transformOrigin: 'bottom center',
        }, 1.5)
        .fromTo(
          textRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
          2.2
        );
      } else {
        gsap.set(
          [dogRef.current, fatherRef.current, daughterRef.current, impactRef.current, textRef.current],
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
        src="https://images.unsplash.com/photo-1579684385127-1ef0c0e3e6b3?w=1920&q=80"
        alt="Medical examination showing concern"
        overlay="dark"
        overlayOpacity={0.35}
        reducedMotion={reducedMotion}
      />

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="scene2-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="40%" stopColor="#FBBF24" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#FEF3C7" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#E7E5E4" />
          </linearGradient>
          <radialGradient id="impact-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EF4444" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sky - transitions to gray */}
        <rect ref={skyRef} width="1440" height="900" fill="url(#scene2-sky)" />

        {/* Ground */}
        <rect x="0" y="530" width="1440" height="370" fill="#D4E7C5" />
        <rect x="0" y="530" width="1440" height="370" fill="rgba(0,0,0,0.03)" />

        {/* Path */}
        <path d="M0,580 Q360,560 720,570 Q1080,580 1440,565" fill="none" stroke="#E8D5C4" strokeWidth="60" opacity="0.4" />

        {/* Trees - reacting */}
        {[
          { x: 300, y: 400, scale: 1 },
          { x: 900, y: 390, scale: 1.2 },
          { x: 1100, y: 410, scale: 0.9 },
        ].map((t, i) => (
          <g
            key={`tree-${i}`}
            ref={(el) => (treeRefs.current[i] = el)}
            transform={`translate(${t.x},${t.y}) scale(${t.scale})`}
          >
            <rect x="-4" y="20" width="8" height="40" rx="3" fill="#8B6914" />
            <ellipse cx="0" cy="10" rx="25" ry="22" fill="#6BAF5D" />
          </g>
        ))}

        {/* Father - protective stance */}
        <g ref={fatherRef} transform="translate(560, 320)">
          <ellipse cx="0" cy="160" rx="30" ry="8" fill="rgba(0,0,0,0.08)" />
          <rect x="-18" y="40" width="36" height="55" rx="8" fill="#4F46E5" />
          <rect x="-14" y="92" width="12" height="55" rx="5" fill="#1F2937" />
          <rect x="2" y="92" width="12" height="55" rx="5" fill="#1F2937" />
          <circle cx="0" cy="18" r="22" fill="#FDE8D0" />
          <path d="M-22,10 Q0,-10 22,10 Q22,0 0,-18 Q-22,0 -22,10" fill="#374151" />
          {/* Arms raised protectively */}
          <path d="M18,50 Q35,40 40,25" stroke="#FDE8D0" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M18,45 Q32,42 35,32" stroke="#4F46E5" strokeWidth="10" strokeLinecap="round" fill="none" />
          {/* Worried expression */}
          <circle cx="-6" cy="15" r="3" fill="#374151" />
          <circle cx="6" cy="15" r="3" fill="#374151" />
          <path d="M-6,28 Q0,23 6,28" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Daughter - scared, behind father */}
        <g ref={daughterRef} transform="translate(655, 350)">
          <ellipse cx="0" cy="130" rx="20" ry="6" fill="rgba(0,0,0,0.08)" />
          <path d="M-15,30 L-18,80 Q0,90 18,80 L15,30 Z" fill="#F472B6" />
          <rect x="-10" y="78" width="8" height="40" rx="4" fill="#FDE8D0" />
          <rect x="2" y="78" width="8" height="40" rx="4" fill="#FDE8D0" />
          <circle cx="0" cy="14" r="18" fill="#FDE8D0" />
          <path d="M-18,8 Q-8,-12 8,-12 Q18,-8 18,8 Q18,0 8,-6 Q-8,-6 -18,8" fill="#92400E" />
          <circle cx="-16" cy="12" r="6" fill="#92400E" />
          <circle cx="16" cy="12" r="6" fill="#92400E" />
          {/* Arms up in fear */}
          <path d="M-15,50 Q-28,35 -25,20" stroke="#FDE8D0" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M15,50 Q28,35 25,20" stroke="#FDE8D0" strokeWidth="6" strokeLinecap="round" fill="none" />
          {/* Scared eyes */}
          <circle cx="-5" cy="12" r="3" fill="#374151" />
          <circle cx="5" cy="12" r="3" fill="#374151" />
          {/* Open mouth (crying) */}
          <ellipse cx="0" cy="20" rx="4" ry="3" fill="#374151" />
          {/* Tears */}
          <circle cx="-10" cy="18" r="2" fill="#93C5FD" opacity="0.6" />
          <circle cx="10" cy="18" r="2" fill="#93C5FD" opacity="0.6" />
        </g>

        {/* Stray dog */}
        <g ref={dogRef} transform="translate(480, 400)">
          {/* Shadow */}
          <ellipse cx="0" cy="95" rx="35" ry="8" fill="rgba(0,0,0,0.1)" />
          {/* Body */}
          <ellipse cx="0" cy="50" rx="35" ry="20" fill="#A8A29E" />
          {/* Head */}
          <ellipse cx="-35" cy="35" rx="18" ry="16" fill="#A8A29E" />
          {/* Ear */}
          <ellipse cx="-40" cy="20" rx="8" ry="12" fill="#78716C" />
          <ellipse cx="-28" cy="22" rx="6" ry="10" fill="#78716C" />
          {/* Snout */}
          <ellipse cx="-48" cy="38" rx="10" ry="7" fill="#D6D3D1" />
          {/* Nose */}
          <circle cx="-52" cy="36" r="3" fill="#1F2937" />
          {/* Eye (angry) */}
          <circle cx="-38" cy="30" r="3" fill="#1F2937" />
          {/* Teeth show */}
          <path d="M-50,42 L-46,46 L-42,42 L-38,46" stroke="#1F2937" strokeWidth="1.5" fill="none" />
          {/* Tail up (aggressive) */}
          <path d="M35,40 Q50,20 55,10" stroke="#A8A29E" strokeWidth="6" strokeLinecap="round" fill="none" />
          {/* Legs */}
          <rect x="-20" y="65" width="8" height="25" rx="4" fill="#78716C" />
          <rect x="-10" y="65" width="8" height="25" rx="4" fill="#78716C" />
          <rect x="10" y="65" width="8" height="25" rx="4" fill="#78716C" />
          <rect x="20" y="65" width="8" height="25" rx="4" fill="#78716C" />
        </g>

        {/* Impact burst */}
        <g ref={impactRef} transform="translate(540, 420)" opacity="0">
          <circle cx="0" cy="0" r="60" fill="url(#impact-glow)" />
          {/* Impact lines */}
          <line x1="-40" y1="-40" x2="-55" y2="-55" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
          <line x1="40" y1="-20" x2="55" y2="-30" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          <line x1="-30" y1="30" x2="-45" y2="40" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
          <line x1="35" y1="35" x2="50" y2="45" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
        </g>
      </svg>

      <div className="relative z-10 text-center px-6">
        <p
          ref={textRef}
          className="text-xl sm:text-2xl text-stone-700/70 font-light tracking-wide"
        >
          Until everything changed in an instant
        </p>
      </div>
    </section>
  );
}
