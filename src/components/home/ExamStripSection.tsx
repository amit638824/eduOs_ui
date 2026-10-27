import { Link } from 'react-router-dom';

const exams = [
  { title: 'CAT', sub: 'MBA Entrance', color: '#ea580c', bg: '#fff7ed' },
  { title: 'JEE', sub: 'Main & Advanced', color: '#2563eb', bg: '#eff6ff' },
  { title: 'UPSC', sub: 'Civil Services', color: '#7c3aed', bg: '#f5f3ff' },
  { title: 'Banking', sub: 'IBPS | SBI | RBI', color: '#dc2626', bg: '#fef2f2' },
  { title: 'SSC', sub: 'CGL | CHSL | CPO', color: '#0891b2', bg: '#ecfeff' },
  { title: 'GATE', sub: 'IITs & PSUs', color: '#16a34a', bg: '#f0fdf4' },
  { title: 'CLAT', sub: 'Law Entrance', color: '#ca8a04', bg: '#fefce8' },
  { title: '& More', sub: 'View all exams', color: '#3861fb', bg: '#eff4ff' },
];

export default function ExamStripSection() {
  return (
    <section className="eduleb-exam-strip">
      <div className="container">
        <div className="text-center mb-4" data-aos="fade-up" data-aos-duration="1000">
          <p className="eduleb-exam-strip-eyebrow">PREPARE FOR TOP EXAMS</p>
        </div>
        <div className="row g-3 justify-content-center">
          {exams.map((exam, idx) => (
            <div
              key={exam.title}
              className="col-6 col-sm-4 col-md-3 col-lg"
              data-aos="fade-up"
              data-aos-delay={idx * 80}
              data-aos-duration="1000"
            >
              <Link to="/exams" className="eduleb-exam-card eduleb-hover-lift">
                <span className="eduleb-exam-icon" style={{ background: exam.bg, color: exam.color }}>
                  {exam.title === '& More' ? '▦' : exam.title.slice(0, 1)}
                </span>
                <span className="eduleb-exam-title">{exam.title}</span>
                <span className="eduleb-exam-sub">{exam.sub}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
