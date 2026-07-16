import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Cross } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../api/axios';
import { showSuccess, showError } from '../../hooks/useToast';

import BackgroundEffects from '../../components/auth/BackgroundEffects';
import PhoneMockup from '../../components/auth/PhoneMockup';
import InputField from '../../components/auth/InputField';
import AnimatedButton from '../../components/auth/AnimatedButton';

export default function Register() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const prefersReducedMotion = useReducedMotion();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Redirect to verify OTP if email is stored in session
  useEffect(() => {
    const pendingEmail = sessionStorage.getItem('pending_verification_email');
    const pendingName = sessionStorage.getItem('pending_verification_name');
    if (pendingEmail && pendingName) {
      navigate('/verify-otp', { replace: true });
    }
  }, [navigate]);

  const updateField = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.first_name.trim()) { setError('First name is required.'); return; }
    if (!formData.last_name.trim()) { setError('Last name is required.'); return; }
    if (!formData.email.trim()) { setError('Email is required.'); return; }
    if (formData.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (formData.password !== formData.confirm_password) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      await authAPI.registerStep1({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirm_password: formData.confirm_password,
      });

      sessionStorage.setItem('pending_verification_email', formData.email.trim().toLowerCase());
      sessionStorage.setItem('pending_verification_name', formData.first_name.trim());
      sessionStorage.setItem('otp_expires_at', new Date(Date.now() + 5 * 60 * 1000).toISOString());

      showSuccess('Verification code sent! Check your email.');
      navigate('/verify-otp', { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const messages = Object.entries(data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join('\n');
        setError(messages);
        showError('Registration failed. Please check your details.');
      } else {
        setError('Registration failed. Please try again.');
        showError('Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  // Animation variants matching Login page
  const fadeUp = prefersReducedMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } } };

  if (isAuthenticated) return null;

  return (
    <div className="relative min-h-screen flex bg-white overflow-hidden">
      {/* ====== LEFT SECTION - Phone Mockup ====== */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center">
        <BackgroundEffects />
        <div className="relative z-10">
          {/* Logo badge */}
          <motion.div
            className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center gap-2 justify-center">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
                <Cross className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-700">Animal Bite Clinic</span>
            </div>
          </motion.div>

          {/* Phone - registration variant */}
          <PhoneMockup variant="register" />

          {/* Bottom tagline */}
          <motion.p
            className="absolute -bottom-14 left-1/2 -translate-x-1/2 text-xs text-slate-400 whitespace-nowrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Complete clinic management, anywhere
          </motion.p>
        </div>
      </div>

      {/* ====== RIGHT SECTION - Registration Form ====== */}
      <div className="flex-1 flex items-center justify-center px-6 py-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile logo */}
          <motion.div
            className="lg:hidden flex items-center gap-2.5 mb-10 justify-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-sm">
              <Cross className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-700">Animal Bite Clinic</span>
          </motion.div>

          {/* Heading */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h1 className="text-[28px] font-bold tracking-tight text-slate-900 mb-1.5">
              Create your account
            </h1>
            <p className="text-sm text-slate-500 leading-relaxed">
              Register to access the Animal Bite Clinic System and manage your clinic operations.
            </p>
          </motion.div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5"
            >
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200" role="alert">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium text-red-800 whitespace-pre-line">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Progress indicator */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <div className="flex items-center gap-2 justify-center mb-1.5">
              <div className="w-8 h-1.5 rounded-full bg-blue-500" />
              <div className="w-8 h-1.5 rounded-full bg-slate-200" />
            </div>
            <p className="text-xs text-slate-400 text-center">Step 1 of 2 — Personal Details</p>
          </motion.div>

          {/* Registration form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div variants={prefersReducedMotion ? undefined : fadeUp} initial="hidden" animate="visible">
              {/* Row: First Name + Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  id="first_name"
                  label="First Name"
                  type="text"
                  value={formData.first_name}
                  onChange={updateField('first_name')}
                  error={error.includes('first_name') ? 'Required' : ''}
                  disabled={loading}
                  autoComplete="given-name"
                  autoFocus
                  placeholder="Juan"
                />
                <InputField
                  id="last_name"
                  label="Last Name"
                  type="text"
                  value={formData.last_name}
                  onChange={updateField('last_name')}
                  error={error.includes('last_name') ? 'Required' : ''}
                  disabled={loading}
                  autoComplete="family-name"
                  placeholder="Dela Cruz"
                />
              </div>
            </motion.div>

            <motion.div variants={prefersReducedMotion ? undefined : fadeUp} initial="hidden" animate="visible">
              <InputField
                id="email"
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={updateField('email')}
                error={error.includes('email') ? 'Invalid email' : ''}
                disabled={loading}
                icon="mail"
                autoComplete="email"
                placeholder="you@example.com"
              />
            </motion.div>

            <motion.div variants={prefersReducedMotion ? undefined : fadeUp} initial="hidden" animate="visible">
              {/* Row: Password + Confirm Password */}
              <div className="grid grid-cols-2 gap-3">
                <InputField
                  id="password"
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={updateField('password')}
                  error={error.includes('password') || error.includes('Password') ? error : ''}
                  disabled={loading}
                  icon="lock"
                  autoComplete="new-password"
                />
                <InputField
                  id="confirm_password"
                  label="Confirm Password"
                  type="password"
                  value={formData.confirm_password}
                  onChange={updateField('confirm_password')}
                  error={error.includes('match') ? 'Must match' : ''}
                  disabled={loading}
                  icon="lock"
                  autoComplete="new-password"
                />
              </div>
            </motion.div>

            {/* Submit button */}
            <motion.div variants={prefersReducedMotion ? undefined : fadeUp} initial="hidden" animate="visible">
              <AnimatedButton loading={loading} success={false} disabled={loading}>
                <span className="flex items-center gap-2">
                  {loading ? 'Sending OTP...' : 'Send Verification Code'}
                </span>
              </AnimatedButton>
            </motion.div>
          </form>

          {/* Footer links */}
          <motion.div
            className="mt-6 text-center space-y-2"
            variants={prefersReducedMotion ? undefined : { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.5 } } }}
            initial="hidden"
            animate="visible"
          >
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors
                           focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
              >
                Sign in
              </Link>
            </p>
            <Link
              to="/"
              className="inline-block text-xs text-slate-400 hover:text-slate-600 transition-colors"
            >
              ← Back to Home
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Ripple animation keyframes */}
      <style>{`
        @keyframes ripple {
          0% { transform: scale(0); opacity: 0.5; }
          100% { transform: scale(20); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
