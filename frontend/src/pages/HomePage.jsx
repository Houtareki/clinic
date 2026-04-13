function HomePage() {
  return (
    <>
      <section className="hero-section text-white">
        <img
          src="/assets/img/intro1.png"
          alt="Clinic"
          className="hero-bg-img"
        />
        <div className="hero-overlay"></div>

        <div className="container py-5 hero-content">
          <div className="row align-items-center" style={{ minHeight: "60vh" }}>
            <div className="col-lg-6">
              <h1 className="hero-title display-4 fw-bold mb-3">
                Sức khỏe là vàng
                <br />
                Hãy chăm sóc mỗi ngày
              </h1>
              <p className="hero-subtitle fs-5 mb-4 opacity-75">
                Đội ngũ chuyên gia luôn sẵn sàng đồng hành cùng bạn.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-5">
        <div className="container">
          <div className="d-flex flex-column align-items-start">
            <h2 className="hero-title fw-bold mb-2 pb-2 border-bottom text-start">
              Tinh thần lạc quan <br />
              Cuộc sống khỏe mạnh
            </h2>
          </div>

          <div className="row g-4 py-5 row-cols-1 row-cols-lg-3 justify-content-between">
            {services.map((service) => (
              <div key={service.title} className="col-lg-4">
                <div className="feature bg-card d-flex flex-column text-center h-100 p-4 border-0 shadow-sm">
                  <div className="feature-icon d-inline-flex align-items-center justify-content-center fs-2 mb-3">
                    <img src={service.icon} alt={service.title} height="60" />
                  </div>

                  <h3 className="fs-2 fw-bold text-white mb-3">
                    {service.title}
                  </h3>
                  <p className="text-white mb-4">{service.desc}</p>

                  <a
                    href="#"
                    className="icon-link mt-auto mx-auto d-flex align-items-center gap-1 text-decoration-none"
                  >
                    Call to action
                    <svg
                      className="bi"
                      aria-hidden="true"
                      width="16"
                      height="16"
                      fill="currentColor"
                    >
                      <use xlinkHref="#chevron-right"></use>
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container py-5">
        <div
          id="carouselExampleIndicators"
          className="carousel slide"
          data-bs-ride="carousel"
          data-bs-interval="2000"
        >
          <div className="carousel-indicators">
            <button
              type="button"
              data-bs-target="#carouselExampleIndicators"
              data-bs-slide-to="0"
              className="active"
              aria-current="true"
              aria-label="Slide 1"
            ></button>
            <button
              type="button"
              data-bs-target="#carouselExampleIndicators"
              data-bs-slide-to="1"
              aria-label="Slide 2"
            ></button>
            <button
              type="button"
              data-bs-target="#carouselExampleIndicators"
              data-bs-slide-to="2"
              aria-label="Slide 3"
            ></button>
          </div>
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img
                src="/assets/img/image.png"
                className="d-block w-100"
                alt="Clinic Image 1"
              />
            </div>
            <div className="carousel-item">
              <img
                src="/assets/img/image2.png"
                className="d-block w-100"
                alt="Clinic Image 2"
              />
            </div>
            <div className="carousel-item">
              <img
                src="/assets/img/image3.png"
                className="d-block w-100"
                alt="Clinic Image 3"
              />
            </div>
          </div>
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#carouselExampleIndicators"
            data-bs-slide="prev"
          >
            <span
              className="carousel-control-prev-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#carouselExampleIndicators"
            data-bs-slide="next"
          >
            <span
              className="carousel-control-next-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </div>

      <section id="testimonial">
        <div className="p-5 text-center bg-body-tertiary">
          <div className="container py-5">
            <h2 className="text-body-emphasis fw-bold">Đối tác đồng hành</h2>
            <p className="col-lg-8 mx-auto lead text-muted">
              Chúng tôi tự hào được hợp tác cùng các tổ chức y tế và nền tảng
              công nghệ hàng đầu để không ngừng nâng cao chất lượng dịch vụ chăm
              sóc sức khỏe cho cộng đồng.
            </p>
          </div>

          <div className="container text-center">
            <div className="row align-items-center">
              <div className="col-xxl-3 col-sm-12 mb-4 mb-xxl-0">
                <img
                  src="/assets/img/icons/aamc.png"
                  alt="aamc logo"
                  height="60"
                />
              </div>
              <div className="col-xxl-3 col-sm-12 mb-4 mb-xxl-0">
                <img
                  src="/assets/img/icons/health partner.png"
                  alt="health partner logo"
                  height="60"
                />
              </div>
              <div className="col-xxl-3 col-sm-12 mb-4 mb-xxl-0">
                <img
                  src="/assets/img/icons/global award.png"
                  alt="global award"
                  height="60"
                />
              </div>
              <div className="col-xxl-3 col-sm-12 mb-4 mb-xxl-0">
                <img
                  src="/assets/img/icons/german.png"
                  alt="german award"
                  height="60"
                />
              </div>
            </div>
          </div>
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
