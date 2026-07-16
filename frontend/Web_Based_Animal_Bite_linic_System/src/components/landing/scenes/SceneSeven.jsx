import { useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import usePrefersReducedMotion from '../../../hooks/usePrefersReducedMotion';
import { useCharacterBreathing } from '../../../hooks/useHoverTilt';
import SceneImageBg from '../SceneImageBg';

gsap.registerPlugin(ScrollTrigger);

export default function SceneSeven() {
  const sectionRef = useRef(null);
  const sunRef = useRef(null);
  const familyRef = useRef(null);
  const phoneRef = useRef(null);
  const badgeRef = useRef(null);
  const textRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonGroupRef = useRef(null);
  const particlesRef = useRef([]);
  const navigate = useNavigate();
  const reducedMotion = usePrefersReducedMotion();

  // Character breathing (happy, relaxed, respects reduced motion)
  useCharacterBreathing(familyRef, { amplitude: 0.005, duration: 3.5, disabled: reducedMotion });

  // Phone hover tilt
  const phoneTilt = useRef({ x: 0, y: 0, isHovering: false });

  const handlePhoneEnter = useCallback(() => {
    if (reducedMotion || !phoneRef.current) return;
    phoneTilt.current.isHovering = true;
    gsap.to(phoneRef.current, {
      scale: 1.05,
      duration: 0.5,
      ease: 'power2.out',
    });
    gsap.to(badgeRef.current, {
      scale: 1.15,
      duration: 0.5,
      ease: 'power2.out',
    });
  }, [reducedMotion]);

  const handlePhoneMove = useCallback((e) => {
    if (reducedMotion || !phoneTilt.current.isHovering || !phoneRef.current) return;
    const rect = phoneRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    gsap.to(phoneRef.current, {
      rotateX: (0.5 - y) * 15,
      rotateY: (x - 0.5) * 20,
      duration: 0.2,
      ease: 'power1.out',
      overwrite: 'auto',
    });
  }, [reducedMotion]);

  const handlePhoneLeave = useCallback(() => {
    if (reducedMotion || !phoneRef.current) return;
    phoneTilt.current.isHovering = false;
    gsap.to(phoneRef.current, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      duration: 0.8,
      ease: 'elastic.out(1, 0.4)',
      overwrite: 'auto',
    });
    gsap.to(badgeRef.current, {
      scale: 1,
      duration: 0.6,
      ease: 'power2.out',
    });
  }, [reducedMotion]);

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
        // Warm glow
        tl.fromTo(sunRef.current,
          { opacity: 0, scale: 0.8 },
          { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' },
          0
        )
        // Family walking in (from left to center)
        .fromTo(familyRef.current,
          { x: -100, opacity: 0 },
          { x: 0, opacity: 1, duration: 1.5, ease: 'power3.out' },
          0.3
        )
        // Phone floats up
        .fromTo(phoneRef.current,
          { y: 60, opacity: 0, scale: 0.8 },
          { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' },
          0.6
        )
        // Completed badge
        .fromTo(badgeRef.current,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(2)' },
          1.2
        )
        // Floating particles
        .fromTo(particlesRef.current,
          { y: 30, opacity: 0, scale: 0 },
          { y: 0, opacity: 0.4, scale: 1, duration: 0.6, stagger: 0.1, ease: 'power2.out' },
          1.5
        )
        .fromTo(textRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
          1.8
        )
        .fromTo(subtitleRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
          '-=0.3'
        )
        .fromTo(buttonGroupRef.current?.children,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.15, ease: 'power2.out' },
          '-=0.2'
        );

        // Particle float
        particlesRef.current.forEach((p, i) => {
          gsap.to(p, {
            y: -15 - i * 5,
            duration: 3 + i * 0.5,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
            delay: i * 0.3,
          });
        });

        // Sun gentle pulse
        gsap.to(sunRef.current, {
          scale: 1.05,
          duration: 4,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: 2,
        });

        // Phone idle float
        gsap.to(phoneRef.current, {
          y: -5,
          duration: 3.5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: 2,
        });
      } else {
        gsap.set([
          sunRef.current, familyRef.current, phoneRef.current, badgeRef.current,
          textRef.current, subtitleRef.current, ...particlesRef.current,
        ], { opacity: 1 });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white via-blue-50/20 to-amber-50/20"
    >
      {/* Real image background - happy family */}
      <SceneImageBg
        src="https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=1920&q=80"
        alt="Happy family together"
        overlay="warm"
        overlayOpacity={0.2}
        reducedMotion={reducedMotion}
      />

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="scene7-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FEF3C7" />
            <stop offset="30%" stopColor="#FDE68A" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#BFDBFE" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#FDF2E9" />
          </linearGradient>
          <radialGradient id="sun-glow-7" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FDE047" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#FDE047" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#FDE047" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="vaccine-complete" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <filter id="badge-glow">
            <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#10B981" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Sky */}
        <rect width="1440" height="900" fill="url(#scene7-sky)" />

        {/* Sun glow */}
        <circle cx="1100" cy="200" r="250" fill="url(#sun-glow-7)" />
        <circle ref={sunRef} cx="1100" cy="200" r="60" fill="#FDE047" opacity="0.8" />

        {/* Ground */}
        <rect x="0" y="550" width="1440" height="350" fill="#D4E7C5" />
        <path d="M0,590 Q360,575 720,585 Q1080,595 1440,580" fill="none" stroke="#E8D5C4" strokeWidth="60" opacity="0.4" />

        {/* Trees */}
        <g transform="translate(200, 420)">
          <rect x="-4" y="20" width="8" height="40" rx="3" fill="#8B6914" />
          <ellipse cx="0" cy="10" rx="30" ry="26" fill="#6BAF5D" />
          <ellipse cx="-12" cy="18" rx="20" ry="18" fill="#7BC36A" opacity="0.6" />
        </g>
        <g transform="translate(1000, 410)">
          <rect x="-5" y="25" width="10" height="45" rx="3" fill="#8B6914" />
          <ellipse cx="0" cy="12" rx="35" ry="30" fill="#6BAF5D" />
          <ellipse cx="15" cy="15" rx="22" ry="20" fill="#7BC36A" opacity="0.6" />
        </g>

        {/* Family walking home safely */}
        <g ref={familyRef} transform="translate(650, 340)">
          {/* Shadow */}
          <ellipse cx="-20" cy="170" rx="45" ry="10" fill="rgba(0,0,0,0.06)" />

          {/* Father (now healthy) */}
          <g transform="translate(-30, 0)">
            <rect x="-18" y="40" width="36" height="55" rx="8" fill="#4F46E5" />
            <rect x="-14" y="92" width="12" height="55" rx="5" fill="#1F2937" />
            <rect x="2" y="92" width="12" height="55" rx="5" fill="#1F2937" />
            <circle cx="0" cy="18" r="22" fill="#FDE8D0" />
            <path d="M-22,10 Q0,-10 22,10 Q22,0 0,-18 Q-22,0 -22,10" fill="#374151" />
            {/* Happy smile */}
            <path d="M-7,24 Q0,32 7,24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="-6" cy="16" r="2.5" fill="#374151" />
            <circle cx="6" cy="16" r="2.5" fill="#374151" />
            {/* Arm around daughter */}
            <path d="M18,55 Q30,70 35,90" stroke="#4F46E5" strokeWidth="10" strokeLinecap="round" fill="none" />
          </g>

          {/* Daughter (happy) */}
          <g transform="translate(15, 5)">
            <path d="M-15,30 L-18,80 Q0,90 18,80 L15,30 Z" fill="#F472B6" />
            <rect x="-10" y="78" width="8" height="40" rx="4" fill="#FDE8D0" />
            <rect x="2" y="78" width="8" height="40" rx="4" fill="#FDE8D0" />
            <ellipse cx="-6" cy="120" rx="7" ry="4" fill="#EF4444" />
            <ellipse cx="6" cy="120" rx="7" ry="4" fill="#EF4444" />
            <circle cx="0" cy="14" r="18" fill="#FDE8D0" />
            <path d="M-18,8 Q-8,-12 8,-12 Q18,-8 18,8 Q18,0 8,-6 Q-8,-6 -18,8" fill="#92400E" />
            <circle cx="-16" cy="12" r="6" fill="#92400E" />
            <circle cx="16" cy="12" r="6" fill="#92400E" />
            {/* Big smile */}
            <path d="M-5,18 Q0,26 5,18" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="-4" cy="12" r="2" fill="#374151" />
            <circle cx="4" cy="12" r="2" fill="#374151" />
          </g>
        </g>

        {/* Smartphone with 3D hover tilt */}
        <g
          ref={phoneRef}
          transform="translate(1000, 600)"
          onMouseEnter={handlePhoneEnter}
          onMouseMove={handlePhoneMove}
          onMouseLeave={handlePhoneLeave}
          style={{ cursor: 'pointer', transformStyle: 'preserve-3d' }}
        >
          <rect x="-55" y="-100" width="110" height="200" rx="16" fill="#1F2937" />
          <rect x="-52" y="-97" width="104" height="194" rx="14" fill="white" />
          <rect x="-20" y="-92" width="40" height="12" rx="6" fill="#1F2937" />
          <circle cx="0" cy="-86" r="2" fill="#374151" />

          {/* Completed vaccination status */}
          <rect x="-40" y="-72" width="80" height="16" rx="8" fill="#D1FAE5" />
          <circle cx="-28" cy="-64" r="4" fill="#10B981" />
          <text x="-18" y="-61" fontSize="6" fill="#065F46" fontWeight="600">Vaccination Complete</text>

          {/* Checkmark large */}
          <circle cx="0" cy="-20" r="25" fill="#D1FAE5" />
          <circle cx="0" cy="-20" r="20" fill="#10B981" />
          <path d="M-8,-20 L-3,-15 L8,-25" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

          {/* Status details */}
          <text x="-30" y="15" fontSize="6" fill="#64748B">Patient: Juan Dela Cruz</text>
          <text x="-30" y="25" fontSize="6" fill="#64748B">Dose 1 ✓</text>
          <text x="-30" y="33" fontSize="6" fill="#D6D3D1">Dose 2 - Mar 14</text>
          <text x="-30" y="41" fontSize="6" fill="#D6D3D1">Dose 3 - Apr 14</text>
          <text x="-30" y="55" fontSize="6" fill="#10B981" fontWeight="600">Next visit: Mar 14, 2026</text>

          {/* Home indicator */}
          <rect x="-20" y="85" width="40" height="3" rx="1.5" fill="#D6D3D1" />
        </g>

        {/* Completed badge */}
        <g ref={badgeRef} transform="translate(1000, 480)" filter="url(#badge-glow)">
          <rect x="-40" y="-12" width="80" height="24" rx="12" fill="url(#vaccine-complete)" />
          <text x="0" y="4" fontSize="8" fill="white" textAnchor="middle" fontWeight="bold">✓ Fully Protected</text>
        </g>

        {/* Floating decorative particles */}
        {[
          { x: 400, y: 250 },
          { x: 500, y: 200 },
          { x: 800, y: 280 },
          { x: 600, y: 180 },
          { x: 700, y: 220 },
          { x: 900, y: 300 },
        ].map((p, i) => (
          <g
            key={`particle-${i}`}
            ref={(el) => (particlesRef.current[i] = el)}
            transform={`translate(${p.x},${p.y})`}
            opacity="0"
          >
            <circle cx="0" cy="0" r="3" fill="#93C5FD" />
          </g>
        ))}
      </svg>

      {/* Overlay content */}
      <div ref={buttonGroupRef} className="relative z-10 text-center px-6 mt-[380px] lg:mt-0">
        <p
          ref={textRef}
          className="text-3xl sm:text-4xl lg:text-5xl text-gray-800 font-bold tracking-tight"
        >
          Protect Lives Through{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            Smarter Healthcare
          </span>
        </p>
        <p
          ref={subtitleRef}
          className="mt-3 text-base sm:text-lg text-gray-500 font-light max-w-xl mx-auto"
        >
          Every minute matters. Every record counts. Every life is protected.
        </p>

        {/* Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-3.5 bg-blue-600 text-white font-semibold rounded-2xl text-base shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300"
          >
            Create Your Account
          </button>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3.5 text-gray-700 font-semibold rounded-2xl text-base border border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:-translate-y-0.5 transition-all duration-300"
          >
            Sign In
          </button>
        </div>
      </div>
    </section>
  );
}
