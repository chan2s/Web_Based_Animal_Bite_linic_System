import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { appointmentAPI, patientAPI } from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import { useNetworkStatus } from '../../contexts/NetworkContext';
import { Calendar, Clock, User, Save, X, WifiOff, AlertCircle } from 'lucide-react';

export default function AppointmentBooking() {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    appointment_date: '',
    time_slot: '',
    reason: 'new_bite',  // Must match backend REASON_CHOICES exactly
    notes: '',
  });

  const { isOnline } = useNetworkStatus();

  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientSelect, setShowPatientSelect] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const isPatient = hasRole('patient');

  // ── Time slots MUST match backend format: HH:MM (5 chars max) ──
  // Backend: Appointment.time_slot = CharField(max_length=5, help_text="Format: HH:MM")
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30',
    '10:00', '10:30', '11:00', '11:30',
    '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30',
  ];

  useEffect(() => {
    if (!isPatient) {
      fetchPatients();
    }
  }, []);

  const fetchPatients = async (search = '') => {
    try {
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
    // Clear selected patient when user types a new search
    if (query !== patientSearch) {
      setSelectedPatient(null);
    }
    if (query.length > 1) fetchPatients(query);
  };

  const handleSelectPatient = useCallback((patient) => {
    // Store the full patient info needed by the backend API
    setSelectedPatient({
      id: patient.id,
      patient_id: patient.patient_id_display,
      full_name: patient.full_name || `${patient.first_name} ${patient.last_name}`,
      phone: patient.phone,
      email: patient.email || '',
    });
    // Show the selected patient's name in the search input
    setPatientSearch(patient.full_name || `${patient.first_name} ${patient.last_name}`);
    // Close the dropdown
    setShowPatientSelect(false);
    // Clear any patient-related error
    setErrors((prev) => {
      const next = { ...prev };
      delete next.patient;
      return next;
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear the error for this field when user changes it
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // ── Fetch available time slots when date changes ──
  const fetchAvailableSlots = useCallback(async (dateStr) => {
    if (!dateStr) {
      setAvailableSlots([]);
      return;
    }
    setSlotLoading(true);
    try {
      const response = await appointmentAPI.availableSlots(dateStr);
      const data = response.data;
      // Backend returns { date, slots: [{ time: '09:00', available: true }, ...], clinic_info }
      const slots = Array.isArray(data.slots) ? data.slots : [];
      const availableSlotTimes = slots
        .filter((s) => s.available !== false)
        .map((s) => s.time || s);
      setAvailableSlots(availableSlotTimes);
    } catch (error) {
      console.error('Failed to fetch available slots:', error);
      setAvailableSlots([]);
    } finally {
      setSlotLoading(false);
    }
  }, []);

  // When appointment_date changes, fetch available slots
  useEffect(() => {
    if (formData.appointment_date) {
      fetchAvailableSlots(formData.appointment_date);
    } else {
      setAvailableSlots([]);
    }
  }, [formData.appointment_date, fetchAvailableSlots]);

  // ── Validation ──
  function validate() {
    const newErrors = {};
    if (!isPatient && !selectedPatient) {
      newErrors.patient = 'Please select a patient.';
    }
    if (!formData.appointment_date) {
      newErrors.appointment_date = 'Appointment date is required.';
    }
    if (!formData.time_slot) {
      newErrors.time_slot = 'Time slot is required.';
    }
    if (!formData.reason) {
      newErrors.reason = 'Reason is required.';
    }
    // Check date is not in the past
    if (formData.appointment_date) {
      const today = new Date();
      const selectedDate = new Date(formData.appointment_date + 'T00:00:00');
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        newErrors.appointment_date = 'Appointment date cannot be in the past.';
      }
    }
    return newErrors;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isOnline) {
      setErrors({ server: 'No internet connection. Please reconnect and try again.' });
      return;
    }

    // Client-side validation
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      // Build the payload with correct field names matching the backend serializer
      const payload = isPatient
        ? {
            patient_name: `${user.first_name} ${user.last_name}`.trim() || user.username,
            patient_phone: user.profile?.phone || '',
            patient_email: user.email || '',
            appointment_date: formData.appointment_date,
            time_slot: formData.time_slot,
            reason: formData.reason,
            notes: formData.notes,
          }
        : {
            patient_name: selectedPatient.full_name,
            patient_phone: selectedPatient.phone,
            patient_email: selectedPatient.email || '',
            appointment_date: formData.appointment_date,
            time_slot: formData.time_slot,
            reason: formData.reason,
            notes: formData.notes,
          };

      console.log('[AppointmentBooking] Submitting payload:', payload);
      await appointmentAPI.create(payload);
      setSuccess(true);
      setTimeout(() => navigate('/appointments/my'), 1500);
    } catch (err) {
      // Extract validation errors from the API response
      const responseData = err.response?.data;
      if (responseData) {
        if (typeof responseData === 'string') {
          setErrors({ server: responseData });
        } else if (responseData.detail) {
          setErrors({ server: responseData.detail });
        } else if (responseData.error) {
          setErrors({ server: responseData.error });
        } else {
          // Handle DRF field-level errors (e.g., { patient_name: ["This field is required."] })
          const fieldErrors = {};
          Object.entries(responseData).forEach(([key, msgs]) => {
            fieldErrors[key] = Array.isArray(msgs) ? msgs.join(', ') : msgs;
          });
          setErrors(fieldErrors);
        }
      } else {
        setErrors({ server: 'Failed to book appointment. Please try again.' });
      }
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
          <h3 className="text-lg font-bold text-slate-900 mb-1">✅ Appointment booked successfully!</h3>
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

        {/* Server-level error banner */}
        {errors.server && (
          <div className="mx-6 mb-2">
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-800">{errors.server}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {!isPatient && (
            <>
              <p className="form-section-title">Patient</p>
              <div className="form-row">
                <div className="form-group">
                  <label>Search &amp; Select Patient *</label>
                  <div className="patient-search-wrapper">
                    <input
                      type="text"
                      placeholder="Search patients by name or ID..."
                      value={patientSearch}
                      onChange={handlePatientSearch}
                      onFocus={() => {
                        if (selectedPatient) {
                          // If a patient is already selected, show dropdown with current results
                          setShowPatientSelect(true);
                        } else {
                          setShowPatientSelect(true);
                          fetchPatients();
                        }
                      }}
                      onBlur={() => {
                        // Delay so mousedown on the dropdown item fires first
                        setTimeout(() => setShowPatientSelect(false), 200);
                      }}
                      className={errors.patient ? 'border-red-300 focus:border-red-400' : ''}
                      autoComplete="off"
                    />
                    {errors.patient && (
                      <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.patient}
                      </p>
                    )}
                    {showPatientSelect && (
                      <div className="patient-search-dropdown">
                        {patients.length === 0 ? (
                          <div className="dropdown-empty">No patients found. Type at least 2 characters to search.</div>
                        ) : (
                          patients.map((p) => {
                            const fullName = p.full_name || `${p.first_name} ${p.last_name}`;
                            const isSelected = selectedPatient?.id === p.id;
                            return (
                              <div
                                key={p.id}
                                className={`dropdown-item ${isSelected ? 'selected' : ''}`}
                                onMouseDown={() => {
                                  // onMouseDown fires BEFORE onBlur, preventing the race condition
                                  handleSelectPatient(p);
                                }}
                              >
                                <div className="flex items-center justify-between w-full">
                                  <strong>{fullName}</strong>
                                  <span className="patient-id text-xs text-slate-400 ml-2">{p.patient_id_display}</span>
                                </div>
                                <div className="text-xs text-slate-400 mt-0.5">{p.phone}</div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                  {selectedPatient && (
                    <div className="mt-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-blue-500" />
                        <span className="font-medium text-blue-800">{selectedPatient.full_name}</span>
                        <span className="text-blue-400">|</span>
                        <span className="text-blue-600">{selectedPatient.patient_id}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPatient(null);
                          setPatientSearch('');
                        }}
                        className="text-xs text-blue-500 hover:text-blue-700 font-medium"
                      >
                        Change
                      </button>
                    </div>
                  )}
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
                  onChange={(e) => {
                    // Also reset time slot when date changes
                    handleChange(e);
                    if (formData.time_slot) {
                      setFormData((prev) => ({ ...prev, time_slot: '' }));
                    }
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  className={`pl-10 ${errors.appointment_date ? 'border-red-300 focus:border-red-400' : ''}`}
                />
              </div>
              {errors.appointment_date && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.appointment_date}
                </p>
              )}
            </div>
            <div className="form-group">
              <label>Time Slot *</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  name="time_slot"
                  value={formData.time_slot}
                  onChange={handleChange}
                  className={`pl-10 ${errors.time_slot ? 'border-red-300 focus:border-red-400' : ''}`}
                >
                  <option value="">Select a time slot</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot} {!slotLoading && availableSlots.includes(slot) ? '✔ Available' : ''}
                    </option>
                  ))}
                </select>
              </div>
              {errors.time_slot && (
                <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.time_slot}
                </p>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Reason</label>
              {/* Values MUST match backend Appointment.REASON_CHOICES exactly:
                  ('new_bite', 'New Animal Bite'),
                  ('follow_up', 'Follow-up Dose'),
                  ('booster', 'Booster'),
                  ('other', 'Other') */}
              <select name="reason" value={formData.reason} onChange={handleChange}>
                <option value="new_bite">New Animal Bite</option>
                <option value="follow_up">Follow-up Dose</option>
                <option value="booster">Booster</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label>Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} placeholder="Optional notes or special requests..." />
          </div>

          {/* Inline validation summary */}
          {Object.keys(errors).length > 0 && !errors.server && (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200">
              <p className="text-xs font-semibold text-amber-800 mb-1">Please fix the following:</p>
              <ul className="text-xs text-amber-700 list-disc list-inside space-y-0.5">
                {Object.entries(errors).map(([key, msg]) => (
                  <li key={key}>{msg}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="spinner" />
                  Creating appointment...
                </span>
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
