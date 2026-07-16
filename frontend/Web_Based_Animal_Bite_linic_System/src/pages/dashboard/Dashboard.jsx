import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { dashboardAPI } from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
import { Users, Calendar, Stethoscope, CheckCircle, Syringe, ClipboardList, Package, AlertTriangle } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.stats();
      setData(response.data);
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader text="Loading dashboard..." />;
  if (error) return <div className="error-state">{error}</div>;
  if (!data) return null;

  const { overview, category_distribution, low_stock_items, upcoming_followups, monthly_statistics, recent_activities } = data;

  const statCards = [
    { title: 'Total Patients', value: overview.total_patients, icon: <Users className="w-5 h-5" />, color: '#3b82f6', subtitle: `+${overview.patients_this_month} this month`, onClick: () => navigate('/patients') },
    { title: "Today's Patients", value: overview.todays_patients, icon: <Calendar className="w-5 h-5" />, color: '#06b6d4', onClick: () => navigate('/patients') },
    { title: 'Open Cases', value: overview.open_cases, icon: <Stethoscope className="w-5 h-5" />, color: '#ef4444', subtitle: `${overview.ongoing_cases} ongoing`, onClick: () => navigate('/cases') },
    { title: 'Completed Cases', value: overview.completed_cases, icon: <CheckCircle className="w-5 h-5" />, color: '#10b981', subtitle: `${overview.total_cases} total`, onClick: () => navigate('/cases') },
    { title: "Today's Vaccinations", value: overview.todays_vaccinations, icon: <Syringe className="w-5 h-5" />, color: '#8b5cf6', subtitle: `${overview.todays_scheduled_vaccinations} scheduled`, onClick: () => navigate('/vaccinations') },
    { title: 'Upcoming Follow-ups', value: overview.upcoming_followups, icon: <ClipboardList className="w-5 h-5" />, color: '#f59e0b', onClick: () => navigate('/vaccinations') },
    { title: 'Vaccine Types', value: overview.total_vaccines, icon: <Package className="w-5 h-5" />, color: '#65a30d', onClick: () => navigate('/inventory') },
    { title: 'Low Stock Items', value: overview.low_stock_count, icon: <AlertTriangle className="w-5 h-5" />, color: overview.low_stock_count > 0 ? '#ef4444' : '#10b981', subtitle: overview.low_stock_count > 0 ? 'Needs attention' : 'All stocked', onClick: () => navigate('/inventory') },
  ];

  return (
    <motion.div
      className="dashboard"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Stats Cards */}
      <div className="stats-grid">
        {statCards.map((card, i) => (
          <motion.div key={i} variants={itemVariants}>
            <StatCard {...card} />
          </motion.div>
        ))}
      </div>

      <div className="dashboard-grid">
        {/* Monthly Statistics */}
        <motion.div className="card dashboard-card" variants={itemVariants}>
          <div className="card-header">
            <h3>Monthly Statistics</h3>
          </div>
          <div className="card-body">
            <div className="monthly-stats">
              {monthly_statistics?.map((stat) => (
                <div key={stat.month} className="month-bar-group">
                  <div className="month-label">{stat.label?.split(' ')[0]?.slice(0, 3)}</div>
                  <div className="month-bars">
                    <div className="bar-container">
                      <motion.div
                        className="bar bar-patients"
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.min((stat.patients / Math.max(...monthly_statistics.map(s => Math.max(s.patients, s.cases, s.vaccinations)), 1)) * 100, 100)}%` }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        title={`Patients: ${stat.patients}`}
                      />
                    </div>
                    <div className="bar-container">
                      <motion.div
                        className="bar bar-cases"
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.min((stat.cases / Math.max(...monthly_statistics.map(s => Math.max(s.patients, s.cases, s.vaccinations)), 1)) * 100, 100)}%` }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        title={`Cases: ${stat.cases}`}
                      />
                    </div>
                    <div className="bar-container">
                      <motion.div
                        className="bar bar-vaccinations"
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.min((stat.vaccinations / Math.max(...monthly_statistics.map(s => Math.max(s.patients, s.cases, s.vaccinations)), 1)) * 100, 100)}%` }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        title={`Vaccinations: ${stat.vaccinations}`}
                      />
                    </div>
                  </div>
                  <div className="month-count">{stat.patients}</div>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <span><span className="dot dot-patients"></span> Patients</span>
              <span><span className="dot dot-cases"></span> Cases</span>
              <span><span className="dot dot-vaccinations"></span> Vaccinations</span>
            </div>
          </div>
        </motion.div>

        {/* Case Distribution */}
        <motion.div className="card dashboard-card" variants={itemVariants}>
          <div className="card-header">
            <h3>Cases by Category</h3>
          </div>
          <div className="card-body">
            <div className="distribution-list">
              {category_distribution?.map((cat) => (
                <div key={cat.bite_category} className="distribution-item">
                  <div className="dist-label">
                    <span className="dist-category">Category {cat.bite_category}</span>
                  </div>
                  <div className="dist-bar-bg">
                    <motion.div
                      className="dist-bar"
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(cat.count / Math.max(...category_distribution.map(c => c.count), 1)) * 100}%`,
                      }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      style={{
                        backgroundColor: cat.bite_category === 'I' ? '#10b981' : cat.bite_category === 'II' ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                  <span className="dist-count">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="dashboard-grid">
        {/* Low Stock Alerts */}
        <motion.div className="card dashboard-card" variants={itemVariants}>
          <div className="card-header">
            <h3>Low Stock Alerts</h3>
          </div>
          <div className="card-body">
            {low_stock_items?.length > 0 ? (
              <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Vaccine</th>
                      <th>Current Stock</th>
                      <th>Threshold</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {low_stock_items.map((item) => (
                      <tr key={item.id}>
                        <td className="font-medium">{item.name}</td>
                        <td>{item.stock}</td>
                        <td>{item.threshold}</td>
                        <td><span className="badge badge-danger">Low Stock</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <div className="empty-icon" style={{ fontSize: 32 }}>✓</div>
                <p style={{ color: '#10b981', fontWeight: 500 }}>All items are well-stocked</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div className="card dashboard-card" variants={itemVariants}>
          <div className="card-header">
            <h3>Recent Activity</h3>
          </div>
          <div className="card-body">
            <div className="activity-list">
              {recent_activities?.slice(0, 8).map((activity) => (
                <motion.div
                  key={activity.id}
                  className="activity-item"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="activity-icon">
                    {activity.action === 'login' && '🔑'}
                    {activity.action === 'create' && '➕'}
                    {activity.action === 'update' && '✏️'}
                    {activity.action === 'delete' && '🗑️'}
                    {!['login', 'create', 'update', 'delete'].includes(activity.action) && '📝'}
                  </div>
                  <div className="activity-content">
                    <p className="activity-desc">{activity.description}</p>
                    <span className="activity-meta">
                      {activity.user} · {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              ))}
              {(!recent_activities || recent_activities.length === 0) && (
                <div className="empty-state" style={{ padding: '24px 0' }}>
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Upcoming Follow-ups */}
      {upcoming_followups?.length > 0 && (
        <motion.div className="card" variants={itemVariants}>
          <div className="card-header">
            <h3>Upcoming Follow-ups</h3>
          </div>
          <div className="card-body">
            <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Dose</th>
                    <th>Scheduled Date</th>
                    <th>Case</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming_followups.map((fu) => (
                    <tr key={fu.id}>
                      <td className="font-medium">{fu.patient_name}</td>
                      <td>{fu.dose}</td>
                      <td>{new Date(fu.date).toLocaleDateString()}</td>
                      <td className="text-slate-500">{fu.case_number || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
