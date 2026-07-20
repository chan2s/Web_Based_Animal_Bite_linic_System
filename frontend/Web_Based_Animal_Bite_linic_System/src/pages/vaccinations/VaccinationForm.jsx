import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { vaccinationAPI, patientAPI, inventoryAPI } from '../../api/axios';
import Loader from '../../components/common/Loader';
import { Save, X, Syringe } from 'lucide-react';

const DOSE_TYPE_OPTIONS = [
  { value: 'first', label: 'First Dose' },
  { value: 'second', label: 'Second Dose' },
  { value: 'third', label: 'Third Dose' },
  { value: 'fourth', label: 'Fourth Dose' },
  { value: 'fifth', label: 'Fifth Dose' },
  { value: 'booster', label: 'Booster' },
  { value: 'tetanus', label: 'Tetanus Toxoid' },
  { value: 'rabies_ig', label: 'Rabies Immune Globulin' },
];

const RESULT_OPTIONS = [
  { value: 'administered', label: 'Administered' },
  { value: 'missed', label: 'Missed' },
  { value: 'refused', label: 'Refused' },
  { value: 'contraindicated', label: 'Contraindicated' },
  { value: 'cancelled', label: 'Cancelled' },
];

const ADMINISTRATION_ROUTE_OPTIONS = [
  { value: 'im', label: 'Intramuscular (IM)' },
  { value: 'sc', label: 'Subcutaneous (SC)' },
  { value: 'id', label: 'Intradermal (ID)' },
];

const INJECTION_SITE_OPTIONS = [
  { value: '', label: '— Select Site —' },
  { value: 'left_deltoid', label: 'Left Deltoid' },
  { value: 'right_deltoid', label: 'Right Deltoid' },
  { value: 'left_thigh', label: 'Left Thigh (Anterolateral)' },
  { value: 'right_thigh', label: 'Right Thigh (Anterolateral)' },
  { value: 'left_gluteal', label: 'Left Gluteal' },
  { value: 'right_gluteal', label: 'Right Gluteal' },
];

