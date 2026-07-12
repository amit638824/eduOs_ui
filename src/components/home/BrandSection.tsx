const brands = [
  '/img/brand/brand_1.png',
  '/img/brand/brand_2.png',
  '/img/brand/brand_3.png',
  '/img/brand/brand_4.png',
  '/img/brand/brand_5.png',
];

export default function BrandSection() {
  return (
    <div className="brandarea__2">
      <div className="container">
        <div className="row" data-aos="fade-up">
          <div className="brandarea__wraper brandarea__wraper__2">
            {brands.map((src) => (
              <div key={src} className="brandarea__img">
                <a href="#">
                  <img loading="lazy" src={src} alt="Partner institution" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
