import { Link } from 'react-router-dom';

const categories = [
  { img: '/eduleb/img/e1.png', label: 'Digital Marketing' },
  { img: '/eduleb/img/e2.png', label: 'UI/UX Design' },
  { img: '/eduleb/img/e3.png', label: '3D Visual Design' },
  { img: '/eduleb/img/e4.png', label: 'Content Marketing' },
  { img: '/eduleb/img/e5.png', label: 'Photography' },
  { img: '/eduleb/img/e6.png', label: 'Photo Lifestyle' },
  { img: '/eduleb/img/e7.png', label: 'Art & Design' },
  { img: '/eduleb/img/e8.png', label: 'Finance & Banking' },
  { img: '/eduleb/img/e9.png', label: 'Graphic Design' },
  { img: '/eduleb/img/e2.png', label: 'Interior Design' },
  { img: '/eduleb/img/e3.png', label: '3D Visual Design' },
  { img: '/eduleb/img/e7.png', label: 'Art & Design' },
];

export default function CategoriesSection() {
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
          <h2 data-aos="fade-up" data-aos-delay="100">Find out by popular Categories</h2>
          <p data-aos="fade-up" data-aos-delay="150">
            We offer a brand new approach to the most basic learning paradigms. Choose from a wide
            range of learning options and gain new skills! Our school is know.
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
                      <img src={cat.img} alt="category-image" /> {cat.label}
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
