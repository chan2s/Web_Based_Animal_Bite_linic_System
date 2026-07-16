import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import usePrefersReducedMotion from '../../../hooks/usePrefersReducedMotion';
import { useCharacterBreathing } from '../../../hooks/useHoverTilt';
import SceneImageBg from '../SceneImageBg';

gsap.registerPlugin(ScrollTrigger);

export default function SceneSix() {
  const sectionRef = useRef(null);
  const clinicRef = useRef(null);
  const doctorRef = useRef(null);
  const patientRef = useRef(null);
  const dataPanelRef = useRef(null);
  const notificationRefs = useRef([]);
  const progressRef = useRef(null);
  const textRef = useRef(null);
  const inventoryRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  // Character breathing (respects reduced motion)
  useCharacterBreathing(doctorRef, { amplitude: 0.005, duration: 3.0, disabled: reducedMotion });
  useCharacterBreathing(patientRef, { amplitude: 0.006, duration: 3.5, disabled: reducedMotion });

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
        // Clinic environment slides in
        tl.fromTo(clinicRef.current,
          { opacity: 0, x: -30 },
          { opacity: 1, x: 0, duration: 1, ease: 'power2.out' },
          0.2
        )
        // Doctor appears
        .fromTo(doctorRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
          0.5
        )
        // Patient seated
        .fromTo(patientRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' },
          0.7
        )
        // Data panel slides in from right
        .fromTo(dataPanelRef.current,
          { x: 100, opacity: 0 },
          { x: 0, opacity: 1, duration: 1.2, ease: 'power3.out' },
          0.9
        )
        // Notifications pop in
        .fromTo(notificationRefs.current,
          { y: 20, opacity: 0, scale: 0.9 },
          { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.2, ease: 'back.out(1.7)' },
          1.5
        )
        // Progress bar fills
        .fromTo(progressRef.current,
          { scaleX: 0 },
          { scaleX: 1, duration: 2, ease: 'power2.inOut', transformOrigin: 'left center' },
          1.8
        )
        // Inventory update
        .fromTo(inventoryRef.current,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
          2.5
        )
        .fromTo(textRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
          3
        );
      } else {
        gsap.set([
          clinicRef.current, doctorRef.current, patientRef.current, dataPanelRef.current,
          ...notificationRefs.current, progressRef.current, inventoryRef.current, textRef.current,
        ], { opacity: 1 });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white via-blue-50/20 to-blue-50/30"
    >
      {/* Real image background - healthcare team */}
      <SceneImageBg
        src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=1920&q=80"
        alt="Healthcare professionals collaborating"
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
          <linearGradient id="clinic-wall" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="100%" stopColor="#F1F5F9" />
          </linearGradient>
          <linearGradient id="progress-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
          <filter id="panel-shadow">
            <feDropShadow dx="-2" dy="4" stdDeviation="6" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Clinic background */}
        <g ref={clinicRef}>
          <rect width="1440" height="900" fill="url(#clinic-wall)" />
          {/* Floor */}
          <rect x="0" y="550" width="1440" height="350" fill="#E2E8F0" />
          <line x1="0" y1="550" x2="1440" y2="550" stroke="#CBD5E1" strokeWidth="1" />
          {/* Window */}
          <rect x="200" y="100" width="200" height="250" rx="8" fill="#BFDBFE" stroke="#94A3B8" strokeWidth="2" opacity="0.5" />
          <line x1="300" y1="100" x2="300" y2="350" stroke="#94A3B8" strokeWidth="1" opacity="0.5" />
          <line x1="200" y1="225" x2="400" y2="225" stroke="#94A3B8" strokeWidth="1" opacity="0.5" />
          {/* Clinic bed/exam table */}
          <rect x="300" y="430" width="250" height="100" rx="10" fill="white" stroke="#CBD5E1" strokeWidth="2" />
          <rect x="280" y="460" width="20" height="70" rx="5" fill="#94A3B8" />
          <rect x="550" y="460" width="20" height="70" rx="5" fill="#94A3B8" />
          {/* Pillow */}
          <ellipse cx="340" cy="440" rx="40" ry="12" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="1" />
        </g>

        {/* Doctor */}
        <g ref={doctorRef} transform="translate(490, 280)">
          <ellipse cx="0" cy="200" rx="25" ry="6" fill="rgba(0,0,0,0.06)" />
          {/* White coat body */}
          <rect x="-20" y="50" width="40" height="80" rx="6" fill="white" stroke="#E2E8F0" strokeWidth="1" />
          {/* Medical coat detail */}
          <line x1="-10" y1="50" x2="-10" y2="130" stroke="#E2E8F0" strokeWidth="1" />
          {/* Legs */}
          <rect x="-16" y="125" width="12" height="60" rx="5" fill="#475569" />
          <rect x="4" y="125" width="12" height="60" rx="5" fill="#475569" />
          {/* Head */}
          <circle cx="0" cy="22" r="22" fill="#FDE8D0" />
          {/* Hair */}
          <path d="M-22,12 Q0,-10 22,12 Q22,2 0,-16 Q-22,2 -22,12" fill="#1F2937" />
          {/* Glasses */}
          <circle cx="-7" cy="20" r="7" fill="none" stroke="#64748B" strokeWidth="1.5" />
          <circle cx="7" cy="20" r="7" fill="none" stroke="#64748B" strokeWidth="1.5" />
          <line x1="0" y1="20" x2="0" y2="20" stroke="#64748B" strokeWidth="1.5" />
          {/* Smile */}
          <path d="M-5,28 Q0,34 5,28" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
          {/* Stethoscope */}
          <path d="M-12,50 Q-20,60 -15,80 Q-10,95 0,95 Q10,95 15,80 Q20,60 12,50" fill="none" stroke="#64748B" strokeWidth="2" />
          <circle cx="0" cy="85" r="6" fill="#64748B" />
          {/* Clipboard holding */}
          <path d="M15,60 Q30,70 25,100" stroke="#FDE8D0" strokeWidth="6" strokeLinecap="round" fill="none" />
        </g>

        {/* Patient (father) sitting */}
        <g ref={patientRef} transform="translate(370, 310)">
          <ellipse cx="0" cy="160" rx="25" ry="6" fill="rgba(0,0,0,0.06)" />
          <rect x="-18" y="40" width="36" height="55" rx="8" fill="#4F46E5" />
          <rect x="-14" y="92" width="12" height="55" rx="5" fill="#1F2937" />
          <rect x="2" y="92" width="12" height="55" rx="5" fill="#1F2937" />
          <circle cx="0" cy="18" r="22" fill="#FDE8D0" />
          <path d="M-22,10 Q0,-10 22,10 Q22,0 0,-18 Q-22,0 -22,10" fill="#374151" />
          {/* Arm out for vaccination */}
          <path d="M-18,60 Q-40,65 -50,55" stroke="#FDE8D0" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M-18,55 Q-35,58 -42,52" stroke="#4F46E5" strokeWidth="10" strokeLinecap="round" fill="none" />
          {/* Relaxed expression */}
          <path d="M-6,24 Q0,30 6,24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Data panel (right side) */}
        <g ref={dataPanelRef} transform="translate(880, 200)" filter="url(#panel-shadow)">
          <rect x="-130" y="-80" width="260" height="320" rx="12" fill="white" stroke="#E2E8F0" strokeWidth="1" />
          <rect x="-130" y="-80" width="260" height="35" rx="12" fill="#3B82F6" />
          <rect x="-130" y="-65" width="260" height="20" fill="#3B82F6" />
          <text x="-100" y="-60" fontSize="10" fill="white" fontWeight="600">Patient Records</text>

          {/* Patient info */}
          <circle cx="-100" cy="-30" r="15" fill="#DBEAFE" />
          <text x="-108" y="-26" fontSize="8" fill="#3B82F6" fontWeight="bold">JD</text>
          <text x="-75" y="-27" fontSize="9" fill="#1F2937" fontWeight="600">Juan Dela Cruz</text>
          <text x="-75" y="-15" fontSize="7" fill="#94A3B8">DOB: 12/15/1985 | M</text>

          {/* Medical info */}
          <text x="-110" y="5" fontSize="7" fill="#64748B" fontWeight="600">Vaccination Record</text>
          <rect x="-110" y="12" width="220" height="20" rx="4" fill="#F0F9FF" />
          <circle cx="-95" cy="22" r="4" fill="#10B981" />
          <text x="-85" y="25" fontSize="7" fill="#475569">Rabies Vaccine - Dose 1</text>
          <text x="80" y="25" fontSize="7" fill="#94A3B8">Today</text>

          <rect x="-110" y="36" width="220" height="20" rx="4" fill="#F8FAFC" />
          <circle cx="-95" cy="46" r="4" fill="#E2E8F0" />
          <text x="-85" y="49" fontSize="7" fill="#94A3B8">Rabies Vaccine - Dose 2</text>
          <text x="80" y="49" fontSize="7" fill="#94A3B8">Mar 14</text>

          <rect x="-110" y="60" width="220" height="20" rx="4" fill="#F8FAFC" />
          <circle cx="-95" cy="70" r="4" fill="#E2E8F0" />
          <text x="-85" y="73" fontSize="7" fill="#94A3B8">Rabies Vaccine - Dose 3</text>
          <text x="80" y="73" fontSize="7" fill="#94A3B8">Apr 14</text>

          {/* Treatment notes */}
          <text x="-110" y="98" fontSize="7" fill="#64748B" fontWeight="600">Treatment Plan</text>
          <rect x="-110" y="105" width="220" height="25" rx="4" fill="#FFF7ED" stroke="#FED7AA" strokeWidth="1" />
          <text x="-100" y="120" fontSize="7" fill="#9A3412">Wound cleaned &amp; dressed ✓</text>
          <rect x="-110" y="135" width="220" height="25" rx="4" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1" />
          <text x="-100" y="150" fontSize="7" fill="#166534">Tetanus shot administered ✓</text>
          <rect x="-110" y="165" width="220" height="25" rx="4" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1" />
          <text x="-100" y="180" fontSize="7" fill="#1E40AF">Rabies vaccine scheduled ✓</text>
        </g>

        {/* Progress bar */}
        <g ref={progressRef} transform="translate(300, 560)">
          <rect x="0" y="0" width="300" height="6" rx="3" fill="#E2E8F0" />
          <rect x="0" y="0" width="300" height="6" rx="3" fill="url(#progress-grad)" style={{ transformOrigin: 'left center' }} />
          <text x="310" y="5" fontSize="8" fill="#3B82F6" fontWeight="600">Vaccination Progress 33%</text>
        </g>

        {/* Notifications */}
        {[
          { x: 850, y: 560, text: 'Inventory updated', color: '#10B981' },
          { x: 850, y: 590, text: 'Appointment confirmed', color: '#3B82F6' },
          { x: 850, y: 620, text: 'Records synced', color: '#8B5CF6' },
        ].map((n, i) => (
          <g
            key={`notif-${i}`}
            ref={(el) => (notificationRefs.current[i] = el)}
            transform={`translate(${n.x},${n.y})`}
          >
            <rect x="-110" y="-12" width="220" height="24" rx="6" fill="white" stroke="#E2E8F0" strokeWidth="1" />
            <circle cx="-95" cy="0" r="5" fill={n.color} />
            <text x="-82" y="3" fontSize="8" fill="#475569">{n.text}</text>
          </g>
        ))}

        {/* Inventory update */}
        <g ref={inventoryRef} transform="translate(300, 630)">
          <rect x="0" y="0" width="280" height="40" rx="8" fill="white" stroke="#E2E8F0" strokeWidth="1" />
          <text x="15" y="16" fontSize="8" fill="#64748B" fontWeight="600">Inventory</text>
          <rect x="15" y="24" width="80" height="6" rx="3" fill="#E2E8F0" />
          <rect x="15" y="24" width="50" height="6" rx="3" fill="#10B981" />
          <text x="105" y="24" fontSize="7" fill="#94A3B8">Rabies Vaccine: 42 doses</text>
          <text x="105" y="34" fontSize="7" fill="#10B981">-1 (administered)</text>
        </g>
      </svg>

      <div className="relative z-10 text-center px-6 mt-[440px] lg:mt-0">
        <p
          ref={textRef}
          className="text-xl sm:text-2xl text-blue-700/70 font-light tracking-wide"
        >
          The clinic was ready. Everything was ready.
        </p>
      </div>
    </section>
  );
}
