import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import InputField from './InputField';
import AnimatedButton from './AnimatedButton';
import SocialLogin from './SocialLogin';

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.25 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

export default function LoginForm({
  email,
  password,
  errors,
  fieldsVisited,
  loading,
  isSuccess,
  prefersReducedMotion,
  onEmailChange,
  onPasswordChange,
  onEmailBlur,
  onPasswordBlur,
  onSubmit,
  onDismissError,
  showInfo,
}) {
  const variants = prefersReducedMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : { hidden: { opacity: 0 }, visible: { opacity: 1 } };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="w-full max-w-[400px] mx-auto"
    >
      {/* Server error */}
      <AnimatePresence>
        {errors.server && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="mb-5"
          >
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200" role="alert">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-800">{errors.server}</p>
              </div>
              <button
                type="button"
                onClick={onDismissError}
                className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                aria-label="Dismiss error"
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {/* Email field */}
        <motion.div variants={prefersReducedMotion ? undefined : fadeUp}>
          <InputField
            id="email"
            label="Email Address"
            type="email"
            value={email}
            onChange={onEmailChange}
            onBlur={onEmailBlur}
            error={fieldsVisited.email ? errors.email : ''}
            success={fieldsVisited.email && !errors.email && email.length > 0}
            disabled={loading || isSuccess}
            icon="mail"
            autoComplete="email"
            autoFocus
            placeholder="you@example.com"
          />
        </motion.div>

        {/* Password field */}
        <motion.div variants={prefersReducedMotion ? undefined : fadeUp}>
          <InputField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={onPasswordChange}
            onBlur={onPasswordBlur}
            error={fieldsVisited.password ? errors.password : ''}
            success={fieldsVisited.password && !errors.password && password.length > 0}
            disabled={loading || isSuccess}
            icon="lock"
            autoComplete="current-password"
          />
        </motion.div>

        {/* Forgot password */}
        <motion.div
          className="flex justify-end"
          variants={prefersReducedMotion ? undefined : fadeUp}
        >
          <button
            type="button"
            onClick={() => showInfo('Password reset feature coming soon')}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded px-1"
          >
            Forgot password?
          </button>
        </motion.div>

        {/* Submit button */}
        <motion.div variants={prefersReducedMotion ? undefined : fadeUp}>
          <AnimatedButton loading={loading} success={isSuccess} disabled={loading || isSuccess}>
            <span>Sign In</span>
          </AnimatedButton>
        </motion.div>
      </form>

      {/* Divider */}
      <motion.div
        className="flex items-center gap-3 my-5"
        variants={prefersReducedMotion ? undefined : fadeUp}
      >
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-xs text-slate-400 font-medium">OR</span>
        <div className="flex-1 h-px bg-slate-200" />
      </motion.div>

      {/* Google sign-in */}
      <motion.div variants={prefersReducedMotion ? undefined : fadeUp}>
        <SocialLogin />
      </motion.div>

      {/* Footer links */}
      <motion.div
        className="mt-6 text-center space-y-2"
        variants={prefersReducedMotion ? undefined : { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.5 } } }}
      >
        <p className="text-xs text-slate-500">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:text-blue-700 transition-colors
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
          >
            Create account
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
  );
}
