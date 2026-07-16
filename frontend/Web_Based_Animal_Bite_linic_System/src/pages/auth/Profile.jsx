import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { authAPI } from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import Loader from '../../components/common/Loader';
import { User, Mail, Shield, Calendar, Save, Lock } from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    contact_number: '',
    address: '',
    sex: '',
    date_of_birth: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await authAPI.getPatientProfile();
      setProfile(res.data);
      setFormData({
        first_name: res.data.first_name || '',
        last_name: res.data.last_name || '',
        email: res.data.email || '',
        contact_number: res.data.contact_number || res.data.phone || '',
        address: res.data.address || '',
        sex: res.data.sex || res.data.gender || '',
        date_of_birth: res.data.date_of_birth || res.data.birth_date || '',
        emergency_contact_name: res.data.emergency_contact_name || '',
        emergency_contact_phone: res.data.emergency_contact_phone || '',
        emergency_contact_relation: res.data.emergency_contact_relation || '',
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await authAPI.updatePatientProfile(formData);
      setSuccess('Profile updated successfully!');
      if (formData.first_name) {
        updateUser({ ...user, first_name: formData.first_name, last_name: formData.last_name });
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading profile..." />;

  return (
    <motion.div
      className="form-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card">
        <div className="flex items-center gap-4 p-6 pb-4 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white">
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user?.first_name} {user?.last_name}</h2>
            <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              {user?.email}
            </p>
          </div>
          <div className="ml-auto">
            <span className="badge badge-lg capitalize">{user?.profile?.role || 'User'}</span>
          </div>
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}
        {success && (
          <div className="mx-6 mt-4 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-sm text-emerald-700 font-medium">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>
          <p className="form-section-title" style={{ padding: 0 }}>Personal Information</p>
          <div className="form-row">
            <div className="form-group">
              <label>First Name</label>
              <input name="first_name" value={formData.first_name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input name="last_name" value={formData.last_name} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Email</label>
              <input name="email" value={formData.email} onChange={handleChange} type="email" />
            </div>
            <div className="form-group">
              <label>Contact Number</label>
              <input name="contact_number" value={formData.contact_number} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Sex</label>
              <select name="sex" value={formData.sex} onChange={handleChange}>
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label>Address</label>
            <textarea name="address" value={formData.address} onChange={handleChange} rows={2} />
          </div>

          <p className="form-section-title" style={{ padding: 0 }}>Emergency Contact</p>
          <div className="form-row">
            <div className="form-group">
              <label>Contact Name</label>
              <input name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Contact Phone</label>
              <input name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Relation</label>
              <input name="emergency_contact_relation" value={formData.emergency_contact_relation} onChange={handleChange} />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2"><span className="spinner" /> Saving...</span>
              ) : (
                <><Save className="w-4 h-4" /> Update Profile</>
              )}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
