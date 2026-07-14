import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { vaccinationAPI, patientAPI, caseAPI, inventoryAPI } from '../../api/axios';
import Loader from '../../components/common/Loader';

export default function VaccinationForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prePatient = searchParams.get('patient');
  const preCase = searchParams.get('case');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [patients, setPatients] = useState([]);
  const [cases, setCases] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');

  const [formData, setFormData] = useState({
    patient: prePatient || '',
    case: preCase || '',
    dose_type: 'first',
    dose_number: 1,
    scheduled_date: new Date().toISOString().slice(0, 10),
    administered_date: new Date().toISOString().slice(0, 10),
    administration_route: 'im',
    injection_site: 'left_deltoid',
    vaccine: '',
    batch_number: '',
    dosage_amount: '0.5ml',
    manufacturer: '',
    result: 'administered',
    notes: '',
    adverse_reaction: '',
  });

  // Pre-filled data from patient profile (for staff using their own profile)
  const [prefilledProfile, setPrefilledProfile] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Auto-load patient profile data when a patient is selected
  useEffect(() => {
    if (formData.patient && typeof formData.patient === 'number') {
      loadPatientProfile(formData.patient);
    }
  }, [formData.patient]);

  const loadPatientProfile = async (patientId) => {
    try {
      const res = await patientAPI.get(patientId);
      setPrefilledProfile(res.data);
    } catch (e) {
      console.error('Failed to load patient profile:', e);
    }
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [vaccineRes] = await Promise.all([
        inventoryAPI.vaccines({ is_active: true }),
      ]);
      setVaccines(vaccineRes.data.results || vaccineRes.data || []);
      
      if (prePatient) {
        const caseRes = await caseAPI.list({ patient: prePatient });
        setCases(caseRes.data.results || caseRes.data || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async (search = '') => {
    try {
      const params = search ? { search } : {};
      const response = await patientAPI.list(params);
      setPatients(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to load patients:', error);
    }
  };

  const handlePatientSelect = async (patientId) => {
    setFormData({ ...formData, patient: patientId });
    try {
      // Load patient profile for pre-filling
      const [patientRes, caseRes] = await Promise.all([
        patientAPI.get(patientId),
        caseAPI.list({ patient: patientId }),
      ]);
      setPrefilledProfile(patientRes.data);
      setCases(caseRes.data.results || caseRes.data || []);
    } catch (error) {
      console.error('Failed to load patient data:', error);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient) {
      setError('Please select a patient.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await vaccinationAPI.create({
        ...formData,
        administered_date: formData.result === 'administered' ? formData.administered_date : null,
      });
      navigate('/vaccinations');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save vaccination record.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading..." />;

  return (
    <div className="form-page">
      <div className="card">
        <h2>Record Vaccination</h2>
        {error && <div className="error-message">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Patient *</label>
            {prePatient ? (
              <p className="selected-info">Patient #{prePatient}</p>
            ) : (
              <div className="patient-search-wrapper">
                <input
                  type="text"
                  placeholder="Search patients..."
                  onChange={(e) => {
                    setPatientSearch(e.target.value);
                    if (e.target.value.length > 1) fetchPatients(e.target.value);
                  }}
                />
                {patientSearch.length > 1 && (
                  <div className="patient-search-dropdown">
                    {patients.map((p) => (
                      <div key={p.id} className="dropdown-item" onClick={() => handlePatientSelect(p.id)}>
                        <strong>{p.full_name || `${p.first_name} ${p.last_name}`}</strong>
                        <span className="patient-id">{p.patient_id_display}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Show pre-filled patient profile info */}
            {prefilledProfile && (
              <div style={{ marginTop: 8, padding: '10px 12px', background: '#eef2ff', borderRadius: 8, fontSize: 13 }}>
                <div style={{ fontWeight: 600, color: '#4338ca', marginBottom: 4 }}>
                  📋 Patient Profile — {prefilledProfile.full_name || `${prefilledProfile.first_name} ${prefilledProfile.last_name}`}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px', color: '#1e293b' }}>
                  <span>🆔 {prefilledProfile.patient_id_display}</span>
                  <span>📞 {prefilledProfile.phone || '—'}</span>
                  <span>🎂 DOB: {prefilledProfile.date_of_birth ? new Date(prefilledProfile.date_of_birth).toLocaleDateString() : '—'}</span>
                  <span>⚧ {prefilledProfile.gender || '—'}</span>
                  <span>📍 {prefilledProfile.address || '—'}</span>
                  <span>🩸 {prefilledProfile.blood_type || '—'}</span>
                  <span>📧 {prefilledProfile.email || '—'}</span>
                  <span>🆘 {prefilledProfile.emergency_contact_name ? `${prefilledProfile.emergency_contact_name} (${prefilledProfile.emergency_contact_phone})` : '—'}</span>
                </div>
              </div>
            )}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Related Case</label>
              <select name="case" value={formData.case} onChange={handleChange}>
                <option value="">No specific case</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>{c.case_number} - {new Date(c.incident_date).toLocaleDateString()}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Dose Type</label>
              <select name="dose_type" value={formData.dose_type} onChange={handleChange}>
                <option value="first">First Dose</option>
                <option value="second">Second Dose</option>
                <option value="third">Third Dose</option>
                <option value="fourth">Fourth Dose</option>
                <option value="fifth">Fifth Dose</option>
                <option value="booster">Booster</option>
                <option value="tetanus">Tetanus Toxoid</option>
                <option value="rabies_ig">Rabies Immune Globulin</option>
              </select>
            </div>
            <div className="form-group">
              <label>Dose Number</label>
              <input type="number" name="dose_number" min="1" value={formData.dose_number} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Scheduled Date *</label>
              <input type="date" name="scheduled_date" value={formData.scheduled_date} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Administered Date</label>
              <input type="date" name="administered_date" value={formData.administered_date} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Vaccine</label>
              <select name="vaccine" value={formData.vaccine} onChange={handleChange}>
                <option value="">Select Vaccine</option>
                {vaccines.map((v) => (
                  <option key={v.id} value={v.id}>{v.name} (Stock: {v.current_stock || 0})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Batch Number</label>
              <input name="batch_number" value={formData.batch_number} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Administration Route</label>
              <select name="administration_route" value={formData.administration_route} onChange={handleChange}>
                <option value="im">Intramuscular (IM)</option>
                <option value="sc">Subcutaneous (SC)</option>
                <option value="id">Intradermal (ID)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Injection Site</label>
              <select name="injection_site" value={formData.injection_site} onChange={handleChange}>
                <option value="left_deltoid">Left Deltoid</option>
                <option value="right_deltoid">Right Deltoid</option>
                <option value="left_thigh">Left Thigh</option>
                <option value="right_thigh">Right Thigh</option>
              </select>
            </div>
            <div className="form-group">
              <label>Dosage</label>
              <input name="dosage_amount" value={formData.dosage_amount} onChange={handleChange} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Result</label>
              <select name="result" value={formData.result} onChange={handleChange}>
                <option value="administered">Administered</option>
                <option value="missed">Missed</option>
                <option value="refused">Refused</option>
                <option value="contraindicated">Contraindicated</option>
              </select>
            </div>
            <div className="form-group">
              <label>Manufacturer</label>
              <input name="manufacturer" value={formData.manufacturer} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} />
          </div>
          <div className="form-group">
            <label>Adverse Reaction</label>
            <textarea name="adverse_reaction" value={formData.adverse_reaction} onChange={handleChange} rows={2} placeholder="If any adverse reaction occurred..." />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Record Vaccination'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/vaccinations')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
