import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Shield, Cross } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function CTASection() {
  const sectionRef = useRef(null);
  const contentRef = useRef(null);
  const headingRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Floating icons
      gsap.to('.cta-orb', {
        y: -20,
        duration: 3,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        stagger: 0.6,
      });

      // Content entrance
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: contentRef.current,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });

      tl.fromTo(
        headingRef.current,
        { y: 60, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 1, ease: 'power3.out' }
      ).fromTo(
        contentRef.current.querySelectorAll('.cta-btn'),
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: 'power2.out' },
        '-=0.4'
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="cta"
      ref={sectionRef}
      className="relative py-28 lg:py-36 overflow-hidden bg-gradient-to-b from-white via-blue-50/20 to-blue-50/30"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="cta-orb absolute top-1/4 left-[15%] w-[200px] h-[200px] rounded-full bg-blue-100/30 blur-[60px]" />
        <div className="cta-orb absolute bottom-1/3 right-[15%] w-[180px] h-[180px] rounded-full bg-cyan-100/20 blur-[50px]" style={{ animationDelay: '1s' }} />
        <div
          className="absolute inset-0 opacity-[0.012]"
          style={{
            backgroundImage: 'radial-gradient(circle at 25px 25px, #0ea5e9 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Floating decorative icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Cross className="absolute top-[20%] right-[20%] w-5 h-5 text-blue-200/20" />
        <Heart className="absolute bottom-[30%] left-[10%] w-4 h-4 text-rose-200/20" />
        <Shield className="absolute top-[40%] left-[25%] w-4 h-4 text-blue-200/20" />
      </div>

      <div ref={contentRef} className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2
          ref={headingRef}
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight"
        >
          Protect Lives Through{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
            Better Healthcare
          </span>
        </h2>

        <p className="mt-6 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Join hundreds of clinics already using our platform to deliver faster, smarter, and more compassionate care to animal bite patients.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/register')}
            className="cta-btn group relative px-10 py-4 bg-blue-600 text-white font-semibold rounded-2xl text-lg shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10">Create Your Account</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="cta-btn px-10 py-4 text-gray-700 font-semibold rounded-2xl text-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:-translate-y-0.5 transition-all duration-300"
          >
            Sign In
          </button>
        </div>

        {/* Trust markers */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-green-500" />
            HIPAA Compliant
          </span>
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-green-500" />
            End-to-End Encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-green-500" />
            99.9% Uptime
          </span>
        </div>
      </div>
    </section>
  );
}
