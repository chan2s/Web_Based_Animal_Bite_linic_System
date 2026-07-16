import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { userAPI } from '../../api/axios';
import Loader from '../../components/common/Loader';
import { Search, UserCog } from 'lucide-react';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const response = await userAPI.list(params);
      setUsers(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const getRoleBadge = (role) => {
    const map = { admin: 'badge-role-admin', doctor: 'badge-role-doctor', nurse: 'badge-role-nurse', staff: 'badge-role-staff' };
    return map[role] || 'badge-secondary';
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
          <h1>User Management</h1>
          <p>Manage system users and permissions</p>
        </div>
        <div className="header-actions">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="btn-search">
              <Search className="w-4 h-4" />
            </button>
          </form>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="filter-select">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="doctor">Doctor</option>
            <option value="nurse">Nurse</option>
            <option value="staff">Staff</option>
            <option value="patient">Patient</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Loader text="Loading users..." />
      ) : users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><UserCog className="w-12 h-12 text-slate-300 mx-auto" /></div>
          <h3>No Users Found</h3>
          <p>No users match your search criteria.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr
                  key={u.id}
                  className="animate-fade-in"                style={{ animationDelay: `${i * 0.03}s` }}
                >
                <td className="font-mono font-medium">{u.username}</td>
                  <td className="font-medium">{u.first_name} {u.last_name}</td>
                  <td className="text-slate-500">{u.email}</td>
                  <td><span className={`badge ${getRoleBadge(u.profile?.role)}`}>{u.profile?.role || 'N/A'}</span></td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="text-slate-500">{u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
