import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { patientAPI } from '../../api/axios';
import Loader from '../../components/common/Loader';

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, [page, genderFilter, search]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const params = { page, page_size: 20 };
      if (search) params.search = search;
      if (genderFilter) params.gender = genderFilter;
      const response = await patientAPI.list(params);
      setPatients(response.data.results || response.data);
      setTotal(response.data.count || response.data.length || 0);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    // useEffect will handle the fetch
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-actions">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search patients by name, ID, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn-search">🔍</button>
          </form>
          <select
            value={genderFilter}
            onChange={(e) => { setGenderFilter(e.target.value); setPage(1); }}
            className="filter-select"
          >
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <Link to="/patients/new" className="btn-primary">
            + Register Patient
          </Link>
        </div>
      </div>

      {loading ? (
        <Loader text="Loading patients..." />
      ) : patients.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No Patients Found</h3>
          <p>Register a new patient to get started.</p>
          <Link to="/patients/new" className="btn-primary">Register Patient</Link>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Full Name</th>
                  <th>Gender</th>
                  <th>Age</th>
                  <th>Phone</th>
                  <th>Barangay</th>
                  <th>Registered</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((patient) => (
                  <tr key={patient.id}>
                    <td><span className="patient-id">{patient.patient_id_display || `PAT-${String(patient.id).padStart(5, '0')}`}</span></td>
                    <td>
                      <Link to={`/patients/${patient.id}`} className="patient-name">
                        {patient.full_name || `${patient.first_name} ${patient.last_name}`}
                      </Link>
                    </td>
                    <td>{patient.gender === 'male' ? '♂' : '♀'}</td>
                    <td>{patient.age || '—'}</td>
                    <td>{patient.phone}</td>
                    <td>{patient.barangay || '—'}</td>
                    <td>{new Date(patient.created_at).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <Link to={`/patients/${patient.id}`} className="btn-sm" title="View">👁️</Link>
                      <Link to={`/patients/${patient.id}/edit`} className="btn-sm" title="Edit">✏️</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {total > 20 && (
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
              <span>Page {page} of {Math.ceil(total / 20)}</span>
              <button disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
