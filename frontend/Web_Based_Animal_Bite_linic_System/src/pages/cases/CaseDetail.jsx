import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { caseAPI, vaccinationAPI } from '../../api/axios';
import Loader from '../../components/common/Loader';
import { ExternalLink, Edit3, Syringe, Stethoscope, User } from 'lucide-react';

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    fetchCaseData();
  }, [id]);

  const fetchCaseData = async () => {
    try {
      setLoading(true);
      const [caseRes, vaccRes] = await Promise.all([
        caseAPI.get(id),
        vaccinationAPI.list({ case: id }),
      ]);
      setCaseData(caseRes.data);
      setVaccinations(vaccRes.data.results || vaccRes.data || []);
    } catch (error) {
      console.error('Failed to load case:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Loading case details..." />;
  if (!caseData) return <div className="error-state">Case not found</div>;

  const c = caseData;
  const InfoRow = ({ label, value }) => (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value || '—'}</span>
    </div>
  );

  const getStatusBadge = (status) => {
    const map = { open: 'badge-warning', ongoing: 'badge-info', completed: 'badge-success', lost_to_followup: 'badge-danger', referred: 'badge-secondary' };
    return map[status] || 'badge-secondary';
  };

  return (
    <motion.div
      className="detail-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="detail-header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="detail-title">
          <div className="patient-avatar-lg">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h2>Case {c.case_number}</h2>
            <p className="detail-id">
              Patient: <Link to={`/patients/${c.patient}`} className="text-blue-600 hover:underline">{c.patient_name}</Link>
              {' · '}{c.patient_id_display}
            </p>
          </div>
        </div>
        <div className="detail-actions">
          <span className={`badge badge-lg ${getStatusBadge(c.case_status)}`}>{c.case_status?.replace(/_/g, ' ')}</span>
          <Link to={`/cases/${id}/edit`} className="btn-secondary">
            <Edit3 className="w-4 h-4" />
            Edit
          </Link>
          <Link to={`/vaccinations/new?patient=${c.patient}`} className="btn-primary">
            <Syringe className="w-4 h-4" />
            Record Vaccination
          </Link>
        </div>
      </motion.div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Case Details</button>
        <button className={`tab ${activeTab === 'vaccinations' ? 'active' : ''}`} onClick={() => setActiveTab('vaccinations')}>Vaccinations ({vaccinations.length})</button>
      </div>

      {activeTab === 'details' && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="card-body">
            <h3>Incident Information</h3>
            <div className="info-grid">
              <InfoRow label="Incident Date" value={new Date(c.incident_date).toLocaleString()} />
              <InfoRow label="Location" value={c.incident_location} />
              <InfoRow label="Days Since Incident" value={`${c.days_since_incident}d`} />
            </div>

            <h3>Animal Information</h3>
            <div className="info-grid">
              <InfoRow label="Animal Type" value={c.animal_type} />
              <InfoRow label="Animal Description" value={c.animal_description} />
              <InfoRow label="Vaccination Status" value={c.animal_vaccination_status} />
              <InfoRow label="Stray" value={c.animal_is_stray ? 'Yes' : 'No'} />
              <InfoRow label="Was Provoked" value={c.animal_was_provoked === true ? 'Yes' : c.animal_was_provoked === false ? 'No' : 'Unknown'} />
              <InfoRow label="Owner" value={c.animal_owner_name} />
            </div>

            <h3>Bite Details</h3>
            <div className="info-grid">
              <InfoRow label="Bite Category" value={`Category ${c.bite_category}`} />
              <InfoRow label="Exposure Type" value={c.exposure_type} />
              <InfoRow label="Wound Location" value={c.wound_location} />
              <InfoRow label="Number of Wounds" value={c.number_of_wounds} />
              <InfoRow label="Severity" value={c.severity} />
              <InfoRow label="Wound Depth" value={c.wound_depth_mm ? `${c.wound_depth_mm}mm` : '—'} />
            </div>
            {c.wound_description && (
              <div className="info-row" style={{ marginBottom: 16 }}>
                <span className="info-label">Wound Description</span>
                <span className="info-value">{c.wound_description}</span>
              </div>
            )}

            <h3>Management</h3>
            <div className="info-grid">
              <InfoRow label="Initial Treatment" value={c.initial_treatment} />
              <InfoRow label="Treated Within 24h" value={c.wound_treated_within_24h === true ? 'Yes' : c.wound_treated_within_24h === false ? 'No' : 'Unknown'} />
              <InfoRow label="Tetanus Checked" value={c.tetanus_status_checked ? '✓ Yes' : '✗ No'} />
              <InfoRow label="Tetanus Vaccine" value={c.tetanus_vaccine_given ? '✓ Given' : '✗ Not given'} />
              <InfoRow label="Rabies IG Given" value={c.rabies_immune_globulin_given ? '✓ Given' : '✗ Not given'} />
              <InfoRow label="Referred to Hospital" value={c.referred_to_hospital ? '✓ Yes' : '✗ No'} />
            </div>

            {c.notes && (
              <div className="info-row" style={{ marginBottom: 16 }}>
                <span className="info-label">Notes</span>
                <span className="info-value">{c.notes}</span>
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
        >
          <div className="card-body">
            {vaccinations.length === 0 ? (
              <div className="empty-state">
                <p className="text-slate-500 mb-4">No vaccinations recorded for this case.</p>
                <Link to={`/vaccinations/new?patient=${c.patient}`} className="btn-primary">
                  <Syringe className="w-4 h-4" />
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
