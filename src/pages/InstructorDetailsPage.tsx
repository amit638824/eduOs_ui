import PageBanner from '@/components/eduleb/PageBanner';

export default function InstructorDetailsPage() {
  return (
    <>
      <PageBanner title="Instructor Details" crumb="Instructor Details" />
      <section className="ab_area section-padding">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-5 col-sm-12">
              <div className="ab_img">
                <img src="/eduleb/img/ins-details.png" className="img-fluid" alt="instructor" />
              </div>
            </div>
            <div className="col-lg-7 col-sm-12">
              <div className="ab_content">
                <h2>Manuel Nuer</h2>
                <p>
                  <strong>TEACHER</strong>
                </p>
                <p>
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                  veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
                  consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum
                  dolore eu fugiat nulla pariatur.
                </p>
                <ul>
                  <li>
                    <span className="ti-check" /> Expert online educator
                  </li>
                  <li>
                    <span className="ti-check" /> 30+ published courses
                  </li>
                  <li>
                    <span className="ti-check" /> 1000+ students mentored
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
