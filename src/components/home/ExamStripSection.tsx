import { Link } from 'react-router-dom';
import type { HomepageContent } from '@/types/homepage';

const fallbackExams = [
  { title: 'CCC & O Level', sub: 'Govt IT Certifications' },
  { title: 'Hardware & Net', sub: 'A+, CCNA & Network Basics' },
  { title: 'Computer App', sub: 'Office Tools & Tally' },
  { title: 'Programming', sub: 'Python, Java & Web Tech' },
  { title: 'Aptitude & Core', sub: 'Quant & Logical Reasoning' },
  { title: 'Diploma Exams', sub: 'Semester & Terminal CBT' },
  { title: 'Skill Screening', sub: 'Hiring & Corporate Tests' },
  { title: '& More', sub: '250+ Practice Tests' },
];

export default function ExamStripSection({ content }: { content?: HomepageContent['exams'] }) {
  const exams = content?.items?.length
    ? content.items.map((exam) => ({ title: exam.title, sub: exam.sub }))
    : fallbackExams;

  return (
    <section className="eduleb-exam-strip">
      <div className="container">
        <div className="text-center mb-4" data-aos="fade-up" data-aos-duration="1000">
          <p className="eduleb-exam-strip-eyebrow">
            {content?.eyebrow || 'POPULAR EXAM CATEGORIES & CERTIFICATIONS'}
          </p>
        </div>
        <div className="row g-3 justify-content-center eduleb-exam-strip-row">
          {exams.map((exam, idx) => (
            <div
              key={exam.title}
              className="col-6 col-sm-4 col-md-3 col-lg"
              data-aos="fade-up"
              data-aos-delay={idx * 80}
              data-aos-duration="1000"
            >
              <Link to="/exams" className="eduleb-exam-card eduleb-hover-lift">
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
