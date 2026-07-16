import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { patientAPI } from '../../api/axios';
import Loader from '../../components/common/Loader';
import { Save, X } from 'lucide-react';

export default function PatientForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    first_name: '', middle_name: '', last_name: '', suffix: '',
    date_of_birth: '', gender: 'male', blood_type: 'unknown',
    phone: '', email: '', address: '', barangay: '', municipality: '', province: '',
    emergency_contact_name: '', emergency_contact_phone: '', emergency_contact_relation: '',
    allergies: '', medical_conditions: '', current_medications: '', tetanus_vaccination_history: '',
  });

  useEffect(() => {
    if (isEditing) fetchPatient();
  }, [id]);

  const fetchPatient = async () => {
    try {
      const response = await patientAPI.get(id);
      const p = response.data;
      setFormData({
        first_name: p.first_name || '', middle_name: p.middle_name || '', last_name: p.last_name || '', suffix: p.suffix || '',
        date_of_birth: p.date_of_birth || '', gender: p.gender || 'male', blood_type: p.blood_type || 'unknown',
        phone: p.phone || '', email: p.email || '', address: p.address || '', barangay: p.barangay || '', municipality: p.municipality || '', province: p.province || '',
        emergency_contact_name: p.emergency_contact_name || '', emergency_contact_phone: p.emergency_contact_phone || '', emergency_contact_relation: p.emergency_contact_relation || '',
        allergies: p.allergies || '', medical_conditions: p.medical_conditions || '', current_medications: p.current_medications || '', tetanus_vaccination_history: p.tetanus_vaccination_history || '',
      });
    } catch (err) {
      setError('Failed to load patient data');
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
    try {
      if (isEditing) {
        await patientAPI.update(id, formData);
      } else {
        await patientAPI.create(formData);
      }
      navigate('/patients');
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const messages = Object.entries(data).map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`).join('\n');
        setError(messages);
      } else {
        setError('Failed to save patient. Please check all fields.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading patient data..." />;

  return (
    <motion.div
      className="form-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card">
        <h2>{isEditing ? 'Edit Patient' : 'Register New Patient'}</h2>
        {error && <div className="error-message">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <p className="form-section-title">Personal Information</p>
          <div className="form-row">
            <div className="form-group">
              <label>First Name *</label>
              <input name="first_name" value={formData.first_name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Middle Name</label>
              <input name="middle_name" value={formData.middle_name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input name="last_name" value={formData.last_name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Suffix</label>
              <select name="suffix" value={formData.suffix} onChange={handleChange}>
                <option value="">None</option>
                <option value="Jr.">Jr.</option>
                <option value="Sr.">Sr.</option>
                <option value="III">III</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date of Birth *</label>
              <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Gender *</label>
              <select name="gender" value={formData.gender} onChange={handleChange} required>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Blood Type</label>
              <select name="blood_type" value={formData.blood_type} onChange={handleChange}>
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

          <p className="form-section-title">Contact Information</p>
          <div className="form-row">
            <div className="form-group">
              <label>Phone *</label>
              <input name="phone" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group" style={{ marginBottom: 14 }}>
            <label>Address *</label>
            <textarea name="address" value={formData.address} onChange={handleChange} rows={2} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Barangay</label>
              <input name="barangay" value={formData.barangay} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Municipality</label>
              <input name="municipality" value={formData.municipality} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Province</label>
              <input name="province" value={formData.province} onChange={handleChange} />
            </div>
          </div>

          <p className="form-section-title">Emergency Contact</p>
          <div className="form-row">
            <div className="form-group">
              <label>Contact Name *</label>
              <input name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Contact Phone *</label>
              <input name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Relation</label>
              <input name="emergency_contact_relation" value={formData.emergency_contact_relation} onChange={handleChange} />
            </div>
          </div>

          <p className="form-section-title">Medical Information</p>
          <div className="form-row">
            <div className="form-group">
              <label>Allergies</label>
              <textarea name="allergies" value={formData.allergies} onChange={handleChange} rows={2} />
            </div>
            <div className="form-group">
              <label>Medical Conditions</label>
              <textarea name="medical_conditions" value={formData.medical_conditions} onChange={handleChange} rows={2} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Current Medications</label>
              <textarea name="current_medications" value={formData.current_medications} onChange={handleChange} rows={2} />
            </div>
            <div className="form-group">
              <label>Tetanus Vaccination History</label>
              <textarea name="tetanus_vaccination_history" value={formData.tetanus_vaccination_history} onChange={handleChange} rows={2} />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="spinner" />
                  Saving...
                </span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditing ? 'Update Patient' : 'Register Patient'}
                </>
              )}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/patients')}>
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
