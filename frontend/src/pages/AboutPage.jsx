function AboutPage() {
  return (
    <>
      <section
        className="position-relative text-white"
        style={{ minHeight: "40vh", overflow: "hidden" }}
      >
        <img
          src="/assets/img/intro1.png"
          alt="About"
          className="position-absolute w-100 h-100"
          style={{ objectFit: "cover", top: 0, left: 0 }}
        />
        <div
          className="position-absolute w-100 h-100"
          style={{ background: "rgba(0,0,0,0.5)", top: 0, left: 0 }}
        />
        <div className="container position-relative py-5" style={{ zIndex: 1 }}>
          <div className="py-5">
            <h1 className="display-4 fw-bold">Về Trustcare Clinic</h1>
            <p className="fs-5 opacity-75">
              Chăm sóc sức khỏe của bạn là sứ mệnh hàng đầu của chúng tôi.
            </p>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container py-4">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <img
                src="/assets/img/image.png"
                alt="About Trustcare"
                className="img-fluid rounded-4 shadow"
              />
            </div>
            <div className="col-lg-6">
              <h2 className="fw-bold text-success mb-4">
                Chào mừng đến với Trustcare
              </h2>
              <p className="text-muted fs-5 mb-4">
                Tại Trustcare Clinic, chúng tôi tin rằng "Sức khỏe là tài sản vô
                giá".
              </p>
              <ul className="list-unstyled d-flex flex-column gap-3 text-muted">
                {features.map((f) => (
                  <li key={f}>
                    <i className="fa-solid fa-check text-success me-2"></i>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

const features = [
  "Đội ngũ bác sĩ chuyên môn cao, giàu kinh nghiệm.",
  "Trang thiết bị y tế hiện đại, đạt chuẩn quốc tế.",
  "Dịch vụ chăm sóc khách hàng tận tình 24/7.",
];

export default AboutPage;
