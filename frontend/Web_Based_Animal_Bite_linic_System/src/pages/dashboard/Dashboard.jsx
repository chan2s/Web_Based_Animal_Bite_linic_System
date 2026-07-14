import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';

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

  return (
    <div className="dashboard">
      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Patients"
          value={overview.total_patients}
          icon="👥"
          color="#4f46e5"
          subtitle={`+${overview.patients_this_month} this month`}
          onClick={() => navigate('/patients')}
        />
        <StatCard
          title="Today's Patients"
          value={overview.todays_patients}
          icon="📅"
          color="#0891b2"
          onClick={() => navigate('/patients')}
        />
        <StatCard
          title="Open Cases"
          value={overview.open_cases}
          icon="🩺"
          color="#dc2626"
          subtitle={`${overview.ongoing_cases} ongoing`}
          onClick={() => navigate('/cases')}
        />
        <StatCard
          title="Completed Cases"
          value={overview.completed_cases}
          icon="✅"
          color="#16a34a"
          subtitle={`${overview.total_cases} total`}
          onClick={() => navigate('/cases')}
        />
        <StatCard
          title="Today's Vaccinations"
          value={overview.todays_vaccinations}
          icon="💉"
          color="#9333ea"
          subtitle={`${overview.todays_scheduled_vaccinations} scheduled`}
          onClick={() => navigate('/vaccinations')}
        />
        <StatCard
          title="Upcoming Follow-ups"
          value={overview.upcoming_followups}
          icon="📋"
          color="#ea580c"
          onClick={() => navigate('/vaccinations')}
        />
        <StatCard
          title="Vaccine Types"
          value={overview.total_vaccines}
          icon="📦"
          color="#65a30d"
          onClick={() => navigate('/inventory')}
        />
        <StatCard
          title="Low Stock Items"
          value={overview.low_stock_count}
          icon="⚠️"
          color={overview.low_stock_count > 0 ? '#dc2626' : '#16a34a'}
          subtitle={overview.low_stock_count > 0 ? 'Needs attention' : 'All stocked'}
          onClick={() => navigate('/inventory')}
        />
      </div>

      <div className="dashboard-grid">
        {/* Monthly Statistics */}
        <div className="card dashboard-card">
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
                      <div
                        className="bar bar-patients"
                        style={{ height: `${Math.min((stat.patients / Math.max(...monthly_statistics.map(s => Math.max(s.patients, s.cases, s.vaccinations)), 1)) * 100, 100)}%` }}
                        title={`Patients: ${stat.patients}`}
                      />
                    </div>
                    <div className="bar-container">
                      <div
                        className="bar bar-cases"
                        style={{ height: `${Math.min((stat.cases / Math.max(...monthly_statistics.map(s => Math.max(s.patients, s.cases, s.vaccinations)), 1)) * 100, 100)}%` }}
                        title={`Cases: ${stat.cases}`}
                      />
                    </div>
                    <div className="bar-container">
                      <div
                        className="bar bar-vaccinations"
                        style={{ height: `${Math.min((stat.vaccinations / Math.max(...monthly_statistics.map(s => Math.max(s.patients, s.cases, s.vaccinations)), 1)) * 100, 100)}%` }}
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
        </div>

        {/* Case Distribution */}
        <div className="card dashboard-card">
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
                    <div
                      className="dist-bar"
                      style={{
                        width: `${(cat.count / Math.max(...category_distribution.map(c => c.count), 1)) * 100}%`,
                        backgroundColor: cat.bite_category === 'I' ? '#16a34a' : cat.bite_category === 'II' ? '#ea580c' : '#dc2626'
                      }}
                    />
                  </div>
                  <span className="dist-count">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Low Stock Alerts */}
        <div className="card dashboard-card">
          <div className="card-header">
            <h3>⚠️ Low Stock Alerts</h3>
          </div>
          <div className="card-body">
            {low_stock_items?.length > 0 ? (
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
                      <td>{item.name}</td>
                      <td>{item.stock}</td>
                      <td>{item.threshold}</td>
                      <td><span className="badge badge-danger">Low Stock</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="empty-state">No low stock items ✓</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card dashboard-card">
          <div className="card-header">
            <h3>Recent Activity</h3>
          </div>
          <div className="card-body">
            <div className="activity-list">
              {recent_activities?.slice(0, 8).map((activity) => (
                <div key={activity.id} className="activity-item">
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
                </div>
              ))}
              {(!recent_activities || recent_activities.length === 0) && (
                <p className="empty-state">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Follow-ups */}
      {upcoming_followups?.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3>📋 Upcoming Follow-ups</h3>
          </div>
          <div className="card-body">
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
                    <td>{fu.patient_name}</td>
                    <td>{fu.dose}</td>
                    <td>{new Date(fu.date).toLocaleDateString()}</td>
                    <td>{fu.case_number || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
