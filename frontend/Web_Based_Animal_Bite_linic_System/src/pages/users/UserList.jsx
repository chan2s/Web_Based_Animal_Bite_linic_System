import { useState, useEffect } from 'react';
import { userAPI } from '../../api/axios';
import Loader from '../../components/common/Loader';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    username: '', email: '', first_name: '', last_name: '',
    password: '', confirm_password: '',
    profile: { role: 'staff', phone: '', gender: '' }
  });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.list();
      setUsers(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setEditingUser(null);
    setFormData({
      username: '', email: '', first_name: '', last_name: '',
      password: '', confirm_password: '',
      profile: { role: 'staff', phone: '', gender: '' }
    });
    setShowForm(true);
    setError('');
  };

  const openEditForm = async (userId) => {
    try {
      const response = await userAPI.get(userId);
      const u = response.data;
      setEditingUser(u);
      setFormData({
        username: u.username, email: u.email || '',
        first_name: u.first_name || '', last_name: u.last_name || '',
        password: '', confirm_password: '',
        profile: {
          role: u.profile?.role || 'staff',
          phone: u.profile?.phone || '',
          gender: u.profile?.gender || ''
        }
      });
      setShowForm(true);
      setError('');
    } catch (err) {
      setError('Failed to load user data.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editingUser) {
        const payload = {
          username: formData.username,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          profile: formData.profile
        };
        await userAPI.update(editingUser.id, payload);
      } else {
        await userAPI.create(formData);
      }
      setShowForm(false);
      fetchUsers();
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const messages = Object.entries(data).map(([key, val]) => 
          `${key}: ${Array.isArray(val) ? val.join(', ') : val}`
        ).join('\n');
        setError(messages);
      } else {
        setError('Failed to save user.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (userId, currentActive) => {
    try {
      await userAPI.update(userId, { is_active: !currentActive });
      fetchUsers();
    } catch (err) {
      setError('Failed to update user status.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('profile.')) {
      const field = name.split('.')[1];
      setFormData({ ...formData, profile: { ...formData.profile, [field]: value } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>User Management</h2>
        <button className="btn-primary" onClick={openCreateForm}>+ Create User</button>
      </div>

      {error && <div className="error-message">⚠️ {error}</div>}

      {loading ? <Loader text="Loading users..." /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td><strong>{u.username}</strong></td>
                  <td>{u.full_name || `${u.first_name} ${u.last_name}`}</td>
                  <td>{u.email || '—'}</td>
                  <td><span className={`badge badge-role-${u.role}`}>{u.role}</span></td>
                  <td>{u.profile?.phone || '—'}</td>
                  <td>
                    <span className={`badge ${u.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {u.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td>{new Date(u.date_joined).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button className="btn-sm" onClick={() => openEditForm(u.id)} title="Edit">✏️</button>
                    <button
                      className="btn-sm"
                      onClick={() => handleToggleActive(u.id, u.is_active)}
                      title={u.is_active ? 'Disable' : 'Enable'}
                    >
                      {u.is_active ? '🔒' : '🔓'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingUser ? 'Edit User' : 'Create User'}</h3>
              <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label>Username *</label>
                    <input name="username" value={formData.username} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input name="first_name" value={formData.first_name} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input name="last_name" value={formData.last_name} onChange={handleChange} />
                  </div>
                </div>
                {!editingUser && (
                  <div className="form-row">
                    <div className="form-group">
                      <label>Password *</label>
                      <input type="password" name="password" value={formData.password} onChange={handleChange} required={!editingUser} minLength={8} />
                    </div>
                    <div className="form-group">
                      <label>Confirm Password *</label>
                      <input type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} required={!editingUser} minLength={8} />
                    </div>
                  </div>
                )}
                <div className="form-row">
                  <div className="form-group">
                    <label>Role</label>
                    <select name="profile.role" value={formData.profile.role} onChange={handleChange}>
                      <option value="admin">Administrator</option>
                      <option value="doctor">Doctor</option>
                      <option value="nurse">Nurse</option>
                      <option value="staff">Staff</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input name="profile.phone" value={formData.profile.phone} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Gender</label>
                    <select name="profile.gender" value={formData.profile.gender} onChange={handleChange}>
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
