import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { patientAPI } from '../../api/axios';
import { useNetworkStatus } from '../../contexts/NetworkContext';
import Loader from '../../components/common/Loader';
import { Search, Plus, Users, ExternalLink, Edit3, WifiOff, RefreshCw } from 'lucide-react';

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

export default function PatientList() {
  const { isOnline } = useNetworkStatus();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOnline) {
      fetchPatients();
    }
  }, [page, genderFilter, isOnline]); // Handles initial load AND re-fetch on reconnect

  const fetchPatients = async () => {
    if (!isOnline) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const params = { page, page_size: 20 };
      if (search) params.search = search;
      if (genderFilter) params.gender = genderFilter;
      const response = await patientAPI.list(params);
      setPatients(response.data.results || response.data);
      setTotal(response.data.count || response.data.length || 0);
    } catch (error) {
      if (error?.offline) {
        // Offline, handled by isOnline
      } else {
        console.error('Failed to fetch patients:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Show offline message when not online and no data cached
  if (!isOnline && patients.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center py-20 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-4">
          <WifiOff className="w-8 h-8 text-orange-400" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 mb-1">No internet connection.</h3>
        <p className="text-sm text-slate-500 max-w-[300px] mb-6">
          Reconnect to continue using the Animal Bite Clinic System.
        </p>
        <button
          onClick={fetchPatients}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </motion.div>
    );
  }

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPatients();
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
          <h1>Patients</h1>
          <p>View and manage all patient records</p>
        </div>
        <div className="header-actions">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search patients by name, ID, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn-search">
              <Search className="w-4 h-4" />
            </button>
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
          <Link
            to={isOnline ? "/patients/new" : "#"}
            className={`btn-primary ${!isOnline ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
            onClick={(e) => { if (!isOnline) { e.preventDefault(); } }}
            title={!isOnline ? 'Offline — cannot register patients' : 'Register Patient'}
          >
            <Plus className="w-4 h-4" />
            Register Patient {!isOnline && '(Offline)'}
          </Link>
        </div>
      </motion.div>

      {loading ? (
        <Loader text="Loading patients..." />
      ) : patients.length === 0 ? (
        <motion.div className="empty-state" variants={itemVariants}>
          <div className="empty-icon">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
          </div>
          <h3>No Patients Found</h3>
          <p>Register a new patient to get started.</p>
          <Link
            to={isOnline ? "/patients/new" : "#"}
            className={`btn-primary ${!isOnline ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}
            onClick={(e) => { if (!isOnline) { e.preventDefault(); } }}
            title={!isOnline ? 'Offline — cannot register patients' : 'Register Patient'}
          >
            <Plus className="w-4 h-4" />
            Register Patient {!isOnline && '(Offline)'}
          </Link>
        </motion.div>
      ) : (
        <>
          <motion.div className="table-container" variants={itemVariants}>
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
                {patients.map((patient, i) => (
                  <tr
                    key={patient.id}
                    className="animate-fade-in"                    style={{ animationDelay: `${i * 0.03}s` }}
                  >
                  <td><span className="patient-id">{patient.patient_id_display || `PAT-${String(patient.id).padStart(5, '0')}`}</span></td>
                    <td>
                      <Link to={`/patients/${patient.id}`} className="patient-name">
                        {patient.full_name || `${patient.first_name} ${patient.last_name}`}
                      </Link>
                    </td>
                    <td>{patient.gender === 'male' ? '♂ Male' : '♀ Female'}</td>
                    <td className="font-medium">{patient.age || '—'}</td>
                    <td>{patient.phone}</td>
                    <td className="text-slate-500">{patient.barangay || '—'}</td>
                    <td className="text-slate-500">{new Date(patient.created_at).toLocaleDateString()}</td>
                    <td className="actions-cell">
                      <Link to={`/patients/${patient.id}`} className="btn-sm" title="View">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <Link to={`/patients/${patient.id}/edit`} className="btn-sm" title="Edit">
                        <Edit3 className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>

          {total > 20 && (
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
              <span>Page {page} of {Math.ceil(total / 20)}</span>
              <button disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}
