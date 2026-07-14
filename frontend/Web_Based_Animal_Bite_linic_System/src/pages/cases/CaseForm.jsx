import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { caseAPI, patientAPI } from '../../api/axios';
import Loader from '../../components/common/Loader';

export default function CaseForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const preSelectedPatient = searchParams.get('patient');
  const isEditing = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [patients, setPatients] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientSelect, setShowPatientSelect] = useState(false);

  const [formData, setFormData] = useState({
    patient: preSelectedPatient || '',
    incident_date: new Date().toISOString().slice(0, 16),
    incident_location: '',
    animal_type: 'dog',
    animal_other_type: '',
    animal_description: '',
    animal_owner_name: '',
    animal_owner_contact: '',
    animal_vaccination_status: 'unknown',
    animal_is_stray: false,
    animal_was_provoked: '',
    bite_category: 'II',
    exposure_type: 'bite',
    wound_location: 'hand',
    wound_location_other: '',
    wound_description: '',
    wound_depth_mm: '',
    number_of_wounds: 1,
    severity: 'mild',
    initial_treatment: 'none',
    initial_treatment_notes: '',
    wound_treated_within_24h: '',
    tetanus_status_checked: false,
    tetanus_vaccine_given: false,
    rabies_immune_globulin_given: false,
    referred_to_hospital: false,
    referral_notes: '',
    case_status: 'open',
    attending_doctor: '',
    notes: '',
  });

  useEffect(() => {
    if (isEditing) {
      fetchCase();
    }
    if (!preSelectedPatient) {
      fetchPatients();
    }
  }, [id]);

  const fetchPatients = async (search = '') => {
    try {
      const params = search ? { search } : {};
      const response = await patientAPI.list(params);
      setPatients(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to load patients:', error);
    }
  };

  const fetchCase = async () => {
    try {
      setLoading(true);
      const response = await caseAPI.get(id);
      const c = response.data;
      setFormData({
        patient: c.patient,
        incident_date: c.incident_date?.slice(0, 16) || '',
        incident_location: c.incident_location || '',
        animal_type: c.animal_type || 'dog',
        animal_other_type: c.animal_other_type || '',
        animal_description: c.animal_description || '',
        animal_owner_name: c.animal_owner_name || '',
        animal_owner_contact: c.animal_owner_contact || '',
        animal_vaccination_status: c.animal_vaccination_status || 'unknown',
        animal_is_stray: c.animal_is_stray || false,
        animal_was_provoked: c.animal_was_provoked ?? '',
        bite_category: c.bite_category || 'II',
        exposure_type: c.exposure_type || 'bite',
        wound_location: c.wound_location || 'hand',
        wound_location_other: c.wound_location_other || '',
        wound_description: c.wound_description || '',
        wound_depth_mm: c.wound_depth_mm || '',
        number_of_wounds: c.number_of_wounds || 1,
        severity: c.severity || 'mild',
        initial_treatment: c.initial_treatment || 'none',
        initial_treatment_notes: c.initial_treatment_notes || '',
        wound_treated_within_24h: c.wound_treated_within_24h ?? '',
        tetanus_status_checked: c.tetanus_status_checked || false,
        tetanus_vaccine_given: c.tetanus_vaccine_given || false,
        rabies_immune_globulin_given: c.rabies_immune_globulin_given || false,
        referred_to_hospital: c.referred_to_hospital || false,
        referral_notes: c.referral_notes || '',
        case_status: c.case_status || 'open',
        attending_doctor: c.attending_doctor || '',
        notes: c.notes || '',
      });
    } catch (err) {
      setError('Failed to load case data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handlePatientSearch = (e) => {
    const query = e.target.value;
    setPatientSearch(query);
    if (query.length > 1) {
      fetchPatients(query);
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patient) {
      setError('Please select a patient.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      // Convert string booleans to actual booleans/null for backend
      const getBooleanOrNull = (val) => {
        if (val === 'true') return true;
        if (val === 'false') return false;
        return null;
      };
      const payload = {
        ...formData,
        wound_depth_mm: formData.wound_depth_mm ? Number(formData.wound_depth_mm) : null,
        number_of_wounds: Number(formData.number_of_wounds),
        animal_was_provoked: getBooleanOrNull(formData.animal_was_provoked),
        wound_treated_within_24h: getBooleanOrNull(formData.wound_treated_within_24h),
      };
      delete payload.patientSearch;
      if (isEditing) {
        await caseAPI.update(id, payload);
      } else {
        await caseAPI.create(payload);
      }
      navigate('/cases');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save case.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader text="Loading case data..." />;

  return (
    <div className="form-page">
      <div className="card">
        <h2>{isEditing ? 'Edit Bite Case' : 'Record New Bite Case'}</h2>
        {error && <div className="error-message">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} className="form">
          {/* Patient Selection */}
          <h3 className="form-section-title">Patient Information</h3>
          {preSelectedPatient ? (
            <div className="form-group">
              <label>Selected Patient</label>
              <p className="selected-patient-info">Patient ID: {preSelectedPatient}</p>
            </div>
          ) : (
            <div className="form-group">
              <label>Search & Select Patient *</label>
              <div className="patient-search-wrapper">
                <input
                  type="text"
                  placeholder="Search patients by name or ID..."
                  value={patientSearch}
                  onChange={handlePatientSearch}
                  onFocus={() => setShowPatientSelect(true)}
                />
                {showPatientSelect && (
                  <div className="patient-search-dropdown">
                    {patients.length === 0 ? (
                      <div className="dropdown-empty">No patients found. Please register first.</div>
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
              {formData.patient && (
                <p className="selected-info">Selected: {getPatientName(formData.patient)}</p>
              )}
            </div>
          )}

          <h3 className="form-section-title">Incident Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Date & Time of Incident *</label>
              <input type="datetime-local" name="incident_date" value={formData.incident_date} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Incident Location</label>
              <input name="incident_location" value={formData.incident_location} onChange={handleChange} />
            </div>
          </div>

          <h3 className="form-section-title">Animal Information</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Animal Type *</label>
              <select name="animal_type" value={formData.animal_type} onChange={handleChange} required>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="bat">Bat</option>
                <option value="monkey">Monkey</option>
                <option value="rat">Rat</option>
                <option value="other">Other</option>
              </select>
            </div>
            {formData.animal_type === 'other' && (
              <div className="form-group">
                <label>Specify Animal *</label>
                <input name="animal_other_type" value={formData.animal_other_type} onChange={handleChange} required />
              </div>
            )}
            <div className="form-group">
              <label>Vaccination Status</label>
              <select name="animal_vaccination_status" value={formData.animal_vaccination_status} onChange={handleChange}>
                <option value="unknown">Unknown</option>
                <option value="vaccinated">Vaccinated</option>
                <option value="not_vaccinated">Not Vaccinated</option>
                <option value="observed">Under Observation</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Animal Description</label>
              <input name="animal_description" value={formData.animal_description} onChange={handleChange} placeholder="Color, size, features..." />
            </div>
            <div className="form-group">
              <label>Animal Owner</label>
              <input name="animal_owner_name" value={formData.animal_owner_name} onChange={handleChange} placeholder="If known" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group checkbox-group">
              <label>
                <input type="checkbox" name="animal_is_stray" checked={formData.animal_is_stray} onChange={handleChange} />
                Stray Animal
              </label>
            </div>
            <div className="form-group">
              <label>Was Animal Provoked?</label>
              <select name="animal_was_provoked" value={formData.animal_was_provoked} onChange={handleChange}>
                <option value="">Unknown</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>

          <h3 className="form-section-title">Bite Details</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Bite Category *</label>
              <select name="bite_category" value={formData.bite_category} onChange={handleChange} required>
                <option value="I">Category I - Contact without breaking skin</option>
                <option value="II">Category II - Nibbling without bleeding</option>
                <option value="III">Category III - Bites with bleeding</option>
              </select>
            </div>
            <div className="form-group">
              <label>Exposure Type</label>
              <select name="exposure_type" value={formData.exposure_type} onChange={handleChange}>
                <option value="direct">Direct Contact</option>
                <option value="scratch">Scratch</option>
                <option value="bite">Bite</option>
                <option value="mucous_membrane">Mucous Membrane</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Wound Location</label>
              <select name="wound_location" value={formData.wound_location} onChange={handleChange}>
                <option value="head">Head</option>
                <option value="face">Face</option>
                <option value="neck">Neck</option>
                <option value="upper_arm">Upper Arm</option>
                <option value="forearm">Forearm</option>
                <option value="hand">Hand</option>
                <option value="finger">Finger</option>
                <option value="chest">Chest</option>
                <option value="abdomen">Abdomen</option>
                <option value="thigh">Thigh</option>
                <option value="leg">Leg</option>
                <option value="foot">Foot</option>
                <option value="multiple">Multiple</option>
              </select>
            </div>
            <div className="form-group">
              <label>Number of Wounds</label>
              <input type="number" name="number_of_wounds" min="1" value={formData.number_of_wounds} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Severity</label>
              <select name="severity" value={formData.severity} onChange={handleChange}>
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Wound Description</label>
            <textarea name="wound_description" value={formData.wound_description} onChange={handleChange} rows={2} />
          </div>

          <h3 className="form-section-title">Initial Management</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Initial Treatment</label>
              <select name="initial_treatment" value={formData.initial_treatment} onChange={handleChange}>
                <option value="none">No Treatment</option>
                <option value="wound_cleaning">Wound Cleaning</option>
                <option value="wound_care">Wound Care & Dressing</option>
                <option value="first_aid">First Aid</option>
              </select>
            </div>
            <div className="form-group">
              <label>Treated Within 24h?</label>
              <select name="wound_treated_within_24h" value={formData.wound_treated_within_24h} onChange={handleChange}>
                <option value="">Unknown</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>

          <div className="form-row checkboxes">
            <div className="form-group checkbox-group">
              <label><input type="checkbox" name="tetanus_status_checked" checked={formData.tetanus_status_checked} onChange={handleChange} /> Tetanus Status Checked</label>
            </div>
            <div className="form-group checkbox-group">
              <label><input type="checkbox" name="tetanus_vaccine_given" checked={formData.tetanus_vaccine_given} onChange={handleChange} /> Tetanus Vaccine Given</label>
            </div>
            <div className="form-group checkbox-group">
              <label><input type="checkbox" name="rabies_immune_globulin_given" checked={formData.rabies_immune_globulin_given} onChange={handleChange} /> Rabies Immune Globulin Given</label>
            </div>
            <div className="form-group checkbox-group">
              <label><input type="checkbox" name="referred_to_hospital" checked={formData.referred_to_hospital} onChange={handleChange} /> Referred to Hospital</label>
            </div>
          </div>

          <div className="form-group">
            <label>Case Status</label>
            <select name="case_status" value={formData.case_status} onChange={handleChange}>
              <option value="open">Open</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="lost_to_followup">Lost to Follow-up</option>
              <option value="referred">Referred</option>
            </select>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : isEditing ? 'Update Case' : 'Record Case'}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate('/cases')}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
