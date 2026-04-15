import { Link } from "react-router-dom";

function DashboardQuickLinkCard({ to, icon, title, description, tone }) {
  return (
    <div className="col">
      <Link
        to={to}
        className={`dashboard-quick-link dashboard-quick-link-${tone} h-100 text-decoration-none`}
      >
        <div className="dashboard-quick-link-icon">
          <i className={`fa-solid ${icon}`}></i>
        </div>

        <div className="dashboard-quick-link-content">
          <h3 className="dashboard-quick-link-title">{title}</h3>
          <p className="dashboard-quick-link-description">{description}</p>
        </div>

        <span className="dashboard-quick-link-arrow">
          <i className="fa-solid fa-arrow-right"></i>
        </span>
      </Link>
    </div>
  );
}

export default DashboardQuickLinkCard;
