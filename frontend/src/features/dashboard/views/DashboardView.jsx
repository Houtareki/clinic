import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../../context/useAuth";
import { getDashboardStats } from "../../../api/dashboardApi";
import DashboardHero from "../components/DashboardHero";
import DashboardQuickLinkCard from "../components/DashboardQuickLinkCard";
import DashboardStatCard from "../components/DashboardStatCard";
import {
  formatLastUpdated,
  getDashboardQuickLinks,
  getDashboardStatCards,
  getHeroContent,
  getHeroSummary,
  getRoleLabel,
} from "../utils/dashboardUtils";
import "../styles/dashboard.css";

function DashboardView() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [retryToken, setRetryToken] = useState(0);

  const userRole = String(user?.role || "").toUpperCase();
  const statCards = useMemo(
    () => getDashboardStatCards(userRole, stats),
    [stats, userRole],
  );
  const quickLinks = useMemo(
    () => getDashboardQuickLinks(userRole),
    [userRole],
  );
  const heroContent = useMemo(() => getHeroContent(userRole), [userRole]);
  const heroSummary = useMemo(
    () => getHeroSummary(userRole, stats),
    [stats, userRole],
  );

  useEffect(() => {
    let isDisposed = false;

    const fetchStats = async () => {
      if (!userRole) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErrorText("");

        const nextStats = await getDashboardStats({
          role: userRole,
          accountId: user?.accountId,
        });

        if (isDisposed) {
          return;
        }

        setStats(nextStats || {});
        setLastUpdatedAt(new Date());
      } catch (error) {
        if (!isDisposed) {
          setErrorText(error.message || "Không thể tải dashboard.");
        }
      } finally {
        if (!isDisposed) {
          setLoading(false);
        }
      }
    };

    fetchStats();

    return () => {
      isDisposed = true;
    };
  }, [retryToken, user?.accountId, userRole]);

  if (loading) {
    return (
      <div className="dashboard-loading p-5 text-center">
        <div className="spinner-border text-success mb-3" role="status"></div>
        <p className="mb-0 text-muted">Đang tải số liệu dashboard...</p>
      </div>
    );
  }

  if (errorText) {
    return (
      <div className="dashboard-error p-4 p-md-5">
        <h5 className="fw-bold text-dark mb-2">Không thể tải dashboard</h5>
        <p className="text-muted mb-4">{errorText}</p>
        <button
          type="button"
          className="btn btn-primary-custom"
          onClick={() => setRetryToken((currentValue) => currentValue + 1)}
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="dashboard-view">
      <DashboardHero
        title={heroContent.title}
        subtitle={heroContent.subtitle}
        summary={heroSummary}
        roleLabel={getRoleLabel(userRole)}
        lastUpdated={formatLastUpdated(lastUpdatedAt)}
      />

      <section>
        <div className="dashboard-section-heading mb-3">
          <div>
            <h5 className="dashboard-section-title">Số liệu hôm nay</h5>
          </div>
        </div>

        <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-3">
          {statCards.map((card) => (
            <DashboardStatCard key={card.key} {...card} />
          ))}
        </div>
      </section>

      {quickLinks.length > 0 ? (
        <section>
          <div className="dashboard-section-heading mb-3">
            <div>
              <h5 className="dashboard-section-title">Truy cập nhanh</h5>
            </div>
          </div>

          <div className="row row-cols-1 row-cols-lg-2 row-cols-xxl-3 g-3">
            {quickLinks.map((link) => (
              <DashboardQuickLinkCard key={link.to} {...link} />
            ))}
          </div>
        </section>
      ) : (
        <section className="dashboard-empty p-4">
          <h5 className="fw-bold text-dark mb-2">Chưa có liên kết nhanh</h5>
          <p className="mb-0 text-muted">
            Vai trò hiện tại không có tác vụ điều hướng riêng trên dashboard.
          </p>
        </section>
      )}
    </div>
  );
}

export default DashboardView;
