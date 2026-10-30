import { Link } from 'react-router-dom';
import type { HomepageContent } from '@/types/homepage';

const fallbackCategories = [
  { img: '/eduleb/img/e1.png', label: 'Hardware & Networking' },
  { img: '/eduleb/img/e8.png', label: 'CCC & O Level (Govt IT)' },
  { img: '/eduleb/img/e2.png', label: 'Computer Applications' },
  { img: '/eduleb/img/e9.png', label: 'Programming & Coding' },
  { img: '/eduleb/img/e4.png', label: 'Quantitative Aptitude' },
  { img: '/eduleb/img/e5.png', label: 'Logical Reasoning' },
  { img: '/eduleb/img/e7.png', label: 'Diploma & Semester Exams' },
  { img: '/eduleb/img/e6.png', label: 'Cyber Security & IT Tools' },
  { img: '/eduleb/img/e3.png', label: 'Database & SQL Tests' },
  { img: '/eduleb/img/e2.png', label: 'Cloud & Web Technologies' },
  { img: '/eduleb/img/e8.png', label: 'Corporate Skill Screening' },
  { img: '/eduleb/img/e7.png', label: 'General English & Verbal' },
];

export default function CategoriesSection({ content }: { content?: HomepageContent['categories'] }) {
  const categories = content?.items?.length ? content.items : fallbackCategories;
  return (
    <section
      className="top_cat__area section-padding"
      style={{
        backgroundImage: 'url(/eduleb/img/bg/section-2.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
      }}
    >
      <div className="container">
        <div className="section-title text-center" data-aos="fade-up">
          <h2 data-aos="fade-up" data-aos-delay="100">{content?.title || 'Explore Tests by Examination Category'}</h2>
          <p data-aos="fade-up" data-aos-delay="150">
            {content?.description ||
              'Practice with targeted question sets across IT certifications, government exams, university diplomas, and competitive aptitude.'}
          </p>
        </div>
        <div className="row">
          <div className="col-lg-12 col-sm-12 col-xs-12">
            <div className="cat_list">
              <ul>
                {categories.map((cat, i) => (
                  <li
                    key={`${cat.label}-${i}`}
                    className="eduleb-hover-lift"
                    data-aos="zoom-in"
                    data-aos-delay={(i % 6) * 70}
                  >
                    <Link to="/exams">
                      <img src={cat.img} alt={cat.label} /> {cat.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
