import React from "react";

const SchoolLandingPage = () => {
  return (
    <div>
      {/* Navbar */}
      <nav
        className="navbar navbar-expand-lg navbar-light p-3 fixed-top shadow-sm"
        style={{ backgroundColor: "rgba(255, 255, 255, 0.9)" }}
      >
        <div className="container">
          <a className="navbar-brand fw-bold text-dark" href="#">
            Bright Future Academy
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto fs-5">
              <li className="nav-item active">
                <a className="nav-link fw-medium text-dark" href="#home">
                  Home
                </a>
              </li>
              <li className="nav-item me-3">
                <a className="nav-link fw-medium text-dark" href="#about">
                  About
                </a>
              </li>
              <li className="nav-item me-3">
                <a className="nav-link fw-medium text-dark" href="#features">
                  Admission
                </a>
              </li>
             
              <li className="nav-item me-3">
                <a className="nav-link fw-medium text-dark" href="#features">
                  E-Learning
                </a>
              </li>
              <li className="nav-item me-3">
                <a className="nav-link fw-medium text-dark" href="#features">
                  Parents
                </a>
              </li>
               <li className="nav-item me-3">
                <a className="nav-link fw-medium text-dark" href="#features">
                  Features
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link fw-medium text-dark" href="#contact">
                  Contact
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link fw-medium text-dark" href="#contact">
                  Login
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header
        id="home"
        className="text-white text-center pt-5 position-relative d-flex align-items-center justify-content-center"
        style={{
          backgroundImage: "url('./images/school/school3.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "80vh",
          marginTop: "56px", // To avoid overlap with fixed navbar
          textShadow: "1px 1px 5px rgba(0,0,0,0.6)",
        }}
      >
        <div className="container">
          <h2 className="display-4 fw-bold">
            Empowering Students for a Brighter Future
          </h2>
          <p className="lead">
            Join Bright Future Academy and experience quality education with
            cutting-edge technology.
          </p>
        </div>
        3{/* Core Values Section */}
        <div
          className="container mt-4 position-absolute start-50 translate-middle-x w-100 px-3"
          style={{ bottom: "-50px" }}
        >
          <div className="row g-3">
            {/* Core Values Card */}
            <div className="col-lg-4 col-md-6">
              <div
                className="card p-4 text-start text-white shadow-lg rounded-3"
                style={{
                  minHeight: "25vh",
                  objectFit: "cover",
                  backgroundColor: "rgba(60, 104, 104, 0.72)",
                }}
              >
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h5 className="fw-bold">
                      <a
                        href="#"
                        className="text-decoration-underline text-white"
                      >
                        OUR CORE VALUES
                      </a>
                    </h5>
                    <p className="mb-0">
                      God consciousness, truthfulness, respect, diligence &
                      valuable contribution.
                    </p>
                  </div>
                  <img
                    src="./images/envelop.png"
                    width={50}
                    className="ms-3"
                    alt="Icon"
                  />
                </div>
              </div>
            </div>

            {/* Vision Card */}
            <div className="col-lg-4 col-md-6">
              <div
                className="card p-4 text-start text-white shadow-lg rounded-3"
                style={{
                  minHeight: "25vh",
                  objectFit: "cover",
                  backgroundColor: "rgba(60, 104, 104, 0.72)",
                }}
              >
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h5 className="fw-bold">
                      <a
                        href="#"
                        className="text-decoration-underline text-white"
                      >
                        OUR VISION
                      </a>
                    </h5>
                    <p className="mb-0">
                      Learn <br />
                      Inspire &amp; <br />
                      Excel
                    </p>
                  </div>
                  <img
                    src="./images/envelop.png"
                    width={50}
                    className="ms-3"
                    alt="Icon"
                  />
                </div>
              </div>
            </div>

            {/* Mission Card */}
            <div className="col-lg-4 ">
              <div
                className="card p-4 text-start text-white shadow-lg rounded-3"
                style={{
                  minHeight: "25vh",
                  objectFit: "cover",
                  backgroundColor: "rgba(60, 104, 104, 0.72)",
                }}
              >
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h5 className="fw-bold">
                      <a
                        href="#"
                        className="text-decoration-underline text-white"
                      >
                        OUR MISSION
                      </a>
                    </h5>
                    <p className="mb-0" style={{ fontSize: "14px " }}>
                      To bring about positive change in society by creating a
                      collaborative learning community characterized by Islamic
                      moral values and academic excellence.
                    </p>
                  </div>
                  <img
                    src="./images/envelop.png"
                    width={50}
                    className="ms-3"
                    alt="Icon"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Message From The Head Of School */}
      <section
        id="message"
        className=" m-4 bg-white"
        style={{ padding: "100px 0 50px 0" }}
      >
        <div className="container">
          <div className="row align-items-center p-5">
            {/* Image Section */}
            <div className="col-md-5 text-center">
              <img
                src="./images/school/school6.jpg"
                alt="Head of School"
                className="img-fluid rounded shadow-lg"
              />
            </div>

            {/* Text Section */}
            <div className="col-md-7">
              <h2 className="fw-bold">Message from the Head of School</h2>
              <p className="lead text-muted">
                Welcome to Bright Future Academy! We are dedicated to nurturing
                young minds with a blend of academic excellence and moral
                values.Many thanks for taking the time off your busy schedule to
                visit our website. I hope you find it very interesting and
                informative and that it answers any question(s) you may have
                about the school. At Premier International School, we offer a
                unique curriculum comprising of the National, Cambridge
                (British) and a blend of the American curricula.{" "}
              </p>
              <p>
                Our mission is to provide an engaging and supportive environment
                where students can develop intellectually, socially, and
                ethically. With a team of passionate educators, modern
                resources, and a holistic curriculum, we aim to inspire lifelong
                learners who will make meaningful contributions to society.
              </p>
              <p>
                We look forward to partnering with parents and the community in
                shaping the future of our students. Thank you for being a part
                of our journey.
              </p>
              <h5 className="fw-bold mt-3">Dr. [Head of School's Name]</h5>
              <p className="text-muted">
                Head of School, Bright Future Academy
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section
        id="about"
        className="py-5"
        style={{
          minHeight: "25vh",
          objectFit: "cover",
          backgroundColor: "rgba(119, 182, 182, 0.72)",
        }}
      >
        <div className="container text-center">
          <h2 className="fw-bold">Why Choose Bright Future Academy?</h2>
          <p className="lead text-muted " style={{ padding: "0 150px " }}>
            We offer a comprehensive education that blends the Nigerian National
            Curriculum and the Cambridge IGCSE framework ensuring academic
            excellence and strong moral values.
          </p>
          <img
            src="./images/students2.jpeg"
            width={350}
            className="img-fluid mt-3"
            alt="School"
          />
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section id="events" className="py-5 bg-light">
        <div className="container text-center">
          <h2 className="fw-bold">Upcoming Events</h2>
          <p className="lead">
            Stay updated with our latest programs and activities.
          </p>

          <div className="row m-4">
            {/* Event 1 */}
            <div className="col-md-4">
              <div className="card shadow h-100">
                <img
                  src="./images/school/school1.jpg"
                  className="card-img-top"
                  alt="Event 1"
                />
                <div className="card-body">
                  <h5 className="card-title fw-bold">
                    Science & Innovation Fair
                  </h5>
                  <p className="card-text">
                    Join us for an exciting exhibition of student projects,
                    showcasing creativity and technological advancements.
                  </p>
                  <p className="text-muted">
                    <i className="bi bi-calendar-event"></i> July 20, 2024
                  </p>
                  <button className="btn btn-primary">Learn More</button>
                </div>
              </div>
            </div>

            {/* Event 2 */}
            <div className="col-md-4">
              <div className="card shadow h-100">
                <img
                  src="./images/school/school2.jpg"
                  className="card-img-top"
                  alt="Event 2"
                />
                <div className="card-body">
                  <h5 className="card-title fw-bold">
                    Parent-Teacher Conference
                  </h5>
                  <p className="card-text">
                    An opportunity for parents to engage with teachers, discuss
                    academic progress, and strengthen collaboration.
                  </p>
                  <p className="text-muted">
                    <i className="bi bi-calendar-event"></i> August 5, 2024
                  </p>
                  <button className="btn btn-primary">Learn More</button>
                </div>
              </div>
            </div>

            {/* Event 3 */}
            <div className="col-md-4">
              <div className="card shadow h-100">
                <img
                  src="./images/students2.jpeg"
                  className="card-img-top"
                  alt="Event 3"
                />
                <div className="card-body">
                  <h5 className="card-title fw-bold">Annual Sports Day</h5>
                  <p className="card-text">
                    Experience a fun-filled day with various sporting
                    activities, teamwork, and friendly competitions.
                  </p>
                  <p className="text-muted">
                    <i className="bi bi-calendar-event"></i> September 10, 2024
                  </p>
                  <button className="btn btn-primary">Learn More</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

   {/* Features Section */}
<section
  id="features"
  className="py-5 text-white"
  style={{
    backgroundImage: "url('/images/students3.jpeg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    minHeight: "60vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  }}
>
    {/* Overlay with Blur Effect */}
    <div
    className="position-absolute top-0 start-0 w-100 h-100"
    style={{
      backdropFilter: "blur(5px)", // Increased blur effect
      backgroundColor: "rgba(0, 0, 0, 0.4)", // Semi-transparent dark overlay
    }}
  ></div>
  
  <div className="container text-center position-relative">
    <h2 className="fw-bold mb-4">Our Features</h2>
    <p className="text-light" style={{  padding: "0 120px",  }}>
      Our school is modern, spacious, and innovative. Facilities are designed 
      to enhance teaching and learning, providing a well-resourced and motivational 
      environment for our pupils.
    </p>
    <div className="row">
      
      {/* Information Technology */}
      <div className="col-md-4">
        <div className="card p-4 bg-light bg-opacity-75">
          <h4><i className="fas fa-laptop-code"></i> Information Technology</h4>
          <p>
            Equipped with ICT labs, multimedia projectors, and smart boards, our school ensures hands-on learning experiences for pupils.
          </p>
        </div>
      </div>

      {/* Expert Teachers */}
      <div className="col-md-4">
        <div className="card p-4 bg-light bg-opacity-75">
          <h4><i className="fas fa-chalkboard-teacher"></i> Expert Teachers</h4>
          <p>
            Our passionate, knowledgeable, and resourceful educators inspire and nurture every child's potential.
          </p>
        </div>
      </div>

      {/* Music */}
      <div className="col-md-4">
        <div className="card p-4 bg-light bg-opacity-75">
          <h4><i className="fas fa-music"></i> Music</h4>
          <p>
            Our music program includes a variety of instruments, fostering creativity and a love for the arts.
          </p>
        </div>
      </div>

    </div>

    <div className="row mt-4">
      
      {/* Extracurricular Activities */}
      <div className="col-md-4">
        <div className="card p-4 bg-light bg-opacity-75">
          <h4><i className="fas fa-theater-masks"></i> Extracurricular Activities</h4>
          <p>
            Offering ballet, karate, science club, and arts, we help pupils develop talents beyond the classroom.
          </p>
        </div>
      </div>

      {/* Library */}
      <div className="col-md-4">
        <div className="card p-4 bg-light bg-opacity-75">
          <h4><i className="fas fa-book-reader"></i> Library</h4>
          <p>
            Each classroom has a mini-library, and we offer extensive resources to support pupils' learning journey.
          </p>
        </div>
      </div>

      {/* Video Lessons */}
      <div className="col-md-4">
        <div className="card p-4 bg-light bg-opacity-75">
          <h4><i className="fas fa-video"></i> Video Lessons</h4>
          <p>
            Access teacher-led instructional videos and digital resources for Mathematics, English, and more.
          </p>
        </div>
      </div>

    </div>
  </div>
</section>

      {/* Contact Us Section */}
      <section id="contact" className="py-5 bg-light">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <h2 className="text-center fw-bold mb-4">Contact Us</h2>
              <p className="text-center text-muted mb-4">
                Have questions? Feel free to reach out, and we'll get back to
                you as soon as possible.
              </p>

              <form>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="subject" className="form-label">
                    Subject
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="subject"
                    placeholder="Enter the subject"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="message" className="form-label">
                    Message
                  </label>
                  <textarea
                    className="form-control"
                    id="message"
                    rows="3"
                    placeholder="Enter your message"
                    required
                  ></textarea>
                </div>

                <div className="d-grid">
                  <button type="submit" className="btn btn-primary btn-lg">
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer
        className=" text-white pt-5 pb-4"
        style={{
          minHeight: "45vh",
          objectFit: "cover",
          backgroundColor: "rgba(119, 182, 182, 0.72)",
        }}
      >
        <div className="container">
          <div className="row">
            {/* About Section */}
            <div className="col-md-4">
              <h5 className="fw-bold">About Bright Future Academy</h5>
              <p className="text-muted">
                Bright Future Academy provides a well-rounded education by
                integrating modern learning techniques with strong moral and
                ethical values. We aim to nurture the next generation of leaders
                through academic excellence and character development.
              </p>
            </div>

            {/* Quick Links */}
            <div className="col-md-2">
              <h5 className="fw-bold">Quick Links</h5>
              <ul className="list-unstyled">
                <li>
                  <a href="#about" className="text-muted text-decoration-none">
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="text-muted text-decoration-none"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a href="#events" className="text-muted text-decoration-none">
                    Events
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-muted text-decoration-none"
                  >
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#admissions"
                    className="text-muted text-decoration-none"
                  >
                    Admissions
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div className="col-md-3">
              <h5 className="fw-bold">Contact Information</h5>
              <p className="text-muted">
                <i className="fas fa-map-marker-alt"></i> 123 Academy Street,
                City, Country
              </p>
              <p className="text-muted">
                <i className="fas fa-envelope"></i>{" "}
                contact@brightfutureacademy.com
              </p>
              <p className="text-muted">
                <i className="fas fa-phone"></i> +123 456 7890
              </p>
            </div>

            {/* Social Media */}
            <div className="col-md-3">
              <h5 className="fw-bold">Follow Us</h5>
              <p className="text-muted">
                Stay connected with us on social media.
              </p>
              <div>
                <a href="#" className="text-white me-3">
                  <i className="fab fa-facebook fa-lg"></i>
                </a>
                <a href="#" className="text-white me-3">
                  <i className="fab fa-twitter fa-lg"></i>
                </a>
                <a href="#" className="text-white me-3">
                  <i className="fab fa-instagram fa-lg"></i>
                </a>
                <a href="#" className="text-white">
                  <i className="fab fa-linkedin fa-lg"></i>
                </a>
              </div>
            </div>
          </div>

          {/* Copyright Section */}
          <hr className="mt-4 border-light" />
          <div className="text-center text-muted">
            &copy; {new Date().getFullYear()} Bright Future Academy. All Rights
            Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SchoolLandingPage;
