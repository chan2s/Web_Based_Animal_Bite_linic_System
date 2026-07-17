import { motion } from 'framer-motion';
import { Users, Calendar, Syringe, ClipboardList, Package, AlertTriangle, MessageSquare, Bell, UserPlus, RefreshCw, WifiOff, CheckCircle, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
import { useNetworkStatus } from '../../contexts/NetworkContext';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

export default function StaffDashboard() {
  const { isOnline } = useNetworkStatus();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => { if (isOnline) fetchDashboard(); }, [isOnline]);
  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/staff/');
      setData(res.data);
    } catch (err) {
      if (!err?.offline) setError('Failed to load dashboard data');
    } finally { setLoading(false); }
  };

  if (!isOnline && !data) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-4"><WifiOff className="w-8 h-8 text-orange-400" /></div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">No internet connection.</h3>
      <p className="text-sm text-slate-500 max-w-[300px] mb-6">Reconnect to continue using the system.</p>
      <button onClick={fetchDashboard} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md"><RefreshCw className="w-4 h-4" />Retry</button>
    </div>
  );
  if (loading) return <Loader text="Loading dashboard..." />;
  if (error) return <div className="error-state">{error}</div>;
  if (!data) return null;

  const { overview } = data;

  const statCards = [
    { title: "Today's Patients", value: overview.todays_patients, icon: <Users className="w-5 h-5" />, color: '#3b82f6', onClick: () => navigate('/patients') },
    { title: "Today's Appointments", value: overview.todays_appointments, icon: <Calendar className="w-5 h-5" />, color: '#06b6d4', subtitle: `${overview.pending_appointments} pending`, onClick: () => navigate('/appointments/manage') },
    { title: 'Checked In', value: overview.checked_in_patients, icon: <Users className="w-5 h-5" />, color: '#3b82f6', subtitle: 'Waiting for vet', onClick: () => navigate('/appointments/manage') },
    { title: 'Completed Today', value: overview.completed_today, icon: <CheckCircle className="w-5 h-5" />, color: '#10b981', onClick: () => navigate('/appointments/manage') },
    { title: 'Cancelled / No-Show', value: overview.cancelled_today, icon: <XCircle className="w-5 h-5" />, color: '#ef4444', onClick: () => navigate('/appointments/manage') },
    { title: 'Low Stock Items', value: overview.low_stock_count, icon: <AlertTriangle className="w-5 h-5" />, color: overview.low_stock_count > 0 ? '#ef4444' : '#10b981', onClick: () => navigate('/inventory') },
  ];

  return (
    <motion.div className="dashboard" variants={containerVariants} initial="hidden" animate="visible">
      {/* Welcome */}
      <motion.div variants={itemVariants} className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white mb-6 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div><h2 className="text-xl font-bold">Staff Dashboard</h2><p className="text-emerald-100 text-sm mt-1">Your daily clinic operations overview</p></div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/patients/new')} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"><UserPlus className="w-4 h-4" />Register Patient</button>
            <button onClick={() => navigate('/appointments/book')} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"><Calendar className="w-4 h-4" />Book Appointment</button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="stats-grid">{statCards.map((card, i) => <motion.div key={i} variants={itemVariants}><StatCard {...card} /></motion.div>)}</div>

      {/* Quick Actions */}
      <motion.div className="card" variants={itemVariants}>
        <div className="card-header"><h3>Quick Actions</h3></div>
        <div className="card-body">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Register Patient', icon: <UserPlus className="w-5 h-5" />, color: '#3b82f6', onClick: () => navigate('/patients/new') },
              { label: 'Book Appointment', icon: <Calendar className="w-5 h-5" />, color: '#06b6d4', onClick: () => navigate('/appointments/book') },
              { label: 'Record Vaccination', icon: <Syringe className="w-5 h-5" />, color: '#10b981', onClick: () => navigate('/vaccinations/new') },
              { label: 'View Patients', icon: <Users className="w-5 h-5" />, color: '#8b5cf6', onClick: () => navigate('/patients') },
              { label: 'Inventory', icon: <Package className="w-5 h-5" />, color: '#f59e0b', onClick: () => navigate('/inventory') },
              { label: 'Messages', icon: <MessageSquare className="w-5 h-5" />, color: '#ef4444', onClick: () => navigate('/chat') },
            ].map((action) => (
              <button key={action.label} onClick={action.onClick} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all text-left">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${action.color}15`, color: action.color }}>{action.icon}</div>
                <span className="text-sm font-medium text-slate-700">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
