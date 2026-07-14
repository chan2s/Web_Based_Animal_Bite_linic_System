import { useState, useEffect } from 'react';
import { reportAPI } from '../../api/axios';
import Loader from '../../components/common/Loader';

export default function Reports() {
  const [activeReport, setActiveReport] = useState('daily');
  const [period, setPeriod] = useState('monthly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReport();
  }, [activeReport, period]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError('');
      let response;
      const params = { period };
      if (period === 'custom' && startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      }

      switch (activeReport) {
        case 'daily':
          response = await reportAPI.daily();
          break;
        case 'summary':
          response = await reportAPI.summary();
          break;
        case 'patients':
          response = await reportAPI.patients(params);
          break;
        case 'cases':
          response = await reportAPI.cases(params);
          break;
        case 'vaccinations':
          response = await reportAPI.vaccinations(params);
          break;
        case 'inventory':
          response = await reportAPI.inventory();
          break;
        default:
          response = await reportAPI.daily();
      }
      setData(response.data);
    } catch (err) {
      setError('Failed to load report data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reportTypes = [
    { id: 'daily', label: 'Daily', icon: '📅' },
    { id: 'summary', label: 'Summary', icon: '📊' },
    { id: 'patients', label: 'Patients', icon: '👥' },
    { id: 'cases', label: 'Cases', icon: '🩺' },
    { id: 'vaccinations', label: 'Vaccinations', icon: '💉' },
    { id: 'inventory', label: 'Inventory', icon: '📦' },
  ];

  const renderDailyReport = () => {
    if (!data) return null;
    return (
      <div className="report-content">
        <div className="stats-grid">
          <div className="stat-card"><h3>{data.new_patients}</h3><p>New Patients Today</p></div>
          <div className="stat-card"><h3>{data.new_cases}</h3><p>New Cases Today</p></div>
          <div className="stat-card"><h3>{data.new_vaccinations}</h3><p>Vaccinations Today</p></div>
          <div className="stat-card"><h3>{data.scheduled_vaccinations}</h3><p>Scheduled for Today</p></div>
          <div className="stat-card"><h3>{data.ongoing_cases}</h3><p>Ongoing Cases</p></div>
        </div>
      </div>
    );
  };

  const renderSummaryReport = () => {
    if (!data) return null;
    return (
      <div className="report-content">
        <div className="stats-grid">
          <div className="stat-card"><h3>{data.total_patients}</h3><p>Total Patients</p></div>
          <div className="stat-card"><h3>{data.patients_this_month}</h3><p>New This Month</p></div>
          <div className="stat-card"><h3>{data.total_cases}</h3><p>Total Cases</p></div>
          <div className="stat-card"><h3>{data.open_cases}</h3><p>Open Cases</p></div>
          <div className="stat-card"><h3>{data.completed_cases}</h3><p>Completed Cases</p></div>
          <div className="stat-card"><h3>{data.missed_vaccinations}</h3><p>Missed Vacc.</p></div>
          <div className="stat-card"><h3>{data.scheduled_followups}</h3><p>Scheduled Follow-ups</p></div>
        </div>
      </div>
    );
  };

  const renderPeriodReport = () => {
    if (!data) return null;
    return (
      <div className="report-content">
        <div className="report-period">
          <span>Period: {data.period?.start_date} to {data.period?.end_date}</span>
        </div>
        <div className="stats-grid">
          {Object.entries(data).filter(([key]) => key !== 'period').map(([key, value]) => (
            typeof value === 'number' ? (
              <div key={key} className="stat-card">
                <h3>{value}</h3>
                <p>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
              </div>
            ) : null
          ))}
        </div>
        {data.gender_distribution && (
          <div className="card">
            <h3>Gender Distribution</h3>
            <div className="distribution-list">
              {data.gender_distribution.map((d) => (
                <div key={d.gender} className="distribution-item">
                  <span className="dist-label">{d.gender}</span>
                  <div className="dist-bar-bg">
                    <div className="dist-bar" style={{width: `${(d.count / Math.max(...data.gender_distribution.map(g => g.count))) * 100}%`}} />
                  </div>
                  <span>{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {data.category_distribution && (
          <div className="card">
            <h3>Category Distribution</h3>
            <div className="distribution-list">
              {data.category_distribution.map((d) => (
                <div key={d.bite_category} className="distribution-item">
                  <span>Category {d.bite_category}</span>
                  <div className="dist-bar-bg">
                    <div className="dist-bar" style={{width: `${(d.count / Math.max(...data.category_distribution.map(g => g.count))) * 100}%`}} />
                  </div>
                  <span>{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderInventoryReport = () => {
    if (!data) return null;
    return (
      <div className="report-content">
        <table className="table">
          <thead>
            <tr>
              <th>Vaccine</th>
              <th>Stock</th>
              <th>Batches</th>
              <th>Total Received</th>
              <th>Administered</th>
              <th>Near Expiry</th>
              <th>Expired</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.vaccine_name}>
                <td><strong>{item.vaccine_name}</strong></td>
                <td>{item.current_stock}</td>
                <td>{item.batches_received}</td>
                <td>{item.total_received}</td>
                <td>{item.total_administered}</td>
                <td><span className={item.near_expiry_batches > 0 ? 'badge badge-warning' : 'badge-success'}>{item.near_expiry_batches}</span></td>
                <td><span className={item.expired_batches > 0 ? 'badge badge-danger' : 'badge-success'}>{item.expired_batches}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeReport) {
      case 'daily': return renderDailyReport();
      case 'summary': return renderSummaryReport();
      case 'inventory': return renderInventoryReport();
      case 'patients':
      case 'cases':
      case 'vaccinations':
        return renderPeriodReport();
      default: return renderDailyReport();
    }
  };

  return (
    <div className="page-container">
      <div className="report-controls">
        <div className="report-tabs">
          {reportTypes.map((rt) => (
            <button
              key={rt.id}
              className={`tab ${activeReport === rt.id ? 'active' : ''}`}
              onClick={() => setActiveReport(rt.id)}
            >
              {rt.icon} {rt.label}
            </button>
          ))}
        </div>
        <div className="period-controls">
          {activeReport !== 'daily' && activeReport !== 'summary' && activeReport !== 'inventory' && (
            <>
              <select value={period} onChange={(e) => setPeriod(e.target.value)}>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom Range</option>
              </select>
              {period === 'custom' && (
                <>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  <button className="btn-primary btn-sm" onClick={fetchReport}>Apply</button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {loading ? <Loader text="Generating report..." /> : error ? <div className="error-state">{error}</div> : renderContent()}
    </div>
  );
}
