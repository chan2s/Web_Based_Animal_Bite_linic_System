import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Dismissible banner shown at the top of the dashboard
 * when the patient's profile is incomplete.
 */
export function ProfileCompletionBanner({ userName, onDismiss, onComplete }) {
  const navigate = useNavigate();

  const handleCompleteProfile = () => {
    if (onComplete) onComplete();
    navigate('/profile');
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, #fff7ed, #ffedd5)',
        border: '1px solid #fed7aa',
        borderRadius: 12,
        padding: '16px 20px',
        marginBottom: 20,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
      }}
    >
      <span style={{ fontSize: 24, lineHeight: 1 }}>⚠️</span>
      <div style={{ flex: 1 }}>
        <strong style={{ fontSize: 15, color: '#9a3412', display: 'block', marginBottom: 4 }}>
          Complete Your Profile
        </strong>
        <p style={{ fontSize: 13, color: '#c2410c', margin: 0, lineHeight: 1.5 }}>
          Hi {userName || 'there'}! Please complete your profile information so the clinic can serve you better.
          This also allows automatic form pre-filling for faster appointment bookings.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: 13, background: '#ea580c', border: 'none' }}
            onClick={handleCompleteProfile}
          >
            Complete Profile
          </button>
          {onDismiss && (
            <button
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: 13 }}
              onClick={onDismiss}
            >
              Remind Me Later
            </button>
          )}
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            fontSize: 18,
            cursor: 'pointer',
            color: '#9a3412',
            padding: 4,
            lineHeight: 1,
          }}
          title="Dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}

/**
 * Full-screen modal shown on first dashboard visit after login
 * when the profile is incomplete.
 */
export function ProfileCompletionModal({ userName, show, onCompleteLater }) {
  const navigate = useNavigate();

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 20,
        backdropFilter: 'blur(2px)',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: 16,
          maxWidth: 480,
          width: '100%',
          padding: 32,
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
          Complete Your Profile
        </h2>
        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 24 }}>
          Your profile is incomplete.
        </p>
        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 24 }}>
          Please complete your personal information before booking an appointment. This helps the clinic process your vaccination records accurately.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            className="btn-primary"
            style={{ padding: '12px 24px', fontSize: 15 }}
            onClick={() => {
              onCompleteLater();
              navigate('/profile');
            }}
          >
            Complete Profile
          </button>
          <button
            className="btn-secondary"
            style={{ padding: '12px 24px', fontSize: 15 }}
            onClick={onCompleteLater}
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileCompletionBanner;
