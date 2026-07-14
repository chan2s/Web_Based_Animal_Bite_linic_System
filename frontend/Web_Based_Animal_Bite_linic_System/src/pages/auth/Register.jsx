import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../api/axios';
import { showSuccess, showError } from '../../hooks/useToast';
import { motion } from 'framer-motion';

export default function Register() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  return (
    <div className="auth-page">
      <div className="auth-bg-pattern" />
      <motion.div
        className="auth-container"
        style={{ maxWidth: 480 }}
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
              📝
            </motion.div>
            <h1>Create Your Account</h1>
            <p>Step 1 of 2 — Enter your details to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <motion.div
                className="error-message"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{ gap: 8, whiteSpace: 'pre-line' }}
              >
                <span>⚠️</span>
                <span>{error}</span>
              </motion.div>
            )}

            {/* Progress indicator */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <span style={{ width: 32, height: 4, borderRadius: 2, background: 'var(--primary)' }}></span>
              <span style={{ width: 32, height: 4, borderRadius: 2, background: 'var(--border)' }}></span>
            </div>
            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
              Step 1: Personal Details
            </p>

            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="First name"
                    autoFocus
                    required
                    disabled={loading}
                    style={{ paddingLeft: 40 }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <div className="input-wrapper">
                  <span className="input-icon">👤</span>
                  <input
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Last name"
                    required
                    disabled={loading}
                    style={{ paddingLeft: 40 }}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Email Address (used for login) *</label>
              <div className="input-wrapper">
                <span className="input-icon">📧</span>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  autoComplete="email"
                  required
                  disabled={loading}
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password *</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    disabled={loading}
                    style={{ paddingLeft: 40 }}
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Confirm Password *</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    name="confirm_password"
                    type={showConfirm ? 'text' : 'password'}
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    disabled={loading}
                    style={{ paddingLeft: 40 }}
                  />
                  <button type="button" className="password-toggle" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
                    {showConfirm ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary auth-btn" disabled={loading}>
              {loading ? (
                <span className="btn-loading"><span className="spinner"></span> Sending OTP...</span>
              ) : (
                '📧 Send Verification Code'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" style={{ fontWeight: 700 }}>Sign in</Link>
            </p>
            <p style={{ marginTop: 4 }}>
              <Link to="/" style={{ color: '#94a3b8', fontSize: 12 }}>
                ← Back to Home
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
