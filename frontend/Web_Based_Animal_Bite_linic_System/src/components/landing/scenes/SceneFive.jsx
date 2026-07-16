import { useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import usePrefersReducedMotion from '../../../hooks/usePrefersReducedMotion';
import SceneImageBg from '../SceneImageBg';

gsap.registerPlugin(ScrollTrigger);

export default function SceneFive() {
  const sectionRef = useRef(null);
  const phoneRef = useRef(null);
  const stepDotsRef = useRef([]);
  const connectLinesRef = useRef([]);
  const notificationRef = useRef(null);
  const dataFlowRef = useRef(null);
  const checkRefs = useRef([]);
  const textRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  // Phone hover tilt
  const phoneTilt = useRef({ x: 0, y: 0, isHovering: false });

  const handlePhoneEnter = useCallback(() => {
    if (reducedMotion || !phoneRef.current) return;
    phoneTilt.current.isHovering = true;
    gsap.to(phoneRef.current, {
      scale: 1.03,
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
      rotateX: (0.5 - y) * 12,
      rotateY: (x - 0.5) * 16,
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
        tl.fromTo(phoneRef.current,
          { y: 60, opacity: 0, scale: 0.9 },
          { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' },
          0.2
        )
        // Connection lines draw one by one
        .fromTo(connectLinesRef.current,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.6, stagger: 0.2, ease: 'power2.inOut', transformOrigin: 'left center' },
          '-=0.6'
        )
        // Step dots pop in
        .fromTo(stepDotsRef.current,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, stagger: 0.15, ease: 'back.out(2)' },
          '-=0.4'
        )
        // Checkmarks
        .fromTo(checkRefs.current,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.4, stagger: 0.2, ease: 'back.out(2)' },
          '-=0.2'
        )
        // Notification slides in
        .fromTo(notificationRef.current,
          { x: 80, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.8, ease: 'power2.out' },
          1.5
        )
        // Data flow arrows
        .fromTo(dataFlowRef.current,
          { opacity: 0 },
          { opacity: 0.6, duration: 1, ease: 'power1.inOut' },
          1.8
        )
        .fromTo(textRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
          2.2
        );

        // Data flow pulsing
        gsap.to(dataFlowRef.current?.querySelectorAll('.data-pulse'), {
          opacity: 0.2,
          duration: 1.5,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          stagger: 0.5,
        });
      } else {
        gsap.set([
          phoneRef.current, ...stepDotsRef.current, ...connectLinesRef.current,
          ...checkRefs.current, notificationRef.current, dataFlowRef.current, textRef.current,
        ], { opacity: 1 });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white via-blue-50/30 to-white"
    >
      {/* Real image background - vaccination */}
      <SceneImageBg
        src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=1920&q=80"
        alt="Doctor administering a vaccine"
        overlay="clinical"
        overlayOpacity={0.15}
        reducedMotion={reducedMotion}
      />

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="flow-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0" />
            <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
          </linearGradient>
          <filter id="notification-shadow">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.1" />
          </filter>
        </defs>

        <rect width="1440" height="900" fill="white" opacity="0.5" />

        {/* Phone in center-right with 3D tilt */}
        <g
          ref={phoneRef}
          transform="translate(720, 380)"
          onMouseEnter={handlePhoneEnter}
          onMouseMove={handlePhoneMove}
          onMouseLeave={handlePhoneLeave}
          style={{ cursor: 'pointer', transformStyle: 'preserve-3d' }}
        >
          <rect x="-110" y="-200" width="220" height="400" rx="30" fill="#1F2937" />
          <rect x="-106" y="-196" width="212" height="392" rx="27" fill="white" />

          {/* Screen header */}
          <rect x="-85" y="-140" width="170" height="30" rx="8" fill="#3B82F6" />
          <text x="-65" y="-122" fontSize="9" fill="white" fontWeight="600">Book Appointment</text>

          {/* Steps */}
          <rect x="-75" y="-95" width="150" height="40" rx="8" fill="#F0F9FF" stroke="#BAE6FD" strokeWidth="1" />
          <circle cx="-60" cy="-75" r="8" fill="#3B82F6" />
          <text x="-63" y="-71" fontSize="8" fill="white" fontWeight="bold">1</text>
          <text x="-45" y="-72" fontSize="8" fill="#475569" fontWeight="500">Select Clinic</text>

          <rect x="-75" y="-45" width="150" height="40" rx="8" fill="#F0F9FF" stroke="#BAE6FD" strokeWidth="1" />
          <circle cx="-60" cy="-25" r="8" fill="#3B82F6" />
          <text x="-63" y="-21" fontSize="8" fill="white" fontWeight="bold">2</text>
          <text x="-45" y="-22" fontSize="8" fill="#475569" fontWeight="500">Choose Date &amp; Time</text>

          <rect x="-75" y="5" width="150" height="40" rx="8" fill="#F0F9FF" stroke="#BAE6FD" strokeWidth="1" />
          <circle cx="-60" cy="25" r="8" fill="#3B82F6" />
          <text x="-63" y="29" fontSize="8" fill="white" fontWeight="bold">3</text>
          <text x="-45" y="28" fontSize="8" fill="#475569" fontWeight="500">Confirm Booking</text>

          {/* Selected time slot */}
          <rect x="-75" y="60" width="150" height="30" rx="6" fill="#3B82F6" opacity="0.1" />
          <text x="-60" y="78" fontSize="8" fill="#3B82F6">Today 2:00 PM - Dr. Santos</text>

          {/* Book button */}
          <rect x="-75" y="100" width="150" height="35" rx="8" fill="#3B82F6" />
          <text x="-25" y="121" fontSize="9" fill="white" fontWeight="bold">Confirm Booking</text>
        </g>

        {/* Workflow connection lines (left side) */}
        {[
          { x1: 400, y1: 280, x2: 610, y2: 340 },
          { x1: 400, y1: 380, x2: 610, y2: 380 },
          { x1: 400, y1: 480, x2: 610, y2: 420 },
        ].map((line, i) => (
          <g key={`line-${i}`} ref={(el) => (connectLinesRef.current[i] = el)}>
            <line
              x1={line.x1} y1={line.y1}
              x2={line.x2} y2={line.y2}
              stroke="#93C5FD"
              strokeWidth="2"
              strokeDasharray="6,4"
              opacity="0.5"
            />
          </g>
        ))}

        {/* Workflow step dots (left side) */}
        {[
          { x: 360, y: 280, label: 'Select', color: '#3B82F6' },
          { x: 360, y: 380, label: 'Schedule', color: '#10B981' },
          { x: 360, y: 480, label: 'Confirm', color: '#8B5CF6' },
        ].map((dot, i) => (
          <g key={`dot-${i}`} ref={(el) => (stepDotsRef.current[i] = el)}>
            <circle cx={dot.x} cy={dot.y} r="12" fill={dot.color} />
            <text x={dot.x} y={dot.y + 3.5} fontSize="9" fill="white" textAnchor="middle" fontWeight="bold">{i + 1}</text>
            <text x={dot.x} y={dot.y + 24} fontSize="9" fill="#64748B" textAnchor="middle">{dot.label}</text>
            {/* Checkmarks */}
            <g ref={(el) => (checkRefs.current[i] = el)} transform={`translate(${dot.x + 20},${dot.y - 5})`}>
              <path d="M-5,0 L-1,4 L5,-3" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>
        ))}

        {/* Notification toast */}
        <g ref={notificationRef} transform="translate(940, 200)" filter="url(#notification-shadow)">
          <rect x="-120" y="-30" width="240" height="60" rx="10" fill="white" stroke="#E2E8F0" strokeWidth="1" />
          <circle cx="-95" cy="0" r="15" fill="#3B82F6" />
          <text x="-103" y="4" fontSize="10" fill="white" fontWeight="bold">✓</text>
          <text x="-70" y="-6" fontSize="8" fill="#475569" fontWeight="600">Appointment Booked!</text>
          <text x="-70" y="6" fontSize="7" fill="#94A3B8">Juan Dela Cruz - Today 2:00 PM</text>
        </g>

        {/* Data flow indicators */}
        <g ref={dataFlowRef} transform="translate(400, 300)">
          <text x="0" y="0" fontSize="8" fill="#94A3B8" textAnchor="middle">Patient Data</text>
          <rect className="data-pulse" x="-30" y="8" width="60" height="4" rx="2" fill="#3B82F6" opacity="0.3" />
          <rect className="data-pulse" x="-20" y="16" width="40" height="4" rx="2" fill="#3B82F6" opacity="0.2" />
          <rect className="data-pulse" x="-25" y="24" width="50" height="4" rx="2" fill="#3B82F6" opacity="0.25" />
        </g>
      </svg>

      <div className="relative z-10 text-center px-6 mt-[420px] lg:mt-0 lg:mb-0">
        <p
          ref={textRef}
          className="text-xl sm:text-2xl text-blue-700/70 font-light tracking-wide"
        >
          A few taps and everything was set in motion
        </p>
      </div>
    </section>
  );
}
