import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/patients': 'Patient Management',
  '/patients/new': 'Register New Patient',
  '/cases': 'Bite Case Management',
  '/cases/new': 'Record New Bite Case',
  '/vaccinations': 'Vaccination Management',
  '/inventory': 'Vaccine Inventory',
  '/reports': 'Reports & Analytics',
  '/users': 'User Management',
  '/users/new': 'Create New User',
  '/audit-logs': 'Audit Logs',
  '/profile': 'My Profile',
};

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  // Find the best matching title
  const path = location.pathname;
  const title = pageTitles[path] || 
    (path.startsWith('/patients/') ? 'Patient Details' :
     path.startsWith('/cases/') ? 'Case Details' :
     path.startsWith('/users/') ? 'User Details' :
     'Dashboard');

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="main-content">
        <Header title={title} />
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
