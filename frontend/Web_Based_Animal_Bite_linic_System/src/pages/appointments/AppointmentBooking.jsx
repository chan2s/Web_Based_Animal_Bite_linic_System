import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { appointmentAPI } from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNetworkStatus } from '../../contexts/NetworkContext';
import Loader from '../../components/common/Loader';
import { Calendar, Clock, User, Save, X, WifiOff } from 'lucide-react';

export default function AppointmentBooking() {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    patient: '',
    appointment_date: '',
    time_slot: '',
    reason: 'vaccination',
    notes: '',
  });

  const { isOnline } = useNetworkStatus();

  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientSelect, setShowPatientSelect] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);
  const isPatient = hasRole('patient');

  const timeSlots = [
    '08:00-08:30', '08:30-09:00', '09:00-09:30', '09:30-10:00',
    '10:00-10:30', '10:30-11:00', '11:00-11:30', '13:00-13:30',
    '13:30-14:00', '14:00-14:30', '14:30-15:00', '15:00-15:30',
    '15:30-16:00', '16:00-16:30',
  ];

  useEffect(() => {
    if (!isPatient) {
      fetchPatients();
    }
  }, []);

  const fetchPatients = async (search = '') => {
    try {
      const { patientAPI } = await import('../../api/axios');
      const params = search ? { search } : {};
      const response = await patientAPI.list(params);
      setPatients(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to load patients:', error);
    }
  };

  const handlePatientSearch = (e) => {
    const query = e.target.value;
    setPatientSearch(query);
    if (query.length > 1) fetchPatients(query);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isOnline) {
      setError('No internet connection. Please reconnect and try again.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const payload = isPatient ? {
        appointment_date: formData.appointment_date,
        time_slot: formData.time_slot,
        reason: formData.reason,
        notes: formData.notes,
      } : formData;
      await appointmentAPI.create(payload);
      setSuccess(true);
      setTimeout(() => navigate('/appointments/my'), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to book appointment.');
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <motion.div
        className="flex items-center justify-center py-20"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Appointment Booked!</h3>
          <p className="text-sm text-slate-500">Redirecting to your appointments...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="form-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card">
        <h2>Book Appointment</h2>
        {error && <div className="error-message">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          {!isPatient && (
            <>
              <p className="form-section-title">Patient</p>
              <div className="form-row">
                <div className="form-group">
                  <label>Search & Select Patient *</label>
                  <div className="patient-search-wrapper">
                    <input
                      type="text"
                      placeholder="Search patients..."
                      value={patientSearch}
                      onChange={handlePatientSearch}
                      onFocus={() => setShowPatientSelect(true)}
                      onBlur={() => setTimeout(() => setShowPatientSelect(false), 200)}
                    />
                    {showPatientSelect && (
                      <div className="patient-search-dropdown">
                        {patients.length === 0 ? (
                          <div className="dropdown-empty">No patients found.</div>
                        ) : (
                          patients.map((p) => (
                            <div
                              key={p.id}
                              className={`dropdown-item ${Number(formData.patient) === p.id ? 'selected' : ''}`}
                              onClick={() => {
                                setFormData({ ...formData, patient: p.id });
                                setShowPatientSelect(false);
                              }}
                            >
                              <strong>{p.full_name || `${p.first_name} ${p.last_name}`}</strong>
                              <span className="patient-id">{p.patient_id_display}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          <p className="form-section-title">Appointment Details</p>
          <div className="form-row">
            <div className="form-group">
              <label>Appointment Date *</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  name="appointment_date"
                  value={formData.appointment_date}
                  onChange={handleChange}
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Time Slot *</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  name="time_slot"
                  value={formData.time_slot}
                  onChange={handleChange}
                  required
                  className="pl-10"
                >
                  <option value="">Select a time slot</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Reason</label>
              <select name="reason" value={formData.reason} onChange={handleChange}>
                <option value="vaccination">Vaccination</option>
                <option value="follow_up">Follow-up</option>
                <option value="consultation">Consultation</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label>Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2"><span className="spinner" /> Booking...</span>
              ) : (
                <><Calendar className="w-4 h-4" /> Book Appointment</>
              )}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
