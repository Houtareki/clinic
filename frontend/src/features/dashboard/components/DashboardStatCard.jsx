function DashboardStatCard({ icon, tone, title, value, helperText }) {
  return (
    <div className="col">
      <article className="dashboard-stat-card h-100">
        <div className={`dashboard-stat-icon dashboard-stat-icon-${tone}`}>
          <i className={`fa-solid ${icon}`}></i>
        </div>

        <div className="dashboard-stat-label">{title}</div>
        <div className="dashboard-stat-value">{value}</div>
        <div className="dashboard-stat-helper">{helperText}</div>
      </article>
    </div>
  );
}

export default DashboardStatCard;
