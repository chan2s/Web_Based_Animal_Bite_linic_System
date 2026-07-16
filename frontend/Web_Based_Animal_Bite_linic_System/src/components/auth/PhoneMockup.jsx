import { useState, useRef, memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

function PhoneMockup({ variant = 'login' }) {
  const [hoverProgress, setHoverProgress] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const phoneRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  const handleMouseMove = (e) => {
    if (!phoneRef.current || prefersReducedMotion) return;
    const rect = phoneRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const x = (e.clientX - centerX) / (rect.width / 2);
    const y = (e.clientY - centerY) / (rect.height / 2);
    setHoverProgress({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
  };

  const handleMouseLeave = () => {
    setHoverProgress({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const isRegister = variant === 'register';

  // Dashboard mockup data (login page)
  const stats = [
    { label: 'Active Cases', value: '24', color: 'bg-blue-500' },
    { label: 'Vaccinations', value: '156', color: 'bg-emerald-500' },
    { label: 'Appointments', value: '12', color: 'bg-cyan-500' },
  ];

  const appointments = [
    { time: '09:00', patient: 'Maria Santos', type: 'Follow-up' },
    { time: '10:30', patient: 'Juan Reyes', type: 'Vaccination' },
    { time: '14:00', patient: 'Ana Perez', type: 'New Case' },
  ];

  // Registration/onboarding mockup data
  const registrationSteps = [
    { step: 'Profile', icon: '👤', done: true },
    { step: 'Verify', icon: '📧', done: true },
    { step: 'Details', icon: '📋', done: true },
    { step: 'Complete', icon: '✅', done: false },
  ];

  const formFields = [
    { label: 'First Name', value: 'Juan', color: 'bg-blue-100' },
    { label: 'Last Name', value: 'Dela Cruz', color: 'bg-blue-100' },
    { label: 'Email', value: 'juan@email.com', color: 'bg-emerald-100' },
    { label: 'Phone', value: '+63 912 345 6789', color: 'bg-blue-100' },
  ];

  return (
    <motion.div
      ref={phoneRef}
      className="relative select-none"
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 60, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 1,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.15,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '1200px',
      }}
      role="img"
      aria-label={`Animal Bite Clinic mobile ${isRegister ? 'registration' : 'dashboard'} preview`}
    >
      {/* Main phone body */}
      <motion.div
        className="relative"
        style={{
          transformStyle: 'preserve-3d',
        }}
        animate={
          prefersReducedMotion
            ? {}
            : isHovered
            ? {
                rotateY: hoverProgress.x * 8,
                rotateX: -hoverProgress.y * 6,
                scale: 1.02,
              }
            : {
                y: [0, -6, 0],
                rotateY: 0,
                rotateX: 0,
                scale: 1,
              }
        }
        transition={
          isHovered
            ? { type: 'spring', stiffness: 150, damping: 15 }
            : { y: { duration: 4, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' } }
        }
      >
        {/* Shadow under phone */}
        <motion.div
          className="absolute -bottom-6 left-[10%] right-[10%] h-8 rounded-full bg-blue-500/5 blur-xl"
          animate={prefersReducedMotion ? {} : {
            scale: isHovered ? [1, 1.15, 1] : [1, 0.95, 1],
            opacity: isHovered ? [0.3, 0.5, 0.3] : [0.3, 0.2, 0.3],
          }}
          transition={{ duration: isHovered ? 0.4 : 4, repeat: Infinity, repeatType: 'mirror' }}
        />

        {/* Phone body */}
        <div className="relative w-[280px] sm:w-[320px]">
          {/* Outer bezel */}
          <div
            className="rounded-[3rem] bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 p-[4px] shadow-2xl"
            style={{
              boxShadow: isHovered
                ? '0 30px 80px rgba(59,130,246,0.15), 0 10px 30px rgba(0,0,0,0.25)'
                : '0 25px 60px rgba(0,0,0,0.2), 0 8px 20px rgba(0,0,0,0.1)',
            }}
          >
            {/* Inner bezel */}
            <div className="rounded-[2.7rem] bg-black overflow-hidden">
              {/* Screen */}
              <div
                className="relative rounded-[2.5rem] overflow-hidden bg-white"
                style={{ aspectRatio: '9/19.5' }}
              >
                {/* Status bar */}
                <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-6 pt-3 pb-1">
                  <span className="text-[10px] font-semibold text-slate-800">9:41</span>
                  <div className="flex items-center gap-1">
                    <div className="w-3.5 h-2 rounded-sm border border-slate-600 relative overflow-hidden">
                      <div className="absolute inset-y-0.5 left-0.5 w-2 bg-emerald-500 rounded-sm" />
                    </div>
                    <svg className="w-3 h-3 text-slate-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z" />
                    </svg>
                  </div>
                </div>

                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 w-[120px] h-[30px] bg-black rounded-b-2xl flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border-2 border-slate-700" />
                </div>

                {/* Screen content - conditional based on variant */}
                <div className="absolute inset-0 pt-10 pb-2 px-3 flex flex-col gap-1.5 overflow-hidden">
                  {!isRegister ? (
                    /* ====== DASHBOARD VIEW (login page) ====== */
                    <>
                      {/* Header */}
                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <p className="text-[8px] font-semibold text-blue-600">Animal Bite Clinic</p>
                          <p className="text-[6px] text-slate-400">Patient Dashboard</p>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg className="w-3 h-3 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                          </svg>
                        </div>
                      </div>

                      {/* Stats cards */}
                      <div className="grid grid-cols-3 gap-1.5">
                        {stats.map((stat, i) => (
                          <div key={i} className="bg-slate-50 rounded-lg p-2">
                            <p className="text-[9px] font-bold text-slate-800">{stat.value}</p>
                            <p className="text-[5px] text-slate-500 leading-tight">{stat.label}</p>
                            <div className={`h-1 w-full ${stat.color} rounded-full mt-1 opacity-60`} />
                          </div>
                        ))}
                      </div>

                      {/* Chart area */}
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-2.5">
                        <p className="text-[6px] font-semibold text-slate-600 mb-1.5">Weekly Cases</p>
                        <div className="flex items-end gap-1 h-14">
                          {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                              <div className="w-full rounded-t-sm bg-gradient-to-t from-blue-400 to-cyan-400" style={{ height: `${h * 0.14}px`, opacity: 0.7 + (i / 10) }} />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Appointments */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-[6px] font-semibold text-slate-600">Today&apos;s Schedule</p>
                          <span className="text-[5px] text-blue-500 font-medium">View all</span>
                        </div>
                        <div className="space-y-1">
                          {appointments.map((apt, i) => (
                            <div key={i} className="flex items-center gap-2 py-1 px-1.5 rounded-md hover:bg-slate-50 transition-colors">
                              <div className="text-[7px] font-mono font-semibold text-slate-500 w-7">{apt.time}</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[7px] font-medium text-slate-700 truncate">{apt.patient}</p>
                                <p className="text-[5px] text-slate-400">{apt.type}</p>
                              </div>
                              <div className={`w-1.5 h-1.5 rounded-full ${i === 1 ? 'bg-emerald-400' : i === 2 ? 'bg-blue-400' : 'bg-slate-300'}`} />
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bottom nav */}
                      <div className="flex items-center justify-around py-1 border-t border-slate-100">
                        {[1, 2, 3, 4].map((_, i) => (
                          <div key={i} className={`w-4 h-4 rounded-full ${i === 0 ? 'bg-blue-500' : 'bg-slate-200'}`} />
                        ))}
                      </div>
                    </>
                  ) : (
                    /* ====== REGISTRATION/ONBOARDING VIEW (register page) ====== */
                    <>
                      {/* Header */}
                      <div className="flex items-center justify-between pt-1">
                        <div>
                          <p className="text-[8px] font-semibold text-blue-600">Animal Bite Clinic</p>
                          <p className="text-[6px] text-slate-400">Complete Registration</p>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                          <span className="text-[8px]">✓</span>
                        </div>
                      </div>

                      {/* Progress steps */}
                      <div className="bg-slate-50 rounded-lg p-2">
                        <p className="text-[6px] font-semibold text-slate-600 mb-1.5">Setup Progress</p>
                        <div className="flex items-center gap-1.5">
                          {registrationSteps.map((s, i) => (
                            <div key={i} className={`flex-1 h-1 rounded-full ${s.done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                          ))}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          {registrationSteps.map((s, i) => (
                            <span key={i} className={`text-[5px] ${s.done ? 'text-emerald-600' : 'text-slate-400'}`}>{s.step}</span>
                          ))}
                        </div>
                      </div>

                      {/* Form preview */}
                      <div className="flex-1 space-y-1.5">
                        <p className="text-[6px] font-semibold text-slate-600">Personal Information</p>
                        {formFields.map((field, i) => (
                          <div key={i} className={`${field.color} rounded-lg p-2 flex items-center justify-between`}>
                            <div>
                              <p className="text-[5px] text-slate-500">{field.label}</p>
                              <p className="text-[7px] font-medium text-slate-700">{field.value}</p>
                            </div>
                            <div className={`w-1.5 h-1.5 rounded-full ${i === 2 ? 'bg-emerald-400' : 'bg-slate-300'}`} />
                          </div>
                        ))}
                      </div>

                      {/* Action button */}
                      <div className="py-1.5 px-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 text-center">
                        <p className="text-[7px] font-semibold text-white">Verify Email Address</p>
                      </div>

                      {/* Bottom hint */}
                      <p className="text-[5px] text-slate-400 text-center pb-1">OTP sent to your email</p>
                    </>
                  )}
                </div>

                {/* Screen reflection/glare */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Floating glow behind phone */}
          {!prefersReducedMotion && (
            <motion.div
              className="absolute -inset-10 -z-10 rounded-full blur-3xl pointer-events-none"
              style={{
                background: isHovered
                  ? 'radial-gradient(circle, rgba(59,130,246,0.08), transparent 70%)'
                  : 'transparent',
              }}
              animate={{
                opacity: isHovered ? 1 : 0,
                scale: isHovered ? 1 : 0.8,
              }}
              transition={{ duration: 0.5 }}
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default memo(PhoneMockup);
