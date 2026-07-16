import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { appointmentAPI } from '../../api/axios';
import Loader from '../../components/common/Loader';
import { Search, Calendar, Check, X } from 'lucide-react';

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = filter ? { status: filter } : {};
      if (search) params.search = search;
      const response = await appointmentAPI.list(params);
      setAppointments(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await appointmentAPI.update(id, { status: 'approved' });
      fetchAppointments();
    } catch (err) {
      console.error('Failed to approve:', err);
    }
  };

  const handleReject = async (id) => {
    try {
      await appointmentAPI.update(id, { status: 'cancelled' });
      fetchAppointments();
    } catch (err) {
      console.error('Failed to reject:', err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadge = (status) => {
    const map = { pending: 'badge-warning', approved: 'badge-success', completed: 'badge-primary', cancelled: 'badge-danger', rejected: 'badge-danger' };
    return map[status] || 'badge-secondary';
  };

  const filters = ['all', 'pending', 'approved', 'completed', 'cancelled'];

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <div className="page-header-left">
          <h1>Appointment Management</h1>
          <p>Manage all clinic appointments</p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="tabs">
          {filters.map((f) => (
            <button
              key={f}
              className={`tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); fetchAppointments(); }} className="search-form ml-auto">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            style={{ width: 200 }}
          />
          <button type="submit" className="btn-search">
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {loading ? (
        <Loader text="Loading appointments..." />
      ) : appointments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Calendar className="w-12 h-12 text-slate-300 mx-auto" /></div>
          <h3>No Appointments Found</h3>
          <p>No appointments match the current filter.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Appt #</th>
                <th>Patient</th>
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
                  className="animate-fade-in"
                  style={{ animationDelay: `${i * 0.03}s` }}
                >
                  <td className="font-mono font-medium">{apt.appointment_number}</td>
                  <td className="font-medium">{apt.patient_name}</td>
                  <td>{formatDate(apt.appointment_date)}</td>
                  <td>{apt.time_slot}</td>
                  <td className="capitalize">{apt.reason || 'Vaccination'}</td>
                  <td><span className={`badge ${getStatusBadge(apt.status)}`}>{apt.status}</span></td>
                  <td className="actions-cell">
                    {apt.status === 'pending' && (
                      <>
                        <button className="btn-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => handleApprove(apt.id)} title="Approve">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button className="btn-sm text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleReject(apt.id)} title="Reject">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
