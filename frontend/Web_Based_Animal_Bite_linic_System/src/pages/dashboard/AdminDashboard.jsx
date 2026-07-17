import { motion } from 'framer-motion';
import { Users, Calendar, CheckCircle, Package, AlertTriangle, FileBarChart, Shield, UserPlus, Database, Settings, Syringe, Stethoscope, Activity, UserCog, RefreshCw, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
import { useNetworkStatus } from '../../contexts/NetworkContext';
import { showSuccess } from '../../hooks/useToast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

export default function AdminDashboard() {
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
      const res = await api.get('/dashboard/admin/');
      setData(res.data);
    } catch (err) {
      if (!err?.offline) setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (!isOnline && !data) return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mb-4"><WifiOff className="w-8 h-8 text-orange-400" /></div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">No internet connection.</h3>
      <p className="text-sm text-slate-500 max-w-[300px] mb-6">Reconnect to continue using the system.</p>
      <button onClick={fetchDashboard} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-md"><RefreshCw className="w-4 h-4" />Retry</button>
    </div>
  );
  if (loading) return <Loader text="Loading admin dashboard..." />;
  if (error) return <div className="error-state">{error}</div>;
  if (!data) return null;

  const { overview, low_stock_items, monthly_statistics, recent_activities } = data;

  const statCards = [
    { title: 'Total Patients', value: overview.total_patients, icon: <Users className="w-5 h-5" />, color: '#3b82f6', subtitle: `+${overview.todays_patients} today`, onClick: () => navigate('/patients') },
    { title: 'Total Staff', value: overview.total_staff, icon: <UserCog className="w-5 h-5" />, color: '#06b6d4', subtitle: `${overview.total_admins} admin · ${overview.total_veterinarians} vets`, onClick: () => navigate('/users') },
    { title: "Today's Appointments", value: overview.todays_appointments, icon: <Calendar className="w-5 h-5" />, color: '#8b5cf6', onClick: () => navigate('/appointments/manage') },
    { title: 'Open Cases', value: overview.open_cases, icon: <Stethoscope className="w-5 h-5" />, color: '#ef4444', subtitle: `${overview.completed_cases} completed`, onClick: () => navigate('/cases') },
    { title: 'Completed Cases', value: overview.completed_cases, icon: <CheckCircle className="w-5 h-5" />, color: '#10b981', onClick: () => navigate('/cases') },
    { title: 'Vaccine Types', value: overview.total_vaccines, icon: <Syringe className="w-5 h-5" />, color: '#65a30d', onClick: () => navigate('/inventory') },
    { title: 'Low Stock Alerts', value: overview.low_stock_count, icon: <AlertTriangle className="w-5 h-5" />, color: overview.low_stock_count > 0 ? '#ef4444' : '#10b981', onClick: () => navigate('/inventory') },
    { title: 'Monthly Reports', value: 'View', icon: <FileBarChart className="w-5 h-5" />, color: '#f59e0b', subtitle: 'Analytics dashboard', onClick: () => navigate('/reports') },
  ];

  return (
    <motion.div className="dashboard" variants={containerVariants} initial="hidden" animate="visible">
      {/* Welcome banner */}
      <motion.div variants={itemVariants} className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white mb-6 shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold">Admin Dashboard</h2>
            <p className="text-blue-100 text-sm mt-1">Complete system oversight and management</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/users/new')} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"><UserPlus className="w-4 h-4" />Create User</button>
            <button onClick={() => navigate('/reports')} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"><FileBarChart className="w-4 h-4" />Reports</button>
          </div>
        </div>
      </motion.div>

      {/* Stats grid */}
      <div className="stats-grid">{statCards.map((card, i) => <motion.div key={i} variants={itemVariants}><StatCard {...card} /></motion.div>)}</div>

      <div className="dashboard-grid">
        {/* Monthly Statistics */}
        <motion.div className="card dashboard-card" variants={itemVariants}>
          <div className="card-header"><h3>Monthly Statistics</h3></div>
          <div className="card-body">
            <div className="monthly-stats">
              {monthly_statistics?.map((stat) => {
                const maxVal = Math.max(...monthly_statistics.map(s => Math.max(s.patients, s.cases, s.vaccinations)), 1);
                return (
                  <div key={stat.month} className="month-bar-group">
                    <div className="month-label">{stat.label?.split(' ')[0]?.slice(0, 3)}</div>
                    <div className="month-bars">
                      <div className="bar-container"><motion.div className="bar bar-patients" initial={{ height: 0 }} animate={{ height: `${(stat.patients / maxVal) * 100}%` }} transition={{ duration: 0.6, delay: 0.1 }} title={`Patients: ${stat.patients}`} /></div>
                      <div className="bar-container"><motion.div className="bar bar-cases" initial={{ height: 0 }} animate={{ height: `${(stat.cases / maxVal) * 100}%` }} transition={{ duration: 0.6, delay: 0.2 }} title={`Cases: ${stat.cases}`} /></div>
                      <div className="bar-container"><motion.div className="bar bar-vaccinations" initial={{ height: 0 }} animate={{ height: `${(stat.vaccinations / maxVal) * 100}%` }} transition={{ duration: 0.6, delay: 0.3 }} title={`Vax: ${stat.vaccinations}`} /></div>
                    </div>
                    <div className="month-count">{stat.patients}</div>
                  </div>
                );
              })}
            </div>
            <div className="chart-legend"><span><span className="dot dot-patients" /> Patients</span><span><span className="dot dot-cases" /> Cases</span><span><span className="dot dot-vaccinations" /> Vaccinations</span></div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div className="card dashboard-card" variants={itemVariants}>
          <div className="card-header"><h3>Recent Activity</h3><span className="text-xs text-slate-400">Last 10 actions</span></div>
          <div className="card-body">
            {recent_activities?.length > 0 ? (
              <div className="activity-list max-h-[340px] overflow-y-auto">
                {recent_activities.map((a) => (
                  <div key={a.id} className="activity-item px-0">
                    <div className="activity-icon text-base">
                      {a.action === 'login' && '🔑'} {a.action === 'create' && '➕'} {a.action === 'update' && '✏️'} {a.action === 'delete' && '🗑️'} {!['login', 'create', 'update', 'delete'].includes(a.action) && '📝'}
                    </div>
                    <div className="activity-content"><p className="activity-desc text-xs">{a.description}</p><span className="activity-meta text-[10px]">{a.user} · {new Date(a.timestamp).toLocaleString()}</span></div>
                  </div>
                ))}
              </div>
            ) : <div className="empty-state py-6"><p className="text-slate-400 text-sm">No recent activity</p></div>}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div className="card" variants={itemVariants}>
        <div className="card-header"><h3>Quick Actions</h3></div>
        <div className="card-body">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: 'Create User', icon: <UserPlus className="w-5 h-5" />, color: '#3b82f6', onClick: () => navigate('/users/new') },
              { label: 'Manage Users', icon: <UserCog className="w-5 h-5" />, color: '#06b6d4', onClick: () => navigate('/users') },
              { label: 'Manage Patients', icon: <Users className="w-5 h-5" />, color: '#10b981', onClick: () => navigate('/patients') },
              { label: 'Vaccine Inventory', icon: <Package className="w-5 h-5" />, color: '#f59e0b', onClick: () => navigate('/inventory') },
              { label: 'View Reports', icon: <FileBarChart className="w-5 h-5" />, color: '#8b5cf6', onClick: () => navigate('/reports') },
              { label: 'System Settings', icon: <Settings className="w-5 h-5" />, color: '#64748b', onClick: () => navigate('/profile') },
              { label: 'Audit Logs', icon: <Shield className="w-5 h-5" />, color: '#ef4444', onClick: () => navigate('/audit-logs') },
              { label: 'Backup DB', icon: <Database className="w-5 h-5" />, color: '#65a30d', onClick: () => showSuccess('Backup initiated') },
            ].map((action) => (
              <button key={action.label} onClick={action.onClick} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all text-left" style={{ '--hover-color': action.color }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${action.color}15`, color: action.color }}>{action.icon}</div>
                <span className="text-sm font-medium text-slate-700">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Low Stock */}
      {low_stock_items?.length > 0 && (
        <motion.div className="card" variants={itemVariants}>
          <div className="card-header"><h3>Low Stock Alerts</h3></div>
          <div className="card-body">
            {low_stock_items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                <span className="font-medium text-sm">{item.name}</span>
                <span className="text-sm text-red-600 font-semibold">{item.stock} / {item.threshold}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
