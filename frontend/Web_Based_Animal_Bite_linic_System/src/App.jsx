import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppLayout from './components/Layout/AppLayout';

const ChatBotFloating = lazy(() => import('./components/chatbot'));

// Pages
import LandingPage from './pages/landing/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOTP from './pages/auth/VerifyOTP';
import Profile from './pages/auth/Profile';
import Dashboard from './pages/dashboard/Dashboard';
import PatientList from './pages/patients/PatientList';
import PatientForm from './pages/patients/PatientForm';
import PatientDetail from './pages/patients/PatientDetail';
import CaseList from './pages/cases/CaseList';
import CaseForm from './pages/cases/CaseForm';
import CaseDetail from './pages/cases/CaseDetail';
import VaccinationList from './pages/vaccinations/VaccinationList';
import VaccinationForm from './pages/vaccinations/VaccinationForm';
import Inventory from './pages/inventory/Inventory';
import Reports from './pages/reports/Reports';
import UserList from './pages/users/UserList';
import AuditLogs from './pages/audit_logs/AuditLogs';
import AppointmentBooking from './pages/appointments/AppointmentBooking';
import MyAppointments from './pages/appointments/MyAppointments';
import AppointmentManagement from './pages/appointments/AppointmentManagement';
import PatientDashboard from './pages/dashboard/PatientDashboard';
import ChatPage from './pages/chat/ChatPage';
import ErrorPage from './pages/errors/ErrorPage';

import './App.css';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 8 }}>Loading...</p>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function RoleBasedDashboard() {
  const { hasRole } = useAuth();
  
  if (hasRole('patient')) {
    return <PatientDashboard />;
  }
  
  // Staff users (admin, doctor, nurse, staff) see the staff dashboard
  return <Dashboard />;
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}

function AdminRoute({ children }) {
  const { isAuthenticated, hasRole } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!hasRole('admin')) return <Navigate to="/dashboard" replace />;
  
  return children;
}

function AppRoutes() {
  return (
    <>
      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 500,
            padding: '12px 20px',
          },
        }}
      />
      
      <Suspense fallback={null}>
        <ChatBotFloating />
      </Suspense>
      
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth pages */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/verify-otp" element={<PublicRoute><VerifyOTP /></PublicRoute>} />
        
        {/* Protected routes with layout (existing paths preserved) */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<RoleBasedDashboard />} />
          <Route path="profile" element={<Profile />} />
          
          {/* Patients */}
          <Route path="patients" element={<PatientList />} />
          <Route path="patients/new" element={<PatientForm />} />
          <Route path="patients/:id" element={<PatientDetail />} />
          <Route path="patients/:id/edit" element={<PatientForm />} />
          
          {/* Cases */}
          <Route path="cases" element={<CaseList />} />
          <Route path="cases/new" element={<CaseForm />} />
          <Route path="cases/:id" element={<CaseDetail />} />
          <Route path="cases/:id/edit" element={<CaseForm />} />
          
          {/* Vaccinations */}
          <Route path="vaccinations" element={<VaccinationList />} />
          <Route path="vaccinations/new" element={<VaccinationForm />} />
          
          {/* Inventory */}
          <Route path="inventory" element={<Inventory />} />
          
          {/* Reports */}
          <Route path="reports" element={<Reports />} />
          
          {/* User Management (Admin only) */}
          <Route path="users" element={<AdminRoute><UserList /></AdminRoute>} />
          
          {/* Appointments */}
          <Route path="appointments/book" element={<AppointmentBooking />} />
          <Route path="appointments/my" element={<MyAppointments />} />
          <Route path="appointments/manage" element={<AppointmentManagement />} />
          
          {/* Chat */}
          <Route path="chat" element={<ChatPage />} />
          
          {/* Audit Logs (Admin only) */}
          <Route path="audit-logs" element={<AdminRoute><AuditLogs /></AdminRoute>} />
        </Route>
        
        {/* Error pages */}
        <Route path="/401" element={<ErrorPage code={401} />} />
        <Route path="/403" element={<ErrorPage code={403} />} />
        <Route path="/404" element={<ErrorPage code={404} />} />
        <Route path="/500" element={<ErrorPage code={500} />} />
        
        {/* Catch-all 404 */}
        <Route path="*" element={<ErrorPage code={404} />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
