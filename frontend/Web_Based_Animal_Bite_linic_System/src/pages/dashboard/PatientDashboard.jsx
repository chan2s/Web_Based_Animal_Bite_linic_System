import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { appointmentAPI, authAPI } from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
import { ProfileCompletionBanner, ProfileCompletionModal } from '../../components/common/ProfileCompletionBanner';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileCompleted, setProfileCompleted] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [upcomingRes, profileRes] = await Promise.allSettled([
        appointmentAPI.myUpcoming(),
        authAPI.getPatientProfile(),
      ]);
      if (upcomingRes.status === 'fulfilled') setUpcoming(upcomingRes.value.data || []);
      
      if (profileRes.status === 'fulfilled') {
        const profileData = profileRes.value.data;
        setProfile(profileData);
        // profile_completed is now a top-level field in the flattened response
        const isComplete = profileData?.profile_completed === true;
        setProfileCompleted(isComplete);
        
        // Show modal EVERY time if profile is incomplete (no persistent dismiss)
        if (!isComplete) {
          setShowModal(true);
          setShowBanner(true);
        }
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: 'badge-warning',
      approved: 'badge-success',
      completed: 'badge-primary',
      cancelled: 'badge-danger',
      rejected: 'badge-danger',
    };
    return map[status] || 'badge-secondary';
  };

  const handleDismissBanner = () => {
    setShowBanner(false);
  };

  const handleDismissModal = () => {
    setShowModal(false);
    // Modal dismissed for current page view only.
    // It will reappear on next login/refresh if profile is still incomplete.
    // No sessionStorage or localStorage is used to avoid permanent suppression.
  };

  if (loading) return <Loader text="Loading dashboard..." />;

  return (
    <div className="dashboard">
      {/* Profile Completion Modal (shown once per login) */}
      <ProfileCompletionModal
        userName={profile?.first_name}
        show={showModal}
        onCompleteLater={handleDismissModal}
      />

      {/* Profile Completion Banner */}
      {showBanner && (
        <ProfileCompletionBanner
          userName={profile?.first_name}
          onDismiss={handleDismissBanner}
        />
      )}

      {/* Welcome Section */}
      <div className="welcome-card" style={{ background: 'linear-gradient(135deg, #312e81, #4f46e5)', borderRadius: 16, padding: 28, color: 'white', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ color: 'white', margin: 0, fontSize: 24 }}>
              Welcome, {profile?.first_name || 'Patient'}! 👋
            </h2>
            <p style={{ color: '#c7d2fe', marginTop: 4, fontSize: 14 }}>
              Manage your vaccination appointments and records
            </p>
          </div>
          <Link to="/appointments/book" className="btn-primary" style={{ background: 'white', color: '#4f46e5', fontWeight: 700 }}>
            + Book Appointment
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <StatCard
          title="Upcoming Appointments"
          value={upcoming.length}
          icon="📅"
          color="#4f46e5"
          subtitle="View details"
          onClick={() => navigate('/appointments/my')}
        />
        <StatCard
          title="Book Appointment"
          value="New"
          icon="➕"
          color="#0891b2"
          subtitle="Schedule a visit"
          onClick={() => navigate('/appointments/book')}
        />
        <StatCard
          title="View History"
          value="Records"
          icon="📋"
          color="#16a34a"
          subtitle="Past appointments"
          onClick={() => navigate('/appointments/my?tab=history')}
        />
        <StatCard
          title="My Profile"
          value="Settings"
          icon="👤"
          color="#9333ea"
          subtitle="Update info"
          onClick={() => navigate('/profile')}
        />
      </div>

      {/* Upcoming Appointments */}
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>📅 Upcoming Appointments</h3>
          <Link to="/appointments/my" style={{ fontSize: 13, fontWeight: 600 }}>View All →</Link>
        </div>
        <div className="card-body">
          {upcoming.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div className="empty-icon" style={{ fontSize: 40 }}>📅</div>
              <h3 style={{ fontSize: 16, margin: '8px 0' }}>No Upcoming Appointments</h3>
              <p style={{ fontSize: 14, marginBottom: 16 }}>Book your first vaccination appointment today.</p>
              <Link to="/appointments/book" className="btn-primary">Book Now</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {upcoming.slice(0, 5).map((apt) => (
                <div key={apt.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: 8, gap: 12, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 8, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💉</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{apt.appointment_number}</div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{formatDate(apt.appointment_date)} at {apt.time_slot}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className={`badge ${getStatusBadge(apt.status)}`}>{apt.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="card">
        <div className="card-header"><h3>🔗 Quick Links</h3></div>
        <div className="card-body">
          <div className="quick-links-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            <Link to="/appointments/book" className="quick-link" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: '#eef2ff', borderRadius: 8, textDecoration: 'none', color: '#4338ca', fontWeight: 600 }}>
              📅 Book Appointment
            </Link>
            <Link to="/appointments/my" className="quick-link" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: '#f0fdf4', borderRadius: 8, textDecoration: 'none', color: '#16a34a', fontWeight: 600 }}>
              📋 My Appointments
            </Link>
            <Link to="/profile" className="quick-link" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: '#fef2f2', borderRadius: 8, textDecoration: 'none', color: '#dc2626', fontWeight: 600 }}>
              👤 My Profile
            </Link>
            <Link to="/profile" className="quick-link" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, background: '#fff7ed', borderRadius: 8, textDecoration: 'none', color: '#ea580c', fontWeight: 600 }}>
              🔑 Change Password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
