import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Cross, Shield, Activity, Heart } from 'lucide-react';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const subtitleRef = useRef(null);
  const ctaRef = useRef(null);
  const circleRef = useRef(null);
  const iconsRef = useRef(null);
  const navigate = useNavigate();
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Floating circles (skip if reduced motion)
      if (!reducedMotion) {
        gsap.to('.hero-orb', {
          y: -30,
          duration: 4,
          ease: 'sine.inOut',
          yoyo: true,
          repeat: -1,
          stagger: 0.8,
        });
      }

      // Fade-in sequence
      const tl = gsap.timeline();
      tl.fromTo(
        headingRef.current,
        { y: reducedMotion ? 0 : 60, opacity: 0 },
        { y: 0, opacity: 1, duration: reducedMotion ? 0.6 : 1.2, ease: 'power3.out' }
      )
        .fromTo(
          subtitleRef.current,
          { y: reducedMotion ? 0 : 30, opacity: 0 },
          { y: 0, opacity: 1, duration: reducedMotion ? 0.4 : 0.8, ease: 'power2.out' },
          '-=0.6'
        )
        .fromTo(
          ctaRef.current?.children,
          { y: reducedMotion ? 0 : 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'power2.out' },
          '-=0.4'
        )
        .fromTo(
          iconsRef.current?.children,
          { scale: reducedMotion ? 1 : 0, opacity: reducedMotion ? 0.15 : 0 },
          { scale: 1, opacity: 0.15, duration: reducedMotion ? 0 : 0.8, stagger: 0.2, ease: 'back.out(1.7)' },
          '-=0.6'
        );

      // Scroll parallax effect (skip if reduced motion)
      if (!reducedMotion) {
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom -20%',
          onUpdate: (self) => {
            const progress = self.progress;
            gsap.set(headingRef.current, {
              y: progress * 80,
              scale: 1 - progress * 0.05,
              opacity: 1 - progress * 0.3,
            });
            gsap.set(circleRef.current, {
              scale: 1 + progress * 0.15,
              opacity: 1 - progress * 0.4,
            });
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-white via-blue-50/30 to-white"
    >
      {/* Background orbs */}
      <div ref={circleRef} className="absolute inset-0 pointer-events-none">
        <div className="hero-orb absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-100/40 blur-[120px]" />
        <div className="hero-orb absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-100/30 blur-[100px]" style={{ animationDelay: '1.2s' }} />
        <div className="hero-orb absolute top-1/3 right-1/3 w-[300px] h-[300px] rounded-full bg-blue-50/50 blur-[80px]" style={{ animationDelay: '2.4s' }} />
      </div>

      {/* Floating medical icons */}
      <div ref={iconsRef} className="absolute inset-0 pointer-events-none overflow-hidden">
        <Cross className="absolute top-[15%] left-[10%] w-6 h-6 text-blue-200/30" />
        <Shield className="absolute top-[25%] right-[15%] w-5 h-5 text-blue-200/25" />
        <Activity className="absolute bottom-[30%] left-[8%] w-5 h-5 text-blue-200/25" />
        <Heart className="absolute bottom-[20%] right-[10%] w-5 h-5 text-blue-200/30" />
      </div>

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Urgency badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100/60 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-semibold text-red-600 tracking-wide uppercase">
            Medical Emergency Support
          </span>
        </motion.div>

        {/* Main heading */}
        <h1
          ref={headingRef}
          className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-gray-900 leading-[1.1] tracking-tight"
        >
          Every Minute{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            Matters
          </span>{' '}
          <br />
          After an Animal Bite.
        </h1>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed"
        >
          Animal bites can lead to infections, rabies, delayed treatment, and preventable complications.{' '}
          <span className="text-gray-700 font-medium">Our system ensures no moment is wasted.</span>
        </p>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/register')}
            className="group relative px-8 py-4 bg-blue-600 text-white font-semibold rounded-2xl text-lg shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10">Get Started Free</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
          <button
            onClick={() => {
              document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-8 py-4 text-gray-700 font-semibold rounded-2xl text-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:-translate-y-0.5 transition-all duration-300"
          >
            Learn More
          </button>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-6 h-10 rounded-full border-2 border-gray-300 flex items-start justify-center pt-2"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
