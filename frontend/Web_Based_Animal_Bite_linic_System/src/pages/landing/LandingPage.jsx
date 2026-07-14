import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Animated Counter ───
function AnimatedCounter({ value, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const counted = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const start = 0;
          const end = parseInt(value);
          const increment = Math.ceil(end / (duration / 16));
          const timer = setInterval(() => {
            setCount((prev) => {
              const next = prev + increment;
              if (next >= end) {
                clearInterval(timer);
                return end;
              }
              return next;
            });
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className="stat-value">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

// ─── FAQ Item ───
function FAQItem({ question, answer, isOpen, onClick }) {
  return (
    <div className={`faq-item ${isOpen ? 'active' : ''}`}>
      <button className="faq-question" onClick={onClick}>
        <span>{question}</span>
        <span className="faq-arrow">▼</span>
      </button>
      <div className={`faq-answer ${isOpen ? 'open' : 'closed'}`}>
        <p>{answer}</p>
      </div>
    </div>
  );
}

// ─── Service Card ───
const services = [
  { icon: '🩺', title: 'Animal Bite Consultation', desc: 'Expert assessment and management of animal bite wounds by qualified medical professionals.', color: '#eef2ff', iconColor: '#6366f1' },
  { icon: '💉', title: 'Anti-Rabies Vaccination', desc: 'Complete anti-rabies vaccination following WHO and DOH protocols for bite victims.', color: '#f0fdf4', iconColor: '#10b981' },
  { icon: '📋', title: 'Follow-up Vaccination', desc: 'Scheduled follow-up doses to ensure complete immunization and patient safety.', color: '#fef3c7', iconColor: '#f59e0b' },
  { icon: '🏥', title: 'Wound Assessment', desc: 'Thorough wound evaluation and proper treatment to prevent infection and complications.', color: '#fce7f3', iconColor: '#ec4899' },
  { icon: '📁', title: 'Patient Records', desc: 'Secure digital storage of patient records, vaccination history, and medical documents.', color: '#dbeafe', iconColor: '#3b82f6' },
  { icon: '📅', title: 'Appointment Scheduling', desc: 'Easy online booking system for vaccination appointments and follow-up visits.', color: '#f5f3ff', iconColor: '#8b5cf6' },
];

// ─── How It Works Steps ───
const steps = [
  { number: 1, icon: '📝', title: 'Create an Account', desc: 'Sign up with your email and verify your identity.' },
  { number: 2, icon: '👤', title: 'Complete Your Profile', desc: 'Fill in your personal and medical information.' },
  { number: 3, icon: '📅', title: 'Book an Appointment', desc: 'Choose your preferred date and time slot.' },
  { number: 4, icon: '🏥', title: 'Visit the Clinic', desc: 'Come to the clinic at your scheduled time.' },
  { number: 5, icon: '💉', title: 'Receive Vaccination', desc: 'Get your anti-rabies vaccination from our staff.' },
  { number: 6, icon: '📊', title: 'Track Your History', desc: 'Monitor your vaccination records online.' },
];

// ─── Features ───
const features = [
  { icon: '📅', title: 'Online Appointment Booking', desc: 'Book, reschedule, or cancel appointments anytime from any device.' },
  { icon: '📊', title: 'Vaccination Tracking', desc: 'Track your complete vaccination history and upcoming doses.' },
  { icon: '🔒', title: 'Secure Patient Accounts', desc: 'Your medical data is protected with industry-standard encryption.' },
  { icon: '📧', title: 'Email Verification', desc: 'Secure email verification to protect your account.' },
  { icon: '🔔', title: 'Appointment Notifications', desc: 'Get notified about upcoming appointments and follow-up doses.' },
  { icon: '📋', title: 'Digital Medical Records', desc: 'Access your vaccination records anytime from your patient dashboard.' },
];

// ─── Testimonials ───
const testimonials = [
  { name: 'Maria Santos', role: 'Patient', avatar: 'MS', text: 'The clinic made my vaccination process so easy. I booked online, showed up, and got my shot in minutes. Highly recommended!' },
  { name: 'Juan dela Cruz', role: 'Patient', avatar: 'JC', text: 'After being bitten by a stray dog, I was worried. The staff here were professional and explained everything clearly. Thank you!' },
  { name: 'Anna Reyes', role: 'Patient', avatar: 'AR', text: 'The online appointment system is really convenient. No more long queues! The nurses are very gentle with the injections.' },
];

// ─── FAQs ───
const faqs = [
  { q: 'How do I book an appointment?', a: 'Simply create an account, complete your profile, and use the "Book Appointment" feature to select your preferred date and time. You\'ll receive a confirmation email once booked.' },
  { q: 'What should I bring to my appointment?', a: 'Please bring a valid ID, any previous medical records related to animal bites, and your patient ID if you have one. Arrive 10 minutes before your scheduled time.' },
  { q: 'How many vaccine doses do I need?', a: 'The number of doses depends on your bite category and previous vaccination status. Typically, post-exposure prophylaxis involves 3-5 doses over 28 days.' },
  { q: 'Is there a fee for the consultation?', a: 'Please contact the clinic for information about consultation fees and vaccination costs. Some services may be covered by PhilHealth or other health insurance.' },
  { q: 'Can I reschedule my appointment?', a: 'Yes, you can reschedule or cancel your appointment through your patient dashboard. Please do so at least 24 hours before your scheduled time.' },
  { q: 'What if I miss my scheduled dose?', a: 'If you miss your scheduled dose, please contact the clinic immediately to reschedule. It\'s important to complete the full vaccination series on time.' },
];

// ─── FadeInView wrapper ───
function FadeInView({ children, delay = 0, direction = 'up' }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const variants = {
    up: { opacity: 0, y: 40 },
    down: { opacity: 0, y: -20 },
    left: { opacity: 0, x: -40 },
    right: { opacity: 0, x: 40 },
  };

  return (
    <motion.div
      ref={ref}
      initial={variants[direction]}
      animate={isVisible ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════
// MAIN LANDING PAGE COMPONENT
// ═══════════════════════════════
export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSent, setContactSent] = useState(false);

  // Scroll listener for nav
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSent(true);
    setTimeout(() => setContactSent(false), 5000);
    setContactForm({ name: '', email: '', message: '' });
  };

  return (
    <div className="landing-page">
      {/* ── Navigation ── */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner">
          <a href="#" className="nav-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="nav-brand-icon">🏥</div>
            <span>Animal Bite Clinic</span>
          </a>

          <ul className="nav-links">
            <li><button className="nav-link-item" onClick={() => scrollTo('home')}>Home</button></li>
            <li><button className="nav-link-item" onClick={() => scrollTo('about')}>About</button></li>
            <li><button className="nav-link-item" onClick={() => scrollTo('services')}>Services</button></li>
            <li><button className="nav-link-item" onClick={() => scrollTo('faq')}>FAQs</button></li>
            <li><button className="nav-link-item" onClick={() => scrollTo('contact')}>Contact</button></li>
          </ul>

          <div className="nav-cta">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn-primary" style={{ padding: '10px 24px', fontSize: 14 }}>
                Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-secondary" style={{ padding: '10px 20px', fontSize: 13, color: '#475569' }}>
                  Login
                </Link>
                <Link to="/register" className="btn-primary" style={{ padding: '10px 20px', fontSize: 13 }}>
                  Register
                </Link>
              </>
            )}
          </div>

          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)} aria-label="Menu">
            ☰
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="mobile-nav-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              className="mobile-nav"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="mobile-nav-header">
                <span style={{ fontWeight: 700, fontSize: 18 }}>Menu</span>
                <button className="mobile-nav-close" onClick={() => setMobileMenuOpen(false)}>✕</button>
              </div>
              <button className="mobile-nav-link" onClick={() => scrollTo('home')}>🏠 Home</button>
              <button className="mobile-nav-link" onClick={() => scrollTo('about')}>ℹ️ About</button>
              <button className="mobile-nav-link" onClick={() => scrollTo('services')}>🩺 Services</button>
              <button className="mobile-nav-link" onClick={() => scrollTo('faq')}>❓ FAQs</button>
              <button className="mobile-nav-link" onClick={() => scrollTo('contact')}>📞 Contact</button>
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-primary" style={{ textAlign: 'center', marginTop: 16 }}>
                  Dashboard →
                </Link>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary" style={{ textAlign: 'center', marginTop: 16 }}>
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary" style={{ textAlign: 'center' }}>
                    Register
                  </Link>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Hero Section ── */}
      <section id="home" className="hero-section">
        <div className="hero-bg-pattern" />
        <div className="hero-gradient-orb" />
        <div className="hero-gradient-orb-2" />
        <div className="hero-content">
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <h1>
              Your Safety Is Our <span>Priority</span>
            </h1>
            <p className="hero-description">
              The Animal Bite Clinic System provides comprehensive care for animal bite victims.
              From wound assessment to complete anti-rabies vaccination, we're here to protect
              your health every step of the way.
            </p>
            <div className="hero-buttons">
              {isAuthenticated ? (
                <Link to="/appointments/book" className="hero-btn-primary">
                  📅 Book Appointment
                </Link>
              ) : (
                <>
                  <Link to="/register" className="hero-btn-primary">
                    📅 Get Started
                  </Link>
                  <Link to="/login" className="hero-btn-secondary">
                    🔑 Login
                  </Link>
                </>
              )}
            </div>
            <div className="hero-stats-row">
              <div className="hero-stat">
                <div className="hero-stat-value">500+</div>
                <div className="hero-stat-label">Patients Treated</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">99%</div>
                <div className="hero-stat-label">Satisfaction Rate</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-value">24/7</div>
                <div className="hero-stat-label">Patient Support</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="hero-visual"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          >
            <div className="hero-illustration">
              <div className="hero-illustration-icon">🏥</div>
              <div className="hero-illustration-features">
                <div className="hero-illustration-item">✅ Online Appointment Booking</div>
                <div className="hero-illustration-item">✅ Anti-Rabies Vaccination</div>
                <div className="hero-illustration-item">✅ Digital Medical Records</div>
                <div className="hero-illustration-item">✅ Secure Patient Portal</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── About Section ── */}
      <section id="about" className="section about-section">
        <div className="section-inner">
          <div className="about-grid">
            <FadeInView direction="left">
              <div className="about-image">🏥</div>
            </FadeInView>
            <FadeInView direction="right" delay={0.1}>
              <div className="section-label">About Us</div>
              <h3>Dedicated to Rabies Prevention and Community Health</h3>
              <p>
                The Animal Bite Clinic is a specialized healthcare facility dedicated to the
                prevention and management of rabies. We provide comprehensive care for animal
                bite victims, from initial wound assessment to complete post-exposure prophylaxis.
              </p>
              <p>
                Our team of trained medical professionals follows the latest WHO and DOH guidelines
                to ensure every patient receives the highest standard of care.
              </p>
              <div className="about-mission">
                <div className="mission-card">
                  <h4>🎯 Our Mission</h4>
                  <p>To provide accessible, high-quality rabies prevention services to all patients through efficient healthcare delivery.</p>
                </div>
                <div className="mission-card">
                  <h4>👁️ Our Vision</h4>
                  <p>A rabies-free community where every animal bite victim receives timely and complete medical care.</p>
                </div>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* ── Services Section ── */}
      <section id="services" className="section services-section">
        <div className="section-inner">
          <FadeInView>
            <div className="section-header">
              <div className="section-label">Our Services</div>
              <h2 className="section-title">Comprehensive Bite Care Services</h2>
              <p className="section-subtitle">From consultation to complete vaccination, we provide all the care you need.</p>
            </div>
          </FadeInView>
          <div className="services-grid">
            {services.map((s, i) => (
              <FadeInView key={s.title} delay={i * 0.08}>
                <div className="service-card">
                  <div className="service-icon" style={{ background: s.color }}>
                    {s.icon}
                  </div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="section how-section">
        <div className="section-inner">
          <FadeInView>
            <div className="section-header">
              <div className="section-label">How It Works</div>
              <h2 className="section-title">Your Journey to Recovery</h2>
              <p className="section-subtitle">Simple steps from registration to complete vaccination.</p>
            </div>
          </FadeInView>
          <div className="steps-grid">
            {steps.map((step, i) => (
              <FadeInView key={step.number} delay={i * 0.1}>
                <div className="step-card">
                  <div className="step-number">{step.number}</div>
                  <span className="step-icon">{step.icon}</span>
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section className="section features-section">
        <div className="section-inner">
          <FadeInView>
            <div className="section-header">
              <div className="section-label" style={{ background: 'rgba(99,102,241,0.2)', color: '#a5b4fc' }}>
                Features
              </div>
              <h2 className="section-title">Why Choose Our System</h2>
              <p className="section-subtitle">Modern healthcare technology at your fingertips.</p>
            </div>
          </FadeInView>
          <div className="features-grid">
            {features.map((f, i) => (
              <FadeInView key={f.title} delay={i * 0.08}>
                <div className="feature-card">
                  <span className="feature-icon">{f.icon}</span>
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Section ── */}
      <section className="section stats-section">
        <div className="section-inner">
          <div className="stats-grid-landing">
            <FadeInView>
              <div className="stat-card-landing">
                <AnimatedCounter value={850} suffix="+" />
                <div className="stat-label">Registered Patients</div>
              </div>
            </FadeInView>
            <FadeInView delay={0.1}>
              <div className="stat-card-landing">
                <AnimatedCounter value={2400} suffix="+" />
                <div className="stat-label">Vaccinations Administered</div>
              </div>
            </FadeInView>
            <FadeInView delay={0.2}>
              <div className="stat-card-landing">
                <AnimatedCounter value={1200} suffix="+" />
                <div className="stat-label">Completed Appointments</div>
              </div>
            </FadeInView>
            <FadeInView delay={0.3}>
              <div className="stat-card-landing">
                <AnimatedCounter value={5} suffix="+" />
                <div className="stat-label">Years of Service</div>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section testimonials-section">
        <div className="section-inner">
          <FadeInView>
            <div className="section-header">
              <div className="section-label">Testimonials</div>
              <h2 className="section-title">What Our Patients Say</h2>
              <p className="section-subtitle">Hear from patients who have experienced our care.</p>
            </div>
          </FadeInView>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <FadeInView key={t.name} delay={i * 0.1}>
                <div className="testimonial-card">
                  <div className="testimonial-stars">★★★★★</div>
                  <p className="testimonial-text">"{t.text}"</p>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar">{t.avatar}</div>
                    <div>
                      <div className="testimonial-name">{t.name}</div>
                      <div className="testimonial-role">{t.role}</div>
                    </div>
                  </div>
                </div>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section id="faq" className="section faq-section">
        <div className="section-inner">
          <FadeInView>
            <div className="section-header">
              <div className="section-label">FAQs</div>
              <h2 className="section-title">Frequently Asked Questions</h2>
              <p className="section-subtitle">Everything you need to know about our services.</p>
            </div>
          </FadeInView>
          <div className="faq-list">
            {faqs.map((faq, i) => (
              <FadeInView key={i} delay={i * 0.05}>
                <FAQItem
                  question={faq.q}
                  answer={faq.a}
                  isOpen={openFaq === i}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                />
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact Section ── */}
      <section id="contact" className="section contact-section">
        <div className="section-inner">
          <FadeInView>
            <div className="section-header">
              <div className="section-label">Contact Us</div>
              <h2 className="section-title">Get In Touch</h2>
              <p className="section-subtitle">We're here to help. Reach out to us anytime.</p>
            </div>
          </FadeInView>
          <div className="contact-grid">
            <FadeInView direction="left">
              <div className="contact-info-list">
                <div className="contact-item">
                  <div className="contact-item-icon">📍</div>
                  <div>
                    <h4>Address</h4>
                    <p>123 Health Street, Barangay San Juan<br />Manila, Philippines 1000</p>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-item-icon">📞</div>
                  <div>
                    <h4>Phone</h4>
                    <p>(02) 8123-4567<br />+63 912 345 6789</p>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-item-icon">📧</div>
                  <div>
                    <h4>Email</h4>
                    <p>info@animalbiteclinic.com<br />support@animalbiteclinic.com</p>
                  </div>
                </div>
                <div className="contact-item">
                  <div className="contact-item-icon">🕐</div>
                  <div>
                    <h4>Clinic Hours</h4>
                    <p>Monday – Friday: 8:00 AM – 5:00 PM<br />Saturday: 8:00 AM – 12:00 PM</p>
                  </div>
                </div>
                <div className="contact-map">
                  🗺️ Google Maps Integration
                </div>
              </div>
            </FadeInView>

            <FadeInView direction="right" delay={0.1}>
              <div className="card" style={{ padding: 32 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Send Us a Message</h3>
                <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="form-group">
                    <label>Your Name</label>
                    <input
                      type="text"
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Message</label>
                    <textarea
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="How can we help you?"
                      rows={5}
                      required
                    />
                  </div>
                  <button type="submit" className="btn-primary" style={{ padding: '14px 24px', fontSize: 15 }}>
                    {contactSent ? '✅ Message Sent!' : '📨 Send Message'}
                  </button>
                </form>
              </div>
            </FadeInView>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-brand">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'white', fontWeight: 700, fontSize: 18 }}>
                <span style={{ fontSize: 24 }}>🏥</span>
                Animal Bite Clinic
              </div>
              <p>Providing comprehensive animal bite care and rabies prevention services to the community.</p>
              <div className="footer-social">
                <a href="#" className="social-icon" aria-label="Facebook">f</a>
                <a href="#" className="social-icon" aria-label="Twitter">𝕏</a>
                <a href="#" className="social-icon" aria-label="Instagram">📷</a>
                <a href="#" className="social-icon" aria-label="YouTube">▶</a>
              </div>
            </div>

            <div className="footer-column">
              <h4>Quick Links</h4>
              <ul className="footer-links">
                <li><button className="footer-link" onClick={() => scrollTo('home')}>Home</button></li>
                <li><button className="footer-link" onClick={() => scrollTo('about')}>About</button></li>
                <li><button className="footer-link" onClick={() => scrollTo('services')}>Services</button></li>
                <li><button className="footer-link" onClick={() => scrollTo('faq')}>FAQs</button></li>
                <li><button className="footer-link" onClick={() => scrollTo('contact')}>Contact</button></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>For Patients</h4>
              <ul className="footer-links">
                <li><Link to="/register" className="footer-link">Register</Link></li>
                <li><Link to="/login" className="footer-link">Login</Link></li>
                <li><Link to="/appointments/book" className="footer-link">Book Appointment</Link></li>
                <li><button className="footer-link" onClick={() => scrollTo('faq')}>FAQ</button></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Contact</h4>
              <ul className="footer-links">
                <li><span className="footer-link" style={{ cursor: 'default' }}>📍 Manila, Philippines</span></li>
                <li><span className="footer-link" style={{ cursor: 'default' }}>📞 (02) 8123-4567</span></li>
                <li><span className="footer-link" style={{ cursor: 'default' }}>📧 info@clinic.com</span></li>
                <li><span className="footer-link" style={{ cursor: 'default' }}>🕐 Mon-Sat 8AM-5PM</span></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Animal Bite Clinic System. All rights reserved.</span>
            <div className="footer-bottom-links">
              <a href="#" className="footer-link" style={{ cursor: 'pointer' }}>Privacy Policy</a>
              <a href="#" className="footer-link" style={{ cursor: 'pointer' }}>Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
