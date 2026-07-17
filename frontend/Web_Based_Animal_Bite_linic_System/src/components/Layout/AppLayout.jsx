import { useState, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const pageConfig = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your clinic operations' },
  '/dashboard/admin': { title: 'Admin Dashboard', subtitle: 'Complete system oversight and management' },
  '/dashboard/staff': { title: 'Staff Dashboard', subtitle: 'Your daily clinic operations overview' },
  '/dashboard/veterinarian': { title: 'Veterinarian Dashboard', subtitle: 'Patient care and treatment management' },
  '/dashboard/patient': { title: 'Patient Dashboard', subtitle: 'Your health records and appointments' },
  '/patients': { title: 'Patient Management', subtitle: 'View and manage patient records' },
  '/patients/new': { title: 'Register New Patient', subtitle: 'Add a new patient to the system' },
  '/cases': { title: 'Bite Case Management', subtitle: 'Track and manage animal bite cases' },
  '/cases/new': { title: 'Record New Bite Case', subtitle: 'Document a new animal bite incident' },
  '/vaccinations': { title: 'Vaccination Management', subtitle: 'Track patient vaccination schedules' },
  '/vaccinations/new': { title: 'Record Vaccination', subtitle: 'Administer and record a vaccine dose' },
  '/inventory': { title: 'Vaccine Inventory', subtitle: 'Manage vaccine stock and supplies' },
  '/reports': { title: 'Reports & Analytics', subtitle: 'Insights and data about your clinic' },
  '/users': { title: 'User Management', subtitle: 'Manage system users and permissions' },
  '/audit-logs': { title: 'Audit Logs', subtitle: 'Track system changes and activity' },
  '/profile': { title: 'My Profile', subtitle: 'View and update your profile information' },
  '/appointments/book': { title: 'Book Appointment', subtitle: 'Schedule a new appointment' },
  '/appointments/my': { title: 'My Appointments', subtitle: 'View your appointment history' },
  '/appointments/manage': { title: 'Appointment Management', subtitle: 'Manage all clinic appointments' },
  '/chat': { title: 'Messages', subtitle: 'Communicate with patients and staff' },
};

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const path = location.pathname;
  const config = pageConfig[path] || (() => {
    if (path.startsWith('/patients/')) return { title: 'Patient Details', subtitle: 'View patient information and records' };
    if (path.startsWith('/cases/')) return { title: 'Case Details', subtitle: 'View bite case information' };
    if (path.startsWith('/users/')) return { title: 'User Details', subtitle: 'View user information' };
    return { title: 'Dashboard', subtitle: 'Overview of your clinic operations' };
  })();

  const handleToggle = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const handleMobileToggle = useCallback(() => {
    setMobileOpen(prev => !prev);
  }, []);

  const handleMobileClose = useCallback(() => {
    setMobileOpen(false);
  }, []);

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={handleToggle}
        mobileOpen={mobileOpen}
        onMobileClose={handleMobileClose}
      />
      <div className="main-content">
        <Header
          title={config.title}
          subtitle={config.subtitle}
          onMenuToggle={handleMobileToggle}
        />
        <main className="content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
