function HomePage() {
  return (
    <>
      <section
        className="position-relative text-white"
        style={{ minHeight: "70vh", overflow: "hidden" }}
      >
        <img
          src="/assets/img/intro1.png"
          alt="Clinic"
          className="position-absolute w-100 h-100"
          style={{ objectFit: "cover", top: 0, left: 0 }}
        />
        <div
          className="position-absolute w-100 h-100"
          style={{ background: "rgba(0,0,0,0.5)", top: 0, left: 0 }}
        />
        <div className="container position-relative py-5" style={{ zIndex: 1 }}>
          <div className="row align-items-center" style={{ minHeight: "60vh" }}>
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-3">
                Sức khỏe là vàng
                <br />
                Hãy chăm sóc mỗi ngày
              </h1>
              <p className="fs-5 mb-4 opacity-75">
                Đội ngũ chuyên gia luôn sẵn sàng đồng hành cùng bạn.
              </p>
              <a
                href="#services"
                className="btn btn-success btn-lg px-4 rounded-pill"
              >
                Tìm hiểu thêm
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-5">
        <div className="container">
          <h2 className="fw-bold mb-2">Tinh thần lạc quan</h2>
          <p className="text-muted mb-5">Cuộc sống khỏe mạnh</p>

          <div className="row g-4">
            {services.map((service) => (
              <div key={service.title} className="col-lg-4">
                <div className="card border-0 shadow-sm h-100 text-center p-4">
                  <img
                    src={service.icon}
                    alt={service.title}
                    className="mx-auto mb-3"
                    height="60"
                  />
                  <h4 className="fw-bold">{service.title}</h4>
                  <p className="text-muted">{service.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-light py-5">
        <div className="container text-center">
          <h3 className="fw-bold mb-2">Đối tác đồng hành</h3>
          <p className="text-muted mb-4">
            Hợp tác với các tổ chức y tế hàng đầu.
          </p>
        </div>
      </section>
    </>
  );
}

const services = [
  {
    title: "Khám tổng quát",
    icon: "/assets/img/icons/services1.svg",
    desc: "Cung cấp các gói khám toàn diện, giúp phát hiện sớm các nguy cơ tiềm ẩn.",
  },
  {
    title: "Tư vấn dinh dưỡng",
    icon: "/assets/img/icons/services2.svg",
    desc: "Xây dựng chế độ ăn uống khoa học, cá nhân hóa theo từng thể trạng.",
  },
  {
    title: "Chăm sóc chuyên sâu",
    icon: "/assets/img/icons/services3.svg",
    desc: "Áp dụng công nghệ y khoa tiên tiến, phác đồ điều trị chuẩn quốc tế.",
  },
];

export default HomePage;
