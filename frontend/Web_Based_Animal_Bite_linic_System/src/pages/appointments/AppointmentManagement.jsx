import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { appointmentAPI, inventoryAPI } from '../../api/axios';
import Loader from '../../components/common/Loader';
import AppointmentProgressTracker from '../../components/appointments/AppointmentProgressTracker';
import { Search, Calendar, Check, X, UserCheck, Stethoscope, Syringe, Eye, Ban, Award, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('today');
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [vaccinatingId, setVaccinatingId] = useState(null);
  const [vaxForm, setVaxForm] = useState({ vaccine: '', dose_number: 1, dose_type: 'first', batch_number: '', injection_site: '', administration_route: 'im', notes: '' });
  const [vaccines, setVaccines] = useState([]);

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      let params = {};
      if (filter === 'all') params = {};
      else if (filter === 'today') params = { appointment_date: new Date().toISOString().split('T')[0] };
      else params = { status: filter };
      
      if (search) params.search = search;
      const response = await appointmentAPI.list(params);
      setAppointments(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load vaccines for the vaccination form
  useEffect(() => {
    if (vaccinatingId) {
      inventoryAPI.vaccines({ is_active: true }).then(res => {
        setVaccines(res.data.results || res.data || []);
      }).catch(() => {});
      setVaxForm({ vaccine: '', dose_number: 1, dose_type: 'first', batch_number: '', injection_site: '', administration_route: 'im', notes: '' });
    }
  }, [vaccinatingId]);

  const handleAdministerVaccine = async (apt) => {
    if (!vaxForm.vaccine) {
      toast.error('Please select a vaccine.');
      return;
    }
    const payload = {
      vaccine: vaxForm.vaccine,
      dose_number: parseInt(vaxForm.dose_number),
      dose_type: vaxForm.dose_type,
      batch_number: vaxForm.batch_number,
      injection_site: vaxForm.injection_site,
      administration_route: vaxForm.administration_route,
      notes: vaxForm.notes,
      administered_date: new Date().toISOString().split('T')[0],
      scheduled_date: new Date().toISOString().split('T')[0],
      send_to_observation: false,
    };
    await doAction(`Administering vaccine for ${apt.patient_name}`, () => appointmentAPI.administerVaccination(apt.id, payload));
    setVaccinatingId(null);
  };

  const doAction = async (label, apiCall) => {
    setActionLoading(label);
    try {
      const res = await apiCall();
      toast.success(res.data?.message || `${label} successful`);
      fetchAppointments();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || err.response?.data?.message || `${label} failed`;
      toast.error(msg);
      console.error(`${label} failed:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: 'badge-warning',
      approved: 'badge-success',
      checked_in: 'badge-info',
      under_consultation: 'badge-primary',
      vaccination_ongoing: 'badge-info',
      observation: 'badge-warning',
      completed: 'badge-success',
      cancelled: 'badge-danger',
      rejected: 'badge-danger',
      no_show: 'badge-danger',
      rescheduled: 'badge-secondary',
    };
    return map[status] || 'badge-secondary';
  };

  const statusLabel = (status) => {
    const labels = {
      pending: 'Pending', approved: 'Approved', checked_in: 'Checked In',
      under_consultation: 'In Consultation', vaccination_ongoing: 'Vaccinating',
      observation: 'Observing', completed: 'Completed', cancelled: 'Cancelled',
      rejected: 'Rejected', no_show: 'No Show', rescheduled: 'Rescheduled',
    };
    return labels[status] || status;
  };

  const filters = ['today', 'all', 'pending', 'approved', 'checked_in', 'under_consultation', 'completed', 'cancelled'];

  const renderActions = (apt) => {
    const isPending = actionLoading?.includes(apt.id);
    const btnClass = (color) => `btn-sm ${color} disabled:opacity-50 disabled:cursor-not-allowed`;

    switch (apt.status) {
      case 'pending':
        return (
          <div className="flex gap-1">
            <button className={btnClass('text-emerald-600 hover:bg-emerald-50')}
              onClick={() => doAction(`Approving ${apt.appointment_number}`, () => appointmentAPI.approve(apt.id))}
              disabled={!!actionLoading} title="Approve">
              <Check className="w-3.5 h-3.5" />
            </button>
            <button className={btnClass('text-red-600 hover:bg-red-50')}
              onClick={() => doAction(`Rejecting ${apt.appointment_number}`, () => appointmentAPI.reject(apt.id, ''))}
              disabled={!!actionLoading} title="Reject">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      case 'approved':
        return (
          <button className="btn-sm text-blue-600 hover:bg-blue-50 flex items-center gap-1"
            onClick={() => doAction(`Checking in ${apt.patient_name}`, () => appointmentAPI.checkIn(apt.id))}
            disabled={!!actionLoading} title="Check In">
            <UserCheck className="w-3.5 h-3.5" />
            <span className="text-[11px]">Check In</span>
          </button>
        );
      case 'checked_in':
        return (
          <button className="btn-sm text-purple-600 hover:bg-purple-50 flex items-center gap-1"
            onClick={() => doAction(`Starting consultation`, () => appointmentAPI.startConsultation(apt.id))}
            disabled={!!actionLoading} title="Start Consultation">
            <Stethoscope className="w-3.5 h-3.5" />
            <span className="text-[11px]">Consult</span>
          </button>
        );
      case 'under_consultation':
        return (
          <div className="flex gap-1">
            <button className="btn-sm text-cyan-600 hover:bg-cyan-50 flex items-center gap-1"
              onClick={() => doAction(`Starting vaccination`, () => appointmentAPI.startVaccination(apt.id))}
              disabled={!!actionLoading} title="Start Vaccination">
              <Syringe className="w-3.5 h-3.5" />
              <span className="text-[11px]">Vaccinate</span>
            </button>
            <button className="btn-sm text-amber-600 hover:bg-amber-50 flex items-center gap-1"
              onClick={() => doAction(`Starting observation`, () => appointmentAPI.startObservation(apt.id, {}))}
              disabled={!!actionLoading} title="Send to Observation">
              <Eye className="w-3.5 h-3.5" />
              <span className="text-[11px]">Observe</span>
            </button>
          </div>
        );
      case 'vaccination_ongoing':
        return (
          <div className="flex gap-1">
            {vaccinatingId === apt.id ? (
              <div className="flex items-center gap-1">
                <select
                  className="text-[10px] border border-slate-200 rounded px-1 py-0.5 w-20"
                  value={vaxForm.vaccine}
                  onChange={(e) => setVaxForm(f => ({ ...f, vaccine: e.target.value }))}
                >
                  <option value="">Select vaccine</option>
                  {vaccines.map(v => (
                    <option key={v.id} value={v.id}>{v.name}</option>
                  ))}
                </select>
                <input
                  className="text-[10px] border border-slate-200 rounded px-1 py-0.5 w-14"
                  type="number" min="1" value={vaxForm.dose_number}
                  onChange={(e) => setVaxForm(f => ({ ...f, dose_number: e.target.value }))}
                  placeholder="Dose"
                />
                <button className="btn-sm text-emerald-600 hover:bg-emerald-50"
                  onClick={() => handleAdministerVaccine(apt)} disabled={!!actionLoading} title="Save">
                  <Save className="w-3.5 h-3.5" />
                </button>
                <button className="btn-sm text-red-400 hover:bg-red-50"
                  onClick={() => setVaccinatingId(null)} title="Cancel">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button className="btn-sm text-cyan-600 hover:bg-cyan-50 flex items-center gap-1"
                onClick={() => setVaccinatingId(apt.id)} disabled={!!actionLoading} title="Record Vaccination">
                <Syringe className="w-3.5 h-3.5" />
                <span className="text-[11px]">Record</span>
              </button>
            )}
            <button className="btn-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-1"
              onClick={() => doAction(`Completing treatment`, () => appointmentAPI.complete(apt.id))}
              disabled={!!actionLoading} title="Complete Treatment">
              <Award className="w-3.5 h-3.5" />
              <span className="text-[11px]">Done</span>
            </button>
          </div>
        );
      case 'observation':
        return (
          <button className="btn-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-1"
            onClick={() => doAction(`Completing treatment`, () => appointmentAPI.complete(apt.id))}
            disabled={!!actionLoading} title="Complete Treatment">
            <Award className="w-3.5 h-3.5" />
            <span className="text-[11px]">Complete</span>
          </button>
        );
      default:
        return <span className="text-xs text-slate-400">—</span>;
    }
  };

  const filtersConfig = [
    { key: 'today', label: "Today's" },
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'checked_in', label: 'Checked In' },
    { key: 'under_consultation', label: 'In Consult' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

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
          <p>Full clinic appointment lifecycle management</p>
        </div>
        <button onClick={fetchAppointments} className="btn-secondary flex items-center gap-2">
          <Search className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap mb-5">
        <div className="tabs">
          {filtersConfig.map((f) => (
            <button
              key={f.key}
              className={`tab ${filter === f.key ? 'active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); fetchAppointments(); }} className="search-form ml-auto">
          <input
            type="text"
            placeholder="Search patients..."
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
          <button onClick={fetchAppointments} className="btn-primary mt-4">Refresh</button>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Appt #</th>
                <th>Patient</th>
                <th>Date / Time</th>
                <th>Reason</th>
                <th>Progress</th>
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
                  <td className="font-mono font-medium text-xs">{apt.appointment_number}</td>
                  <td className="font-medium">{apt.patient_name}</td>
                  <td>
                    <div className="text-sm">{formatDate(apt.appointment_date)}</div>
                    <div className="text-xs text-slate-400">{apt.time_slot}</div>
                  </td>
                  <td className="capitalize text-sm">{apt.reason?.replace(/_/g, ' ') || '—'}</td>
                  <td className="min-w-[200px]">
                    <AppointmentProgressTracker currentStatus={apt.status} showLabels={false} size="sm" />
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(apt.status)}`}>
                      {statusLabel(apt.status)}
                    </span>
                  </td>
                  <td className="actions-cell">
                    {renderActions(apt)}
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
