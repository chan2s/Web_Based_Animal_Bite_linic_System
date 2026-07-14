import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI, authAPI } from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import Loader from '../../components/common/Loader';

export default function AppointmentBooking() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isPatient = user?.profile?.role === 'patient';
  const [step, setStep] = useState(1); // 1: details, 2: confirm, 3: success
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [clinicInfo, setClinicInfo] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(true);
  const [updateProfileOpt, setUpdateProfileOpt] = useState(false);
  const [formData, setFormData] = useState({
    patient_name: '',
    patient_phone: '',
    patient_email: '',
    appointment_date: '',
    time_slot: '',
    reason: 'new_bite',
    reason_other: '',
    notes: '',
  });
  const [bookingResult, setBookingResult] = useState(null);
  const minDate = new Date().toISOString().split('T')[0];
  const submitLockRef = useRef(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [clinicRes, profileRes] = await Promise.allSettled([
        appointmentAPI.clinicInfo(),
        authAPI.getPatientProfile(),
      ]);
      
      if (clinicRes.status === 'fulfilled') {
        setClinicInfo(clinicRes.value.data);
      }
      
      if (profileRes.status === 'fulfilled') {
        const profileData = profileRes.value.data;
        // profile_completed is now a top-level field
        const isComplete = profileData?.profile_completed === true;
        setProfileCompleted(isComplete);
        
        // Pre-fill form from profile data (flattened format)
        if (profileData) {
          setFormData((prev) => ({
            ...prev,
            patient_name: `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() || prev.patient_name,
            patient_phone: profileData.contact_number || prev.patient_phone,
            patient_email: profileData.email || prev.patient_email,
          }));
        }
        setProfileLoaded(true);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClinicInfo = async () => {
    try {
      const res = await appointmentAPI.clinicInfo();
      setClinicInfo(res.data);
    } catch (err) {
      console.error('Failed to load clinic info:', err);
    }
  };

  const handleDateChange = async (e) => {
    const date = e.target.value;
    setFormData({ ...formData, appointment_date: date, time_slot: '' });
    setSelectedSlot('');
    
    if (!date) return;
    
    setSlotsLoading(true);
    setError('');
    try {
      const res = await appointmentAPI.availableSlots(date);
      setAvailableSlots(res.data.slots || []);
      if (res.data.clinic_info) setClinicInfo(res.data.clinic_info);
    } catch (err) {
      setError('Failed to load available slots.');
      setAvailableSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSlotSelect = (time) => {
    setSelectedSlot(time);
    setFormData({ ...formData, time_slot: time });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProceedToConfirm = (e) => {
    e.preventDefault();
    if (!formData.patient_name || !formData.patient_phone || !formData.appointment_date || !formData.time_slot) {
      setError('Please fill in all required fields.');
      return;
    }
    if (formData.reason === 'other' && !formData.reason_other) {
      setError('Please specify the reason for your visit.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleConfirmBooking = async () => {
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    setSubmitting(true);
    setError('');
    
    try {
      const payload = { ...formData };
      const res = await appointmentAPI.create(payload);
      
      // If user opted to update their profile with booking details
      if (updateProfileOpt) {
        try {
          await authAPI.updatePatientProfile({
            phone: formData.patient_phone,
          });
        } catch (e) {
          console.error('Failed to auto-update profile:', e);
        }
      }
      
      setBookingResult(res.data);
      setStep(3);
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const msgs = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join('\n');
        setError(msgs);
      } else {
        setError('Booking failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
      submitLockRef.current = false;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  // ── SUCCESS STEP ──
  if (step === 3 && bookingResult) {
    return (
      <div className="page-container">
        <div className="card" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <div className="card-body" style={{ padding: 40 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <h2 style={{ marginBottom: 8 }}>Appointment Booked!</h2>
            <p style={{ color: '#64748b', marginBottom: 24 }}>Your vaccination appointment has been confirmed.</p>
            
            <div className="booking-success-details" style={{ background: '#f8fafc', borderRadius: 12, padding: 24, marginBottom: 24, textAlign: 'left' }}>
              <div className="info-row"><span className="info-label">Appointment #</span><span className="info-value" style={{ fontFamily: 'monospace', fontWeight: 700 }}>{bookingResult.appointment_number}</span></div>
              <div className="info-row"><span className="info-label">Patient</span><span className="info-value">{bookingResult.patient_name}</span></div>
              <div className="info-row"><span className="info-label">Date</span><span className="info-value">{formatDate(bookingResult.appointment_date)}</span></div>
              <div className="info-row"><span className="info-label">Time</span><span className="info-value">{bookingResult.time_slot}</span></div>
              <div className="info-row"><span className="info-label">Status</span><span className="info-value"><span className="badge badge-warning">{bookingResult.status}</span></span></div>
            </div>

            <div style={{ background: '#eef2ff', borderRadius: 8, padding: 16, marginBottom: 24, fontSize: 14, color: '#4338ca', textAlign: 'left' }}>
              📋 <strong>Please Note:</strong><br/>
              • Your appointment is currently <strong>pending</strong> and needs staff approval.<br/>
              • Please arrive 10 minutes before your scheduled time.<br/>
              • Bring any previous vaccination records if available.<br/>
              • To cancel or reschedule, visit the "My Appointments" page.
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn-primary" onClick={() => navigate('/appointments/my')}>View My Appointments</button>
              <button className="btn-secondary" onClick={() => { setStep(1); setFormData({ patient_name: '', patient_phone: '', patient_email: '', appointment_date: '', time_slot: '', reason: 'new_bite', reason_other: '', notes: '' }); setSelectedSlot(''); setAvailableSlots([]); }}>Book Another</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── CONFIRM STEP ──
  if (step === 2) {
    return (
      <div className="page-container">
        <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
          <div className="card-header"><h3>Confirm Your Appointment</h3></div>
          <div className="card-body">
            {error && <div className="error-message" style={{ whiteSpace: 'pre-line', marginBottom: 16 }}>⚠️ {error}</div>}
            
            <div className="booking-summary" style={{ background: '#f8fafc', borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <div className="info-row"><span className="info-label">Patient</span><span className="info-value">{formData.patient_name}</span></div>
              <div className="info-row"><span className="info-label">Phone</span><span className="info-value">{formData.patient_phone}</span></div>
              {formData.patient_email && <div className="info-row"><span className="info-label">Email</span><span className="info-value">{formData.patient_email}</span></div>}
              <div className="info-row"><span className="info-label">Date</span><span className="info-value">{formatDate(formData.appointment_date)}</span></div>
              <div className="info-row"><span className="info-label">Time</span><span className="info-value"><strong>{formData.time_slot}</strong></span></div>
              <div className="info-row"><span className="info-label">Reason</span><span className="info-value">{formData.reason === 'other' ? formData.reason_other : formData.reason?.replace(/_/g, ' ')}</span></div>
              {formData.notes && <div className="info-row"><span className="info-label">Notes</span><span className="info-value">{formData.notes}</span></div>}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setStep(1)} disabled={submitting}>
                ← Back
              </button>
              <button className="btn-primary" onClick={handleConfirmBooking} disabled={submitting}>
                {submitting ? (
                  <span className="btn-loading"><span className="spinner"></span> Booking...</span>
                ) : '✅ Confirm Booking'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── BOOKING FORM STEP ──
  return (
    <div className="page-container">
      <div className="card" style={{ maxWidth: 720, margin: '0 auto' }}>
        <div className="card-header">
          <h3>📅 Book a Vaccination Appointment</h3>
        </div>
        <div className="card-body">
          {/* Incomplete profile warning */}
          {profileLoaded && !profileCompleted && (
            <div
              style={{
                background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
                border: '1px solid #fed7aa',
                borderRadius: 12,
                padding: '14px 18px',
                marginBottom: 20,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}
            >
              <span style={{ fontSize: 20, lineHeight: 1 }}>⚠️</span>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: 14, color: '#9a3412', display: 'block', marginBottom: 4 }}>
                  Your profile is incomplete
                </strong>
                <p style={{ fontSize: 13, color: '#c2410c', margin: 0, lineHeight: 1.5 }}>
                  Please complete your profile before booking an appointment.
                </p>
                <button
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: 13, marginTop: 10, background: '#ea580c', border: 'none' }}
                  onClick={() => navigate('/profile')}
                >
                  Complete Profile
                </button>
              </div>
            </div>
          )}

          {clinicInfo && (
            <div className="clinic-hours-bar" style={{ display: 'flex', gap: 20, padding: '12px 16px', background: '#eef2ff', borderRadius: 8, marginBottom: 20, fontSize: 13, color: '#4338ca', flexWrap: 'wrap' }}>
              <span>🕐 Hours: {clinicInfo.opening_time} – {clinicInfo.closing_time}</span>
              <span>⏱ Slot Duration: {clinicInfo.appointment_duration_minutes}min</span>
              <span>📋 Max/Day: {clinicInfo.max_appointments_per_day}</span>
            </div>
          )}

          {error && <div className="error-message" style={{ whiteSpace: 'pre-line', marginBottom: 16 }}>⚠️ {error}</div>}

          <form onSubmit={handleProceedToConfirm}>
            <h3 className="form-section-title">Your Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input name="patient_name" value={formData.patient_name} onChange={handleChange} placeholder="Your full name" required />
              </div>
              <div className="form-group">
                <label>Phone *</label>
                <input name="patient_phone" value={formData.patient_phone} onChange={handleChange} placeholder="Contact number" required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" name="patient_email" value={formData.patient_email} onChange={handleChange} placeholder="email@example.com" />
              </div>
            </div>

            <h3 className="form-section-title">Select Date & Time</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Appointment Date *</label>
                <input type="date" name="appointment_date" value={formData.appointment_date} onChange={handleDateChange} min={minDate} required />
              </div>
              <div className="form-group">
                <label>Reason for Visit *</label>
                <select name="reason" value={formData.reason} onChange={handleChange} required>
                  <option value="new_bite">New Animal Bite</option>
                  <option value="follow_up">Follow-up Dose</option>
                  <option value="booster">Booster</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {formData.reason === 'other' && (
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Please Specify *</label>
                <input name="reason_other" value={formData.reason_other} onChange={handleChange} placeholder="Describe your reason" required />
              </div>
            )}

            {/* Time Slot Selector */}
            {formData.appointment_date && (
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label>Available Time Slots *</label>
                {slotsLoading ? (
                  <div style={{ padding: 20 }}><Loader size={24} text="Checking availability..." /></div>
                ) : availableSlots.length === 0 ? (
                  <div style={{ padding: 16, background: '#fef2f2', borderRadius: 8, color: '#dc2626', fontSize: 14 }}>
                    ⚠️ No available slots for this date. The clinic may be closed or fully booked. Please select another date.
                  </div>
                ) : (
                  <div className="time-slots-grid">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        className={`time-slot-btn ${selectedSlot === slot.time ? 'selected' : ''} ${!slot.available ? 'disabled' : ''}`}
                        onClick={() => slot.available && handleSlotSelect(slot.time)}
                        disabled={!slot.available}
                        title={!slot.available ? 'Slot is full' : `Book at ${slot.time}`}
                      >
                        <span className="slot-time">{slot.time}</span>
                        {slot.available ? (
                          <span className="slot-status available">Available</span>
                        ) : (
                          <span className="slot-status full">Full</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <h3 className="form-section-title">Additional Notes</h3>
            <div className="form-group" style={{ marginBottom: 16 }}>
              <label>Notes (Optional)</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} placeholder="Any additional information..." />
            </div>

            {/* Update profile option — only for patients */}
            {isPatient && (
              <div className="checkbox-group" style={{ marginTop: 4, marginBottom: 16 }}>
                <label>
                  <input
                    type="checkbox"
                    checked={updateProfileOpt}
                    onChange={(e) => setUpdateProfileOpt(e.target.checked)}
                  />
                  ☐ Update my profile with these new details
                </label>
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={!formData.time_slot}>
                Review Booking →
              </button>
              <button type="button" className="btn-secondary" onClick={() => navigate('/appointments/my')}>
                My Appointments
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
