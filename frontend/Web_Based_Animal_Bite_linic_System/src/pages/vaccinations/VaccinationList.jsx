import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { vaccinationAPI } from '../../api/axios';
import Loader from '../../components/common/Loader';
import { Search, Plus, Syringe } from 'lucide-react';

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

export default function VaccinationList() {
  const [vaccinations, setVaccinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [resultFilter, setResultFilter] = useState('');

  useEffect(() => {
    fetchVaccinations();
  }, [search, resultFilter]);

  const fetchVaccinations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (resultFilter) params.result = resultFilter;
      const response = await vaccinationAPI.list(params);
      setVaccinations(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to load vaccinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVaccinations();
  };

  const getResultBadge = (result) => {
    const map = {
      administered: 'badge-success',
      completed: 'badge-success',
      scheduled: 'badge-info',
      missed: 'badge-danger',
      refused: 'badge-warning',
      contraindicated: 'badge-danger',
      cancelled: 'badge-danger',
      pending: 'badge-warning',
    };
    return map[result] || 'badge-secondary';
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
          <h1>Vaccinations</h1>
          <p>Track and manage patient vaccination schedules</p>
        </div>
        <div className="header-actions">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search by patient name, dose..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn-search">
              <Search className="w-4 h-4" />
            </button>
          </form>
          <select value={resultFilter} onChange={(e) => setResultFilter(e.target.value)} className="filter-select">
            <option value="">All Results</option>
            <option value="administered">Administered</option>
            <option value="missed">Missed</option>
            <option value="refused">Refused</option>
            <option value="contraindicated">Contraindicated</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Link to="/vaccinations/new" className="btn-primary">
            <Plus className="w-4 h-4" />
            Record Vaccination
          </Link>
        </div>
      </motion.div>

      {loading ? (
        <Loader text="Loading vaccinations..." />
      ) : vaccinations.length === 0 ? (
        <motion.div className="empty-state" variants={itemVariants}>
          <div className="empty-icon">
            <Syringe className="w-12 h-12 text-slate-300 mx-auto" />
          </div>
          <h3>No Vaccinations Found</h3>
          <p>Record a vaccination to get started.</p>
          <Link to="/vaccinations/new" className="btn-primary">
            <Plus className="w-4 h-4" />
            Record Vaccination
          </Link>
        </motion.div>
      ) : (
        <motion.div className="table-container" variants={itemVariants}>
          <table className="table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Patient ID</th>
                <th>Dose</th>
                <th>Vaccine</th>
                <th>Scheduled</th>
                <th>Administered</th>
                <th>Result</th>
                <th>Administered By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vaccinations.map((v, i) => (                  <tr
                    key={v.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${i * 0.03}s` }}
                  >
                  <td className="font-medium">
                    <Link to={`/patients/${v.patient}`} className="patient-name">
                      {v.patient_name}
                    </Link>
                  </td>
                  <td><span className="patient-id">{v.patient_id_display}</span></td>
                  <td>Dose {v.dose_number} ({v.dose_type})</td>
                  <td>{v.vaccine_name || '—'}</td>
                  <td>{new Date(v.scheduled_date).toLocaleDateString()}</td>
                  <td>{v.administered_date ? new Date(v.administered_date).toLocaleDateString() : <span className="text-slate-400">—</span>}</td>
                  <td><span className={`badge ${getResultBadge(v.result)}`}>{v.result}</span></td>
                  <td className="text-slate-500">{v.administered_by_name || '—'}</td>
                  <td className="actions-cell">
                    <Link to={`/patients/${v.patient}`} className="btn-sm" title="View Patient">
                      👁️
                    </Link>
                  </td>                  </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </motion.div>
  );
}
