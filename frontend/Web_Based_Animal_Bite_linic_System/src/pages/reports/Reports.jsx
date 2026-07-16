import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { reportAPI } from '../../api/axios';
import Loader from '../../components/common/Loader';
import { FileBarChart, Download, Calendar } from 'lucide-react';

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState('month');

  useEffect(() => {
    setLoading(false);
  }, []);

  const reportTypes = [
    { id: 'summary', label: 'Summary Report', icon: '📊' },
    { id: 'patients', label: 'Patient Report', icon: '👥' },
    { id: 'cases', label: 'Cases Report', icon: '🩺' },
    { id: 'vaccinations', label: 'Vaccination Report', icon: '💉' },
    { id: 'inventory', label: 'Inventory Report', icon: '📦' },
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
          <h1>Reports & Analytics</h1>
          <p>Generate and view clinic reports</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card">
            <div className="card-body" style={{ padding: 16 }}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Report Types</p>
              <div className="flex flex-col gap-1">
                {reportTypes.map((rt) => (
                  <button
                    key={rt.id}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left
                      ${reportType === rt.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}
                    onClick={() => setReportType(rt.id)}
                  >
                    <span>{rt.icon}</span>
                    {rt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="card mt-4">
            <div className="card-body" style={{ padding: 16 }}>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Date Range</p>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-3">
          <div className="card">
            <div className="card-header">
              <h3>{reportTypes.find(rt => rt.id === reportType)?.label}</h3>
              <button className="btn-secondary">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
            <div className="card-body">
              <div className="empty-state" style={{ padding: '60px 20px' }}>
                <div className="empty-icon">
                  <FileBarChart className="w-16 h-16 text-slate-200 mx-auto" />
                </div>
                <h3>Report Generation</h3>
                <p>Select a report type and date range to generate your report.</p>
                <button className="btn-primary mt-2">
                  <Calendar className="w-4 h-4" />
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
