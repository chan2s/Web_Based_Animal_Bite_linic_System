import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Syringe, Users, CalendarDays, FileText, Stethoscope, Activity } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const STATS = [
  { icon: Syringe, value: 15420, suffix: '+', label: 'Vaccinations Administered', color: 'blue' },
  { icon: Users, value: 8730, suffix: '+', label: 'Patients Registered', color: 'green' },
  { icon: CalendarDays, value: 12500, suffix: '+', label: 'Appointments Scheduled', color: 'purple' },
  { icon: FileText, value: 28400, suffix: '+', label: 'Medical Records Created', color: 'amber' },
  { icon: Stethoscope, value: 520, suffix: '+', label: 'Partner Clinics', color: 'indigo' },
  { icon: Activity, value: 98, suffix: '%', label: 'Patient Satisfaction', color: 'teal' },
];

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  purple: 'bg-purple-50 text-purple-600',
  amber: 'bg-amber-50 text-amber-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  teal: 'bg-teal-50 text-teal-600',
};

const counterColorClasses = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  purple: 'text-purple-600',
  amber: 'text-amber-600',
  indigo: 'text-indigo-600',
  teal: 'text-teal-600',
};

function AnimatedCounter({ value, suffix = '', color, label, icon: Icon, index }) {
  const counterRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Card entrance
      gsap.fromTo(
        cardRef.current,
        { y: 40, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 88%',
            toggleActions: 'play none none reverse',
          },
          delay: index * 0.1,
        }
      );

      // Animated counter
      const obj = { val: 0 };
      gsap.to(obj, {
        val: value,
        duration: 2.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
        onUpdate: () => {
          if (counterRef.current) {
            counterRef.current.textContent = Math.floor(obj.val).toLocaleString() + suffix;
          }
        },
      });
    }, cardRef);

    return () => ctx.revert();
  }, [value, suffix, index]);

  return (
    <div
      ref={cardRef}
      className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-500"
    >
      <div
        className={`w-12 h-12 rounded-xl border border-gray-100 flex items-center justify-center mb-4 ${colorClasses[color]}`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div ref={counterRef} className={`text-3xl font-bold ${counterColorClasses[color]}`}>
        0
      </div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
}

export default function StatisticsSection() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headingRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: headingRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="stats"
      ref={sectionRef}
      className="relative py-28 lg:py-36 overflow-hidden bg-gradient-to-b from-white via-blue-50/20 to-white"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-100/20 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold tracking-wider uppercase border border-blue-100/60">
            Our Impact
          </span>
        </div>

        <h2
          ref={headingRef}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 text-center leading-tight"
        >
          Trusted by{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            500+ Clinics
          </span>
        </h2>

        <p className="mt-4 text-lg text-gray-500 text-center max-w-2xl mx-auto">
          Our platform has helped healthcare providers deliver better care to thousands of patients.
        </p>

        <div className="mt-16 grid grid-cols-2 lg:grid-cols-3 gap-5">
          {STATS.map((stat, i) => (
            <AnimatedCounter key={stat.label} index={i} {...stat} />
          ))}
        </div>
      </div>
    </section>
  );
}
