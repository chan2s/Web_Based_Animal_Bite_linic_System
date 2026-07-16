import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Users,
  Syringe,
  Calendar,
  Package,
  Bell,
  BarChart3,
  FileText,
  Shield,
  ClipboardList,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: Users,
    title: 'Patient Management',
    desc: 'Complete patient profiles with medical history, contact details, and vaccination records in one place.',
    color: 'blue',
  },
  {
    icon: Syringe,
    title: 'Vaccination Tracking',
    desc: 'Automated dose scheduling with reminders for anti-rabies and tetanus vaccines.',
    color: 'green',
  },
  {
    icon: Calendar,
    title: 'Appointment Scheduling',
    desc: 'Smart calendar with real-time availability, automated reminders, and rescheduling options.',
    color: 'purple',
  },
  {
    icon: Package,
    title: 'Inventory Management',
    desc: 'Track vaccine stocks, medical supplies, and receive low-stock alerts automatically.',
    color: 'amber',
  },
  {
    icon: Bell,
    title: 'Smart Notifications',
    desc: 'Automated SMS and email reminders for upcoming appointments and follow-up doses.',
    color: 'rose',
  },
  {
    icon: BarChart3,
    title: 'Reports & Analytics',
    desc: 'Comprehensive dashboards with vaccination rates, patient trends, and clinic performance.',
    color: 'indigo',
  },
  {
    icon: ClipboardList,
    title: 'Case Management',
    desc: 'Detailed bite case records with wound classification, treatment plans, and progress tracking.',
    color: 'teal',
  },
  {
    icon: Shield,
    title: 'Role-Based Access',
    desc: 'Secure authentication with different access levels for admins, doctors, and nurses.',
    color: 'cyan',
  },
  {
    icon: FileText,
    title: 'Digital Records',
    desc: 'Paperless documentation with auto-generated medical certificates and vaccination cards.',
    color: 'violet',
  },
];

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-100',
  green: 'bg-green-50 text-green-600 border-green-100 group-hover:bg-green-100',
  purple: 'bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-100',
  rose: 'bg-rose-50 text-rose-600 border-rose-100 group-hover:bg-rose-100',
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:bg-indigo-100',
  teal: 'bg-teal-50 text-teal-600 border-teal-100 group-hover:bg-teal-100',
  cyan: 'bg-cyan-50 text-cyan-600 border-cyan-100 group-hover:bg-cyan-100',
  violet: 'bg-violet-50 text-violet-600 border-violet-100 group-hover:bg-violet-100',
};

export default function FeaturesSection() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const cardsRef = useRef([]);

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

      cardsRef.current.forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 50, opacity: 0, scale: 0.95, rotateX: i % 2 === 1 ? 3 : -3 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            rotateX: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
            delay: i * 0.08,
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative py-28 lg:py-36 overflow-hidden bg-white"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-blue-50/30 blur-[100px]" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] rounded-full bg-cyan-50/20 blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold tracking-wider uppercase border border-blue-100/60">
            System Features
          </span>
        </div>

        <h2
          ref={headingRef}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 text-center leading-tight"
        >
          Everything You Need to{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            Run a Modern Clinic
          </span>
        </h2>

        <p className="mt-4 text-lg text-gray-500 text-center max-w-2xl mx-auto">
          Powerful tools designed specifically for animal bite treatment centers and vaccination clinics.
        </p>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                ref={(el) => (cardsRef.current[i] = el)}
                className="group p-6 sm:p-8 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
              >
                <div
                  className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-4 transition-all duration-300 ${colorClasses[feature.color]}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>

                {/* Hover bottom accent */}
                <div className="mt-4 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-blue-200 to-transparent transition-all duration-500 rounded-full" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
