import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { UserPlus, ClipboardCheck, Calendar, Stethoscope, Syringe, LineChart, Shield } from 'lucide-react';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  { icon: UserPlus, title: 'Register', desc: 'Create your account in under 2 minutes.' },
  { icon: ClipboardCheck, title: 'Complete Profile', desc: 'Add your medical history and details.' },
  { icon: Calendar, title: 'Book Appointment', desc: 'Schedule a visit at your convenience.' },
  { icon: Stethoscope, title: 'Visit Clinic', desc: 'Get examined by our healthcare team.' },
  { icon: Syringe, title: 'Receive Vaccination', desc: 'Get your anti-rabies vaccination.' },
  { icon: LineChart, title: 'Track Progress', desc: 'Monitor your vaccination schedule.' },
  { icon: Shield, title: 'Stay Protected', desc: 'Receive reminders for follow-up doses.' },
];

export default function TimelineSection() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const trackRef = useRef(null);
  const stepsRef = useRef([]);
  const connectorRef = useRef(null);

  const reducedMotion = usePrefersReducedMotion();

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

      // Horizontal scroll timeline (skip scrub-based scroll if reduced motion)
      const steps = stepsRef.current.filter(Boolean);
      const track = trackRef.current;

      if (steps.length && track) {
        if (!reducedMotion) {
          const totalWidth = track.scrollWidth;
          const viewportWidth = window.innerWidth;
          const scrollDistance = -(totalWidth - viewportWidth + 100);

          const calcEnd = () => `+=${totalWidth - viewportWidth + 400}`;

          gsap.to(track, {
            x: scrollDistance,
            ease: 'none',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top top',
              end: calcEnd,
              pin: true,
              scrub: 1.5,
              invalidateOnRefresh: true,
            },
          });

          // Individual step animations
          steps.forEach((step, i) => {
            gsap.fromTo(
              step,
              { y: 40, opacity: 0, scale: 0.9 },
              {
                y: 0,
                opacity: 1,
                scale: 1,
                duration: 0.7,
                ease: 'power2.out',
                scrollTrigger: {
                  trigger: step,
                  start: 'left 80%',
                  toggleActions: 'play none none reverse',
                  horizontal: true,
                },
                delay: 0.1,
              }
            );
          });
        } else {
          // Reduced motion: just show all steps without scrub
          steps.forEach((step, i) => {
            gsap.set(step, { opacity: 1, y: 0, scale: 1 });
          });
        }
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      id="timeline"
      ref={sectionRef}
      className="relative overflow-hidden bg-gradient-to-b from-white via-blue-50/20 to-white"
    >
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-36 pb-8">
        <div className="text-center mb-4">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold tracking-wider uppercase border border-blue-100/60">
            How It Works
          </span>
        </div>

        <h2
          ref={headingRef}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 text-center leading-tight"
        >
          From Registration to{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            Full Protection
          </span>
        </h2>

        <p className="mt-4 text-lg text-gray-500 text-center max-w-2xl mx-auto">
          A seamless journey designed to ensure you never miss a dose.
        </p>
      </div>

      {/* Horizontal scrollable timeline */}
      <div ref={trackRef} className="flex items-center gap-0 pl-8 lg:pl-16 pb-32 pt-8 min-w-max">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isLast = i === STEPS.length - 1;
          return (
            <div
              key={step.title}
              ref={(el) => (stepsRef.current[i] = el)}
              className="flex items-center"
            >
              <div className="flex flex-col items-center mx-6 lg:mx-10">
                <div className="relative">
                  <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-white border-2 border-blue-100 shadow-lg flex items-center justify-center group hover:border-blue-300 hover:shadow-xl transition-all duration-500">
                    <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shadow-md">
                      {i + 1}
                    </div>
                    <Icon className="w-9 h-9 lg:w-10 lg:h-10 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>
                <h3 className="mt-4 text-base lg:text-lg font-semibold text-gray-900 text-center whitespace-nowrap">
                  {step.title}
                </h3>
                <p className="mt-1 text-xs lg:text-sm text-gray-500 text-center max-w-[140px]">
                  {step.desc}
                </p>
              </div>

              {/* Connector arrow */}
              {!isLast && (
                <div className="flex items-center">
                  <div className="w-12 lg:w-16 h-0.5 bg-gradient-to-r from-blue-300 to-blue-200" />
                  <svg className="w-4 h-4 text-blue-300 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <div className="w-12 lg:w-16 h-0.5 bg-gradient-to-r from-blue-200 to-blue-300" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
