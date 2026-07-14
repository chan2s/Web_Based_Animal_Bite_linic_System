import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const menuItems = [
  // ── Patient Menu (visible only to patients) ──
  {
    section: 'Patient Portal',
    roles: ['patient'],
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: '🏠', roles: ['patient'] },
      { path: '/appointments/book', label: 'Book Appointment', icon: '📅', roles: ['patient'] },
      { path: '/appointments/my', label: 'My Appointments', icon: '📋', roles: ['patient'] },
      { path: '/profile', label: 'My Profile', icon: '👤', roles: ['patient'] },
    ],
  },
  // ── Staff Menu (visible to admin, doctor, nurse, staff) ──
  {
    section: 'Main',
    roles: ['admin', 'doctor', 'nurse', 'staff'],
    items: [
      { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'doctor', 'nurse', 'staff'] },
    ],
  },
  {
    section: 'Management',
    roles: ['admin', 'doctor', 'nurse', 'staff'],
    items: [
      { path: '/patients', label: 'Patients', icon: '👥', roles: ['admin', 'doctor', 'nurse', 'staff'] },
      { path: '/cases', label: 'Bite Cases', icon: '🩺', roles: ['admin', 'doctor', 'nurse'] },
      { path: '/appointments/book', label: 'Book Appointment', icon: '📅', roles: ['admin', 'doctor', 'nurse', 'staff'] },
      { path: '/appointments/my', label: 'My Appointments', icon: '📋', roles: ['admin', 'doctor', 'nurse', 'staff'] },
      { path: '/appointments/manage', label: 'Manage Appts', icon: '⚙️', roles: ['admin', 'doctor', 'nurse'] },
    ],
  },
  {
    section: 'Vaccination',
    roles: ['admin', 'doctor', 'nurse', 'staff'],
    items: [
      { path: '/vaccinations', label: 'Vaccinations', icon: '💉', roles: ['admin', 'doctor', 'nurse'] },
      { path: '/inventory', label: 'Vaccine Inventory', icon: '📦', roles: ['admin', 'nurse', 'staff'] },
    ],
  },
  {
    section: 'Reports',
    roles: ['admin', 'doctor', 'staff'],
    items: [
      { path: '/reports', label: 'Reports', icon: '📈', roles: ['admin', 'doctor'] },
    ],
  },
  {
    section: 'Administration',
    roles: ['admin'],
    items: [
      { path: '/users', label: 'User Management', icon: '🔐', roles: ['admin'] },
      { path: '/audit-logs', label: 'Audit Logs', icon: '📋', roles: ['admin'] },
    ],
  },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { hasRole, user } = useAuth();

  const filteredMenu = menuItems
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => hasRole(item.roles)),
    }))
    .filter((section) => section.items.length > 0);

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          {collapsed ? '🏥' : <><span className="logo-icon">🏥</span><span className="logo-text">Animal Bite<br/>Clinic System</span></>}
        </div>
        <button className="sidebar-toggle" onClick={onToggle}>
          {collapsed ? '→' : '←'}
        </button>
      </div>

      <nav className="sidebar-nav">
        {filteredMenu.map((section) => (
          <div key={section.section} className="nav-section">
            {!collapsed && <span className="nav-section-title">{section.section}</span>}
            <ul>
              {section.items.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    {!collapsed && <span className="nav-label">{item.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Visit Website Link */}
      <NavLink
        to="/"
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span className="nav-icon">🌐</span>
        {!collapsed && <span className="nav-label">Visit Website</span>}
      </NavLink>

      <div className="sidebar-footer">
        {!collapsed && user && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user.first_name?.[0] || user.username[0]?.toUpperCase() || 'U'}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user.first_name || user.username}</span>
              <span className="sidebar-user-role">{user.profile?.role || 'User'}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
