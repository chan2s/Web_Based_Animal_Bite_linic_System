import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Header({ title }) {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="app-header">
      <div className="header-left">
        <h1 className="page-title">{title || 'Dashboard'}</h1>
      </div>
      <div className="header-right">
        <div className="header-user" ref={dropdownRef}>
          <button
            className="header-user-btn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="header-avatar">
              {user?.first_name?.[0] || user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="header-user-text">
              <span className="header-user-name">
                {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
              </span>
              <span className="header-user-role">{user?.profile?.role || 'User'}</span>
            </div>
            <span className="dropdown-arrow">{showDropdown ? '▲' : '▼'}</span>
          </button>

          {showDropdown && (
            <div className="dropdown-menu">
              <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                👤 My Profile
              </Link>
              <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                🔑 Change Password
              </Link>
              <hr className="dropdown-divider" />
              <button className="dropdown-item logout" onClick={logout}>
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
