import { useState, useEffect, useRef, useCallback, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Cross, Menu, X, Calendar, Syringe, FileText, Package,
  Star, Phone, Mail, MapPin, Clock,
  Users, Activity, Shield, ArrowRight, CheckCircle,
  UserPlus, Stethoscope, BarChart3,
} from 'lucide-react';

const VisitOurClinic = lazy(() => import('../../components/landing/VisitOurClinic'));

/* ============================================
   UTILITY HOOKS
   ============================================ */

function useScrollSpy() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return scrolled;
}

function useFadeIn(ref, options = {}) {
  const { threshold = 0.15, rootMargin = '0px 0px -40px 0px' } = options;
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el); } },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, threshold, rootMargin]);
  return visible;
}

function useCountUp(end, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useFadeIn(ref);
  useEffect(() => {
    if (!started) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, end, duration]);
  return [ref, count];
}

/* ============================================
   NAVBAR
   ============================================ */

function Navbar() {
  const scrolled = useScrollSpy();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = useMemo(() => [
    { label: 'Home', href: '#hero' },
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Features', href: '#features' },
    { label: 'Contact', href: '#contact' },
  ], []);

  const scrollTo = useCallback((href) => {
    setMobileOpen(false);
    if (href.startsWith('#')) {
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.08)]'
        : 'bg-white/80 backdrop-blur-sm'
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-18">
          {/* Logo */}
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <Cross className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-lg tracking-tight">
              Animal<span className="text-blue-600">Bite</span>Clinic
            </span>
          </button>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1">
            {links.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <button onClick={() => navigate('/login')} className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
              Sign In
            </button>
            <button onClick={() => navigate('/register')} className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-all duration-200">
              Get Started
            </button>
          </div>

          {/* Mobile menu toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Menu">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-3 space-y-1">
            {links.map((link) => (
              <button key={link.href} onClick={() => scrollTo(link.href)} className="block w-full text-left px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                {link.label}
              </button>
            ))}
            <hr className="my-2 border-gray-100" />
            <button onClick={() => navigate('/login')} className="block w-full text-left px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors">
              Sign In
            </button>
            <button onClick={() => navigate('/register')} className="block w-full text-center px-4 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

/* ============================================
   HERO
   ============================================ */

function Hero() {
  const navigate = useNavigate();
  const headingRef = useRef(null);
  const headingVisible = useFadeIn(headingRef, { threshold: 0.3 });

  return (
    <section id="hero" className="relative min-h-screen flex items-center bg-gradient-to-b from-blue-50/40 via-white to-white pt-24 lg:pt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center py-12 lg:py-0">
          {/* Left: Text */}
          <div ref={headingRef} className={`transition-all duration-700 ${headingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
              Web-Based Animal Bite Clinic System
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight">
              Protecting Lives Through{' '}
              <span className="text-blue-600">Smarter Animal Bite Care</span>
            </h1>
            <p className="mt-5 text-lg text-gray-500 leading-relaxed max-w-lg">
              A comprehensive digital platform for animal bite treatment clinics. Streamline patient management, track vaccinations, and deliver faster, safer care.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button onClick={() => navigate('/register')} className="px-7 py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all duration-200 flex items-center justify-center gap-2">
                Book an Appointment
                <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="px-7 py-3.5 text-gray-700 font-semibold rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200">
                Learn More
              </button>
            </div>
            {/* Benefits checklist */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                'Online Appointment Scheduling',
                'Digital Medical Records',
                'Vaccination Tracking',
                'Faster Patient Management',
              ].map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          {/* Right: Image */}
          <div className={`transition-all duration-700 delay-200 ${headingVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1579684385127-1ef0c0e3e6b3?w=800&q=80"
                alt="Doctor assisting a patient"
                loading="lazy"
                className="w-full h-[400px] lg:h-[500px] object-cover rounded-2xl shadow-xl shadow-blue-500/5"
              />
              {/* Floating stats card */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">8,730+</div>
                  <div className="text-xs text-gray-500">Patients Registered</div>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-medium text-gray-700">HIPAA Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   WHY CHOOSE US
   ============================================ */

function WhyChooseUs() {
  const sectionRef = useRef(null);
  const visible = useFadeIn(sectionRef);

  const cards = [
    { icon: Calendar, title: 'Appointment Scheduling', desc: 'Patients can book, reschedule, and manage appointments online with real-time availability.', color: 'blue' },
    { icon: Syringe, title: 'Vaccination Monitoring', desc: 'Track anti-rabies vaccination schedules with automated reminders for follow-up doses.', color: 'green' },
    { icon: FileText, title: 'Digital Records', desc: 'Secure, paperless medical records accessible anytime. No more lost files or misfiled documents.', color: 'purple' },
    { icon: Package, title: 'Inventory Tracking', desc: 'Monitor vaccine stocks and medical supplies with automated low-stock alerts.', color: 'amber' },
  ];

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <section id="about" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={sectionRef} className={`text-center mb-14 transition-all duration-600 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold tracking-wide uppercase mb-4">
            Why Choose Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Built for Animal Bite Clinics</h2>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
            Our platform addresses the unique challenges of animal bite treatment centers with specialized tools.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <div
                key={card.title}
                className="p-6 rounded-xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorMap[card.color]}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1.5">{card.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   SERVICES
   ============================================ */

function Services() {
  const sectionRef = useRef(null);
  const visible = useFadeIn(sectionRef);

  const services = [
    { icon: Stethoscope, title: 'Animal Bite Treatment', desc: 'Complete wound assessment, cleaning, and initial treatment protocols.', image: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=600&q=80' },
    { icon: Syringe, title: 'Rabies Vaccination', desc: 'Scheduled anti-rabies vaccine administration with dose tracking.', image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600&q=80' },
    { icon: UserPlus, title: 'Patient Registration', desc: 'Quick digital registration with complete medical history capture.', image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&q=80' },
    { icon: Calendar, title: 'Follow-Up Monitoring', desc: 'Automated follow-up scheduling and wound healing progress tracking.', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&q=80' },
    { icon: Activity, title: 'Emergency Consultation', desc: 'Priority consultation for emergency animal bite cases.', image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&q=80' },
    { icon: FileText, title: 'Medical Records', desc: 'Secure digital storage of all patient medical records and vaccination certificates.', image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=600&q=80' },
  ];

  return (
    <section id="services" className="py-20 lg:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={sectionRef} className={`text-center mb-14 transition-all duration-600 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold tracking-wide uppercase mb-4">
            Our Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Comprehensive Animal Bite Care</h2>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
            From emergency treatment to complete vaccination management, we cover every step of the care journey.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div key={service.title} className="group rounded-xl bg-white border border-gray-100 overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="h-44 overflow-hidden">
                  <img src={service.image} alt={service.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2.5 mb-2">
                    <Icon className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">{service.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{service.desc}</p>
                  <button className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                    Learn More <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   HOW IT WORKS
   ============================================ */

function HowItWorks() {
  const sectionRef = useRef(null);
  const visible = useFadeIn(sectionRef);

  const steps = [
    { icon: UserPlus, num: '01', title: 'Create an Account', desc: 'Register in under 2 minutes with your basic information.' },
    { icon: Calendar, num: '02', title: 'Book an Appointment', desc: 'Choose a convenient time slot and clinic location.' },
    { icon: Stethoscope, num: '03', title: 'Visit the Clinic', desc: 'Receive professional examination and treatment.' },
    { icon: Syringe, num: '04', title: 'Track Vaccinations', desc: 'Monitor your vaccination schedule and get reminders.' },
  ];

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={sectionRef} className={`text-center mb-14 transition-all duration-600 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold tracking-wide uppercase mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Simple Four-Step Process</h2>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
            Getting started with the Animal Bite Clinic System is easy.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.num} className="text-center relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-blue-100" />
                )}
                <div className="w-24 h-24 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4 relative">
                  <Icon className="w-10 h-10 text-blue-600" />
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shadow-md">
                    {step.num}
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-sm text-gray-500 max-w-[200px] mx-auto">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   FEATURES (Alternating Image + Text)
   ============================================ */

function Features() {
  const sectionRef = useRef(null);
  const visible = useFadeIn(sectionRef);

  const features = [
    {
      title: 'Patient Management',
      desc: 'Complete patient profiles with medical history, contact details, and vaccination records. Easily search, filter, and access patient information instantly.',
      benefits: ['Digital patient intake forms', 'Medical history tracking', 'Automated record updates'],
      image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=700&q=80',
      reversed: false,
    },
    {
      title: 'Appointment System',
      desc: 'Smart scheduling with real-time availability, automated reminders, and easy rescheduling. Reduce no-shows and optimize clinic workflow.',
      benefits: ['Online booking portal', 'SMS/email reminders', 'Calendar integration'],
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=700&q=80',
      reversed: true,
    },
    {
      title: 'Vaccination Records',
      desc: 'Automated vaccination scheduling with dose tracking, follow-up reminders, and digital vaccination certificates for patients.',
      benefits: ['Multi-dose scheduling', 'Overdue alerts', 'Digital certificates'],
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=700&q=80',
      reversed: false,
    },
    {
      title: 'Inventory Management',
      desc: 'Real-time tracking of vaccine stocks, medical supplies, and pharmaceuticals. Automated low-stock alerts and supply chain management.',
      benefits: ['Real-time stock tracking', 'Low-stock alerts', 'Supply ordering'],
      image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=700&q=80',
      reversed: true,
    },
    {
      title: 'Reports & Analytics',
      desc: 'Comprehensive dashboards and reports covering vaccination rates, patient trends, clinic performance, and operational metrics.',
      benefits: ['Real-time analytics', 'Exportable reports', 'Performance metrics'],
      image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=700&q=80',
      reversed: false,
    },
    {
      title: 'Notifications',
      desc: 'Automated SMS and email notifications for appointment reminders, vaccination schedule updates, follow-up alerts, and clinic announcements.',
      benefits: ['Appointment confirmations', 'Vaccination reminders', 'Automated follow-ups'],
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=700&q=80',
      reversed: true,
    },
  ];

  return (
    <section id="features" className="py-20 lg:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={sectionRef} className={`text-center mb-14 transition-all duration-600 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold tracking-wide uppercase mb-4">
            System Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Everything You Need to Run a Modern Clinic</h2>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
            Powerful tools designed specifically for animal bite treatment centers.
          </p>
        </div>

        <div className="space-y-20">
          {features.map((feature) => (
            <div key={feature.title} className={`grid lg:grid-cols-2 gap-10 lg:gap-16 items-center ${feature.reversed ? 'lg:direction-rtl' : ''}`}>
              {/* Image */}
              <div className={`${feature.reversed ? 'lg:order-2' : ''}`}>
                <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                  <img src={feature.image} alt={feature.title} loading="lazy" className="w-full h-[300px] lg:h-[360px] object-cover" />
                </div>
              </div>
              {/* Text */}
              <div className={feature.reversed ? 'lg:order-1' : ''}>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed mb-5">{feature.desc}</p>
                <ul className="space-y-2.5">
                  {feature.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-2.5 text-sm text-gray-700">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   STATISTICS
   ============================================ */

function Statistics() {
  const sectionRef = useRef(null);
  const visible = useFadeIn(sectionRef);
  const [ref1, v1] = useCountUp(15420);
  const [ref2, v2] = useCountUp(8730);
  const [ref3, v3] = useCountUp(12500);
  const [ref4, v4] = useCountUp(28400);
  const [ref5, v5] = useCountUp(520);
  const [ref6, v6] = useCountUp(98);

  const stats = [
    { ref: ref1, value: v1, suffix: '+', label: 'Vaccinations Administered' },
    { ref: ref2, value: v2, suffix: '+', label: 'Patients Registered' },
    { ref: ref3, value: v3, suffix: '+', label: 'Appointments Scheduled' },
    { ref: ref4, value: v4, suffix: '+', label: 'Medical Records Created' },
    { ref: ref5, value: v5, suffix: '+', label: 'Partner Clinics' },
    { ref: ref6, value: v6, suffix: '%', label: 'Patient Satisfaction' },
  ];

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={sectionRef} className={`text-center mb-14 transition-all duration-600 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold tracking-wide uppercase mb-4">
            Our Impact
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Trusted by Healthcare Providers</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
          {stats.map((stat, i) => (
            <div key={stat.label} ref={stat.ref} className="text-center p-4">
              <div className="text-3xl lg:text-4xl font-bold text-blue-600">
                {stat.value.toLocaleString()}{stat.suffix}
              </div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   TESTIMONIALS
   ============================================ */

function Testimonials() {
  const sectionRef = useRef(null);
  const visible = useFadeIn(sectionRef);

  const testimonials = [
    { name: 'Dr. Maria Santos', role: 'Chief Veterinarian', clinic: 'Manila Animal Bite Center', quote: 'This system transformed our clinic workflow. Vaccination tracking alone saved us countless hours.', rating: 5 },
    { name: 'Dr. Juan Dela Cruz', role: 'Medical Director', clinic: 'Quezon City Health Office', quote: 'Automated reminders reduced our no-show rate by 70%. A game-changer for public health.', rating: 5 },
    { name: 'Nurse Patricia Reyes', role: 'Head Nurse', clinic: 'Cebu Animal Bite Treatment Center', quote: 'Training new staff takes hours, not days. The dashboard gives me everything at a glance.', rating: 5 },
  ];

  return (
    <section className="py-20 lg:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={sectionRef} className={`text-center mb-14 transition-all duration-600 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold tracking-wide uppercase mb-4">
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Trusted by Healthcare Professionals</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="p-6 rounded-xl bg-white border border-gray-100 hover:shadow-md transition-shadow duration-300">
              <div className="flex gap-1 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.role}, {t.clinic}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   CONTACT
   ============================================ */

function Contact() {
  const sectionRef = useRef(null);
  const visible = useFadeIn(sectionRef);

  const contactInfo = [
    { icon: MapPin, label: 'Clinic Address', value: 'Barangay Tinago, Bayawan City, Negros Oriental' },
    { icon: Phone, label: 'Phone Number', value: '0986632883' },
    { icon: Mail, label: 'Email Address', value: 'contact@animalbiteclinic.com' },
    { icon: Clock, label: 'Operating Hours', value: 'Mon - Sat: 8:00 AM - 6:00 PM' },
  ];

  return (
    <section id="contact" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={sectionRef} className={`text-center mb-14 transition-all duration-600 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold tracking-wide uppercase mb-4">
            Contact Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Get in Touch</h2>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
            Have questions? We&apos;re here to help.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div className="space-y-6">
            {contactInfo.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{item.label}</div>
                    <div className="text-sm text-gray-500">{item.value}</div>
                  </div>
                </div>
              );
            })}
            {/* Map placeholder */}
            {/* <div className="h-48 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-sm">
              <MapPin className="w-5 h-5 mr-1" /> Map Integration
            </div> */}
          </div>
          {/* Contact Form */}
          <div className="bg-gray-50 rounded-xl p-6 lg:p-8 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Send Us a Message</h3>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm" placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm" placeholder="john@example.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea rows={4} className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm resize-none" placeholder="How can we help you?" />
              </div>
              <button type="submit" className="w-full px-5 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-sm">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   CTA
   ============================================ */

function CTA() {
  const navigate = useNavigate();
  const sectionRef = useRef(null);
  const visible = useFadeIn(sectionRef);

  return (
    <section className="py-20 lg:py-28 bg-blue-600">
      <div ref={sectionRef} className={`max-w-3xl mx-auto px-4 sm:px-6 text-center transition-all duration-600 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
          Ready to Transform Your Clinic?
        </h2>
        <p className="mt-4 text-lg text-blue-100 max-w-xl mx-auto">
          Join hundreds of clinics using our platform to deliver faster, smarter animal bite care.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button onClick={() => navigate('/register')} className="px-8 py-3.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
            Get Started Free
          </button>
          <button onClick={() => navigate('/login')} className="px-8 py-3.5 text-white font-semibold rounded-xl border border-white/30 hover:bg-white/10 transition-colors">
            Sign In
          </button>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   VISIT OUR CLINIC (Scroll-triggered lazy load)
   ============================================ */

function VisitOurClinicSection() {
  const ref = useRef(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.05, rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {shouldLoad && (
        <Suspense fallback={null}>
          <VisitOurClinic />
        </Suspense>
      )}
    </div>
  );
}

/* ============================================
   FOOTER
   ============================================ */

function Footer() {
  const navigate = useNavigate();

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand */}
          <div className="lg:col-span-4">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
                <Cross className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-white text-lg">AnimalBiteClinic</span>
            </button>
            <p className="mt-4 text-sm leading-relaxed max-w-xs">
              A comprehensive management system for animal bite treatment clinics. Streamline operations, track vaccinations, and save lives.
            </p>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Home', id: 'hero' },
                { label: 'About', id: 'about' },
                { label: 'Services', id: 'services' },
                { label: 'Features', id: 'features' },
                { label: 'Contact', id: 'contact' },
              ].map((link) => (
                <li key={link.label}>
                  <button onClick={() => scrollTo(link.id)} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Services</h4>
            <ul className="space-y-2.5">
              {['Animal Bite Treatment', 'Rabies Vaccination', 'Patient Registration', 'Follow-Up Care', 'Emergency Consultation'].map((s) => (
                <li key={s}>
                  <span className="text-sm text-gray-400">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-4">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5 text-sm">
                <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
                123 Healthcare Ave, Manila
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
                +63 (2) 8123 4567
              </li>
              <li className="flex items-center gap-2.5 text-sm">
                <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                contact@animalbiteclinic.com
              </li>
            </ul>
            <div className="mt-4 flex gap-2">
              <button onClick={() => navigate('/register')} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                Get Started
              </button>
              <button onClick={() => navigate('/login')} className="px-4 py-2 border border-gray-700 text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                Sign In
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} AnimalBiteClinic System. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button className="hover:text-gray-300 transition-colors">Privacy Policy</button>
            <span>·</span>
            <button className="hover:text-gray-300 transition-colors">Terms of Service</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ============================================
   LANDING PAGE COMPOSITION
   ============================================ */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <WhyChooseUs />
      <Services />
      <HowItWorks />
      <Features />
      <Statistics />
      <Testimonials />
      <Contact />
      <CTA />
      <VisitOurClinicSection />
      <Footer />
    </div>
  );
}
