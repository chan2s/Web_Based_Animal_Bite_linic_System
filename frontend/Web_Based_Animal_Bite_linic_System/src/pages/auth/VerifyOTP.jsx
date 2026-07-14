import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { showSuccess, showError } from '../../hooks/useToast';
import { motion } from 'framer-motion';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(300);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Load email from session storage
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('pending_verification_email');
    const storedName = sessionStorage.getItem('pending_verification_name');
    const expiresAt = sessionStorage.getItem('otp_expires_at');

    if (!storedEmail || !storedName) {
      navigate('/register', { replace: true });
      return;
    }

    setEmail(storedEmail);
    setFirstName(storedName);

    if (expiresAt) {
      const remaining = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setCountdown(remaining);
    }
  }, [navigate]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setError('OTP has expired. Please request a new one.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (value && index === 5 && newOtp.every((d) => d !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    if (!/^\d{6}$/.test(pastedData)) return;

    const digits = pastedData.split('');
    setOtp(digits);
    setError('');
    inputRefs.current[5]?.focus();
    handleVerify(pastedData);
  };

  const handleVerify = async (otpCode) => {
    const code = otpCode || otp.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const response = await authAPI.verifyOtp({ email, otp: code });
      const { token, user: userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      sessionStorage.removeItem('pending_verification_email');
      sessionStorage.removeItem('pending_verification_name');
      sessionStorage.removeItem('otp_expires_at');

      setSuccess('Account verified successfully!');
      showSuccess('Account created! Welcome to the clinic.');

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } catch (err) {
      const data = err.response?.data;
      const errMsg = data?.error || 'Verification failed. Please try again.';
      setError(errMsg);
      showError(errMsg);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || loading) return;

    setLoading(true);
    setError('');

    try {
      await authAPI.resendOtp({ email });
      setOtp(['', '', '', '', '', '']);
      setCountdown(300);
      setResendCooldown(60);
      setCanResend(false);
      sessionStorage.setItem('otp_expires_at', new Date(Date.now() + 5 * 60 * 1000).toISOString());
      inputRefs.current[0]?.focus();
      showSuccess('New verification code sent!');
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to resend OTP.';
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!email) return null;

  return (
    <div className="auth-page">
      <div className="auth-bg-pattern" />
      <motion.div
        className="auth-container"
        style={{ maxWidth: 460 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-card">
          <div className="auth-header">
            <motion.div
              className="auth-logo"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
            >
              📧
            </motion.div>
            <h1>Verify Your Email</h1>
            <p>
              We've sent a 6-digit code to<br />
              <strong style={{ color: 'var(--primary)' }}>{email}</strong>
            </p>
          </div>

          <form
            onSubmit={(e) => { e.preventDefault(); handleVerify(); }}
            className="auth-form"
          >
            {error && (
              <motion.div
                className="error-message"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ gap: 8, whiteSpace: 'pre-line' }}
              >
                <span>⚠️</span>
                <span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div
                className="alert alert-success"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                ✅ {success}
              </motion.div>
            )}

            {/* Progress indicator */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <span style={{ width: 32, height: 4, borderRadius: 2, background: 'var(--primary)' }}></span>
              <span style={{ width: 32, height: 4, borderRadius: 2, background: 'var(--primary)' }}></span>
            </div>
            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
              Step 2: Verify Email
            </p>

            {/* OTP Input */}
            <div style={{ textAlign: 'center' }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: 12 }}>
                Enter Verification Code
              </label>
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  justifyContent: 'center',
                }}
              >
                {otp.map((digit, index) => (
                  <motion.input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    disabled={verifying || success}
                    autoFocus={index === 0}
                    whileFocus={{ scale: 1.05 }}
                    style={{
                      width: 52,
                      height: 60,
                      textAlign: 'center',
                      fontSize: 24,
                      fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      border: `2px solid ${digit ? 'var(--primary)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius)',
                      background: digit ? 'var(--primary-light)' : 'var(--bg-input)',
                      color: 'var(--text)',
                      outline: 'none',
                      transition: 'all 0.15s ease',
                      caretColor: 'var(--primary)',
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'var(--border-focus)';
                      e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)';
                    }}
                    onBlur={(e) => {
                      if (!digit) {
                        e.target.style.borderColor = 'var(--border)';
                        e.target.style.boxShadow = 'none';
                      }
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Timer */}
            <div style={{ textAlign: 'center' }}>
              {countdown > 0 ? (
                <p style={{ fontSize: 13, color: countdown <= 60 ? 'var(--danger)' : 'var(--text-muted)' }}>
                  ⏰ Code expires in{' '}
                  <strong style={{ fontFamily: 'var(--font-mono)', fontSize: 16 }}>
                    {formatTime(countdown)}
                  </strong>
                </p>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--danger)' }}>
                  ⏰ Code has expired. Request a new one below.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary auth-btn"
              disabled={verifying || success || countdown <= 0}
            >
              {verifying ? (
                <span className="btn-loading"><span className="spinner"></span> Verifying...</span>
              ) : (
                'Verify My Account'
              )}
            </button>

            {/* Resend */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!canResend || loading || verifying || success}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: canResend ? 'var(--primary)' : 'var(--text-muted)',
                    fontWeight: 700,
                    cursor: canResend ? 'pointer' : 'not-allowed',
                    fontSize: 13,
                    padding: 0,
                    fontFamily: 'var(--font-sans)',
                    transition: 'color 0.15s',
                  }}
                >
                  {loading ? 'Sending...' : canResend ? 'Resend Code' : `Resend in ${resendCooldown}s`}
                </button>
              </p>
            </div>

            {/* Change email */}
            <div style={{ textAlign: 'center' }}>
              <Link
                to="/register"
                style={{ fontSize: 13, color: 'var(--text-muted)' }}
                onClick={() => {
                  sessionStorage.removeItem('pending_verification_email');
                  sessionStorage.removeItem('pending_verification_name');
                  sessionStorage.removeItem('otp_expires_at');
                }}
              >
                ← Use a different email
              </Link>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
