export default function StatCard({ title, value, icon, color = '#4f46e5', subtitle, onClick }) {
  return (
    <div className="stat-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="stat-card-header">
        <div className="stat-icon" style={{ backgroundColor: `${color}15`, color }}>
          {icon}
        </div>
      </div>
      <div className="stat-card-body">
        <h3 className="stat-value">{value ?? '—'}</h3>
        <p className="stat-title">{title}</p>
        {subtitle && <span className="stat-subtitle">{subtitle}</span>}
      </div>
    </div>
  );
}
