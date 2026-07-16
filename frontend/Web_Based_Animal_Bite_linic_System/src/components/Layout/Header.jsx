import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, User, Settings, LogOut, Menu } from 'lucide-react';

export default function Header({ title, subtitle, onMenuToggle }) {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="header-left">
          <h1 className="page-title">{title || 'Dashboard'}</h1>
          {subtitle && <span className="page-subtitle">{subtitle}</span>}
        </div>
      </div>

      <div className="header-right">
        {/* Search - hidden on mobile */}
        <div className="header-search hidden md:block">
          <span className="header-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search patients, cases..."
            onFocus={() => navigate('/patients')}
            readOnly
          />
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            className="relative p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15 }}
                className="dropdown-menu"
                style={{ width: 320 }}
              >
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-800">Notifications</p>
                </div>
                <div className="py-6 text-center text-sm text-slate-400">
                  No new notifications
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User dropdown */}
        <div className="header-user" ref={dropdownRef}>
          <button
            className="header-user-btn"
            onClick={() => setShowDropdown(!showDropdown)}
            aria-label="User menu"
          >
            <div className="header-avatar">
              {user?.first_name?.[0] || user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="header-user-text hidden sm:block">
              <span className="header-user-name">
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
              </span>
              <span className="header-user-role">{user?.profile?.role || 'User'}</span>
            </div>
            <span className={`dropdown-arrow ${showDropdown ? 'open' : ''}`}>▼</span>
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15 }}
                className="dropdown-menu"
              >
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-sm font-medium text-slate-900">
                    {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
                  </p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
                <Link
                  to="/profile"
                  className="dropdown-item flex items-center gap-2.5"
                  onClick={() => setShowDropdown(false)}
                >
                  <User className="w-4 h-4 text-slate-400" />
                  My Profile
                </Link>
                <Link
                  to="/profile"
                  className="dropdown-item flex items-center gap-2.5"
                  onClick={() => setShowDropdown(false)}
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Settings
                </Link>
                <hr className="dropdown-divider" />
                <button
                  className="dropdown-item logout flex items-center gap-2.5"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
