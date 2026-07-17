import { motion } from 'framer-motion';
import { Stethoscope, Users, Calendar, Syringe, CheckCircle, Activity, MessageSquare, FileText, RefreshCw, WifiOff } from 'lucide-react';
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

export default function VeterinarianDashboard() {
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
      const res = await api.get('/dashboard/veterinarian/');
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
  if (loading) return <Loader text="Loading clinical dashboard..." />;
  if (error) return <div className="error-state">{error}</div>;
  if (!data) return null;

  const { overview } = data;

  const statCards = [
    { title: 'Assigned Patients', value: overview.assigned_patients, icon: <Users className="w-5 h-5" />, color: '#3b82f6', onClick: () => navigate('/patients') },
    { title: 'Active Cases', value: overview.active_cases, icon: <Activity className="w-5 h-5" />, color: '#ef4444', subtitle: 'Requires attention', onClick: () => navigate('/cases') },
    { title: "Today's Consultations", value: overview.today_consultations, icon: <Calendar className="w-5 h-5" />, color: '#06b6d4', onClick: () => navigate('/appointments/manage') },
    { title: 'Ongoing Treatments', value: overview.active_cases, icon: <Stethoscope className="w-5 h-5" />, color: '#f59e0b', onClick: () => navigate('/cases') },
    { title: 'Completed Treatments', value: overview.completed_cases, icon: <CheckCircle className="w-5 h-5" />, color: '#10b981', onClick: () => navigate('/cases') },
    { title: 'Vaccinations Completed', value: overview.vaccinations_completed, icon: <Syringe className="w-5 h-5" />, color: '#8b5cf6', onClick: () => navigate('/vaccinations') },
  ];

  return (
    <motion.div className="dashboard" variants={containerVariants} initial="hidden" animate="visible">
      {/* Welcome */}
      <motion.div variants={itemVariants} className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-6 text-white mb-6 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div><h2 className="text-xl font-bold">Veterinarian Dashboard</h2><p className="text-violet-100 text-sm mt-1">Patient care and treatment management</p></div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/cases')} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"><Stethoscope className="w-4 h-4" />View Cases</button>
            <button onClick={() => navigate('/cases/new')} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"><FileText className="w-4 h-4" />New Case</button>
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
              { label: 'Open Patient Record', icon: <FileText className="w-5 h-5" />, color: '#3b82f6', onClick: () => navigate('/patients') },
              { label: 'Add Medical Notes', icon: <FileText className="w-5 h-5" />, color: '#06b6d4', onClick: () => navigate('/cases') },
              { label: 'Record Treatment', icon: <Activity className="w-5 h-5" />, color: '#10b981', onClick: () => navigate('/cases/new') },
              { label: 'Update Vaccination', icon: <Syringe className="w-5 h-5" />, color: '#8b5cf6', onClick: () => navigate('/vaccinations/new') },
              { label: 'Complete Case', icon: <CheckCircle className="w-5 h-5" />, color: '#f59e0b', onClick: () => navigate('/cases') },
              { label: 'Chat with Staff', icon: <MessageSquare className="w-5 h-5" />, color: '#ef4444', onClick: () => navigate('/chat') },
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
