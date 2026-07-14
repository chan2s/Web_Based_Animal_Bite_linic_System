import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { vaccinationAPI } from '../../api/axios';
import Loader from '../../components/common/Loader';

export default function VaccinationList() {
  const [view, setView] = useState('records'); // records, schedules, missed
  const [records, setRecords] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [missed, setMissed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [view]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (view === 'records') {
        const res = await vaccinationAPI.list();
        setRecords(res.data.results || res.data || []);
      } else if (view === 'schedules') {
        const res = await vaccinationAPI.schedules();
        setSchedules(res.data.results || res.data || []);
      } else if (view === 'missed') {
        const res = await vaccinationAPI.missed();
        setMissed(res.data.missed || []);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResultBadge = (result) => {
    const map = {
      administered: 'badge-success',
      missed: 'badge-danger',
      refused: 'badge-warning',
      contraindicated: 'badge-secondary',
      cancelled: 'badge-secondary',
    };
    return map[result] || 'badge-secondary';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="view-tabs">
          <button className={`tab ${view === 'records' ? 'active' : ''}`} onClick={() => setView('records')}>Vaccination Records</button>
          <button className={`tab ${view === 'schedules' ? 'active' : ''}`} onClick={() => setView('schedules')}>Schedules</button>
          <button className={`tab ${view === 'missed' ? 'active' : ''}`} onClick={() => setView('missed')}>Missed</button>
        </div>
        <Link to="/vaccinations/new" className="btn-primary">+ Record Vaccination</Link>
      </div>

      {loading ? (
        <Loader text="Loading..." />
      ) : view === 'records' && records.length === 0 ? (
        <div className="empty-state"><p>No vaccination records found.</p></div>
      ) : view === 'schedules' && schedules.length === 0 ? (
        <div className="empty-state"><p>No vaccination schedules found.</p></div>
      ) : view === 'missed' && missed.length === 0 ? (
        <div className="empty-state"><p>No missed vaccinations! 🎉</p></div>
      ) : (
        <div className="table-container">
          {view === 'records' && (
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Dose</th>
                  <th>Scheduled</th>
                  <th>Administered</th>
                  <th>Vaccine</th>
                  <th>Batch</th>
                  <th>Result</th>
                  <th>Administered By</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td><Link to={`/patients/${r.patient}`} className="patient-name">{r.patient_name}</Link></td>
                    <td>Dose {r.dose_number} ({r.dose_type})</td>
                    <td>{new Date(r.scheduled_date).toLocaleDateString()}</td>
                    <td>{r.administered_date ? new Date(r.administered_date).toLocaleDateString() : '—'}</td>
                    <td>{r.vaccine_name || '—'}</td>
                    <td>{r.batch_number || '—'}</td>
                    <td><span className={`badge ${getResultBadge(r.result)}`}>{r.result}</span></td>
                    <td>{r.administered_by_name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {view === 'schedules' && (
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Case</th>
                  <th>Dose</th>
                  <th>Scheduled Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s.id}>
                    <td>{s.patient_name}</td>
                    <td>{s.case_number || '—'}</td>
                    <td>Dose {s.dose_number} ({s.dose_type})</td>
                    <td>{new Date(s.scheduled_date).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${s.is_completed ? 'badge-success' : 'badge-warning'}`}>
                        {s.is_completed ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {view === 'missed' && (
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Dose</th>
                  <th>Scheduled</th>
                  <th>Vaccine</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {missed.map((m) => (
                  <tr key={m.id}>
                    <td>{m.patient_name}</td>
                    <td>Dose {m.dose_number} ({m.dose_type})</td>
                    <td>{new Date(m.scheduled_date).toLocaleDateString()}</td>
                    <td>{m.vaccine_name || '—'}</td>
                    <td><Link to={`/patients/${m.patient}`} className="btn-sm">View Patient</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
