import { useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import usePrefersReducedMotion from '../../../hooks/usePrefersReducedMotion';
import SceneImageBg from '../SceneImageBg';

gsap.registerPlugin(ScrollTrigger);

export default function SceneFour() {
  const sectionRef = useRef(null);
  const phoneRef = useRef(null);
  const glowRef = useRef(null);
  const raysRef = useRef([]);
  const floatElementsRef = useRef([]);
  const textRef = useRef(null);
  const subtitleRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  // Phone hover tilt
  const phoneTilt = useRef({ x: 0, y: 0, isHovering: false });

  const handlePhoneEnter = useCallback(() => {
    if (reducedMotion || !phoneRef.current) return;
    phoneTilt.current.isHovering = true;
    gsap.to(phoneRef.current, {
      scale: 1.04,
      duration: 0.5,
      ease: 'power2.out',
    });
    gsap.to(glowRef.current, {
      scale: 1.2,
      opacity: 0.6,
      duration: 0.5,
      ease: 'power2.out',
    });
  }, [reducedMotion]);

  const handlePhoneMove = useCallback((e) => {
    if (reducedMotion || !phoneTilt.current.isHovering || !phoneRef.current) return;
    const rect = phoneRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const tiltY = (x - 0.5) * 20;
    const tiltX = (0.5 - y) * 14;
    gsap.to(phoneRef.current, {
      rotateX: tiltX,
      rotateY: tiltY,
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
    gsap.to(glowRef.current, {
      scale: 1,
      opacity: undefined,
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
        // Phone rises and rotates into view
        tl.fromTo(phoneRef.current,
          { y: 120, opacity: 0, rotation: -15, scale: 0.7 },
          { y: 0, opacity: 1, rotation: 0, scale: 1, duration: 1.5, ease: 'power3.out' },
          0.3
        )
        // Phone screen glow
        .fromTo(glowRef.current,
          { opacity: 0, scale: 0.5 },
          { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' },
          '-=0.8'
        )
        // Light rays fanning out
        .fromTo(raysRef.current,
          { opacity: 0, scale: 0.3 },
          { opacity: 0.6, scale: 1, duration: 1, stagger: 0.1, ease: 'power2.out' },
          '-=0.6'
        )
        // Floating medical icons
        .fromTo(floatElementsRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 0.25, duration: 0.8, stagger: 0.15, ease: 'back.out(1.4)' },
          '-=0.4'
        )
        .fromTo(textRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
          '-=0.2'
        )
        .fromTo(subtitleRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
          '-=0.3'
        );

        // Phone idle float
        gsap.to(phoneRef.current, {
          y: -8,
          duration: 4,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: 2,
        });

        // Glow pulse
        gsap.to(glowRef.current, {
          scale: 1.05,
          opacity: 0.8,
          duration: 2.5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          delay: 2,
        });
      } else {
        gsap.set([
          phoneRef.current, glowRef.current, ...raysRef.current,
          ...floatElementsRef.current, textRef.current, subtitleRef.current,
        ], { opacity: 1 });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-stone-100 via-blue-50 to-white"
    >
      {/* Real image background - smartphone/healthcare app */}
      <SceneImageBg
        src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1920&q=80"
        alt="Person using smartphone healthcare app"
        overlay="clinical"
        overlayOpacity={0.2}
        reducedMotion={reducedMotion}
      />

      {/* Transitional background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-200/20 blur-[100px]" />
      </div>

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="phone-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
            <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="phone-screen" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#EFF6FF" />
            <stop offset="100%" stopColor="#DBEAFE" />
          </linearGradient>
          <filter id="phone-shadow-top">
            <feDropShadow dx="0" dy="20" stdDeviation="25" floodColor="#3B82F6" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Background */}
        <rect width="1440" height="900" fill="white" opacity="0.3" />

        {/* Light rays */}
        {[
          { x: 720, y: 350, angle: -30, len: 400 },
          { x: 720, y: 350, angle: -15, len: 500 },
          { x: 720, y: 350, angle: 0, len: 550 },
          { x: 720, y: 350, angle: 15, len: 500 },
          { x: 720, y: 350, angle: 30, len: 400 },
        ].map((ray, i) => {
          const rad = (ray.angle * Math.PI) / 180;
          const cos = Math.cos(rad);
          const sin = Math.sin(rad);
          return (
            <g key={i} ref={(el) => (raysRef.current[i] = el)} opacity="0">
              <line
                x1={ray.x}
                y1={ray.y}
                x2={ray.x + cos * ray.len}
                y2={ray.y + sin * ray.len}
                stroke="#93C5FD"
                strokeWidth="2"
                opacity="0.3"
                strokeLinecap="round"
              />
            </g>
          );
        })}

        {/* Phone glow background */}
        <circle cx="720" cy="380" r="180" fill="url(#phone-glow)" ref={glowRef} opacity="0" />

        {/* Floating medical icons */}
        {[
          { x: 520, y: 500, d: 'M0,-12 L0,12 M-12,0 L12,0', size: 3, color: '#93C5FD' },
          { x: 920, y: 480, d: 'M0,-15 L0,15 M-15,0 L15,0', size: 3, color: '#93C5FD' },
          { x: 560, y: 280, d: 'M-12,-12 L12,12 M-12,12 L12,-12', size: 3, color: '#93C5FD' },
          { x: 880, y: 260, d: 'M0,-12 L0,12 M-12,0 L12,0', size: 3, color: '#93C5FD' },
        ].map((el, i) => (
          <g
            key={`float-${i}`}
            ref={(r) => (floatElementsRef.current[i] = r)}
            transform={`translate(${el.x},${el.y})`}
            opacity="0"
            stroke={el.color}
            strokeWidth={el.size}
            strokeLinecap="round"
          >
            <path d={el.d} />
          </g>
        ))}

        {/* Smartphone with hover 3D tilt */}
        <g
          ref={phoneRef}
          filter="url(#phone-shadow-top)"
          transform="translate(720, 380)"
          onMouseEnter={handlePhoneEnter}
          onMouseMove={handlePhoneMove}
          onMouseLeave={handlePhoneLeave}
          style={{ cursor: 'pointer', transformStyle: 'preserve-3d' }}
        >
          {/* Phone body */}
          <rect x="-110" y="-200" width="220" height="400" rx="30" fill="#1F2937" />
          <rect x="-106" y="-196" width="212" height="392" rx="27" fill="url(#phone-screen)" />

          {/* Notch */}
          <rect x="-40" y="-190" width="80" height="25" rx="12" fill="#1F2937" />
          <circle cx="0" cy="-177" r="4" fill="#374151" />
          <circle cx="-20" cy="-177" r="2" fill="#3B82F6" />

          {/* Status bar */}
          <text x="-80" y="-165" fontSize="10" fill="#64748B" fontWeight="500">9:41</text>

          {/* Dashboard content on screen */}
          {/* Header */}
          <rect x="-85" y="-140" width="170" height="25" rx="6" fill="#3B82F6" />
          <text x="-70" y="-124" fontSize="9" fill="white" fontWeight="600">AnimalBite Clinic</text>

          {/* Stats cards */}
          <rect x="-85" y="-105" width="52" height="40" rx="6" fill="white" stroke="#E2E8F0" strokeWidth="1" />
          <text x="-73" y="-78" fontSize="14" fill="#3B82F6" fontWeight="bold">24</text>
          <text x="-79" y="-68" fontSize="6" fill="#94A3B8">Patients</text>

          <rect x="-26" y="-105" width="52" height="40" rx="6" fill="white" stroke="#E2E8F0" strokeWidth="1" />
          <text x="-14" y="-78" fontSize="14" fill="#10B981" fontWeight="bold">12</text>
          <text x="-20" y="-68" fontSize="6" fill="#94A3B8">Vacc.</text>

          <rect x="33" y="-105" width="52" height="40" rx="6" fill="white" stroke="#E2E8F0" strokeWidth="1" />
          <text x="45" y="-78" fontSize="14" fill="#8B5CF6" fontWeight="bold">8</text>
          <text x="39" y="-68" fontSize="6" fill="#94A3B8">Appts</text>

          {/* Appointment list */}
          <rect x="-85" y="-55" width="170" height="25" rx="6" fill="#F8FAFC" />
          <circle cx="-72" cy="-42" r="4" fill="#3B82F6" />
          <text x="-62" y="-39" fontSize="7" fill="#475569">Juan Dela Cruz - Rabies Vax</text>

          <rect x="-85" y="-25" width="170" height="25" rx="6" fill="#F8FAFC" />
          <circle cx="-72" cy="-12" r="4" fill="#10B981" />
          <text x="-62" y="-9" fontSize="7" fill="#475569">Maria Santos - Checkup</text>

          <rect x="-85" y="5" width="170" height="25" rx="6" fill="#F8FAFC" />
          <circle cx="-72" cy="18" r="4" fill="#F59E0B" />
          <text x="-62" y="21" fontSize="7" fill="#475569">Pedro Reyes - Follow-up</text>

          {/* Bottom navigation */}
          <rect x="-85" y="50" width="170" height="30" rx="8" fill="white" stroke="#E2E8F0" strokeWidth="1" />
          <rect x="-75" y="58" width="20" height="15" rx="4" fill="#3B82F6" />
          <rect x="-48" y="58" width="20" height="15" rx="4" fill="#E2E8F0" />
          <rect x="-21" y="58" width="20" height="15" rx="4" fill="#E2E8F0" />
          <rect x="6" y="58" width="20" height="15" rx="4" fill="#E2E8F0" />
          <rect x="33" y="58" width="20" height="15" rx="4" fill="#E2E8F0" />

          {/* Home indicator */}
          <rect x="-40" y="180" width="80" height="4" rx="2" fill="#D6D3D1" />
        </g>
      </svg>

      <div className="relative z-10 text-center px-6 mt-[420px] lg:mt-0 lg:mb-0">
        <p
          ref={textRef}
          className="text-xl sm:text-2xl text-blue-700/70 font-light tracking-wide"
        >
          Then they discovered something that changed everything
        </p>
        <p
          ref={subtitleRef}
          className="mt-2 text-sm sm:text-base text-blue-500/60 font-light"
        >
          The Animal Bite Clinic System
        </p>
      </div>
    </section>
  );
}
