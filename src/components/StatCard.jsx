
export default function StatCard({ label, value, icon: Icon, subtitle, trend, trendPositive }) {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-label">{label}</span>
        {Icon && (
          <div className="stat-icon-wrapper">
            <Icon size={18} />
          </div>
        )}
      </div>
      <div className="stat-value">{value}</div>
      {(subtitle || trend) && (
        <div className="stat-trend">
          {trend && (
            <span
              style={{
                color: trendPositive ? 'var(--success)' : 'var(--danger)',
                fontWeight: 600,
                marginRight: '4px'
              }}
            >
              {trend}
            </span>
          )}
          {subtitle && <span style={{ color: 'var(--text-muted)' }}>{subtitle}</span>}
        </div>
      )}
    </div>
  )
}
