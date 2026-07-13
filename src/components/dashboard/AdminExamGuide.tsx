import { Link } from 'react-router-dom';

const STEPS = [
  {
    step: 1,
    title: 'Question Bank',
    desc: 'Add & approve questions',
    href: '/dashboard/admin-question-bank',
  },
  {
    step: 2,
    title: 'Create Test',
    desc: 'New exam draft',
    href: '/dashboard/create-test',
  },
  {
    step: 3,
    title: 'Build Test',
    desc: 'Attach questions',
    href: '/dashboard/admin-course',
  },
  {
    step: 4,
    title: 'Publish',
    desc: 'Make test live',
    href: '/dashboard/admin-course',
  },
  {
    step: 5,
    title: 'Assign Students',
    desc: 'Students can attempt',
    href: '/dashboard/admin-course',
  },
] as const;

interface AdminExamGuideProps {
  activeStep?: number;
  compact?: boolean;
}

export default function AdminExamGuide({ activeStep, compact = false }: AdminExamGuideProps) {
  return (
    <div className={`sca-exam-guide${compact ? ' sca-exam-guide--compact' : ''}`}>
      {!compact && (
        <div className="sca-exam-guide__header">
          <h4>Exam Setup Flow</h4>
          <p>Follow these steps to run a complete online test from Super Admin / Org Admin dashboard.</p>
        </div>
      )}
      <ol className="sca-exam-guide__steps">
        {STEPS.map((s) => (
          <li
            key={s.step}
            className={`sca-exam-guide__step${activeStep === s.step ? ' sca-exam-guide__step--active' : ''}${activeStep && activeStep > s.step ? ' sca-exam-guide__step--done' : ''}`}
          >
            <Link to={s.href} className="sca-exam-guide__link">
              <span className="sca-exam-guide__num">{s.step}</span>
              <span className="sca-exam-guide__text">
                <strong>{s.title}</strong>
                <small>{s.desc}</small>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
