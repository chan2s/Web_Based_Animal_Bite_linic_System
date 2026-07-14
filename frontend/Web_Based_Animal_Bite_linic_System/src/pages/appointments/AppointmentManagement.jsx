import { useState, useEffect } from 'react';
import { appointmentAPI } from '../../api/axios';
import Loader from '../../components/common/Loader';

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRescheduleModal, setShowRescheduleModal] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, dateFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (dateFilter) params.appointment_date = dateFilter;
      const res = await appointmentAPI.staffList(params);
      setAppointments(res.data.results || res.data || []);
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAppointments();
  };

  const handleAction = async (id, action, data = {}) => {
    setActionLoading(id);
    setError('');
    setSuccessMsg('');
    try {
      if (action === 'approve') await appointmentAPI.approve(id);
      else if (action === 'reject') await appointmentAPI.reject(id, data);
      else if (action === 'complete') await appointmentAPI.complete(id);
      else if (action === 'cancel') await appointmentAPI.cancel(id, data);
      
      setSuccessMsg(`Appointment ${action}d successfully!`);
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.error || `Failed to ${action} appointment.`);
    } finally {
      setActionLoading(null);
    }
  };

  const openReschedule = async (apt) => {
    setShowRescheduleModal(apt);
    setNewDate(apt.appointment_date);
    setNewTime(apt.time_slot);
    setError('');
    await loadSlots(apt.appointment_date);
  };

  const loadSlots = async (date) => {
    if (!date) return;
    setSlotsLoading(true);
    try {
      const res = await appointmentAPI.availableSlots(date);
      setAvailableSlots(res.data.slots || []);
    } catch (err) {
      console.error('Failed to load slots:', err);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleDateChangeForReschedule = async (date) => {
    setNewDate(date);
    setNewTime('');
    await loadSlots(date);
  };

  const handleReschedule = async () => {
    if (!newDate || !newTime) {
      setError('Please select a new date and time.');
      return;
    }
    setActionLoading('reschedule');
    setError('');
    try {
      await appointmentAPI.update(showRescheduleModal.id, {
        appointment_date: newDate,
        time_slot: newTime,
      });
      setSuccessMsg('Appointment rescheduled successfully!');
      setShowRescheduleModal(null);
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchAppointments();
    } catch (err) {
      const data = err.response?.data;
      setError(data ? Object.values(data).flat().join(', ') : 'Failed to reschedule.');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
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

  return (
    <div className="page-container">
      {successMsg && <div className="alert alert-success" style={{ marginBottom: 16 }}>✅ {successMsg}</div>}
      {error && <div className="error-message" style={{ marginBottom: 16 }}>⚠️ {error}</div>}

      <div className="page-header">
        <div className="header-actions">
          <form onSubmit={handleSearch} className="search-form">
            <input type="text" placeholder="Search patients, numbers..." value={search} onChange={(e) => setSearch(e.target.value)} className="search-input" />
            <button type="submit" className="btn-search">🔍</button>
          </form>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="filter-select" style={{ width: 160 }} />
          <button className="btn-secondary" onClick={fetchAppointments}>🔄 Refresh</button>
        </div>
      </div>

      {loading ? (
        <Loader text="Loading appointments..." />
      ) : appointments.length === 0 ? (
        <div className="empty-state"><div className="empty-icon">📅</div><h3>No Appointments Found</h3></div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Patient</th>
                <th>Phone</th>
                <th>Date</th>
                <th>Time</th>
                <th>Reason</th>
                <th>Booked By</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt.id}>
                  <td><strong>{apt.appointment_number}</strong></td>
                  <td>{apt.patient_name}</td>
                  <td>{apt.patient_phone}</td>
                  <td>{formatDate(apt.appointment_date)}</td>
                  <td><strong>{apt.time_slot}</strong></td>
                  <td>{apt.reason?.replace(/_/g, ' ')}</td>
                  <td>{apt.booked_by_name || '—'}</td>
                  <td><span className={`badge ${getStatusBadge(apt.status)}`}>{apt.status}</span></td>
                  <td className="actions-cell" style={{ flexWrap: 'wrap' }}>
                    {apt.status === 'pending' && (
                      <>
                        <button className="btn-sm" style={{ color: '#16a34a' }} onClick={() => handleAction(apt.id, 'approve')} disabled={actionLoading === apt.id}>✅ Approve</button>
                        <button className="btn-sm" style={{ color: '#dc2626' }} onClick={() => setShowRejectModal(apt)} disabled={actionLoading === apt.id}>❌ Reject</button>
                      </>
                    )}
                    {apt.status === 'approved' && (
                      <>
                        <button className="btn-sm" style={{ color: '#16a34a' }} onClick={() => handleAction(apt.id, 'complete')} disabled={actionLoading === apt.id}>✅ Complete</button>
                        <button className="btn-sm" style={{ color: '#0891b2' }} onClick={() => openReschedule(apt)} disabled={actionLoading === apt.id}>🔄 Reschedule</button>
                        <button className="btn-sm" style={{ color: '#dc2626' }} onClick={() => handleAction(apt.id, 'cancel', { reason: 'Cancelled by staff' })} disabled={actionLoading === apt.id}>🗑️ Cancel</button>
                      </>
                    )}
                    {apt.status === 'completed' && <span className="badge badge-primary">Done</span>}
                    {apt.status === 'cancelled' && <span className="badge badge-danger">Cancelled</span>}
                    {apt.status === 'rejected' && <span className="badge badge-danger">Rejected</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay" onClick={() => setShowRejectModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header"><h3>Reject Appointment</h3><button className="modal-close" onClick={() => setShowRejectModal(null)}>✕</button></div>
            <div className="modal-body">
              <p style={{ marginBottom: 12 }}>Reject appointment <strong>{showRejectModal.appointment_number}</strong>?</p>
              <div className="form-group">
                <label>Reason *</label>
                <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} placeholder="Why is this being rejected?" required />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-primary" style={{ background: '#dc2626' }} onClick={async () => { await handleAction(showRejectModal.id, 'reject', { reason: rejectReason }); setShowRejectModal(null); setRejectReason(''); }} disabled={!rejectReason.trim()}>Reject</button>
              <button className="btn-secondary" onClick={() => setShowRejectModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="modal-overlay" onClick={() => setShowRescheduleModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header"><h3>Reschedule Appointment</h3><button className="modal-close" onClick={() => setShowRescheduleModal(null)}>✕</button></div>
            <div className="modal-body">
              <p style={{ marginBottom: 16, fontSize: 14, color: '#64748b' }}>
                Reschedule <strong>{showRescheduleModal.appointment_number}</strong> for {showRescheduleModal.patient_name}
              </p>
              <div className="form-row">
                <div className="form-group">
                  <label>New Date</label>
                  <input type="date" value={newDate} onChange={(e) => handleDateChangeForReschedule(e.target.value)} min={new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              {newDate && (
                <div className="form-group">
                  <label>New Time Slot</label>
                  {slotsLoading ? <Loader size={20} text="Checking..." /> : (
                    <div className="time-slots-grid" style={{ maxHeight: 200, overflowY: 'auto' }}>
                      {availableSlots.filter(s => s.available || s.time === showRescheduleModal.time_slot).map(slot => (
                        <button key={slot.time} type="button" className={`time-slot-btn ${newTime === slot.time ? 'selected' : ''} ${!slot.available ? 'disabled' : ''}`}
                          onClick={() => slot.available && setNewTime(slot.time)} disabled={!slot.available && slot.time !== showRescheduleModal.time_slot}>
                          <span className="slot-time">{slot.time}</span>
                          <span className={`slot-status ${slot.available ? 'available' : 'full'}`}>{slot.available ? 'Available' : 'Current'}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-primary" onClick={handleReschedule} disabled={!newDate || !newTime || actionLoading === 'reschedule'}>
                {actionLoading === 'reschedule' ? 'Saving...' : 'Save Changes'}
              </button>
              <button className="btn-secondary" onClick={() => setShowRescheduleModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
