import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { patientAPI, caseAPI, vaccinationAPI } from '../../api/axios';
import { useAuth } from '../../contexts/AuthContext';
import Loader from '../../components/common/Loader';
import { ExternalLink, Edit3, Plus, Syringe, Stethoscope, User, ShieldOff } from 'lucide-react';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  const [patient, setPatient] = useState(null);
  const isAdmin = hasRole('admin');
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
    <motion.div
      className="detail-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <motion.div
        className="detail-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
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
          <Link to={`/cases/new?patient=${patient.id}`} className="btn-primary">
            <Stethoscope className="w-4 h-4" />
            New Case
          </Link>
          <Link to={`/vaccinations/new?patient=${patient.id}`} className="btn-secondary">
            <Syringe className="w-4 h-4" />
            Record Vaccination
          </Link>
          {isAdmin && (
            <Link to={`/patients/${id}/edit`} className="btn-secondary">
              <Edit3 className="w-4 h-4" />
              Edit Patient
            </Link>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        className="tabs"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <button className={`tab ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
          <User className="w-3.5 h-3.5 inline mr-1.5" />
          Patient Info
        </button>
        <button className={`tab ${activeTab === 'cases' ? 'active' : ''}`} onClick={() => setActiveTab('cases')}>
          <Stethoscope className="w-3.5 h-3.5 inline mr-1.5" />
          Bite Cases ({cases.length})
        </button>
        <button className={`tab ${activeTab === 'vaccinations' ? 'active' : ''}`} onClick={() => setActiveTab('vaccinations')}>
          <Syringe className="w-3.5 h-3.5 inline mr-1.5" />
          Vaccinations ({vaccinations.length})
        </button>
      </motion.div>

      {activeTab === 'info' && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
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
              <InfoRow label="Address" value={`${patient.address}, ${patient.barangay || ''}, ${patient.municipality || ''}, ${patient.province || ''}`.replace(/, ,/g, ',').replace(/, ,/g, ',').replace(/^, /, '')} />
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
              {isAdmin ? (
                <Link to={`/patients/${id}/edit`} className="btn-secondary">
                  <Edit3 className="w-4 h-4" />
                  Edit Patient
                </Link>
              ) : (
                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
                  <ShieldOff className="w-3.5 h-3.5" />
                  Only administrators can edit patient records
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'cases' && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="card-body">
            {cases.length === 0 ? (
              <div className="empty-state">
                <p className="text-slate-500 mb-4">No bite cases recorded for this patient.</p>
                <Link to={`/cases/new?patient=${patient.id}`} className="btn-primary">
                  <Plus className="w-4 h-4" />
                  Record First Case
                </Link>
              </div>
            ) : (
              <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
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
                        <td className="font-mono font-medium">{c.case_number}</td>
                        <td>{new Date(c.incident_date).toLocaleDateString()}</td>
                        <td className="capitalize">{c.animal_type}</td>
                        <td><span className={`badge badge-cat-${c.bite_category?.toLowerCase()}`}>Cat {c.bite_category}</span></td>
                        <td><span className="badge badge-secondary capitalize">{c.severity}</span></td>
                        <td><span className={`badge badge-${c.case_status === 'open' || c.case_status === 'ongoing' ? 'warning' : c.case_status === 'completed' ? 'success' : 'danger'}`}>{c.case_status?.replace(/_/g, ' ')}</span></td>
                        <td><Link to={`/cases/${c.id}`} className="btn-sm"><ExternalLink className="w-3 h-3" /></Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {activeTab === 'vaccinations' && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="card-body">
            {vaccinations.length === 0 ? (
              <div className="empty-state">
                <p className="text-slate-500 mb-4">No vaccination records for this patient.</p>
                <Link to={`/vaccinations/new?patient=${patient.id}`} className="btn-primary">
                  <Plus className="w-4 h-4" />
                  Record Vaccination
                </Link>
              </div>
            ) : (
              <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
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
                        <td className="font-medium">Dose {v.dose_number} ({v.dose_type})</td>
                        <td>{new Date(v.scheduled_date).toLocaleDateString()}</td>
                        <td>{v.administered_date ? new Date(v.administered_date).toLocaleDateString() : <span className="text-slate-400">—</span>}</td>
                        <td><span className={`badge badge-${v.result === 'completed' ? 'success' : v.result === 'missed' ? 'danger' : 'warning'}`}>{v.result}</span></td>
                        <td className="text-slate-500">{v.batch_number || '—'}</td>
                        <td>{v.administered_by_name || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
