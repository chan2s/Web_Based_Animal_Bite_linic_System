import { NavLink } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { chatAPI } from '../../api/axios';
import { Cross, LayoutDashboard, Users, Stethoscope, Syringe, Package, FileBarChart, UserCog, ClipboardList, MessageSquare, Calendar, User, LogOut, Menu, ChevronLeft } from 'lucide-react';

const ROLE_DASHBOARD_MAP = {
  admin: '/dashboard/admin',
  doctor: '/dashboard/veterinarian',
  veterinarian: '/dashboard/veterinarian',
  nurse: '/dashboard/staff',
  staff: '/dashboard/staff',
  patient: '/dashboard/patient',
};

const menuItems = [
  // ── Patient Menu ──
  {
    section: 'Patient Portal',
    roles: ['patient'],
    dashboardPath: '/dashboard/patient',
    items: [
      { path: '/dashboard/patient', label: 'Dashboard', icon: LayoutDashboard, roles: ['patient'] },
      { path: '/appointments/book', label: 'Book Appointment', icon: Calendar, roles: ['patient'] },
      { path: '/appointments/my', label: 'My Appointments', icon: ClipboardList, roles: ['patient'] },
      { path: '/profile', label: 'My Profile', icon: User, roles: ['patient'] },
    ],
  },
  // ── Veterinarian/Doctor Menu ──
  {
    section: 'Clinical',
    roles: ['veterinarian', 'doctor'],
    dashboardPath: '/dashboard/veterinarian',
    items: [
      { path: '/dashboard/veterinarian', label: 'Dashboard', icon: LayoutDashboard, roles: ['veterinarian', 'doctor'] },
      { path: '/patients', label: 'Patients', icon: Users, roles: ['veterinarian', 'doctor'] },
      { path: '/cases', label: 'Bite Cases', icon: Stethoscope, roles: ['veterinarian', 'doctor'] },
      { path: '/vaccinations', label: 'Vaccinations', icon: Syringe, roles: ['veterinarian', 'doctor'] },
      { path: '/appointments/manage', label: 'Appointments', icon: Calendar, roles: ['veterinarian', 'doctor'] },
      { path: '/chat', label: 'Messages', icon: MessageSquare, roles: ['veterinarian', 'doctor'], badge: 'unread' },
    ],
  },
  // ── Staff Menu (nurse, staff) ──
  {
    section: 'Main',
    roles: ['nurse', 'staff'],
    dashboardPath: '/dashboard/staff',
    items: [
      { path: '/dashboard/staff', label: 'Dashboard', icon: LayoutDashboard, roles: ['nurse', 'staff'] },
    ],
  },
  {
    section: 'Operations',
    roles: ['nurse', 'staff'],
    dashboardPath: '/dashboard/staff',
    items: [
      { path: '/patients', label: 'Patients', icon: Users, roles: ['nurse', 'staff'] },
      { path: '/appointments/book', label: 'Book Appointment', icon: Calendar, roles: ['nurse', 'staff'] },
      { path: '/appointments/my', label: 'My Appointments', icon: ClipboardList, roles: ['nurse', 'staff'] },
      { path: '/vaccinations', label: 'Vaccinations', icon: Syringe, roles: ['nurse'] },
      { path: '/inventory', label: 'Inventory', icon: Package, roles: ['nurse', 'staff'] },
      { path: '/chat', label: 'Messages', icon: MessageSquare, roles: ['nurse', 'staff'], badge: 'unread' },
    ],
  },
  // ── Admin Menu ──
  {
    section: 'Main',
    roles: ['admin'],
    dashboardPath: '/dashboard/admin',
    items: [
      { path: '/dashboard/admin', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin'] },
    ],
  },
  {
    section: 'Management',
    roles: ['admin'],
    dashboardPath: '/dashboard/admin',
    items: [
      { path: '/patients', label: 'Patients', icon: Users, roles: ['admin'] },
      { path: '/cases', label: 'Bite Cases', icon: Stethoscope, roles: ['admin'] },
      { path: '/vaccinations', label: 'Vaccinations', icon: Syringe, roles: ['admin'] },
      { path: '/inventory', label: 'Inventory', icon: Package, roles: ['admin'] },
      { path: '/appointments/manage', label: 'Appointments', icon: Calendar, roles: ['admin'] },
    ],
  },
  {
    section: 'Reports',
    roles: ['admin'],
    dashboardPath: '/dashboard/admin',
    items: [
      { path: '/reports', label: 'Reports', icon: FileBarChart, roles: ['admin'] },
    ],
  },
  {
    section: 'Administration',
    roles: ['admin'],
    dashboardPath: '/dashboard/admin',
    items: [
      { path: '/users', label: 'User Management', icon: UserCog, roles: ['admin'] },
      { path: '/audit-logs', label: 'Audit Logs', icon: ClipboardList, roles: ['admin'] },
    ],
  },
  {
    section: 'Communication',
    roles: ['admin'],
    dashboardPath: '/dashboard/admin',
    items: [
      { path: '/chat', label: 'Messages', icon: MessageSquare, roles: ['admin'], badge: 'unread' },
    ],
  },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { hasRole, user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await chatAPI.getUnreadCount();
      setUnreadCount(res.data?.unread_count || 0);
    } catch (e) {
      // Ignore errors
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  const filteredMenu = menuItems
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => hasRole(item.roles)),
    }))
    .filter((section) => section.items.length > 0);

  const sidebarContent = (
    <>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Cross className="w-4 h-4" />
          </div>
          {!collapsed && (
            <motion.span
              className="logo-text"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              Animal Bite<br/>Clinic System
            </motion.span>
          )}
        </div>
        <button className="sidebar-toggle" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
          {collapsed ? <ChevronLeft className="w-3 h-3 rotate-180" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {filteredMenu.map((section) => (
          <div key={section.section} className="nav-section">
            {!collapsed && <span className="nav-section-title">{section.section}</span>}
            <ul>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      end={item.path.includes('/dashboard')}
                      className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                      onClick={onMobileClose}
                    >
                      <span className="nav-icon">
                        <Icon className="w-[18px] h-[18px]" />
                      </span>
                      {!collapsed && (
                        <>
                          <span className="nav-label">{item.label}</span>
                          {item.badge === 'unread' && unreadCount > 0 && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="ml-auto bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1 leading-none"
                            >
                              {unreadCount > 99 ? '99+' : unreadCount}
                            </motion.span>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <NavLink
        to="/"
        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        style={{ borderTop: '1px solid var(--border)', margin: '0 10px', borderRadius: 0 }}
        onClick={onMobileClose}
      >
        <span className="nav-icon">
          <FileBarChart className="w-[18px] h-[18px]" />
        </span>
        {!collapsed && <span className="nav-label">Visit Website</span>}
      </NavLink>

      <div className="sidebar-footer">
        {!collapsed && user && (
          <motion.div
            className="sidebar-user"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="sidebar-user-avatar">
              {user.first_name?.[0] || user.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">
                {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.username}
              </span>
              <span className="sidebar-user-role">{user.profile?.role || 'User'}</span>
            </div>
            <button
              onClick={logout}
              className="ml-auto p-1.5 rounded-md text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
        {collapsed && user && (
          <div className="flex justify-center">
            <div className="sidebar-user-avatar" style={{ width: 32, height: 32, fontSize: 11 }}>
              {user.first_name?.[0] || user.username?.[0]?.toUpperCase() || 'U'}
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={onMobileClose} />
      )}

      {/* Desktop sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {sidebarContent}
      </aside>
    </>
  );
}
