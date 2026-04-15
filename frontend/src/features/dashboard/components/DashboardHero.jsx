function DashboardHero({ title, subtitle, summary, roleLabel, lastUpdated }) {
  return (
    <section className="dashboard-hero">
      <div className="dashboard-hero-copy">
        <span className="dashboard-hero-badge">{roleLabel}</span>
        <h2 className="dashboard-hero-title">{title}</h2>
        <p className="dashboard-hero-subtitle">{subtitle}</p>
      </div>

      <div className="dashboard-hero-panel">
        <div className="dashboard-hero-summary-label">Tổng kết hôm nay</div>
        <div className="dashboard-hero-summary">{summary}</div>
        <div className="dashboard-hero-updated">{lastUpdated}</div>
      </div>
    </section>
  );
}

export default DashboardHero;
