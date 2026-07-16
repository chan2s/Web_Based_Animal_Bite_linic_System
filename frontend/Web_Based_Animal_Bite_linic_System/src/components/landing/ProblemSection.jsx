import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Clock, FileText, CalendarX, Users, AlertTriangle, Package } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const PROBLEMS = [
  { icon: Clock, title: 'Long Waiting Queues', desc: 'Patients spend hours waiting for consultation, increasing the risk of delayed treatment.' },
  { icon: FileText, title: 'Paper-Based Records', desc: 'Lost files, illegible handwriting, and misfiled documents compromise patient safety.' },
  { icon: CalendarX, title: 'Missed Vaccinations', desc: 'Without a proper tracking system, follow-up doses are often forgotten or delayed.' },
  { icon: Users, title: 'Lost Patient History', desc: 'Critical medical history disappears when paper records are misplaced or damaged.' },
  { icon: AlertTriangle, title: 'Scheduling Conflicts', desc: 'Double bookings and missed appointments waste valuable clinical resources.' },
  { icon: Package, title: 'Manual Inventory', desc: 'Vaccine stockouts and expired supplies go unnoticed without automated tracking.' },
];

export default function ProblemSection() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading animation
      gsap.fromTo(
        headingRef.current,
        { y: 60, opacity: 0 },
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

      // Cards stagger
      cardsRef.current.forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 60, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 88%',
              toggleActions: 'play none none reverse',
            },
            delay: i * 0.12,
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="problem"
      ref={sectionRef}
      className="relative py-28 lg:py-36 overflow-hidden bg-white"
    >
      {/* Subtle background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full bg-gray-50/50 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Label */}
        <div className="text-center mb-4">
          <span className="inline-block px-4 py-1.5 rounded-full bg-red-50 text-red-600 text-xs font-semibold tracking-wider uppercase border border-red-100/60">
            The Challenge
          </span>
        </div>

        {/* Heading */}
        <h2
          ref={headingRef}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 text-center leading-tight"
        >
          Traditional Clinics Are{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
            Falling Behind
          </span>
        </h2>

        <p className="mt-4 text-lg text-gray-500 text-center max-w-2xl mx-auto">
          Without the right tools, animal bite clinics struggle with inefficiencies that put patients at risk.
        </p>

        {/* Problem cards grid */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {PROBLEMS.map((problem, i) => {
            const Icon = problem.icon;
            return (
              <div
                key={problem.title}
                ref={(el) => (cardsRef.current[i] = el)}
                className="group relative p-6 sm:p-8 rounded-2xl bg-white border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md transition-all duration-500"
              >
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4 group-hover:bg-red-100 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{problem.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{problem.desc}</p>

                {/* Hover accent */}
                <div className="absolute bottom-0 left-6 right-6 h-0.5 bg-red-200 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left rounded-full" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