export default function VaccinationForm() {
  const [searchParams] = useSearchParams();
  const preSelectedPatient = searchParams.get('patient');
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [patients, setPatients] = useState([]);
  const [vaccines, setVaccines] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientSelect, setShowPatientSelect] = useState(false);

  const [formData, setFormData] = useState({
    patient: preSelectedPatient || '',
    dose_number: 1,
    dose_type: 'first',
    vaccine: '',
    batch_number: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    administered_date: new Date().toISOString().split('T')[0],
    administration_route: 'im',
    injection_site: '',
    dosage_amount: '',
    manufacturer: '',
    result: 'administered',
    notes: '',
  });

  useEffect(() => {
    fetchVaccines();
    if (!preSelectedPatient) fetchPatients();
  }, []);

  const fetchVaccines = async () => {
    try {
      const response = await inventoryAPI.vaccines({ is_active: true });
      setVaccines(response.data.results || response.data || []);
    } catch (err) {
      console.error('Failed to load vaccines:', err);
    }
  };

  const fetchPatients = async (search = '') => {
    try {
      const params = search ? { search } : {};
      const response = await patientAPI.list(params);
      setPatients(response.data.results || response.data || []);
    } catch (err) {
      console.error('Failed to load patients:', err);
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
    setFieldErrors({});
    setError('');
  };

  const getPatientName = (id) => {
    const p = patients.find(p => p.id === Number(id));
    return p ? p.full_name || `${p.first_name} ${p.last_name}` : `Patient #${id}`;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear field error when user edits the field
    if (fieldErrors[e.target.name]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[e.target.name];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!formData.patient) {
      setError('Please select a patient.');
      return;
    }

    // Set today's date if not provided
    const today = new Date().toISOString().split('T')[0];
    const payload = {
      patient: Number(formData.patient),
      dose_number: Number(formData.dose_number),
      dose_type: formData.dose_type,
      vaccine: formData.vaccine ? Number(formData.vaccine) : undefined,
      batch_number: formData.batch_number,
      scheduled_date: formData.scheduled_date || today,
      administered_date: formData.administered_date || today,
      administration_route: formData.administration_route,
      injection_site: formData.injection_site,
      dosage_amount: formData.dosage_amount,
      manufacturer: formData.manufacturer,
      result: formData.result,
      notes: formData.notes,
    };

    setSaving(true);
    try {
      await vaccinationAPI.create(payload);
      navigate('/vaccinations');
    } catch (err) {
      const responseData = err.response?.data;

      // Check for field-level errors from the backend
      if (responseData?.field_errors) {
        setFieldErrors(responseData.field_errors);
        setError(Object.values(responseData.field_errors).flat().join('. '));
      } else if (responseData?.error) {
        // Backend returned a top-level error message
        setError(responseData.error);
      } else if (responseData?.detail) {
        // DRF detail error
        setError(responseData.detail);
      } else {
        // Fallback with some guidance
        setError('Failed to save vaccination record. Check the form fields for errors.');
        console.error('Vaccination save error:', err.response?.data || err);
      }
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
        <div className="flex items-center gap-3 mb-6">
          <Syringe className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold">Record Vaccination</h2>
        </div>

        {error && (
          <div className="error-message bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
            <span className="font-medium">⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* ── Patient Selection ── */}
          <p className="form-section-title font-medium text-slate-700 mb-3 pb-1 border-b border-slate-200">
            Patient Information
          </p>
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
                <label>Search &amp; Select Patient *</label>
                <div className="patient-search-wrapper">
                  <input
                    type="text"
                    placeholder="Search patients by name or ID..."
                    value={patientSearch}
                    onChange={handlePatientSearch}
                    onFocus={() => setShowPatientSelect(true)}
                    onBlur={() => setTimeout(() => setShowPatientSelect(false), 200)}
                    className={`w-full ${fieldErrors.patient ? 'border-red-400' : ''}`}
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
                            onMouseDown={() => selectPatient(p.id)}
                          >
                            <strong>{p.full_name || `${p.first_name} ${p.last_name}`}</strong>
                            <span className="patient-id">{p.patient_id_display}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {formData.patient && (
                  <p className="selected-info text-emerald-600 text-xs mt-1">
                    ✓ Selected: {getPatientName(formData.patient)}
                  </p>
                )}
                {fieldErrors.patient && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.patient}</p>
                )}
              </div>
            </div>
          )}

          {/* ── Vaccination Details ── */}
          <p className="form-section-title font-medium text-slate-700 mb-3 pb-1 border-b border-slate-200 mt-6">
            Vaccination Details
          </p>
          <div className="form-row">
            <div className="form-group">
              <label>Dose Number *</label>
              <input
                type="number"
                name="dose_number"
                min="1"
                value={formData.dose_number}
                onChange={handleChange}
                required
                className={fieldErrors.dose_number ? 'border-red-400' : ''}
              />
              {fieldErrors.dose_number && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.dose_number}</p>
              )}
            </div>
            <div className="form-group">
              <label>Dose Type *</label>
              <select
                name="dose_type"
                value={formData.dose_type}
                onChange={handleChange}
                className={fieldErrors.dose_type ? 'border-red-400' : ''}
              >
                {DOSE_TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {fieldErrors.dose_type && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.dose_type}</p>
              )}
            </div>
            <div className="form-group">
              <label>Vaccine (from inventory)</label>
              <select
                name="vaccine"
                value={formData.vaccine}
                onChange={handleChange}
                className={fieldErrors.vaccine ? 'border-red-400' : ''}
              >
                <option value="">— Select Vaccine —</option>
                {vaccines.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} {v.current_stock !== undefined ? `(Stock: ${v.current_stock})` : ''}
                  </option>
                ))}
              </select>
              {fieldErrors.vaccine && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.vaccine}</p>
              )}
              {vaccines.length === 0 && (
                <p className="text-amber-500 text-xs mt-1">
                  No vaccines found in inventory. Add vaccines in Inventory first.
                </p>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Batch Number</label>
              <input
                name="batch_number"
                value={formData.batch_number}
                onChange={handleChange}
                placeholder="e.g. LOT-2024-001"
                className={fieldErrors.batch_number ? 'border-red-400' : ''}
              />
              {fieldErrors.batch_number && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.batch_number}</p>
              )}
            </div>
            <div className="form-group">
              <label>Scheduled Date *</label>
              <input
                type="date"
                name="scheduled_date"
                value={formData.scheduled_date}
                onChange={handleChange}
                required
                className={fieldErrors.scheduled_date ? 'border-red-400' : ''}
              />
              {fieldErrors.scheduled_date && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.scheduled_date}</p>
              )}
            </div>
            <div className="form-group">
              <label>Administered Date</label>
              <input
                type="date"
                name="administered_date"
                value={formData.administered_date}
                onChange={handleChange}
                className={fieldErrors.administered_date ? 'border-red-400' : ''}
              />
              {fieldErrors.administered_date && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.administered_date}</p>
              )}
            </div>
          </div>

          {/* ── Clinical Details ── */}
          <p className="form-section-title font-medium text-slate-700 mb-3 pb-1 border-b border-slate-200 mt-6">
            Clinical Details
          </p>
          <div className="form-row">
            <div className="form-group">
              <label>Administration Route</label>
              <select
                name="administration_route"
                value={formData.administration_route}
                onChange={handleChange}
              >
                {ADMINISTRATION_ROUTE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Injection Site</label>
              <select
                name="injection_site"
                value={formData.injection_site}
                onChange={handleChange}
              >
                {INJECTION_SITE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Dosage Amount</label>
              <input
                name="dosage_amount"
                value={formData.dosage_amount}
                onChange={handleChange}
                placeholder="e.g. 0.5ml"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Manufacturer</label>
              <input
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                placeholder="e.g. Sanofi Pasteur"
              />
            </div>
            <div className="form-group">
              <label>Result</label>
              <select
                name="result"
                value={formData.result}
                onChange={handleChange}
                className={fieldErrors.result ? 'border-red-400' : ''}
              >
                {RESULT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {fieldErrors.result && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.result}</p>
              )}
            </div>
          </div>

          <div className="form-group mb-4">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Any additional notes about the vaccination..."
            />
          </div>

          <div className="form-actions flex gap-3 mt-6">
            <button type="submit" className="btn-primary flex items-center gap-2" disabled={saving}>
              {saving ? (
                <span className="flex items-center gap-2"><span className="spinner" /> Saving...</span>
              ) : (
                <><Save className="w-4 h-4" /> Record Vaccination</>
              )}
            </button>
            <button type="button" className="btn-secondary flex items-center gap-2" onClick={() => navigate('/vaccinations')}>
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
