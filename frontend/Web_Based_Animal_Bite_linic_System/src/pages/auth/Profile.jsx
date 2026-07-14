import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../api/axios';
import usePatientProfile from '../../hooks/usePatientProfile';
import Loader from '../../components/common/Loader';

export default function Profile() {
  const { user, updateUser, loading: authLoading } = useAuth();
  const isPatient = user?.profile?.role === 'patient';
  const { profile: patientProfile, loading: profileLoading, fetchProfile } = usePatientProfile(isPatient);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Use patient profile data if available, otherwise fall back to auth user.
  // Backend now returns flattened profile: { id, first_name, last_name, email, contact_number, address, date_of_birth, sex, emergency_contact_*, blood_type, profile_completed }
  const displayProfile = isPatient && patientProfile ? patientProfile : user;
  const profCompleted = isPatient ? patientProfile?.profile_completed === true : true;

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
    blood_type: '',
  });

  // Sync form data when profile loads
  useEffect(() => {
    if (isPatient && patientProfile) {
      const p = patientProfile;
      setFormData({
        first_name: p.first_name || '',
        last_name: p.last_name || '',
        email: p.email || '',
        contact_number: p.contact_number || '',
        address: p.address || '',
        sex: p.sex || '',
        date_of_birth: p.date_of_birth || '',
        emergency_contact_name: p.emergency_contact_name || '',
        emergency_contact_phone: p.emergency_contact_phone || '',
        emergency_contact_relation: p.emergency_contact_relation || '',
        blood_type: p.blood_type || '',
      });
    } else if (!isPatient && user) {
      const prof = user.profile || {};
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        contact_number: prof.phone || '',
        address: prof.address || '',
        sex: prof.gender || '',
        date_of_birth: prof.birth_date || '',
        emergency_contact_name: prof.emergency_contact_name || '',
        emergency_contact_phone: prof.emergency_contact_phone || '',
        emergency_contact_relation: prof.emergency_contact_relation || '',
        blood_type: prof.blood_type || '',
      });
    }
  }, [isPatient, patientProfile, user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      if (isPatient) {
        // Use patient-specific endpoint with new flattened field names
        const payload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          contact_number: formData.contact_number,
          address: formData.address,
          sex: formData.sex || '',
          date_of_birth: formData.date_of_birth || null,
          emergency_contact_name: formData.emergency_contact_name,
          emergency_contact_phone: formData.emergency_contact_phone,
          emergency_contact_relation: formData.emergency_contact_relation,
          blood_type: formData.blood_type || '',
        };
        await authAPI.updatePatientProfile(payload);
        await fetchProfile(); // Refresh patient profile
      } else {
        // Use general profile endpoint
        const payload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          profile: {
            phone: formData.contact_number,
            address: formData.address,
            gender: formData.sex || null,
            birth_date: formData.date_of_birth || null,
            emergency_contact_name: formData.emergency_contact_name,
            emergency_contact_phone: formData.emergency_contact_phone,
            emergency_contact_relation: formData.emergency_contact_relation,
            blood_type: formData.blood_type || 'unknown',
          },
        };
        const response = await authAPI.updateProfile(payload);
        updateUser(response.data);
      }
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      const data = error.response?.data;
      if (data) {
        const msgs = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join('\n');
        setMessage({ type: 'error', text: msgs });
      } else {
        setMessage({ type: 'error', text: 'Failed to update profile.' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangingPassword(true);
    setMessage({ type: '', text: '' });
    try {
      await authAPI.changePassword(passwords);
      setMessage({ type: 'success', text: 'Password changed! Please login again.' });
      setShowChangePassword(false);
      setPasswords({ old_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      const data = error.response?.data;
      const errorMsg = data?.old_password?.[0] || data?.new_password?.[0] || data?.error || 'Failed to change password.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setChangingPassword(false);
    }
  };

  if (!user) return null;
  if (isPatient && profileLoading) return <Loader text="Loading profile..." />;

  return (
    <div className="profile-page">
      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.type === 'success' ? '✅' : '⚠️'} {message.text}
        </div>
      )}

      {/* Profile completion status */}
      {isPatient && !profCompleted && (
        <div
          style={{
            background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
            border: '1px solid #fed7aa',
            borderRadius: 12,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontSize: 14,
          }}
        >
          <span style={{ fontSize: 20 }}>⚠️</span>
          <span style={{ color: '#9a3412' }}>
            Your profile is <strong>incomplete</strong>. Please fill in all required fields to enable faster appointment bookings and form pre-filling.
          </span>
        </div>
      )}

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-large">
            {displayProfile?.first_name?.[0] || displayProfile?.username?.[0]?.toUpperCase()}
          </div>
          <div className="profile-header-info">
            <h2>{displayProfile?.first_name || displayProfile?.username}</h2>
            <span className="profile-role">{displayProfile?.profile?.role || 'User'}</span>
            <p className="profile-username">@{displayProfile?.username}</p>
            {isPatient && (
              <span className={`badge ${profCompleted ? 'badge-success' : 'badge-warning'}`} style={{ marginTop: 4 }}>
                {profCompleted ? '✅ Profile Complete' : '⚠️ Incomplete'}
              </span>
            )}
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-row">
            <span className="detail-label">First Name</span>
            <span className="detail-value">{displayProfile?.first_name || 'Not set'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Last Name</span>
            <span className="detail-value">{displayProfile?.last_name || 'Not set'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Email</span>
            <span className="detail-value">{displayProfile?.email || 'Not set'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Contact Number</span>
            <span className="detail-value">
              {isPatient && patientProfile
                ? (patientProfile.contact_number || 'Not set')
                : (displayProfile?.profile?.phone || 'Not set')}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Sex</span>
            <span className="detail-value">
              {isPatient && patientProfile
                ? (patientProfile.sex || 'Not set')
                : (displayProfile?.profile?.gender || 'Not set')}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Date of Birth</span>
            <span className="detail-value">
              {isPatient && patientProfile
                ? (patientProfile.date_of_birth
                    ? new Date(patientProfile.date_of_birth + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                    : 'Not set')
                : (displayProfile?.profile?.birth_date
                    ? new Date(displayProfile.profile.birth_date + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                    : 'Not set')}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Address</span>
            <span className="detail-value">
              {isPatient && patientProfile
                ? (patientProfile.address || 'Not set')
                : (displayProfile?.profile?.address || 'Not set')}
            </span>
          </div>
          {isPatient && (
            <>
              <div className="detail-row">
                <span className="detail-label">Emergency Contact</span>
                <span className="detail-value">
                  {patientProfile?.emergency_contact_name
                    ? `${patientProfile.emergency_contact_name} (${patientProfile.emergency_contact_phone || 'No phone'})${patientProfile.emergency_contact_relation ? ` - ${patientProfile.emergency_contact_relation}` : ''}`
                    : 'Not set'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Blood Type</span>
                <span className="detail-value">{patientProfile?.blood_type || 'Not set'}</span>
              </div>
            </>
          )}
          <div className="detail-row">
            <span className="detail-label">Member Since</span>
            <span className="detail-value">
              {displayProfile?.date_joined
                ? new Date(displayProfile.date_joined).toLocaleDateString()
                : '—'}
            </span>
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn-primary" onClick={() => setIsEditing(!isEditing)}>
            ✏️ {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
          <button className="btn-secondary" onClick={() => setShowChangePassword(!showChangePassword)}>
            🔑 Change Password
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="edit-profile-card card">
          <h3>Edit Profile</h3>
          {isPatient && !profCompleted && (
            <div style={{ background: '#eef2ff', borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#4338ca' }}>
              💡 Fields marked with <span style={{ color: '#dc2626' }}>*</span> are required for profile completion.
            </div>
          )}
          <form onSubmit={handleSaveProfile}>
            <h4 style={{ fontSize: 14, fontWeight: 600, color: '#4f46e5', marginBottom: 12, marginTop: 8 }}>
              Personal Information
            </h4>
            <div className="form-row">
              <div className="form-group">
                <label>First Name {isPatient && <span style={{ color: '#dc2626' }}>*</span>}</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required={isPatient}
                />
              </div>
              <div className="form-group">
                <label>Last Name {isPatient && <span style={{ color: '#dc2626' }}>*</span>}</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required={isPatient}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Contact Number {isPatient && <span style={{ color: '#dc2626' }}>*</span>}</label>
                <input
                  type="text"
                  value={formData.contact_number}
                  onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
                  required={isPatient}
                  placeholder="Contact number"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Sex {isPatient && <span style={{ color: '#dc2626' }}>*</span>}</label>
                <select
                  value={formData.sex}
                  onChange={(e) => setFormData({ ...formData, sex: e.target.value })}
                  required={isPatient}
                >
                  <option value="">Select Sex</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Date of Birth {isPatient && <span style={{ color: '#dc2626' }}>*</span>}</label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  required={isPatient}
                />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Address {isPatient && <span style={{ color: '#dc2626' }}>*</span>}</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                placeholder="Complete address"
                required={isPatient}
              />
            </div>

            {isPatient && (
              <>
                <h4 style={{ fontSize: 14, fontWeight: 600, color: '#4f46e5', marginBottom: 12, marginTop: 8 }}>
                  Emergency Contact
                </h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Contact Name <span style={{ color: '#dc2626' }}>*</span></label>
                    <input
                      type="text"
                      value={formData.emergency_contact_name}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                      placeholder="Full name"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Contact Phone <span style={{ color: '#dc2626' }}>*</span></label>
                    <input
                      type="text"
                      value={formData.emergency_contact_phone}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                      placeholder="Phone number"
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Relation</label>
                    <input
                      type="text"
                      value={formData.emergency_contact_relation}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_relation: e.target.value })}
                      placeholder="e.g., Spouse, Parent, Sibling"
                    />
                  </div>
                  <div className="form-group">
                    <label>Blood Type</label>
                    <select
                      value={formData.blood_type}
                      onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                    >
                      <option value="">Select Blood Type</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="unknown">Unknown</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? (
                  <span className="btn-loading"><span className="spinner"></span> Saving...</span>
                ) : 'Save Changes'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showChangePassword && (
        <div className="change-password-card card">
          <h3>Change Password</h3>
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={passwords.old_password}
                onChange={(e) => setPasswords({ ...passwords, old_password: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={passwords.new_password}
                onChange={(e) => setPasswords({ ...passwords, new_password: e.target.value })}
                required
                minLength={8}
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={passwords.confirm_password}
                onChange={(e) => setPasswords({ ...passwords, confirm_password: e.target.value })}
                required
                minLength={8}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={changingPassword}>
                {changingPassword ? 'Changing...' : 'Change Password'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShowChangePassword(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
