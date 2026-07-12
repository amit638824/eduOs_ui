import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { examinationService } from '@/services';
import { parseApiError } from '@/lib/errors';
import { FormError, inputClassName } from '@/components/ui/FormField';
import { createTestApiSchema, type CreateTestApiFormValues } from '@/validators/schemas';
import type { AttemptQuestion, ExamResult, ExamTest, Question, TestAttempt } from '@/types/examination';
import { useAuth } from '@/context/AuthContext';
import { profileSettingsSchema, type ProfileSettingsFormValues } from '@/validators/schemas';

export function QuestionBankPanel() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newQ, setNewQ] = useState('');
  const [questionType, setQuestionType] = useState<'mcq' | 'msq' | 'true_false' | 'fill_blank' | 'integer' | 'numerical'>('mcq');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [correct, setCorrect] = useState('1');
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await examinationService.listQuestions(1, 50);
      setQuestions(res.data);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const created = await examinationService.createQuestion({
        type: questionType,
        content: { text: newQ },
        marks: 1,
        difficulty: 2,
        options:
          questionType === 'fill_blank'
            ? [{ content: { text: opt1 }, isCorrect: true }]
            : questionType === 'integer' || questionType === 'numerical'
              ? [{ content: { value: Number(opt1) || 0 }, isCorrect: true }]
              : [
                  { content: { text: opt1 }, isCorrect: correct === '1' },
                  { content: { text: opt2 }, isCorrect: correct === '2' },
                ],
      });
      await examinationService.approveQuestion(created.id);
      setNewQ('');
      setOpt1('');
      setOpt2('');
      setMessage('Question created and approved.');
      await load();
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title">
        <h4>Question Bank</h4>
      </div>
      {error && <p className="login__error sp_bottom_15">{error}</p>}
      {message && <p className="form-success sp_bottom_15">{message}</p>}
      <form onSubmit={handleCreate} className="sp_bottom_30">
        <div className="row">
          <div className="col-xl-3 sp_bottom_15">
            <select className="form-select" value={questionType} onChange={(e) => setQuestionType(e.target.value as typeof questionType)}>
              <option value="mcq">MCQ</option>
              <option value="msq">MSQ</option>
              <option value="true_false">True/False</option>
              <option value="fill_blank">Fill Blank</option>
              <option value="integer">Integer</option>
              <option value="numerical">Numerical</option>
            </select>
          </div>
          <div className="col-xl-12 sp_bottom_15">
            <input
              className="register__input"
              placeholder="Question text"
              value={newQ}
              onChange={(e) => setNewQ(e.target.value)}
              required
            />
          </div>
          <div className="col-xl-5 sp_bottom_15">
            <input className="register__input" placeholder="Option 1" value={opt1} onChange={(e) => setOpt1(e.target.value)} required />
          </div>
          <div className="col-xl-5 sp_bottom_15">
            <input className="register__input" placeholder="Option 2" value={opt2} onChange={(e) => setOpt2(e.target.value)} required />
          </div>
          <div className="col-xl-2 sp_bottom_15">
            <select className="form-select" value={correct} onChange={(e) => setCorrect(e.target.value)}>
              <option value="1">Opt 1 correct</option>
              <option value="2">Opt 2 correct</option>
            </select>
          </div>
          <div className="col-xl-12">
            <button type="submit" className="default__button">Add MCQ Question</button>
          </div>
        </div>
      </form>
      {loading ? (
        <p>Loading questions...</p>
      ) : (
        <div className="dashboard__table table-responsive">
          <table>
            <thead>
              <tr>
                <th>Question</th>
                <th>Type</th>
                <th>Status</th>
                <th>Marks</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id}>
                  <td>{q.content?.text ?? '—'}</td>
                  <td>{q.type}</td>
                  <td>{q.status}</td>
                  <td>{q.marks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function TestsListPanel({ title }: { title: string }) {
  const [tests, setTests] = useState<ExamTest[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    examinationService
      .listTests(1, 50)
      .then((res) => setTests(res.data))
      .catch((err) => setError(parseApiError(err)));
  }, []);

  const publish = async (id: string) => {
    try {
      await examinationService.publishTest(id);
      const res = await examinationService.listTests(1, 50);
      setTests(res.data);
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title">
        <h4>{title}</h4>
        <Link to="/dashboard/create-test">Create Test</Link>
      </div>
      {error && <p className="login__error sp_bottom_15">{error}</p>}
      <div className="dashboard__table table-responsive">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Duration</th>
              <th>Marks</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {tests.map((t) => (
              <tr key={t.id}>
                <td>{t.title}</td>
                <td>{t.status}</td>
                <td>{t.duration_minutes} min</td>
                <td>{t.total_marks ?? '—'}</td>
                <td>
                  {t.status === 'draft' && (
                    <>
                      <Link to={`/dashboard/test-builder/${t.id}`} className="dashboard__small__btn__2 me-2">
                        Build
                      </Link>
                      <button type="button" className="dashboard__small__btn__2" onClick={() => publish(t.id)}>
                        Publish
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function StudentTestsPanel() {
  const navigate = useNavigate();
  const [tests, setTests] = useState<ExamTest[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    examinationService
      .listMyAssignedTests()
      .then(setTests)
      .catch((err) => setError(parseApiError(err)));
  }, []);

  const start = async (testId: string) => {
    setLoading(true);
    setError('');
    try {
      const attempt = await examinationService.startAttempt(testId);
      navigate(`/dashboard/exam/${testId}/attempt/${attempt.id}`);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title">
        <h4>My Assigned Tests</h4>
      </div>
      {error && <p className="login__error sp_bottom_15">{error}</p>}
      <div className="row">
        {tests.map((t) => (
          <div key={t.id} className="col-xl-4 col-lg-6 sp_bottom_20">
            <div className="dashboard__single__counter">
              <div className="counterarea__text__wraper">
                <div className="counter__content__wraper">
                  <h5>{t.title}</h5>
                  <p>{t.duration_minutes} min · Pass: {t.passing_marks ?? '—'}</p>
                  <button
                    type="button"
                    className="default__button sp_top_15"
                    disabled={loading}
                    onClick={() => start(t.id)}
                  >
                    Start Test
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {!tests.length && !error && <p>No tests assigned yet.</p>}
      </div>
    </div>
  );
}

export function AttemptsListPanel({ title }: { title: string }) {
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    examinationService
      .listAttempts(1, 50)
      .then((res) => setAttempts(res.data))
      .catch((err) => setError(parseApiError(err)));
  }, []);

  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title">
        <h4>{title}</h4>
      </div>
      {error && <p className="login__error sp_bottom_15">{error}</p>}
      <div className="dashboard__table table-responsive">
        <table>
          <thead>
            <tr>
              <th>Test</th>
              <th>Student</th>
              <th>Status</th>
              <th>Score</th>
              <th>Started</th>
            </tr>
          </thead>
          <tbody>
            {attempts.map((a) => (
              <tr key={a.id}>
                <td>{a.test_title ?? a.test_id}</td>
                <td>—</td>
                <td>{a.status}</td>
                <td>
                  {a.percentage != null ? `${a.percentage}%` : '—'}
                </td>
                <td>{new Date(a.started_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ResultsPanel() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    examinationService
      .listMyResults()
      .then(setResults)
      .catch((err) => setError(parseApiError(err)));
  }, []);

  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title">
        <h4>My Results</h4>
      </div>
      {error && <p className="login__error sp_bottom_15">{error}</p>}
      <div className="dashboard__table table-responsive">
        <table>
          <thead>
            <tr>
              <th>Test</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>Accuracy</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id}>
                <td>{r.test_title ?? r.test_id}</td>
                <td>
                  {r.total_score}/{r.max_score}
                </td>
                <td>{Number(r.percentage).toFixed(1)}%</td>
                <td>{r.accuracy != null ? `${Number(r.accuracy).toFixed(1)}%` : '—'}</td>
                <td>{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CreateTestPanel() {
  const [message, setMessage] = useState('');
  const [apiError, setApiError] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTestApiFormValues>({
    resolver: yupResolver(createTestApiSchema),
    defaultValues: {
      title: '',
      duration: '60',
      description: '',
    },
  });

  const onSubmit = async (values: CreateTestApiFormValues) => {
    setApiError('');
    setMessage('');
    try {
      await examinationService.createTest({
        title: values.title,
        description: values.description,
        durationMinutes: Number(values.duration),
        passingMarks: 2,
        instructions: 'Read all questions carefully before submitting.',
      });
      setMessage('Test created as draft. Add questions from Question Bank, then publish from Tests list.');
      reset();
    } catch (err) {
      setApiError(parseApiError(err));
    }
  };

  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title">
        <h4>Create Test</h4>
      </div>
      {apiError && <p className="login__error sp_bottom_15">{apiError}</p>}
      {message && <p className="form-success sp_bottom_15">{message}</p>}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="row">
          <div className="col-xl-12 sp_bottom_20">
            <label htmlFor="examTitle">Exam Title</label>
            <input id="examTitle" className={inputClassName('register__input', !!errors.title)} {...register('title')} />
            <FormError message={errors.title?.message} />
          </div>
          <div className="col-xl-6 sp_bottom_20">
            <label htmlFor="duration">Duration (minutes)</label>
            <select id="duration" className="form-select" {...register('duration')}>
              <option value="30">30</option>
              <option value="60">60</option>
              <option value="90">90</option>
            </select>
          </div>
          <div className="col-xl-12 sp_bottom_20">
            <label htmlFor="aboutExam">Description</label>
            <textarea id="aboutExam" rows={4} className={inputClassName('register__input', !!errors.description)} {...register('description')} />
          </div>
          <div className="col-xl-12">
            <button type="submit" className="default__button auth-submit-btn">Save Test</button>
          </div>
        </div>
      </form>
    </div>
  );
}

export function ExamAttemptPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState<
    (TestAttempt & { questions: AttemptQuestion[]; duration_minutes: number }) | null
  >(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!attemptId) return;
    try {
      const data = await examinationService.getAttempt(attemptId);
      setAttempt(data);
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  useEffect(() => {
    load();
  }, [attemptId]);

  const selectOption = async (questionId: string, optionId: string, current?: string[], multi = false) => {
    if (!attemptId) return;
    let selected: string[];
    if (multi) {
      selected = current?.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...(current ?? []), optionId];
    } else {
      selected = [optionId];
    }
    await examinationService.saveAnswer(attemptId, questionId, { selectedOptionIds: selected });
    await load();
  };

  const saveTextAnswer = async (questionId: string, value: string, field: 'text' | 'value') => {
    if (!attemptId) return;
    const answer = field === 'text' ? { text: value } : { value: Number(value) };
    await examinationService.saveAnswer(attemptId, questionId, answer);
    await load();
  };

  const submit = async () => {
    if (!attemptId) return;
    setSubmitting(true);
    try {
      const result = await examinationService.submitAttempt(attemptId);
      navigate(`/dashboard/exam-result/${result.attempt_id}`);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (error) return <p className="login__error">{error}</p>;
  if (!attempt) return <p>Loading exam...</p>;

  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title">
        <h4>{attempt.test_title ?? 'Exam'}</h4>
        <span>{attempt.duration_minutes} min · {attempt.status}</span>
      </div>
      {attempt.questions.map((q, idx) => {
        const selected = q.answer?.selectedOptionIds ?? [];
        const isMulti = q.type === 'msq';
        const inputType = isMulti ? 'checkbox' : 'radio';
        return (
          <div key={q.question_id} className="sp_bottom_30">
            <h6>
              Q{idx + 1}. {q.content?.text} <small className="text-muted">({q.type})</small>
            </h6>
            {(q.type === 'mcq' || q.type === 'msq' || q.type === 'true_false') && (
              <ul className="list-unstyled">
                {q.options.map((opt) => (
                  <li key={opt.id} className="sp_bottom_10">
                    <label>
                      <input
                        type={inputType}
                        name={q.question_id}
                        checked={selected.includes(opt.id)}
                        onChange={() => selectOption(q.question_id, opt.id, selected, isMulti)}
                      />{' '}
                      {opt.content?.text}
                    </label>
                  </li>
                ))}
              </ul>
            )}
            {q.type === 'fill_blank' && (
              <input
                className="register__input"
                defaultValue={q.answer?.text ?? ''}
                onBlur={(e) => saveTextAnswer(q.question_id, e.target.value, 'text')}
                placeholder="Your answer"
              />
            )}
            {(q.type === 'integer' || q.type === 'numerical') && (
              <input
                className="register__input"
                type="number"
                step={q.type === 'numerical' ? '0.01' : '1'}
                defaultValue={q.answer?.value ?? ''}
                onBlur={(e) => saveTextAnswer(q.question_id, e.target.value, 'value')}
                placeholder="Enter number"
              />
            )}
          </div>
        );
      })}
      <button type="button" className="default__button" disabled={submitting} onClick={submit}>
        {submitting ? 'Submitting...' : 'Submit Test'}
      </button>
    </div>
  );
}

export function ExamResultPage() {
  const { attemptId } = useParams();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!attemptId) return;
    examinationService
      .getResult(attemptId)
      .then(setResult)
      .catch((err) => setError(parseApiError(err)));
  }, [attemptId]);

  if (error) return <p className="login__error">{error}</p>;
  if (!result) return <p>Loading result...</p>;

  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title">
        <h4>Result — {result.test_title}</h4>
      </div>
      <div className="row">
        <div className="col-xl-3 col-lg-6 sp_bottom_20">
          <div className="dashboard__single__counter">
            <div className="counter__content__wraper">
              <div className="counter__number">{result.total_score}/{result.max_score}</div>
              <p>Score</p>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-lg-6 sp_bottom_20">
          <div className="dashboard__single__counter">
            <div className="counter__content__wraper">
              <div className="counter__number">{Number(result.percentage).toFixed(1)}%</div>
              <p>Percentage</p>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-lg-6 sp_bottom_20">
          <div className="dashboard__single__counter">
            <div className="counter__content__wraper">
              <div className="counter__number">
                {result.accuracy != null ? `${Number(result.accuracy).toFixed(1)}%` : '—'}
              </div>
              <p>Accuracy</p>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-lg-6 sp_bottom_20">
          <div className="dashboard__single__counter">
            <div className="counter__content__wraper">
              <div className="counter__number">
                {result.rank != null ? `#${result.rank}` : '—'}
              </div>
              <p>Rank</p>
            </div>
          </div>
        </div>
      </div>
      <Link className="default__button" to="/dashboard/student-reviews">
        Back to Results
      </Link>
    </div>
  );
}

export function ProfileSettingsApiForm() {
  const { user, refreshUser } = useAuth();
  const [message, setMessage] = useState('');
  const [apiError, setApiError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileSettingsFormValues>({
    resolver: yupResolver(profileSettingsSchema),
    values: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      bio: '',
    },
  });

  const onSubmit = async (values: ProfileSettingsFormValues) => {
    setApiError('');
    try {
      await examinationService.updateProfile({
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
      });
      await refreshUser();
      setMessage('Profile updated successfully.');
    } catch (err) {
      setApiError(parseApiError(err));
    }
  };

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {apiError && <p className="login__error sp_bottom_15">{apiError}</p>}
      {message && <p className="form-success sp_bottom_15">{message}</p>}
      <div className="row">
        <div className="col-xl-6 sp_bottom_20">
          <label htmlFor="firstName">First Name</label>
          <input id="firstName" className={inputClassName('register__input', !!errors.firstName)} {...register('firstName')} />
          <FormError message={errors.firstName?.message} />
        </div>
        <div className="col-xl-6 sp_bottom_20">
          <label htmlFor="lastName">Last Name</label>
          <input id="lastName" className={inputClassName('register__input', !!errors.lastName)} {...register('lastName')} />
          <FormError message={errors.lastName?.message} />
        </div>
        <div className="col-xl-6 sp_bottom_20">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" disabled className="register__input" {...register('email')} />
        </div>
        <div className="col-xl-6 sp_bottom_20">
          <label htmlFor="phone">Phone</label>
          <input id="phone" className={inputClassName('register__input', !!errors.phone)} {...register('phone')} />
          <FormError message={errors.phone?.message} />
        </div>
        <div className="col-xl-12">
          <button type="submit" className="default__button">Update Profile</button>
        </div>
      </div>
    </form>
  );
}
