import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentAPI } from '../../api/axios';
import Loader from '../../components/common/Loader';

export default function MyAppointments() {
  const [view, setView] = useState('upcoming');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(null);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, [view]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      let res;
      if (view === 'upcoming') {
        res = await appointmentAPI.myUpcoming();
      } else {
        res = await appointmentAPI.myHistory();
      }
      setAppointments(res.data || []);
    } catch (err) {
      console.error('Failed to load appointments:', err);
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    setCancelLoading(id);
    setError('');
    try {
      await appointmentAPI.cancel(id, cancelReason);
      setShowCancelModal(null);
      setCancelReason('');
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cancel appointment.');
    } finally {
      setCancelLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: 'badge-warning',
      approved: 'badge-success',
      completed: 'badge-primary',
      cancelled: 'badge-danger',
      rejected: 'badge-danger',
      rescheduled: 'badge-info',
    };
    return map[status] || 'badge-secondary';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="view-tabs">
          <button className={`tab ${view === 'upcoming' ? 'active' : ''}`} onClick={() => setView('upcoming')}>Upcoming</button>
          <button className={`tab ${view === 'history' ? 'active' : ''}`} onClick={() => setView('history')}>History</button>
        </div>
        <Link to="/appointments/book" className="btn-primary">+ Book Appointment</Link>
      </div>

      {error && <div className="error-message">⚠️ {error}</div>}

      {loading ? (
        <Loader text="Loading appointments..." />
      ) : appointments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>{view === 'upcoming' ? 'No Upcoming Appointments' : 'No Appointment History'}</h3>
          <p>{view === 'upcoming' ? 'Book your first vaccination appointment.' : 'Your appointment history will appear here.'}</p>
          {view === 'upcoming' && <Link to="/appointments/book" className="btn-primary">Book Now</Link>}
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Appointment #</th>
                <th>Date</th>
                <th>Time</th>
                <th>Reason</th>
                <th>Patient</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt.id}>
                  <td><strong>{apt.appointment_number}</strong></td>
                  <td>{formatDate(apt.appointment_date)}</td>
                  <td><strong>{apt.time_slot}</strong></td>
                  <td>{apt.reason?.replace(/_/g, ' ')}</td>
                  <td>{apt.patient_name}</td>
                  <td><span className={`badge ${getStatusBadge(apt.status)}`}>{apt.status}</span></td>
                  <td className="actions-cell">
                    {view === 'upcoming' && (apt.status === 'pending' || apt.status === 'approved') && (
                      <button className="btn-sm" style={{ color: '#dc2626' }} onClick={() => setShowCancelModal(apt)} title="Cancel">
                        🗑️ Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <h3>Cancel Appointment</h3>
              <button className="modal-close" onClick={() => setShowCancelModal(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 12 }}>
                Cancel appointment <strong>{showCancelModal.appointment_number}</strong> on{' '}
                {formatDate(showCancelModal.appointment_date)} at {showCancelModal.time_slot}?
              </p>
              <div className="form-group">
                <label>Reason (optional)</label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  placeholder="Tell us why you're cancelling..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" style={{ background: '#dc2626' }} onClick={() => handleCancel(showCancelModal.id)} disabled={cancelLoading === showCancelModal.id}>
                {cancelLoading === showCancelModal.id ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
              <button className="btn-secondary" onClick={() => setShowCancelModal(null)}>Keep Appointment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
