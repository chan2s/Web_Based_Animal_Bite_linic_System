import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Syringe, Bell, Users, FileText } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  { icon: Users, label: 'Patient Management', color: 'blue' },
  { icon: Syringe, label: 'Vaccination Tracking', color: 'green' },
  { icon: Calendar, label: 'Appointment Scheduling', color: 'purple' },
  { icon: Bell, label: 'Smart Notifications', color: 'amber' },
  { icon: FileText, label: 'Digital Records', color: 'indigo' },
  { icon: CheckCircle, label: 'Automated Reminders', color: 'teal' },
];

export default function SolutionSection() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const mockupRef = useRef(null);
  const itemsRef = useRef([]);

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

      gsap.fromTo(
        mockupRef.current,
        { scale: 0.8, opacity: 0, y: 60 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: mockupRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      itemsRef.current.forEach((item, i) => {
        gsap.fromTo(
          item,
          { x: -40, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: item,
              start: 'top 90%',
              toggleActions: 'play none none reverse',
            },
            delay: i * 0.1,
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="solution"
      ref={sectionRef}
      className="relative py-28 lg:py-36 overflow-hidden bg-gradient-to-b from-white via-blue-50/20 to-white"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-blue-100/20 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold tracking-wider uppercase border border-blue-100/60">
            The Solution
          </span>
        </div>

        <h2
          ref={headingRef}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 text-center leading-tight"
        >
          A Smarter{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            Animal Bite Clinic
          </span>
        </h2>

        <p className="mt-4 text-lg text-gray-500 text-center max-w-2xl mx-auto">
          Everything you need to manage patients, track vaccinations, and streamline clinic operations from one platform.
        </p>

        {/* Dashboard mockup / feature showcase */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - feature list */}
          <div className="space-y-3">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              const colorMap = {
                blue: 'bg-blue-50 text-blue-600 border-blue-100',
                green: 'bg-green-50 text-green-600 border-green-100',
                purple: 'bg-purple-50 text-purple-600 border-purple-100',
                amber: 'bg-amber-50 text-amber-600 border-amber-100',
                indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
                teal: 'bg-teal-50 text-teal-600 border-teal-100',
              };
              return (
                <div
                  key={feature.label}
                  ref={(el) => (itemsRef.current[i] = el)}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300 group"
                >
                  <div
                    className={`w-11 h-11 rounded-lg flex items-center justify-center border transition-colors duration-300 ${colorMap[feature.color]}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-gray-800 group-hover:text-gray-900 transition-colors">
                    {feature.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Right - interactive dashboard preview */}
          <div ref={mockupRef} className="relative">
            <div className="relative bg-white rounded-2xl border border-gray-200 shadow-xl shadow-blue-500/5 overflow-hidden">
              {/* Dashboard header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-xs font-medium text-gray-400">Dashboard Preview</span>
              </div>

              {/* Dashboard content */}
              <div className="p-6 space-y-4">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Patients', value: '1,247', color: 'text-blue-600' },
                    { label: 'Vaccinations', value: '3,892', color: 'text-green-600' },
                    { label: 'Appointments', value: '486', color: 'text-purple-600' },
                  ].map((stat) => (
                    <div key={stat.label} className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Chart placeholder */}
                <div className="h-28 rounded-xl bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 border border-blue-100/50 flex items-center justify-center">
                  <div className="flex items-end gap-2 h-16">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                      <div
                        key={i}
                        className="w-6 rounded-t-lg bg-gradient-to-t from-blue-400 to-blue-300"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Recent activity */}
                <div className="space-y-2">
                  {[
                    { name: 'Juan Dela Cruz', status: 'Rabies Vaccine - Dose 2', time: 'Today' },
                    { name: 'Maria Santos', status: 'Follow-up Checkup', time: 'Yesterday' },
                    { name: 'Pedro Reyes', status: 'Initial Consultation', time: '2 days ago' },
                  ].map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-800">{item.name}</div>
                        <div className="text-xs text-gray-500">{item.status}</div>
                      </div>
                      <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                        {item.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
