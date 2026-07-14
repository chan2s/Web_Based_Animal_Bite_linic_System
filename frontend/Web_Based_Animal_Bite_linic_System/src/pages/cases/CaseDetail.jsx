import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { caseAPI, vaccinationAPI } from '../../api/axios';
import Loader from '../../components/common/Loader';

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
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

  return (
    <div className="detail-page">
      <div className="detail-header">
        <div className="detail-title">
          <div>
            <h2>Case {c.case_number}</h2>
            <p className="detail-id">
              Patient: <Link to={`/patients/${c.patient}`}>{c.patient_name}</Link> ({c.patient_id_display})
            </p>
          </div>
        </div>
        <div className="detail-actions">
          <Link to={`/cases/${id}/edit`} className="btn-secondary">✏️ Edit Case</Link>
          <Link to={`/vaccinations/new?case=${id}&patient=${c.patient}`} className="btn-primary">+ Record Vaccination</Link>
        </div>
      </div>

      <div className="status-bar">
        <span className={`badge badge-lg ${c.case_status === 'completed' ? 'badge-success' : c.case_status === 'ongoing' ? 'badge-info' : c.case_status === 'open' ? 'badge-warning' : 'badge-danger'}`}>
          {c.case_status?.replace(/_/g, ' ')}
        </span>
        <span className={`badge badge-lg badge-cat-${c.bite_category?.toLowerCase()}`}>Category {c.bite_category}</span>
        <span className={`badge badge-lg ${c.severity === 'severe' ? 'badge-danger' : c.severity === 'moderate' ? 'badge-warning' : 'badge-success'}`}>{c.severity}</span>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'details' ? 'active' : ''}`} onClick={() => setActiveTab('details')}>Case Details</button>
        <button className={`tab ${activeTab === 'vaccinations' ? 'active' : ''}`} onClick={() => setActiveTab('vaccinations')}>Vaccinations ({vaccinations.length})</button>
      </div>

      {activeTab === 'details' && (
        <div className="card">
          <div className="card-body">
            <h3>Incident Information</h3>
            <div className="info-grid">
              <InfoRow label="Incident Date" value={new Date(c.incident_date).toLocaleString()} />
              <InfoRow label="Location" value={c.incident_location} />
              <InfoRow label="Days Since Incident" value={c.days_since_incident} />
              <InfoRow label="Exposure Type" value={c.exposure_type?.replace(/_/g, ' ')} />
              <InfoRow label="Wound Location" value={c.wound_location?.replace(/_/g, ' ')} />
              <InfoRow label="Number of Wounds" value={c.number_of_wounds} />
            </div>

            <h3>Animal Information</h3>
            <div className="info-grid">
              <InfoRow label="Animal Type" value={c.animal_other_type || c.animal_type} />
              <InfoRow label="Description" value={c.animal_description} />
              <InfoRow label="Vaccination Status" value={c.animal_vaccination_status?.replace(/_/g, ' ')} />
              <InfoRow label="Owner" value={c.animal_owner_name} />
              <InfoRow label="Is Stray" value={c.animal_is_stray ? 'Yes' : 'No'} />
              <InfoRow label="Was Provoked" value={c.animal_was_provoked === null ? 'Unknown' : c.animal_was_provoked ? 'Yes' : 'No'} />
            </div>

            <h3>Medical Management</h3>
            <div className="info-grid">
              <InfoRow label="Initial Treatment" value={c.initial_treatment?.replace(/_/g, ' ')} />
              <InfoRow label="Treated Within 24h" value={c.wound_treated_within_24h === null ? 'Unknown' : c.wound_treated_within_24h ? 'Yes' : 'No'} />
              <InfoRow label="Tetanus Status Checked" value={c.tetanus_status_checked ? '✅ Yes' : '❌ No'} />
              <InfoRow label="Tetanus Vaccine Given" value={c.tetanus_vaccine_given ? '✅ Yes' : '❌ No'} />
              <InfoRow label="Rabies IG Given" value={c.rabies_immune_globulin_given ? '✅ Yes' : '❌ No'} />
              <InfoRow label="Referred to Hospital" value={c.referred_to_hospital ? '✅ Yes' : '❌ No'} />
            </div>

            {c.notes && (
              <>
                <h3>Notes</h3>
                <p className="detail-notes">{c.notes}</p>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'vaccinations' && (
        <div className="card">
          <div className="card-body">
            {vaccinations.length === 0 ? (
              <div className="empty-state">
                <p>No vaccinations recorded for this case.</p>
                <Link to={`/vaccinations/new?case=${id}&patient=${c.patient}`} className="btn-primary">Record Vaccination</Link>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Dose</th>
                    <th>Type</th>
                    <th>Scheduled</th>
                    <th>Administered</th>
                    <th>Vaccine</th>
                    <th>Batch</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {vaccinations.map((v) => (
                    <tr key={v.id}>
                      <td>Dose {v.dose_number}</td>
                      <td>{v.dose_type}</td>
                      <td>{new Date(v.scheduled_date).toLocaleDateString()}</td>
                      <td>{v.administered_date ? new Date(v.administered_date).toLocaleDateString() : '—'}</td>
                      <td>{v.vaccine_name || '—'}</td>
                      <td>{v.batch_number || '—'}</td>
                      <td><span className={`badge badge-${v.result}`}>{v.result}</span></td>
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
