import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { vaccinationAPI, patientAPI } from '../../api/axios';
import Loader from '../../components/common/Loader';
import { Save, X, Syringe } from 'lucide-react';

export default function VaccinationForm() {
  const [searchParams] = useSearchParams();
  const preSelectedPatient = searchParams.get('patient');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientSelect, setShowPatientSelect] = useState(false);

  const [formData, setFormData] = useState({
    patient: preSelectedPatient || '',
    dose_number: 1,
    dose_type: 'rabies',
    vaccine: '',
    batch_number: '',
    scheduled_date: '',
    administered_date: '',
    result: 'scheduled',
    notes: '',
    facility: '',
    administered_by: '',
  });

  useEffect(() => {
    if (!preSelectedPatient) fetchPatients();
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
    if (query.length > 1) fetchPatients(query);
  };

  const selectPatient = (patientId) => {
    setFormData({ ...formData, patient: patientId });
    setShowPatientSelect(false);
    setPatientSearch('');
  };

  const getPatientName = (id) => {
    const p = patients.find(p => p.id === Number(id));
    return p ? p.full_name || `${p.first_name} ${p.last_name}` : `Patient #${id}`;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        dose_number: Number(formData.dose_number),
      });
      navigate('/vaccinations');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save vaccination record.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="form-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card">
        <h2>Record Vaccination</h2>
        {error && <div className="error-message">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <p className="form-section-title">Patient Information</p>
          {preSelectedPatient ? (
            <div className="form-row">
              <div className="form-group">
                <label>Selected Patient</label>
                <p className="selected-info">Patient ID: {preSelectedPatient}</p>
              </div>
            </div>
          ) : (
            <div className="form-row">
              <div className="form-group">
                <label>Search & Select Patient *</label>
                <div className="patient-search-wrapper">
                  <input
                    type="text"
                    placeholder="Search patients by name or ID..."
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
                            onClick={() => selectPatient(p.id)}
                          >
                            <strong>{p.full_name || `${p.first_name} ${p.last_name}`}</strong>
                            <span className="patient-id">{p.patient_id_display}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {formData.patient && <p className="selected-info">Selected: {getPatientName(formData.patient)}</p>}
              </div>
            </div>
          )}

          <p className="form-section-title">Vaccination Details</p>
          <div className="form-row">
            <div className="form-group">
              <label>Dose Number *</label>
              <input type="number" name="dose_number" min="1" value={formData.dose_number} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Dose Type</label>
              <select name="dose_type" value={formData.dose_type} onChange={handleChange}>
                <option value="rabies">Rabies Vaccine</option>
                <option value="tetanus">Tetanus Vaccine</option>
                <option value="rabies_ig">Rabies Immune Globulin</option>
                <option value="booster">Booster</option>
              </select>
            </div>
            <div className="form-group">
              <label>Vaccine Name</label>
              <input name="vaccine" value={formData.vaccine} onChange={handleChange} placeholder="e.g. Verorab" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Batch Number</label>
              <input name="batch_number" value={formData.batch_number} onChange={handleChange} />
            </div>
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
              <label>Result</label>
              <select name="result" value={formData.result} onChange={handleChange}>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="missed">Missed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="form-group">
              <label>Facility</label>
              <input name="facility" value={formData.facility} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 14 }}>
            <label>Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={2} />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2"><span className="spinner" /> Saving...</span>
              ) : (
                <><Save className="w-4 h-4" /> Record Vaccination</>
              )}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/vaccinations')}>
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
