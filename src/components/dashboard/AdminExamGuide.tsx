import { Link } from 'react-router-dom';

const SETUP_STEPS = [
  {
    step: 1,
    title: 'Question bank',
    desc: 'Add questions',
    href: '/dashboard/admin-question-bank',
  },
  {
    step: 2,
    title: 'Exam details',
    desc: 'Name, time, rules',
    href: '/dashboard/create-test',
  },
  {
    step: 3,
    title: 'Add questions',
    desc: 'Build the paper',
    href: '/dashboard/admin-course',
  },
  {
    step: 4,
    title: 'Publish',
    desc: 'Make it available',
    href: '/dashboard/admin-course',
  },
  {
    step: 5,
    title: 'Assign',
    desc: 'Students can start',
    href: '/dashboard/admin-course',
  },
] as const;

export interface ExamStepperItem {
  step: number;
  title: string;
  desc: string;
}

interface AdminExamGuideProps {
  activeStep?: number;
  compact?: boolean;
  testId?: string;
}

function stepHref(step: number, testId?: string): string {
  if (!testId) return SETUP_STEPS[step - 1]?.href ?? '/dashboard/admin-course';
  if (step === 3) return `/dashboard/test-builder/${testId}?step=build`;
  if (step === 4) return `/dashboard/test-builder/${testId}?step=publish`;
  if (step === 5) return `/dashboard/test-builder/${testId}?step=assign`;
  return SETUP_STEPS[step - 1]?.href ?? '/dashboard/create-test';
}

export function ExamStepper({
  steps,
  activeStep,
  onStep,
  canOpen,
}: {
  steps: readonly ExamStepperItem[];
  activeStep: number;
  onStep?: (step: number) => void;
  canOpen?: (step: number) => boolean;
}) {
  return (
    <ol className="exam-stepper" aria-label="Steps">
      {steps.map((item) => {
        const done = item.step < activeStep;
        const active = item.step === activeStep;
        const state = done ? 'done' : active ? 'active' : 'todo';
        const open = canOpen ? canOpen(item.step) : item.step <= activeStep;
        return (
          <li key={item.step} className={`exam-stepper__item exam-stepper__item--${state}`}>
            <button
              type="button"
              className="exam-stepper__btn"
              disabled={!onStep || !open}
              onClick={() => {
                if (onStep && open) onStep(item.step);
              }}
            >
              <span className="exam-stepper__dot">{done ? '✓' : item.step}</span>
              <strong>{item.title}</strong>
              <small>{item.desc}</small>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export default function AdminExamGuide({ activeStep, compact = false, testId }: AdminExamGuideProps) {
  return (
    <div className={`sca-exam-guide${compact ? ' sca-exam-guide--compact' : ''}`}>
      {!compact && (
        <div className="sca-exam-guide__header">
          <h4>Exam setup</h4>
          <p>Complete one step at a time. You can return to a finished step from the bar above.</p>
        </div>
      )}
      <ol className="exam-stepper" aria-label="Exam setup">
        {SETUP_STEPS.map((item) => {
          const done = Boolean(activeStep && item.step < activeStep);
          const active = activeStep === item.step;
          const state = done ? 'done' : active ? 'active' : 'todo';
          return (
            <li key={item.step} className={`exam-stepper__item exam-stepper__item--${state}`}>
              <Link to={stepHref(item.step, testId)} className="exam-stepper__btn">
                <span className="exam-stepper__dot">{done ? '✓' : item.step}</span>
                <strong>{item.title}</strong>
                <small>{item.desc}</small>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
