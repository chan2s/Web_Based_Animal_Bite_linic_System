import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { caseAPI } from '../../api/axios';
import Loader from '../../components/common/Loader';
import { Search, Plus, ExternalLink, Edit3, Stethoscope } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

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
  };

  const getStatusBadge = (status) => {
    const map = {
      open: 'badge-warning',
      ongoing: 'badge-info',
      completed: 'badge-success',
      lost_to_followup: 'badge-danger',
      referred: 'badge-secondary',
    };
    return map[status] || 'badge-secondary';
  };

  const getSeverityBadge = (severity) => {
    const map = { mild: 'badge-success', moderate: 'badge-warning', severe: 'badge-danger' };
    return map[severity] || 'badge-secondary';
  };

  return (
    <motion.div
      className="page-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="page-header" variants={itemVariants}>
        <div className="page-header-left">
          <h1>Bite Cases</h1>
          <p>Track and manage animal bite cases</p>
        </div>
        <div className="header-actions">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search cases by number, patient name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn-search">
              <Search className="w-4 h-4" />
            </button>
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
          <Link to="/cases/new" className="btn-primary">
            <Plus className="w-4 h-4" />
            New Case
          </Link>
        </div>
      </motion.div>

      {loading ? (
        <Loader text="Loading cases..." />
      ) : cases.length === 0 ? (
        <motion.div className="empty-state" variants={itemVariants}>
          <div className="empty-icon">
            <Stethoscope className="w-12 h-12 text-slate-300 mx-auto" />
          </div>
          <h3>No Cases Found</h3>
          <p>Record a new bite case to get started.</p>
          <Link to="/cases/new" className="btn-primary">
            <Plus className="w-4 h-4" />
            New Case
          </Link>
        </motion.div>
      ) : (
        <motion.div className="table-container" variants={itemVariants}>
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
              {cases.map((c, i) => (                  <tr
                    key={c.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${i * 0.03}s` }}
                  >
                  <td className="font-mono font-semibold">{c.case_number}</td>
                  <td><Link to={`/patients/${c.patient}`} className="patient-name">{c.patient_name}</Link></td>
                  <td><span className="patient-id">{c.patient_id_display}</span></td>
                  <td className="capitalize">{c.animal_type}</td>
                  <td><span className={`badge badge-cat-${c.bite_category?.toLowerCase()}`}>Cat {c.bite_category}</span></td>
                  <td><span className={getSeverityBadge(c.severity)}>{c.severity}</span></td>
                  <td>{new Date(c.incident_date).toLocaleDateString()}</td>
                  <td className="text-slate-500">{c.days_since_incident}d</td>
                  <td><span className={`badge ${getStatusBadge(c.case_status)}`}>{c.case_status?.replace(/_/g, ' ')}</span></td>
                  <td className="actions-cell">
                    <Link to={`/cases/${c.id}`} className="btn-sm" title="View Details">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <Link to={`/cases/${c.id}/edit`} className="btn-sm" title="Edit">
                      <Edit3 className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </motion.div>
  );
}
