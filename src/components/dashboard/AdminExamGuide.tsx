import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getTestsListPath } from '@/utils/dashboardRole';

const STEP_HELP: Record<number, string> = {
  1: 'Add questions here first. When you are done, press Next: Create the exam.',
  2: 'Fill one screen, press Next, then Save & Build Test. You will add questions after that.',
  3: 'Find your draft exam and press Continue setup. That is where you add questions.',
  4: 'Open the exam with Continue setup, check the questions, then press Publish.',
  5: 'After the exam is live, press Assign students and choose who can attempt it.',
};

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

function stepHref(step: number, testId: string | undefined, testsHref: string): string {
  if (testId && step === 3) return `/dashboard/test-builder/${testId}?step=build`;
  if (testId && step === 4) return `/dashboard/test-builder/${testId}?step=publish`;
  if (testId && step === 5) return `/dashboard/test-builder/${testId}?step=assign`;
  if (step >= 3) return testsHref;
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
  const { user } = useAuth();
  const testsHref = getTestsListPath(user?.roles ?? []);
  const help = activeStep ? STEP_HELP[activeStep] : 'Follow the five steps from left to right.';

  return (
    <div className={`sca-exam-guide${compact ? ' sca-exam-guide--compact' : ''}`}>
      {!compact && (
        <div className="sca-exam-guide__header">
          <h4>Exam setup</h4>
          <p>Follow the steps from left to right. Finish the highlighted step before you move on.</p>
        </div>
      )}
      <ol className="exam-stepper" aria-label="Exam setup">
        {SETUP_STEPS.map((item) => {
          const done = Boolean(activeStep && item.step < activeStep);
          const active = activeStep === item.step;
          const state = done ? 'done' : active ? 'active' : 'todo';
          return (
            <li key={item.step} className={`exam-stepper__item exam-stepper__item--${state}`}>
              <Link to={stepHref(item.step, testId, testsHref)} className="exam-stepper__btn">
                <span className="exam-stepper__dot">{done ? '✓' : item.step}</span>
                <strong>{item.title}</strong>
                <small>{item.desc}</small>
              </Link>
            </li>
          );
        })}
      </ol>
      {help ? <p className="exam-stepper__help">{help}</p> : null}
    </div>
  );
}
