import { motion } from 'framer-motion';

export default function StatCard({
  title,
  value,
  icon,
  color = '#3b82f6',
  subtitle,
  trend,
  trendLabel,
  onClick,
}) {
  const isPositive = trend > 0;
  const trendColor = isPositive ? '#10b981' : '#ef4444';

  return (
    <motion.div
      className="stat-card"
      onClick={onClick}
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="stat-card-header">
        <div
          className="stat-icon-wrapper"
          style={{
            background: `${color}15`,
            color: color,
          }}
        >
          <span>{icon}</span>
        </div>
        {trend !== undefined && (
          <motion.span
            className={`text-xs font-semibold flex items-center gap-0.5 ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span>{isPositive ? '↑' : '↓'}</span>
            {Math.abs(trend)}%
          </motion.span>
        )}
      </div>
      <motion.div
        className="stat-value"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {value}
      </motion.div>
      <div className="stat-title">{title}</div>
      {subtitle && (
        <div className="stat-subtitle">
          {trend !== undefined && (
            <span className={isPositive ? 'stat-trend-up' : 'stat-trend-down'}>
              {isPositive ? '↑' : '↓'}
            </span>
          )}
          {subtitle}
        </div>
      )}
    </motion.div>
  );
}
