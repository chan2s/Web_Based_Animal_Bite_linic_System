import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { appointmentAPI } from '../../api/axios';
import Loader from '../../components/common/Loader';
import { Calendar, ExternalLink } from 'lucide-react';

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

export default function MyAppointments() {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(tabParam === 'history' ? 'history' : 'upcoming');

  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const apiMethod = activeTab === 'upcoming' ? appointmentAPI.myUpcoming : appointmentAPI.myHistory;
      const response = await apiMethod();
      setAppointments(response.data || []);
    } catch (error) {
      console.error('Failed to load appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: 'badge-warning',
      approved: 'badge-success',
      completed: 'badge-primary',
      cancelled: 'badge-danger',
      rejected: 'badge-danger',
    };
    return map[status] || 'badge-secondary';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
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
          <h1>My Appointments</h1>
          <p>View and manage your appointments</p>
        </div>
      </motion.div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`} onClick={() => setActiveTab('upcoming')}>
          Upcoming
        </button>
        <button className={`tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
          History
        </button>
      </div>

      {loading ? (
        <Loader text="Loading appointments..." />
      ) : appointments.length === 0 ? (
        <motion.div className="empty-state" variants={itemVariants}>
          <div className="empty-icon">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
          </div>
          <h3>{activeTab === 'upcoming' ? 'No Upcoming Appointments' : 'No Appointment History'}</h3>
          <p>{activeTab === 'upcoming' ? 'Book your first appointment today.' : 'You have no past appointments.'}</p>
          {activeTab === 'upcoming' && (
            <Link to="/appointments/book" className="btn-primary">
              <Calendar className="w-4 h-4" />
              Book Now
            </Link>
          )}
        </motion.div>
      ) : (
        <motion.div className="table-container" variants={itemVariants}>
          <table className="table">
            <thead>
              <tr>
                <th>Appointment #</th>
                <th>Date</th>
                <th>Time</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt, i) => (
                <tr
                  key={apt.id}
                  className="animate-fade-in"                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                <td className="font-mono font-medium">{apt.appointment_number}</td>
                  <td>{formatDate(apt.appointment_date)}</td>
                  <td>{apt.time_slot}</td>
                  <td className="capitalize">{apt.reason || 'Vaccination'}</td>
                  <td><span className={`badge ${getStatusBadge(apt.status)}`}>{apt.status}</span></td>
                  <td>
                    <button className="btn-sm">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
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
