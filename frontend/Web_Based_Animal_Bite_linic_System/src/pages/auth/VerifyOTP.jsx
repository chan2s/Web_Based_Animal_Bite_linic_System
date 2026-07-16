import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Cross, Mail, ArrowLeft } from 'lucide-react';
import { authAPI } from '../../api/axios';
import { showSuccess, showError } from '../../hooks/useToast';
import BackgroundEffects from '../../components/auth/BackgroundEffects';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const inputRefs = useRef([]);

  const email = sessionStorage.getItem('pending_verification_email');
  const name = sessionStorage.getItem('pending_verification_name');

  useEffect(() => {
    if (!email) {
      navigate('/register', { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    pasted.split('').forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authAPI.verifyOTP({ email, otp: code });
      sessionStorage.removeItem('pending_verification_email');
      sessionStorage.removeItem('pending_verification_name');
      sessionStorage.removeItem('otp_expires_at');
      showSuccess('Email verified! You can now sign in.');
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid or expired verification code.');
      showError('Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!email) return null;

  return (
    <div className="relative min-h-screen flex bg-white overflow-hidden">
      {/* Left Section */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center">
        <BackgroundEffects />
        <div className="relative z-10 text-center">
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto shadow-lg">
              <Mail className="w-10 h-10 text-white" />
            </div>
          </motion.div>
          <motion.h2
            className="text-2xl font-bold text-slate-800 mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Check Your Email
          </motion.h2>
          <motion.p
            className="text-sm text-slate-500 max-w-xs mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            We sent a verification code to <strong className="text-slate-700">{email}</strong>
          </motion.p>
        </div>
      </div>

      {/* Right Section */}
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
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
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
              Verify your email
            </h1>
            <p className="text-sm text-slate-500">
              Enter the 6-digit code sent to <strong className="text-slate-700">{email}</strong>
            </p>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200"
              >
                <p className="text-sm font-medium text-red-800">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* OTP Form */}
          <form onSubmit={handleSubmit}>
            <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-lg font-bold rounded-xl border-2 border-slate-200
                    focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all
                    bg-white"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <motion.button
              type="submit"
              disabled={loading || otp.join('').length !== 6}
              className="w-full py-3 px-5 rounded-xl font-semibold text-sm bg-blue-600 text-white
                hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                shadow-sm hover:shadow-md"
              whileHover={{ y: -1 }}
              whileTap={{ y: 0 }}
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </motion.button>
          </form>

          {/* Timer */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <p className="text-xs text-slate-400">
              Code expires in <span className={`font-semibold ${timeLeft < 60 ? 'text-red-500' : 'text-slate-600'}`}>
                {formatTime(timeLeft)}
              </span>
            </p>
          </motion.div>

          {/* Footer */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center justify-center gap-1 mx-auto"
            >
              <ArrowLeft className="w-3 h-3" />
              Back to Registration
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
