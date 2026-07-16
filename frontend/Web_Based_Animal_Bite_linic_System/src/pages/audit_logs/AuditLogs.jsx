import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { auditLogAPI } from '../../api/axios';
import Loader from '../../components/common/Loader';
import { Search, ClipboardList } from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [search]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = search ? { search } : {};
      const response = await auditLogAPI.list(params);
      setLogs(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const getActionIcon = (action) => {
    const map = {
      login: '🔑', create: '➕', update: '✏️', delete: '🗑️',
    };
    return map[action] || '📝';
  };

  return (
    <motion.div
      className="page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <div className="page-header-left">
          <h1>Audit Logs</h1>
          <p>Track system changes and user activity</p>
        </div>
        <div className="header-actions">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn-search">
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {loading ? (
        <Loader text="Loading audit logs..." />
      ) : logs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><ClipboardList className="w-12 h-12 text-slate-300 mx-auto" /></div>
          <h3>No Audit Logs Found</h3>
          <p>No activity records match your search.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Description</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, i) => (
                <tr
                  key={log.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${i * 0.02}s` }}
                >
                  <td className="text-slate-500 text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="font-medium">{log.user || 'System'}</td>
                  <td>
                    <span className="flex items-center gap-1.5">
                      <span>{getActionIcon(log.action)}</span>
                      <span className="capitalize">{log.action}</span>
                    </span>
                  </td>
                  <td className="text-slate-600">{log.description}</td>
                  <td className="text-slate-400 text-xs font-mono">{log.ip_address || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
