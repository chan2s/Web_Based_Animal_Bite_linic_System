import { useState, useEffect } from 'react';
import { auditLogAPI } from '../../api/axios';
import Loader from '../../components/common/Loader';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionFilter, setActionFilter] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter, moduleFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = { page, page_size: 30 };
      if (actionFilter) params.action = actionFilter;
      if (moduleFilter) params.module = moduleFilter;
      const response = await auditLogAPI.list(params);
      setLogs(response.data.results || response.data || []);
      setTotal(response.data.count || response.data.length || 0);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action) => {
    const map = {
      login: 'badge-info',
      logout: 'badge-secondary',
      create: 'badge-success',
      update: 'badge-warning',
      delete: 'badge-danger',
      view: 'badge-primary',
      password_change: 'badge-danger',
    };
    return map[action] || 'badge-secondary';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Audit Logs</h2>
        <div className="header-actions">
          <select value={actionFilter} onChange={(e) => { setActionFilter(e.target.value); setPage(1); }} className="filter-select">
            <option value="">All Actions</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
          </select>
          <select value={moduleFilter} onChange={(e) => { setModuleFilter(e.target.value); setPage(1); }} className="filter-select">
            <option value="">All Modules</option>
            <option value="api/auth">Authentication</option>
            <option value="api/patients">Patients</option>
            <option value="api/cases">Cases</option>
            <option value="api/vaccinations">Vaccinations</option>
            <option value="api/inventory">Inventory</option>
            <option value="api/users">Users</option>
          </select>
          <button className="btn-secondary" onClick={() => fetchLogs()}>🔄 Refresh</button>
        </div>
      </div>

      {loading ? (
        <Loader text="Loading audit logs..." />
      ) : logs.length === 0 ? (
        <div className="empty-state"><p>No audit logs found.</p></div>
      ) : (
        <>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Module</th>
                  <th>Description</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="text-mono">{new Date(log.created_at).toLocaleString()}</td>
                    <td><strong>{log.username}</strong></td>
                    <td><span className={`badge badge-role-${log.user_role}`}>{log.user_role}</span></td>
                    <td><span className={`badge ${getActionBadge(log.action)}`}>{log.action}</span></td>
                    <td>{log.module}</td>
                    <td className="text-muted">{log.description || '—'}</td>
                    <td className="text-mono">{log.ip_address || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {total > 30 && (
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
              <span>Page {page} of {Math.ceil(total / 30)}</span>
              <button disabled={page >= Math.ceil(total / 30)} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
