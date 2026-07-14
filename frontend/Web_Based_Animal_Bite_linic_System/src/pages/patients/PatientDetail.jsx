import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { patientAPI, caseAPI, vaccinationAPI } from '../../api/axios';
import Loader from '../../components/common/Loader';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [cases, setCases] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchPatientData();
  }, [id]);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const [patientRes, casesRes, vaccRes] = await Promise.all([
        patientAPI.get(id),
        caseAPI.list({ patient: id }),
        vaccinationAPI.list({ patient: id }),
      ]);
      setPatient(patientRes.data);
      setCases(casesRes.data.results || casesRes.data || []);
      setVaccinations(vaccRes.data.results || vaccRes.data || []);
    } catch (error) {
      console.error('Failed to load patient:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Loading patient details..." />;
  if (!patient) return <div className="error-state">Patient not found</div>;

  const InfoRow = ({ label, value }) => (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value || '—'}</span>
    </div>
  );

  return (
    <div className="detail-page">
      <div className="detail-header">
        <div className="detail-title">
          <div className="patient-avatar-lg">
            {patient.first_name?.[0]}{patient.last_name?.[0]}
          </div>
          <div>
            <h2>{patient.full_name || `${patient.first_name} ${patient.last_name}`}</h2>
            <p className="detail-id">{patient.patient_id_display || `PAT-${String(patient.id).padStart(5, '0')}`}</p>
          </div>
        </div>
        <div className="detail-actions">
          <Link to={`/cases/new?patient=${patient.id}`} className="btn-primary">+ New Case</Link>
          <Link to={`/vaccinations/new?patient=${patient.id}`} className="btn-secondary">+ Record Vaccination</Link>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>Patient Info</button>
        <button className={`tab ${activeTab === 'cases' ? 'active' : ''}`} onClick={() => setActiveTab('cases')}>Bite Cases ({cases.length})</button>
        <button className={`tab ${activeTab === 'vaccinations' ? 'active' : ''}`} onClick={() => setActiveTab('vaccinations')}>Vaccinations ({vaccinations.length})</button>
      </div>

      {activeTab === 'info' && (
        <div className="card">
          <div className="card-body">
            <h3>Personal Information</h3>
            <div className="info-grid">
              <InfoRow label="Full Name" value={patient.full_name || `${patient.first_name} ${patient.middle_name} ${patient.last_name}`} />
              <InfoRow label="Date of Birth" value={patient.date_of_birth && new Date(patient.date_of_birth).toLocaleDateString()} />
              <InfoRow label="Gender" value={patient.gender} />
              <InfoRow label="Blood Type" value={patient.blood_type} />
              <InfoRow label="Age" value={patient.age} />
              <InfoRow label="Phone" value={patient.phone} />
              <InfoRow label="Email" value={patient.email} />
              <InfoRow label="Address" value={`${patient.address}, ${patient.barangay || ''}, ${patient.municipality || ''}, ${patient.province || ''}`.replace(/, ,/g, ',')} />
            </div>

            <h3>Emergency Contact</h3>
            <div className="info-grid">
              <InfoRow label="Contact Name" value={patient.emergency_contact_name} />
              <InfoRow label="Contact Phone" value={patient.emergency_contact_phone} />
              <InfoRow label="Relation" value={patient.emergency_contact_relation} />
            </div>

            <h3>Medical Information</h3>
            <div className="info-grid">
              <InfoRow label="Allergies" value={patient.allergies} />
              <InfoRow label="Medical Conditions" value={patient.medical_conditions} />
              <InfoRow label="Current Medications" value={patient.current_medications} />
              <InfoRow label="Tetanus History" value={patient.tetanus_vaccination_history} />
            </div>

            <div className="form-actions">
              <Link to={`/patients/${id}/edit`} className="btn-secondary">✏️ Edit Patient</Link>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'cases' && (
        <div className="card">
          <div className="card-body">
            {cases.length === 0 ? (
              <div className="empty-state">
                <p>No bite cases recorded for this patient.</p>
                <Link to={`/cases/new?patient=${patient.id}`} className="btn-primary">Record First Case</Link>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Case #</th>
                    <th>Date</th>
                    <th>Animal</th>
                    <th>Category</th>
                    <th>Severity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cases.map((c) => (
                    <tr key={c.id}>
                      <td>{c.case_number}</td>
                      <td>{new Date(c.incident_date).toLocaleDateString()}</td>
                      <td>{c.animal_type}</td>
                      <td><span className={`badge badge-cat-${c.bite_category?.toLowerCase()}`}>Cat {c.bite_category}</span></td>
                      <td>{c.severity}</td>
                      <td><span className={`badge badge-${c.case_status}`}>{c.case_status}</span></td>
                      <td><Link to={`/cases/${c.id}`} className="btn-sm">View</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'vaccinations' && (
        <div className="card">
          <div className="card-body">
            {vaccinations.length === 0 ? (
              <div className="empty-state">
                <p>No vaccination records for this patient.</p>
                <Link to={`/vaccinations/new?patient=${patient.id}`} className="btn-primary">Record Vaccination</Link>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Dose</th>
                    <th>Scheduled</th>
                    <th>Administered</th>
                    <th>Result</th>
                    <th>Batch</th>
                    <th>Administered By</th>
                  </tr>
                </thead>
                <tbody>
                  {vaccinations.map((v) => (
                    <tr key={v.id}>
                      <td>Dose {v.dose_number} ({v.dose_type})</td>
                      <td>{new Date(v.scheduled_date).toLocaleDateString()}</td>
                      <td>{v.administered_date ? new Date(v.administered_date).toLocaleDateString() : '—'}</td>
                      <td><span className={`badge badge-${v.result}`}>{v.result}</span></td>
                      <td>{v.batch_number || '—'}</td>
                      <td>{v.administered_by_name || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
