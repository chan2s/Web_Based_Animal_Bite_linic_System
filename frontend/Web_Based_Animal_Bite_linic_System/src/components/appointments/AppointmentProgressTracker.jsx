import { motion } from 'framer-motion';
import { Clock, CheckCircle2, Circle, UserCheck, Stethoscope, Syringe, Eye, Award, XCircle, Ban } from 'lucide-react';

const WORKFLOW_STEPS = [
  { key: 'pending', label: 'Pending', icon: Clock, color: '#f59e0b' },
  { key: 'approved', label: 'Approved', icon: CheckCircle2, color: '#10b981' },
  { key: 'checked_in', label: 'Checked In', icon: UserCheck, color: '#3b82f6' },
  { key: 'under_consultation', label: 'Consultation', icon: Stethoscope, color: '#8b5cf6' },
  { key: 'vaccination_ongoing', label: 'Vaccination', icon: Syringe, color: '#06b6d4' },
  { key: 'observation', label: 'Observation', icon: Eye, color: '#f59e0b' },
  { key: 'completed', label: 'Completed', icon: Award, color: '#10b981' },
];

const TERMINAL_STATUSES = ['cancelled', 'rejected', 'no_show'];

export default function AppointmentProgressTracker({ currentStatus, showLabels = true, size = 'md' }) {
  const isTerminal = TERMINAL_STATUSES.includes(currentStatus);
  const currentIndex = WORKFLOW_STEPS.findIndex((s) => s.key === currentStatus);

  const getStepState = (stepIndex) => {
    if (isTerminal) return 'terminal';
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getTerminalIcon = () => {
    if (currentStatus === 'cancelled' || currentStatus === 'no_show') return XCircle;
    return Ban;
  };

  const getTerminalColor = () => {
    if (currentStatus === 'cancelled') return '#ef4444';
    if (currentStatus === 'rejected') return '#ef4444';
    return '#f59e0b';
  };

  const getTerminalLabel = () => {
    if (currentStatus === 'cancelled') return 'Cancelled';
    if (currentStatus === 'rejected') return 'Rejected';
    if (currentStatus === 'no_show') return 'No Show';
    return currentStatus;
  };

  const isSmall = size === 'sm';
  const iconSize = isSmall ? 14 : 20;
  const stepGap = isSmall ? 'gap-1' : 'gap-2';

  // Terminal state — show only the terminal badge
  if (isTerminal) {
    const TermIcon = getTerminalIcon();
    return (
      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm font-semibold"
          style={{ backgroundColor: getTerminalColor() }}
        >
          <TermIcon size={iconSize} />
          <span>{getTerminalLabel()}</span>
        </div>
      </div>
    );
  }

  // No matching step (e.g. rescheduled)
  if (currentIndex === -1) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-500 capitalize">{currentStatus}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${isSmall ? 'gap-1' : 'gap-0'}`}>
      {WORKFLOW_STEPS.map((step, i) => {
        const state = getStepState(i);
        const StepIcon = step.icon;
        const isActive = state === 'active';
        const isCompleted = state === 'completed';

        return (
          <div key={step.key} className={`flex items-center ${isSmall ? '' : 'flex-1'}`}>
            {/* Step circle + icon */}
            <div className="flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.15 : 1,
                  backgroundColor: isCompleted ? step.color : isActive ? step.color : '#e2e8f0',
                }}
                transition={{ duration: 0.3 }}
                className={`flex items-center justify-center rounded-full transition-shadow ${
                  isActive ? 'shadow-lg' : ''
                } ${isSmall ? 'w-7 h-7' : 'w-9 h-9'}`}
                style={{
                  backgroundColor: isCompleted || isActive ? step.color : '#e2e8f0',
                }}
              >
                {isCompleted ? (
                  <CheckCircle2 size={iconSize} className="text-white" />
                ) : (
                  <StepIcon
                    size={iconSize}
                    className={isActive ? 'text-white' : 'text-slate-400'}
                  />
                )}
              </motion.div>

              {/* Label */}
              {showLabels && (
                <span
                  className={`mt-1.5 text-center leading-tight transition-colors ${
                    isSmall ? 'text-[10px] max-w-[50px]' : 'text-[11px] max-w-[70px]'
                  } ${isActive ? 'font-semibold text-slate-800' : isCompleted ? 'text-slate-600' : 'text-slate-400'}`}
                  style={{
                    color: isActive ? step.color : undefined,
                    fontWeight: isActive ? 600 : undefined,
                  }}
                >
                  {step.label}
                </span>
              )}
            </div>

            {/* Connector line between steps */}
            {i < WORKFLOW_STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-1 rounded-full ${isSmall ? 'mx-0.5' : 'mx-2'}`}
                style={{
                  backgroundColor: i < currentIndex ? step.color : '#e2e8f0',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
