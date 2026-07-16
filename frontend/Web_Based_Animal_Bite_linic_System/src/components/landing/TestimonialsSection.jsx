import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Quote } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const TESTIMONIALS = [
  {
    name: 'Dr. Maria Santos',
    role: 'Chief Veterinarian',
    clinic: 'Manila Animal Bite Center',
    quote: 'This system transformed how we manage patients. Vaccination tracking alone saved us countless hours and eliminated missed doses completely.',
    rating: 5,
  },
  {
    name: 'Dr. Juan Dela Cruz',
    role: 'Medical Director',
    clinic: 'Quezon City Health Office',
    quote: 'The appointment scheduling and automated reminders reduced our no-show rate by 70%. A game-changer for public health clinics.',
    rating: 5,
  },
  {
    name: 'Nurse Patricia Reyes',
    role: 'Head Nurse',
    clinic: 'Cebu Animal Bite Treatment Center',
    quote: 'I love how intuitive the system is. Training new staff takes hours, not days. The dashboard gives me everything I need at a glance.',
    rating: 5,
  },
  {
    name: 'Dr. Carlos Mendoza',
    role: 'Public Health Officer',
    clinic: 'Davao Regional Hospital',
    quote: 'The reporting and analytics features help us track rabies cases across the region. Essential tool for epidemiological surveillance.',
    rating: 5,
  },
  {
    name: 'Admin Liza Gonzales',
    role: 'Clinic Administrator',
    clinic: 'Makati Medical Bite Center',
    quote: 'Inventory management used to be a nightmare. Now we get automatic alerts when vaccine stocks are low. No more last-minute scrambling.',
    rating: 5,
  },
];

function StarRating({ rating }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: rating }, (_, i) => (
        <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const trackRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

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

  // Auto-scroll animation
  const clonesRef = useRef([]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // Clean up any previous clones before creating new ones
    clonesRef.current.forEach((c) => c?.remove());
    clonesRef.current = [];

    const scrollWidth = track.scrollWidth;

    // Duplicate content for seamless loop (only once per setup)
    const clone = track.cloneNode(true);
    track.parentElement.appendChild(clone);
    clonesRef.current = [clone];

    let animation = gsap.to([track, clone], {
      x: -scrollWidth,
      duration: 30,
      ease: 'none',
      repeat: -1,
      paused: isHovered,
    });

    // Use a separate ticker to reset positions seamlessly
    const resetOnRepeat = () => {
      if (animation && animation.progress() >= 0.99) {
        gsap.set([track, clone], { x: 0 });
        animation.restart(true);
      }
    };
    gsap.ticker.add(resetOnRepeat);

    return () => {
      animation?.kill();
      gsap.ticker.remove(resetOnRepeat);
      clone?.remove();
      clonesRef.current = [];
    };
  }, [isHovered]);

  return (
    <section
      ref={sectionRef}
      className="relative py-28 lg:py-36 overflow-hidden bg-white"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] rounded-full bg-blue-50/30 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold tracking-wider uppercase border border-blue-100/60">
            Testimonials
          </span>
        </div>

        <h2
          ref={headingRef}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 text-center leading-tight"
        >
          Trusted by{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            Healthcare Professionals
          </span>
        </h2>

        <p className="mt-4 text-lg text-gray-500 text-center max-w-2xl mx-auto">
          See what clinic administrators and healthcare providers say about our platform.
        </p>
      </div>

      {/* Auto-scroll testimonials */}
      <div
        className="mt-16 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div ref={trackRef} className="flex gap-6 px-4 sm:px-6 lg:px-8">
          {[...TESTIMONIALS, ...TESTIMONIALS].map((testimonial, i) => (
            <div
              key={`${testimonial.name}-${i}`}
              className="flex-shrink-0 w-[350px] lg:w-[400px] p-6 sm:p-8 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-500"
            >
              <Quote className="w-8 h-8 text-blue-200 mb-4" />
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                  {testimonial.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{testimonial.name}</div>
                  <div className="text-xs text-gray-500">{testimonial.role}, {testimonial.clinic}</div>
                  <StarRating rating={testimonial.rating} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
