import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { userAPI } from '../../api/axios';
import { useNetworkStatus } from '../../contexts/NetworkContext';
import { showSuccess, showError } from '../../hooks/useToast';
import { Save, X, UserPlus, Shield } from 'lucide-react';

export default function UserCreate() {
  const navigate = useNavigate();
  const { isOnline } = useNetworkStatus();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [fieldsVisited, setFieldsVisited] = useState({});

  const [formData, setFormData] = useState({
    username: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'staff',
    password: '',
    confirm_password: '',
    is_active: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) {
      setErrors((prev) => { const next = { ...prev }; delete next[name]; return next; });
    }
  };

  const handleBlur = (field) => {
    setFieldsVisited((prev) => ({ ...prev, [field]: true }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.first_name.trim()) errs.first_name = 'First name is required.';
    if (!formData.last_name.trim()) errs.last_name = 'Last name is required.';
    if (!formData.username.trim()) errs.username = 'Username is required.';
    else if (formData.username.length < 3) errs.username = 'Username must be at least 3 characters.';
    if (!formData.email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errs.email = 'Invalid email format.';
    if (!formData.role) errs.role = 'Role is required.';
    if (!formData.password) errs.password = 'Password is required.';
    else if (formData.password.length < 8) errs.password = 'Password must be at least 8 characters.';
    if (formData.password !== formData.confirm_password) errs.confirm_password = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isOnline) {
      showError('No internet connection. Please reconnect and try again.');
      return;
    }

    const validationErrors = validate();
    setErrors(validationErrors);
    setFieldsVisited({ first_name: true, last_name: true, username: true, email: true, role: true, password: true, confirm_password: true });

    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);
    try {
      await userAPI.create({
        username: formData.username.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim().toLowerCase(),
        profile: {
          role: formData.role,
          phone: formData.phone,
        },
        password: formData.password,
        confirm_password: formData.confirm_password,
        is_active: formData.is_active,
      });
      showSuccess('User created successfully!');
      navigate('/users');
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const fieldErrors = {};
        Object.entries(data).forEach(([key, msgs]) => {
          if (key === 'profile') {
            if (typeof msgs === 'object') {
              Object.entries(msgs).forEach(([subKey, subMsgs]) => {
                fieldErrors[subKey] = Array.isArray(subMsgs) ? subMsgs.join(', ') : subMsgs;
              });
            }
          } else {
            fieldErrors[key] = Array.isArray(msgs) ? msgs.join(', ') : msgs;
          }
        });
        setErrors(fieldErrors);
        showError('Failed to create user. Please check the form.');
      } else {
        setErrors({ server: 'Failed to create user. Please try again.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-2.5 rounded-xl border ${errors[field] ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'} text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 disabled:opacity-50`;

  const roleOptions = [
    { value: 'admin', label: 'Administrator' },
    { value: 'doctor', label: 'Doctor' },
    { value: 'veterinarian', label: 'Veterinarian' },
    { value: 'nurse', label: 'Nurse' },
    { value: 'staff', label: 'Staff' },
    { value: 'patient', label: 'Patient' },
  ];

  return (
    <motion.div
      className="form-page max-w-2xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Create User</h2>
              <p className="text-blue-100 text-xs mt-0.5">Add a new user to the system</p>
            </div>
          </div>
        </div>

        {/* Server error */}
        {errors.server && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm font-medium text-red-800">{errors.server}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Personal Information */}
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Personal Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">First Name *</label>
                <input name="first_name" value={formData.first_name} onChange={handleChange} onBlur={() => handleBlur('first_name')} className={inputClass('first_name')} placeholder="Juan" />
                {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Last Name *</label>
                <input name="last_name" value={formData.last_name} onChange={handleChange} onBlur={() => handleBlur('last_name')} className={inputClass('last_name')} placeholder="Dela Cruz" />
                {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Account Information</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Username *</label>
                <input name="username" value={formData.username} onChange={handleChange} onBlur={() => handleBlur('username')} className={inputClass('username')} placeholder="juan.delacruz" />
                {errors.username && <p className="text-xs text-red-500 mt-1">{errors.username}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Email *</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} onBlur={() => handleBlur('email')} className={inputClass('email')} placeholder="juan@clinic.com" />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
            </div>
          </div>

          {/* Role & Contact */}
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Role &amp; Contact</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Role *</label>
                <select name="role" value={formData.role} onChange={handleChange} className={inputClass('role')}>
                  {roleOptions.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Contact Number</label>
                <input name="phone" value={formData.phone} onChange={handleChange} className={inputClass('phone')} placeholder="+63 912 345 6789" />
              </div>
            </div>
          </div>

          {/* Password */}
          <div>
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-3">Password</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Temporary Password *</label>
                <input name="password" type="password" value={formData.password} onChange={handleChange} onBlur={() => handleBlur('password')} className={inputClass('password')} placeholder="Min. 8 characters" />
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm Password *</label>
                <input name="confirm_password" type="password" value={formData.confirm_password} onChange={handleChange} onBlur={() => handleBlur('confirm_password')} className={inputClass('confirm_password')} />
                {errors.confirm_password && <p className="text-xs text-red-500 mt-1">{errors.confirm_password}</p>}
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              <div>
                <span className="text-sm font-semibold text-slate-700">Active</span>
                <p className="text-xs text-slate-400">User can log in immediately after creation</p>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</>
              ) : (
                <><UserPlus className="w-4 h-4" /> Create User</>
              )}
            </button>
            <button type="button" onClick={() => navigate('/users')} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all">
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
