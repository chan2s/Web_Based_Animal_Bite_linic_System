import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import usePrefersReducedMotion from '../../../hooks/usePrefersReducedMotion';
import { useCharacterBreathing } from '../../../hooks/useHoverTilt';
import SceneImageBg from '../SceneImageBg';

gsap.registerPlugin(ScrollTrigger);

export default function SceneThree() {
  const sectionRef = useRef(null);
  const bgRef = useRef(null);
  const fatherRef = useRef(null);
  const daughterRef = useRef(null);
  const paperRefs = useRef([]);
  const clockRef = useRef(null);
  const worryLinesRef = useRef(null);
  const textRef = useRef(null);
  const questionRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  // Character trembling with worry (respects reduced motion)
  useCharacterBreathing(fatherRef, { amplitude: 0.015, duration: 1.8, disabled: reducedMotion });
  useCharacterBreathing(daughterRef, { amplitude: 0.02, duration: 1.5, disabled: reducedMotion });

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
        // Environment darkens
        tl.to(bgRef.current, { attr: { 'stop-color': '#D6D3D1' }, duration: 1.5 }, 0)
          .to(bgRef.current, { attr: { 'stop-color': '#A8A29E' }, duration: 1.5 }, 1.5);

        // Father - confused pose
        tl.fromTo(fatherRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.6 },
          0.5
        );

        // Daughter crying
        tl.fromTo(daughterRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.6 },
          0.7
        );

        // Papers floating in
        paperRefs.current.forEach((paper, i) => {
          tl.fromTo(paper,
            { y: 50, x: 30, opacity: 0, rotation: -10 },
            { y: 0, x: 0, opacity: 0.7, rotation: i % 2 === 0 ? 8 : -5, duration: 1, ease: 'power2.out' },
            0.8 + i * 0.15
          ).to(paper,
            { y: -15, rotation: i % 2 === 0 ? 12 : -8, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 },
            1.8 + i * 0.15
          );
        });

        // Clock spins in
        tl.fromTo(clockRef.current,
          { scale: 0, opacity: 0, rotation: -180 },
          { scale: 1, opacity: 1, rotation: 0, duration: 1.2, ease: 'back.out(1.7)' },
          1.2
        );

        // Clock hands ticking
        if (!reducedMotion) {
          gsap.to(clockRef.current?.querySelector('.clock-hour'), {
            rotation: 360,
            duration: 120,
            ease: 'none',
            repeat: -1,
            transformOrigin: '50% 50%',
          });
          gsap.to(clockRef.current?.querySelector('.clock-minute'), {
            rotation: 360,
            duration: 10,
            ease: 'none',
            repeat: -1,
            transformOrigin: '50% 50%',
          });
        }

        // Worry lines
        tl.fromTo(worryLinesRef.current,
          { opacity: 0 },
          { opacity: 0.5, duration: 0.8 },
          1.5
        );

        // Text fades
        tl.fromTo(textRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          2.5
        ).fromTo(questionRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          '-=0.4'
        );
      } else {
        gsap.set([
          fatherRef.current, daughterRef.current, ...paperRefs.current,
          clockRef.current, worryLinesRef.current, textRef.current, questionRef.current,
        ], { opacity: 1 });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Real image background - clinic */}
      <SceneImageBg
        src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&q=80"
        alt="Modern medical clinic reception"
        overlay="dark"
        overlayOpacity={0.4}
        reducedMotion={reducedMotion}
      />

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="scene3-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#A8A29E" />
          </linearGradient>
          <filter id="paper-shadow">
            <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* Darkening sky */}
        <rect ref={bgRef} width="1440" height="900" fill="url(#scene3-sky)" opacity="0.8" />

        {/* Ground */}
        <rect x="0" y="500" width="1440" height="400" fill="#78716C" opacity="0.3" />
        <path d="M0,550 Q360,540 720,550 Q1080,560 1440,545" fill="none" stroke="#A8A29E" strokeWidth="40" opacity="0.3" />

        {/* Father - worried, holding papers */}
        <g ref={fatherRef} transform="translate(580, 320)" opacity="0">
          <ellipse cx="0" cy="160" rx="30" ry="8" fill="rgba(0,0,0,0.08)" />
          <rect x="-18" y="40" width="36" height="55" rx="8" fill="#4F46E5" />
          <rect x="-14" y="92" width="12" height="55" rx="5" fill="#1F2937" />
          <rect x="2" y="92" width="12" height="55" rx="5" fill="#1F2937" />
          <circle cx="0" cy="18" r="22" fill="#FDE8D0" />
          <path d="M-22,10 Q0,-10 22,10 Q22,0 0,-18 Q-22,0 -22,10" fill="#374151" />
          {/* Worried expression */}
          <circle cx="-6" cy="15" r="3" fill="#374151" />
          <circle cx="6" cy="15" r="3" fill="#374151" />
          <path d="M-8,25 Q0,20 8,25" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
          {/* Hand on head */}
          <path d="M18,45 Q30,30 25,15" stroke="#FDE8D0" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M18,40 Q28,28 22,18" stroke="#4F46E5" strokeWidth="10" strokeLinecap="round" fill="none" />
        </g>

        {/* Daughter - crying */}
        <g ref={daughterRef} transform="translate(665, 350)" opacity="0">
          <ellipse cx="0" cy="130" rx="20" ry="6" fill="rgba(0,0,0,0.08)" />
          <path d="M-15,30 L-18,80 Q0,90 18,80 L15,30 Z" fill="#F472B6" />
          <rect x="-10" y="78" width="8" height="40" rx="4" fill="#FDE8D0" />
          <rect x="2" y="78" width="8" height="40" rx="4" fill="#FDE8D0" />
          <circle cx="0" cy="14" r="18" fill="#FDE8D0" />
          <path d="M-18,8 Q-8,-12 8,-12 Q18,-8 18,8 Q18,0 8,-6 Q-8,-6 -18,8" fill="#92400E" />
          {/* Crying face */}
          <circle cx="-5" cy="12" r="3" fill="#374151" />
          <circle cx="5" cy="12" r="3" fill="#374151" />
          <ellipse cx="0" cy="20" rx="5" ry="4" fill="#374151" />
          {/* Tear streaks */}
          <path d="M-8,14 Q-12,20 -10,28" stroke="#93C5FD" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
          <path d="M8,14 Q12,20 10,28" stroke="#93C5FD" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
        </g>

        {/* Floating papers */}
        {[
          { x: 700, y: 280, w: 40, h: 55 },
          { x: 750, y: 350, w: 35, h: 50 },
          { x: 650, y: 400, w: 45, h: 35 },
          { x: 780, y: 240, w: 38, h: 50 },
          { x: 620, y: 360, w: 42, h: 30 },
        ].map((p, i) => (
          <g
            key={`paper-${i}`}
            ref={(el) => (paperRefs.current[i] = el)}
            transform={`translate(${p.x},${p.y})`}
            opacity="0"
            filter="url(#paper-shadow)"
          >
            <rect x={-p.w / 2} y={-p.h / 2} width={p.w} height={p.h} rx="2" fill="white" opacity="0.7" />
            <line x1={-p.w / 4} y1={-p.h / 4} x2={p.w / 4} y2={-p.h / 4} stroke="#D6D3D1" strokeWidth="1" />
            <line x1={-p.w / 4} y1={0} x2={p.w / 4} y2={0} stroke="#D6D3D1" strokeWidth="1" />
            <line x1={-p.w / 4} y1={p.h / 4} x2={p.w / 4} y2={p.h / 4} stroke="#D6D3D1" strokeWidth="1" />
          </g>
        ))}

        {/* Clock */}
        <g ref={clockRef} transform="translate(840, 220)" opacity="0">
          <circle cx="0" cy="0" r="45" fill="white" stroke="#78716C" strokeWidth="3" />
          <circle cx="0" cy="0" r="3" fill="#78716C" />
          {[0, 6, 12, 18, 24, 30, 36, 42, 48, 54].map((m) => {
            const angle = (m * 6 * Math.PI) / 180;
            const inner = m % 15 === 0 ? 32 : 36;
            return (
              <line
                key={m}
                x1={Math.cos(angle) * inner}
                y1={Math.sin(angle) * inner}
                x2={Math.cos(angle) * 40}
                y2={Math.sin(angle) * 40}
                stroke={m % 15 === 0 ? '#78716C' : '#A8A29E'}
                strokeWidth={m % 15 === 0 ? 2.5 : 1}
                strokeLinecap="round"
              />
            );
          })}
          {/* Hour hand */}
          <line className="clock-hour" x1="0" y1="0" x2="0" y2="-22" stroke="#374151" strokeWidth="3.5" strokeLinecap="round" />
          {/* Minute hand */}
          <line className="clock-minute" x1="0" y1="0" x2="0" y2="-32" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Urgency lines */}
        <g ref={worryLinesRef} transform="translate(560, 200)" opacity="0">
          {[0, 30, 60, 90, 120, 150].map((angle, i) => (
            <line
              key={i}
              x1={Math.cos((angle * Math.PI) / 180) * 80}
              y1={Math.sin((angle * Math.PI) / 180) * 80}
              x2={Math.cos((angle * Math.PI) / 180) * 110}
              y2={Math.sin((angle * Math.PI) / 180) * 110}
              stroke="#EF4444"
              strokeWidth="1.5"
              opacity="0.3"
              strokeLinecap="round"
            />
          ))}
        </g>
      </svg>

      <div className="relative z-10 text-center px-6 space-y-2">
        <p
          ref={textRef}
          className="text-xl sm:text-2xl text-stone-700/70 font-light tracking-wide"
        >
          Panic. Confusion. Precious time slipping away.
        </p>
        <p
          ref={questionRef}
          className="text-lg sm:text-xl text-stone-500/60 font-light"
        >
          Where do we go? What do we do?
        </p>
      </div>
    </section>
  );
}
