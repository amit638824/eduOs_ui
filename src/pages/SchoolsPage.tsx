import { Link } from 'react-router-dom';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { siteContent } from '@/data/siteContent';

export default function SchoolsPage() {
  const { about, parentCompany } = siteContent;

  return (
    <>
      <Breadcrumb title="For Institutes" />
      <div className="aboutarea__2 sp_top_100 sp_bottom_100">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-xl-6" data-aos="fade-up">
              <div className="aboutarea__content__wraper">
                <div className="aboutarea__button">
                  <div className="default__small__button">Institutes &amp; Colleges</div>
                </div>
                <div className="aboutarea__headding heading__underline">
                  <h2>
                    Online Testing for <span>IT Training Institutes</span>
                  </h2>
                </div>
                <div className="aboutarea__para aboutarea__para__2">
                  <p>
                    {parentCompany.name} helps computer training centers and engineering colleges
                    conduct secure online mock tests, certificate exams, and batch assessments with
                    instant results, rank reports, and wallet-based payments.
                  </p>
                </div>
                <div className="aboutarea__list__2">
                  <ul>
                    {about.features.map((f) => (
                      <li key={f}>
                        <i className="icofont-check" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="populerarea__button__2 sp_top_30">
                  <Link className="default__button" to="/register">
                    Request a Demo
                    <i className="icofont-long-arrow-right" />
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-xl-6" data-aos="fade-up">
              <img loading="lazy" src="/img/about/about_2.png" alt="School testing" className="w-100" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
