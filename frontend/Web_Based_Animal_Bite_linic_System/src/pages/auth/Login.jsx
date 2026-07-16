import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Cross } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { showSuccess, showError, showInfo } from '../../hooks/useToast';

import BackgroundEffects from '../../components/auth/BackgroundEffects';
import PhoneMockup from '../../components/auth/PhoneMockup';
import LoginForm from '../../components/auth/LoginForm';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [showSuccessView, setShowSuccessView] = useState(false);
  const [fieldsVisited, setFieldsVisited] = useState({});
  const { login, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const redirectTimeoutRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
    };
  }, []);

  if (isAuthenticated) return null;

  // Validation
  const validateEmail = useCallback((val) => {
    if (!val.trim()) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Please enter a valid email';
    return '';
  }, []);

  const validatePassword = useCallback((val) => {
    if (!val) return 'Password is required';
    if (val.length < 6) return 'Password must be at least 6 characters';
    return '';
  }, []);

  // Handle field changes
  const handleEmailChange = useCallback((e) => {
    const val = e.target.value;
    setEmail(val);
    if (fieldsVisited.email) {
      setErrors((prev) => ({ ...prev, email: validateEmail(val) }));
    }
  }, [fieldsVisited.email, validateEmail]);

  const handlePasswordChange = useCallback((e) => {
    const val = e.target.value;
    setPassword(val);
    if (fieldsVisited.password) {
      setErrors((prev) => ({ ...prev, password: validatePassword(val) }));
    }
  }, [fieldsVisited.password, validatePassword]);

  const handleEmailBlur = useCallback(() => {
    setFieldsVisited((prev) => ({ ...prev, email: true }));
    setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
  }, [email, validateEmail]);

  const handlePasswordBlur = useCallback(() => {
    setFieldsVisited((prev) => ({ ...prev, password: true }));
    setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
  }, [password, validatePassword]);

  const handleDismissError = useCallback(() => {
    setErrors((prev) => ({ ...prev, server: '' }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const emailError = validateEmail(email);
      const passwordError = validatePassword(password);

      setErrors({ email: emailError, password: passwordError });
      setFieldsVisited({ email: true, password: true });

      if (emailError || passwordError) return;

      const result = await login(email, password);

      if (result.success) {
        setIsSuccess(true);
        showSuccess('Welcome back! Redirecting to dashboard...');

        // Brief pause to show button checkmark, then transition to success view
        setTimeout(() => setShowSuccessView(true), 600);
        redirectTimeoutRef.current = setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 2000);
      } else {
        setErrors((prev) => ({
          ...prev,
          server: result.error || 'Invalid credentials. Please try again.',
        }));
        showError(result.error || 'Login failed. Please try again.');
      }
    },
    [email, password, login, navigate, validateEmail, validatePassword]
  );

  return (
    <div className="relative min-h-screen flex bg-white overflow-hidden">
      {/* ====== LEFT SECTION - Phone Mockup (hidden on mobile) ====== */}
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

          {/* Phone */}
          <PhoneMockup />

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

      {/* ====== RIGHT SECTION - Login Form ====== */}
      <div className="flex-1 flex items-center justify-center px-6 py-8 lg:px-12">
        <AnimatePresence mode="wait">
          {!showSuccessView ? (
            <motion.div
              key="login-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
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
                  Welcome back
                </h1>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Sign in to access your Animal Bite Clinic account and manage your clinic operations.
                </p>
              </motion.div>

              {/* Login Form */}
              <LoginForm
                email={email}
                password={password}
                errors={errors}
                fieldsVisited={fieldsVisited}
                loading={loading}
                isSuccess={isSuccess}
                prefersReducedMotion={prefersReducedMotion}
                onEmailChange={handleEmailChange}
                onPasswordChange={handlePasswordChange}
                onEmailBlur={handleEmailBlur}
                onPasswordBlur={handlePasswordBlur}
                onSubmit={handleSubmit}
                onDismissError={handleDismissError}
                showInfo={showInfo}
              />
            </motion.div>
          ) : (
            /* Success View */
            <motion.div
              key="success"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-[420px] text-center"
            >
              <motion.div
                className="py-12 flex flex-col items-center gap-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.15 }}
              >
                <motion.div
                  className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center"
                  initial={prefersReducedMotion ? { scale: 1 } : { scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.1 }}
                >
                  <motion.svg
                    className="w-8 h-8 text-emerald-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.4, ease: 'easeOut', delay: 0.3 }}
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </motion.svg>
                </motion.div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-0.5">Welcome Back!</h2>
                  <p className="text-sm text-slate-500">Redirecting to your dashboard...</p>
                </div>

                {!prefersReducedMotion && (
                  <motion.div className="flex gap-1.5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-blue-400"
                        animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
                      />
                    ))}
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
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
