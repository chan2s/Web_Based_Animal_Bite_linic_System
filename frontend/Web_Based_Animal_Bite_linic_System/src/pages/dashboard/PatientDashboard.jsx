import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { appointmentAPI, authAPI } from '../../api/axios';
import StatCard from '../../components/common/StatCard';
import Loader from '../../components/common/Loader';
import { ProfileCompletionBanner, ProfileCompletionModal } from '../../components/common/ProfileCompletionBanner';
import { Calendar, Plus, ClipboardList, User, Syringe } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

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
      if (upcomingRes.status === 'fulfilled') {
        const data = upcomingRes.value.data;
        const upcomingList = Array.isArray(data) ? data : data?.results || [];
        setUpcoming(upcomingList);
      }
      
      if (profileRes.status === 'fulfilled') {
        const profileData = profileRes.value.data;
        setProfile(profileData);
        const isComplete = profileData?.profile_completed === true;
        setProfileCompleted(isComplete);
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

  if (loading) return <Loader text="Loading dashboard..." />;

  return (
    <motion.div
      className="dashboard"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <ProfileCompletionModal
        userName={profile?.first_name}
        show={showModal}
        onCompleteLater={() => setShowModal(false)}
      />

      {showBanner && (
        <ProfileCompletionBanner
          userName={profile?.first_name}
          onDismiss={() => setShowBanner(false)}
        />
      )}

      {/* Welcome Card */}
      <motion.div className="welcome-card" variants={itemVariants}>
        <div className="welcome-content">
          <div>
            <h2>Welcome, {profile?.first_name || 'Patient'}! 👋</h2>
            <p>Manage your vaccination appointments and records</p>
          </div>
          <Link to="/appointments/book" className="btn-primary" style={{ background: 'white', color: '#2563eb', fontWeight: 700, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <Calendar className="w-4 h-4" />
            Book Appointment
          </Link>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div className="stats-grid" variants={itemVariants}>
        <StatCard
          title="Upcoming Appointments"
          value={upcoming.length}
          icon={<Calendar className="w-5 h-5" />}
          color="#3b82f6"
          subtitle="View details"
          onClick={() => navigate('/appointments/my')}
        />
        <StatCard
          title="Book Appointment"
          value="New"
          icon={<Plus className="w-5 h-5" />}
          color="#06b6d4"
          subtitle="Schedule a visit"
          onClick={() => navigate('/appointments/book')}
        />
        <StatCard
          title="View History"
          value="Records"
          icon={<ClipboardList className="w-5 h-5" />}
          color="#10b981"
          subtitle="Past appointments"
          onClick={() => navigate('/appointments/my?tab=history')}
        />
        <StatCard
          title="My Profile"
          value="Settings"
          icon={<User className="w-5 h-5" />}
          color="#8b5cf6"
          subtitle="Update info"
          onClick={() => navigate('/profile')}
        />
      </motion.div>

      {/* Upcoming Appointments */}
      <motion.div className="card" variants={itemVariants}>
        <div className="card-header">
          <h3>Upcoming Appointments</h3>
          <Link to="/appointments/my" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            View All →
          </Link>
        </div>
        <div className="card-body">
          {upcoming.length === 0 ? (
            <div className="empty-state" style={{ padding: '24px 0' }}>
              <div className="empty-icon" style={{ fontSize: 40 }}>📅</div>
              <h3>No Upcoming Appointments</h3>
              <p>Book your first vaccination appointment today.</p>
              <Link to="/appointments/book" className="btn-primary">
                <Calendar className="w-4 h-4" />
                Book Now
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {upcoming.slice(0, 5).map((apt) => (
                <motion.div
                  key={apt.id}
                  className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl hover:bg-blue-50/50 transition-colors gap-3 flex-wrap"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-lg flex-shrink-0">
                      <Syringe className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-slate-800">{apt.appointment_number}</div>
                      <div className="text-xs text-slate-500">{formatDate(apt.appointment_date)} at {apt.time_slot}</div>
                    </div>
                  </div>
                  <span className={`badge ${getStatusBadge(apt.status)}`}>{apt.status}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      {/* Quick Links */}
      <motion.div className="card" variants={itemVariants}>
        <div className="card-header"><h3>Quick Links</h3></div>
        <div className="card-body">
          <div className="quick-links-grid">
            <Link to="/appointments/book" className="quick-link" style={{ background: '#eff6ff', color: '#2563eb', borderColor: '#bfdbfe' }}>
              <Calendar className="w-5 h-5" />
              Book Appointment
            </Link>
            <Link to="/appointments/my" className="quick-link" style={{ background: '#f0fdf4', color: '#16a34a', borderColor: '#bbf7d0' }}>
              <ClipboardList className="w-5 h-5" />
              My Appointments
            </Link>
            <Link to="/profile" className="quick-link" style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}>
              <User className="w-5 h-5" />
              My Profile
            </Link>
            <Link to="/profile" className="quick-link" style={{ background: '#fff7ed', color: '#ea580c', borderColor: '#fed7aa' }}>
              🔑 Change Password
            </Link>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
