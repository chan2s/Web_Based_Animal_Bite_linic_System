import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { caseAPI } from '../../api/axios';
import Loader from '../../components/common/Loader';

export default function CaseList() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchCases();
  }, [search, statusFilter, categoryFilter]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.case_status = statusFilter;
      if (categoryFilter) params.bite_category = categoryFilter;
      const response = await caseAPI.list(params);
      setCases(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to load cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // useEffect will handle the fetch
  };

  const getStatusBadgeClass = (status) => {
    const map = {
      open: 'badge-warning',
      ongoing: 'badge-info',
      completed: 'badge-success',
      lost_to_followup: 'badge-danger',
      referred: 'badge-secondary',
    };
    return map[status] || 'badge-secondary';
  };

  const getSeverityClass = (severity) => {
    const map = { mild: 'badge-success', moderate: 'badge-warning', severe: 'badge-danger' };
    return map[severity] || 'badge-secondary';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="header-actions">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search cases by number, patient name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn-search">🔍</button>
          </form>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="lost_to_followup">Lost to Follow-up</option>
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="filter-select">
            <option value="">All Categories</option>
            <option value="I">Category I</option>
            <option value="II">Category II</option>
            <option value="III">Category III</option>
          </select>
          <Link to="/cases/new" className="btn-primary">+ New Case</Link>
        </div>
      </div>

      {loading ? (
        <Loader text="Loading cases..." />
      ) : cases.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🩺</div>
          <h3>No Cases Found</h3>
          <p>Record a new bite case to get started.</p>
          <Link to="/cases/new" className="btn-primary">New Case</Link>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Case #</th>
                <th>Patient</th>
                <th>Patient ID</th>
                <th>Animal</th>
                <th>Category</th>
                <th>Severity</th>
                <th>Incident Date</th>
                <th>Days Ago</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.case_number}</strong></td>
                  <td><Link to={`/patients/${c.patient}`} className="patient-name">{c.patient_name}</Link></td>
                  <td><span className="patient-id">{c.patient_id_display}</span></td>
                  <td>{c.animal_type}</td>
                  <td><span className={`badge badge-cat-${c.bite_category?.toLowerCase()}`}>Cat {c.bite_category}</span></td>
                  <td><span className={getSeverityClass(c.severity)}>{c.severity}</span></td>
                  <td>{new Date(c.incident_date).toLocaleDateString()}</td>
                  <td>{c.days_since_incident}d</td>
                  <td><span className={`badge ${getStatusBadgeClass(c.case_status)}`}>{c.case_status?.replace(/_/g, ' ')}</span></td>
                  <td className="actions-cell">
                    <Link to={`/cases/${c.id}`} className="btn-sm" title="View Details">👁️</Link>
                    <Link to={`/cases/${c.id}/edit`} className="btn-sm" title="Edit">✏️</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
