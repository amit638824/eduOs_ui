import { Link } from 'react-router-dom';
import type { HomepageContent } from '@/types/homepage';

const fallbackExams = [
  { title: 'CCC & O Level', sub: 'Govt IT Certifications', color: '#ea580c', bg: '#fff7ed' },
  { title: 'Hardware & Net', sub: 'A+, CCNA & Network Basics', color: '#2563eb', bg: '#eff6ff' },
  { title: 'Computer App', sub: 'Office Tools & Tally', color: '#7c3aed', bg: '#f5f3ff' },
  { title: 'Programming', sub: 'Python, Java & Web Tech', color: '#dc2626', bg: '#fef2f2' },
  { title: 'Aptitude & Core', sub: 'Quant & Logical Reasoning', color: '#0891b2', bg: '#ecfeff' },
  { title: 'Diploma Exams', sub: 'Semester & Terminal CBT', color: '#16a34a', bg: '#f0fdf4' },
  { title: 'Skill Screening', sub: 'Hiring & Corporate Tests', color: '#ca8a04', bg: '#fefce8' },
  { title: '& More', sub: '250+ Practice Tests', color: '#3861fb', bg: '#eff4ff' },
];

export default function ExamStripSection({ content }: { content?: HomepageContent['exams'] }) {
  const exams = content?.items?.length ? content.items : fallbackExams;
  return (
    <section className="eduleb-exam-strip">
      <div className="container">
        <div className="text-center mb-4" data-aos="fade-up" data-aos-duration="1000">
          <p className="eduleb-exam-strip-eyebrow">{content?.eyebrow || 'POPULAR EXAM CATEGORIES & CERTIFICATIONS'}</p>
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
