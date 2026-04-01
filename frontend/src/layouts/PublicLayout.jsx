import { Link, Outlet } from "react-router-dom";

function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg bg-white shadow-sm">
      <div className="container">
        <Link className="navbar-brand text-success fs-3" to="/">
          Trustcare Clinic
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMenu"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav ms-auto gap-4 fw-medium">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/about">
                About
              </Link>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                Services
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                Contact
              </a>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/login">
                Login
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <section>
      <div className="container">
        <footer className="row py-5 my-5 border-top">
          <div className="col-lg-4 mb-4">
            <h2 className="text-success mb-3">Trustcare Clinic</h2>
            <p className="text-muted">
              Tận tâm chăm sóc, mang lại nụ cười và sức khỏe dài lâu.
            </p>
            <ul className="list-unstyled text-muted">
              <li className="mb-2">
                <i className="fa-solid fa-location-dot text-primary me-2"></i>
                123 Đường Giải Phóng, Hà Nội
              </li>
              <li className="mb-2">
                <i className="fa-solid fa-phone text-primary me-2"></i>
                09 1234 5678
              </li>
              <li>
                <i className="fa-regular fa-envelope text-primary me-2"></i>
                contact@trustcare.vn
              </li>
            </ul>
          </div>
        </footer>
      </div>
    </section>
  );
}

export default PublicLayout;
