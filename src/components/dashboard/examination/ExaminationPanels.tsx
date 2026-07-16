import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { examinationService, platformService } from '@/services';
import { parseApiError } from '@/lib/errors';
import { FormError, inputClassName } from '@/components/ui/FormField';
import { createTestApiSchema, type CreateTestApiFormValues } from '@/validators/schemas';
import type { ExamResult, ExamTest, Question, TestAttempt } from '@/types/examination';
import { useAuth } from '@/context/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import { useDashboardLoader, useDashboardLoadingEffect } from '@/context/DashboardLoadingContext';
import { profileSettingsSchema, type ProfileSettingsFormValues } from '@/validators/schemas';
import ExamAttemptPlayer from './ExamAttemptPlayer';
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader';
import AdminExamGuide from '@/components/dashboard/AdminExamGuide';

type QuestionType = 'mcq' | 'msq' | 'true_false' | 'fill_blank' | 'integer' | 'numerical';

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  mcq: 'MCQ',
  msq: 'MSQ',
  true_false: 'True / False',
  fill_blank: 'Fill in the Blank',
  integer: 'Integer',
  numerical: 'Numerical',
};

function needsTwoOptions(type: QuestionType) {
  return type === 'mcq' || type === 'msq';
}

function needsAnswerOnly(type: QuestionType) {
  return type === 'fill_blank' || type === 'integer' || type === 'numerical';
}

export function QuestionBankPanel() {
  const { user } = useAuth();
  const { branches } = useOrganization();
  const isTeacher = user?.roles.includes('teacher') ?? false;
  const canAddTopic = isTeacher || (user?.roles.some((r) => ['org_admin', 'super_admin', 'branch_admin'].includes(r)) ?? false);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);

  const [departmentId, setDepartmentId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [topicId, setTopicId] = useState('');

  const [newSubjectName, setNewSubjectName] = useState('');
  const [newTopicName, setNewTopicName] = useState('');
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newQ, setNewQ] = useState('');
  const [questionType, setQuestionType] = useState<QuestionType>('mcq');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [correct, setCorrect] = useState('1');
  const [message, setMessage] = useState('');
  const withLoader = useDashboardLoader();

  const loadQuestions = async () => {
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
    void loadQuestions();
  }, []);

  useEffect(() => {
    const branchId = branches[0]?.id;
    if (!branchId) return;
    platformService
      .listDepartments(branchId, 1, 50)
      .then((r) => setDepartments(r.data.map((d) => ({ id: d.id, name: d.name }))))
      .catch((err) => setError(parseApiError(err)));
  }, [branches]);

  useEffect(() => {
    setSubjectId('');
    setTopicId('');
    setSubjects([]);
    setTopics([]);
    if (!departmentId) return;
    examinationService
      .listSubjects(1, 100, departmentId)
      .then((r) => setSubjects(r.data.map((s) => ({ id: s.id, name: s.name }))))
      .catch((err) => setError(parseApiError(err)));
  }, [departmentId]);

  useEffect(() => {
    setTopicId('');
    setTopics([]);
    if (!subjectId) return;
    examinationService
      .listTopicsForSubject(subjectId)
      .then((list) => setTopics(list.map((t) => ({ id: t.id, name: t.name }))))
      .catch((err) => setError(parseApiError(err)));
  }, [subjectId]);

  useDashboardLoadingEffect(loading);

  const buildOptions = () => {
    if (questionType === 'true_false') {
      return [
        { content: { text: 'True' }, isCorrect: correct === 'true' },
        { content: { text: 'False' }, isCorrect: correct === 'false' },
      ];
    }
    if (questionType === 'fill_blank') {
      return [{ content: { text: opt1 }, isCorrect: true }];
    }
    if (questionType === 'integer' || questionType === 'numerical') {
      return [{ content: { value: Number(opt1) || 0 }, isCorrect: true }];
    }
    return [
      { content: { text: opt1 }, isCorrect: correct === '1' },
      { content: { text: opt2 }, isCorrect: correct === '2' },
    ];
  };

  const handleAddSubject = async () => {
    if (!departmentId || !newSubjectName.trim()) return;
    setError('');
    await withLoader(async () => {
      try {
        const created = await examinationService.createSubject({
          name: newSubjectName.trim(),
          departmentId,
        });
        setSubjects((prev) => [...prev, { id: created.id, name: created.name }]);
        setSubjectId(created.id);
        setNewSubjectName('');
        setShowAddSubject(false);
        setMessage(`Subject "${created.name}" added.`);
      } catch (err) {
        setError(parseApiError(err));
      }
    });
  };

  const handleAddTopic = async () => {
    if (!subjectId || !newTopicName.trim()) return;
    setError('');
    await withLoader(async () => {
      try {
        const created = await examinationService.createTopicForSubject(subjectId, {
          name: newTopicName.trim(),
        });
        setTopics((prev) => [...prev, { id: created.id, name: created.name }]);
        setTopicId(created.id);
        setNewTopicName('');
        setShowAddTopic(false);
        setMessage(`Topic "${created.name}" added.`);
      } catch (err) {
        setError(parseApiError(err));
      }
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    if (!departmentId || !subjectId || !topicId) {
      setError('Select department, subject, and topic before adding a question.');
      return;
    }
    await withLoader(async () => {
      try {
        const created = await examinationService.createQuestion({
          type: questionType,
          content: { text: newQ },
          marks: 1,
          difficulty: 2,
          topicId,
          options: buildOptions(),
        });
        try {
          await examinationService.approveQuestion(created.id);
          setMessage(`${QUESTION_TYPE_LABELS[questionType]} question created and approved.`);
        } catch {
          setMessage(`${QUESTION_TYPE_LABELS[questionType]} question created (pending approval).`);
        }
        setNewQ('');
        setOpt1('');
        setOpt2('');
        setCorrect('1');
        await loadQuestions();
      } catch (err) {
        setError(parseApiError(err));
      }
    });
  };

  return (
    <>
      <DashboardPageHeader
        badge="Step 1"
        title="Question Bank"
        subtitle="Select department → subject → topic, then add questions. Teachers can also add topics."
      />
      <AdminExamGuide activeStep={1} compact />
      <div className="dashboard__content__wraper">
        <div className="dashboard__section__title">
          <h4>Add Question</h4>
        </div>
        {error && <p className="login__error sp_bottom_15">{error}</p>}
        {message && <p className="form-success sp_bottom_15">{message}</p>}
        <form onSubmit={handleCreate} className="edtp-form-card sp_bottom_30">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Department</label>
              <select
                className="form-select"
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                required
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <p className="text-muted mb-0 mt-1" style={{ fontSize: '0.75rem' }}>
                Departments are added by Organization Admin.
              </p>
            </div>

            <div className="col-md-4">
              <label className="form-label">Subject</label>
              <select
                className="form-select"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                disabled={!departmentId}
                required
              >
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              {departmentId && (
                <button
                  type="button"
                  className="dashboard__small__btn__2 mt-2"
                  onClick={() => setShowAddSubject((v) => !v)}
                >
                  {showAddSubject ? 'Cancel' : '+ Add Subject'}
                </button>
              )}
              {showAddSubject && departmentId && (
                <div className="d-flex gap-2 mt-2">
                  <input
                    className="register__input"
                    placeholder="Subject name"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                  />
                  <button type="button" className="default__button" onClick={handleAddSubject}>
                    Save
                  </button>
                </div>
              )}
            </div>

            <div className="col-md-4">
              <label className="form-label">Topic</label>
              <select
                className="form-select"
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                disabled={!subjectId}
                required
              >
                <option value="">Select topic</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              {canAddTopic && subjectId && (
                <button
                  type="button"
                  className="dashboard__small__btn__2 mt-2"
                  onClick={() => setShowAddTopic((v) => !v)}
                >
                  {showAddTopic ? 'Cancel' : '+ Add Topic'}
                </button>
              )}
              {showAddTopic && subjectId && (
                <div className="d-flex gap-2 mt-2">
                  <input
                    className="register__input"
                    placeholder="Topic name"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                  />
                  <button type="button" className="default__button" onClick={handleAddTopic}>
                    Save
                  </button>
                </div>
              )}
            </div>

            <div className="col-md-4">
              <label className="form-label">Question Type</label>
              <select
                className="form-select"
                value={questionType}
                onChange={(e) => {
                  setQuestionType(e.target.value as QuestionType);
                  setOpt1('');
                  setOpt2('');
                  setCorrect('1');
                }}
              >
                {(Object.keys(QUESTION_TYPE_LABELS) as QuestionType[]).map((t) => (
                  <option key={t} value={t}>{QUESTION_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label">Question Text</label>
              <input
                className="register__input"
                placeholder="Enter the question"
                value={newQ}
                onChange={(e) => setNewQ(e.target.value)}
                required
              />
            </div>
            {questionType === 'true_false' && (
              <div className="col-md-4">
                <label className="form-label">Correct Answer</label>
                <select className="form-select" value={correct} onChange={(e) => setCorrect(e.target.value)}>
                  <option value="true">True</option>
                  <option value="false">False</option>
                </select>
              </div>
            )}
            {needsAnswerOnly(questionType) && (
              <div className="col-md-6">
                <label className="form-label">
                  {questionType === 'fill_blank' ? 'Correct Answer' : 'Correct Value'}
                </label>
                <input
                  className="register__input"
                  placeholder={questionType === 'fill_blank' ? 'Answer text' : 'Numeric value'}
                  value={opt1}
                  onChange={(e) => setOpt1(e.target.value)}
                  required
                />
              </div>
            )}
            {needsTwoOptions(questionType) && (
              <>
                <div className="col-md-5">
                  <label className="form-label">Option 1</label>
                  <input className="register__input" value={opt1} onChange={(e) => setOpt1(e.target.value)} required />
                </div>
                <div className="col-md-5">
                  <label className="form-label">Option 2</label>
                  <input className="register__input" value={opt2} onChange={(e) => setOpt2(e.target.value)} required />
                </div>
                <div className="col-md-2">
                  <label className="form-label">Correct</label>
                  <select className="form-select" value={correct} onChange={(e) => setCorrect(e.target.value)}>
                    <option value="1">Option 1</option>
                    <option value="2">Option 2</option>
                  </select>
                </div>
              </>
            )}
            <div className="col-12">
              <button type="submit" className="default__button" disabled={!topicId}>
                Add {QUESTION_TYPE_LABELS[questionType]} Question
              </button>
            </div>
          </div>
        </form>
        <div className="dashboard__section__title">
          <h4>Questions ({questions.length})</h4>
        </div>
        <div className="dashboard__table table-responsive">
          <table>
            <thead>
              <tr>
                <th>Question</th>
                <th>Department</th>
                <th>Subject</th>
                <th>Topic</th>
                <th>Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((q) => (
                <tr key={q.id}>
                  <td>{q.content?.text ?? '—'}</td>
                  <td>{q.department_name ?? '—'}</td>
                  <td>{q.subject_name ?? '—'}</td>
                  <td>{q.topic_name ?? '—'}</td>
                  <td><span className="edtp-badge edtp-badge--role">{q.type}</span></td>
                  <td>{q.status}</td>
                </tr>
              ))}
              {questions.length === 0 && (
                <tr><td colSpan={6}>No questions yet. Select department → subject → topic and add your first question.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export function TestsListPanel({ title }: { title: string }) {
  const [tests, setTests] = useState<ExamTest[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const withLoader = useDashboardLoader();

  const load = () => {
    setLoading(true);
    examinationService
      .listTests(1, 50)
      .then((res) => setTests(res.data))
      .catch((err) => setError(parseApiError(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  useDashboardLoadingEffect(loading);

  const publish = async (id: string) => {
    await withLoader(async () => {
      try {
        await examinationService.publishTest(id);
        load();
      } catch (err) {
        setError(parseApiError(err));
      }
    });
  };

  const statusBadge = (status: string) => {
    const cls =
      status === 'live' ? 'edtp-badge--active' : status === 'draft' ? 'edtp-badge--role' : 'edtp-badge--inactive';
    return <span className={`edtp-badge ${cls}`}>{status}</span>;
  };

  return (
    <>
      <DashboardPageHeader
        badge="Step 3–5"
        title={title}
        subtitle="Build draft tests, publish when ready, then assign students so they can attempt."
      />
      <AdminExamGuide activeStep={3} compact />
      <div className="dashboard__content__wraper">
        <div className="dashboard__section__title d-flex flex-wrap justify-content-between align-items-center gap-2">
          <h4 className="mb-0">Test List</h4>
          <Link to="/dashboard/create-test" className="default__button small-btn">+ Create Test</Link>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((t) => (
                <tr key={t.id}>
                  <td>{t.title}</td>
                  <td>{statusBadge(t.status)}</td>
                  <td>{t.duration_minutes} min</td>
                  <td>{t.total_marks ?? '—'}</td>
                  <td className="text-nowrap">
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
                    {t.status === 'live' && (
                      <Link to={`/dashboard/test-builder/${t.id}`} className="dashboard__small__btn__2">
                        Manage & Assign
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
              {tests.length === 0 && (
                <tr><td colSpan={5}>No tests yet. <Link to="/dashboard/create-test">Create your first test</Link>.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export function StudentTestsPanel() {
  const navigate = useNavigate();
  const [tests, setTests] = useState<ExamTest[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    setPageLoading(true);
    examinationService
      .listMyAssignedTests()
      .then(setTests)
      .catch((err) => setError(parseApiError(err)))
      .finally(() => setPageLoading(false));
  }, []);

  useDashboardLoadingEffect(loading || pageLoading);

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

  const resume = (t: ExamTest) => {
    if (t.attempt_id) navigate(`/dashboard/exam/${t.id}/attempt/${t.attempt_id}`);
  };

  const renderAction = (t: ExamTest) => {
    const st = t.attempt_status;
    if (st === 'submitted' || st === 'auto_submitted') {
      const resultId = t.result_attempt_id ?? t.attempt_id;
      return resultId ? (
        <Link to={`/dashboard/exam-result/${resultId}`} className="default__button sp_top_15">
          View Result
        </Link>
      ) : (
        <span className="sp_top_15 text-muted">Completed</span>
      );
    }
    if (st === 'in_progress' && t.attempt_id) {
      return (
        <button type="button" className="default__button sp_top_15" disabled={loading} onClick={() => resume(t)}>
          Resume Test
        </button>
      );
    }
    return (
      <button type="button" className="default__button sp_top_15" disabled={loading} onClick={() => start(t.id)}>
        Start Test
      </button>
    );
  };

  return (
    <>
      <DashboardPageHeader
        badge="Online Tests"
        title="My Assigned Tests"
        subtitle="Start, resume or view results for your institute examinations."
      />
      <div className="dashboard__content__wraper">
      <div className="dashboard__section__title">
        <h4>Available Tests</h4>
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
                  {t.attempt_status && (
                    <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                      Status: {t.attempt_status.replace('_', ' ')}
                      {t.result_percentage != null ? ` · ${Number(t.result_percentage).toFixed(1)}%` : ''}
                    </p>
                  )}
                  {renderAction(t)}
                </div>
              </div>
            </div>
          </div>
        ))}
        {!tests.length && !error && <p>No tests assigned yet.</p>}
      </div>
    </div>
    </>
  );
}

export function AttemptsListPanel({ title }: { title: string }) {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    examinationService
      .listAttempts(1, 50)
      .then((res) => setAttempts(res.data))
      .catch((err) => setError(parseApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  useDashboardLoadingEffect(loading);

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
              <th>Status</th>
              <th>Score</th>
              <th>Started</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {attempts.map((a) => (
              <tr key={a.id}>
                <td>{a.test_title ?? a.test_id}</td>
                <td>{a.status.replace('_', ' ')}</td>
                <td>{a.percentage != null ? `${Number(a.percentage).toFixed(1)}%` : '—'}</td>
                <td>{new Date(a.started_at).toLocaleString()}</td>
                <td>
                  {a.status === 'in_progress' && (
                    <button
                      type="button"
                      className="dashboard__small__btn__2"
                      onClick={() => navigate(`/dashboard/exam/${a.test_id}/attempt/${a.id}`)}
                    >
                      Resume
                    </button>
                  )}
                  {(a.status === 'submitted' || a.status === 'auto_submitted') && (
                    <Link to={`/dashboard/exam-result/${a.id}`} className="dashboard__small__btn__2">
                      Result
                    </Link>
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

export function ResultsPanel() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    examinationService
      .listMyResults()
      .then(setResults)
      .catch((err) => setError(parseApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  useDashboardLoadingEffect(loading);

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
              <th>Rank</th>
              <th>Percentile</th>
              <th>Date</th>
              <th />
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
                <td>{r.rank != null ? `#${r.rank}` : '—'}</td>
                <td>{r.percentile != null ? `${Number(r.percentile).toFixed(1)}%` : '—'}</td>
                <td>{new Date(r.created_at).toLocaleString()}</td>
                <td>
                  <Link to={`/dashboard/exam-result/${r.attempt_id}`} className="dashboard__small__btn__2">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function CreateTestPanel() {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [apiError, setApiError] = useState('');
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);
  const [hierarchyLoading, setHierarchyLoading] = useState(true);
  const { branches } = useOrganization();
  const withLoader = useDashboardLoader();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateTestApiFormValues>({
    resolver: yupResolver(createTestApiSchema),
    defaultValues: {
      title: '',
      duration: '60',
      description: '',
      departmentId: '',
      subjectId: '',
      topicId: '',
    },
  });

  const departmentId = watch('departmentId');
  const subjectId = watch('subjectId');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setHierarchyLoading(true);
      try {
        const branchId = branches[0]?.id;
        const deptRes = branchId
          ? await platformService.listDepartments(branchId, 1, 50)
          : { data: [] as { id: string; name: string }[] };
        if (cancelled) return;
        setDepartments(deptRes.data.map((d) => ({ id: d.id, name: d.name })));
      } catch (err) {
        if (!cancelled) setApiError(parseApiError(err));
      } finally {
        if (!cancelled) setHierarchyLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [branches]);

  useEffect(() => {
    setValue('subjectId', '');
    setValue('topicId', '');
    setSubjects([]);
    setTopics([]);
    if (!departmentId) return;
    let cancelled = false;
    examinationService
      .listSubjects(1, 100, departmentId)
      .then((r) => {
        if (!cancelled) setSubjects(r.data.map((s) => ({ id: s.id, name: s.name })));
      })
      .catch((err) => {
        if (!cancelled) setApiError(parseApiError(err));
      });
    return () => {
      cancelled = true;
    };
  }, [departmentId, setValue]);

  useEffect(() => {
    setValue('topicId', '');
    setTopics([]);
    if (!subjectId) return;
    let cancelled = false;
    examinationService
      .listTopicsForSubject(subjectId)
      .then((list) => {
        if (!cancelled) setTopics(list.map((t) => ({ id: t.id, name: t.name })));
      })
      .catch(() => {
        if (!cancelled) setTopics([]);
      });
    return () => {
      cancelled = true;
    };
  }, [subjectId, setValue]);

  useDashboardLoadingEffect(hierarchyLoading);

  const onSubmit = async (values: CreateTestApiFormValues) => {
    setApiError('');
    setMessage('');
    const dept = departments.find((d) => d.id === values.departmentId);
    const subject = subjects.find((s) => s.id === values.subjectId);
    const topic = topics.find((t) => t.id === values.topicId);
    await withLoader(async () => {
      try {
        const test = await examinationService.createTest({
          title: values.title,
          description: values.description,
          durationMinutes: Number(values.duration),
          passingMarks: 40,
          instructions: 'Read all questions carefully. Do not switch tabs during the exam.',
          config: {
            departmentId: values.departmentId,
            departmentName: dept?.name,
            subjectId: values.subjectId,
            subjectName: subject?.name,
            topicId: values.topicId,
            topicName: topic?.name,
          },
        });
        reset();
        navigate(`/dashboard/test-builder/${test.id}`);
      } catch (err) {
        setApiError(parseApiError(err));
      }
    });
  };

  return (
    <>
      <DashboardPageHeader
        badge="Create Test"
        title="Create Test"
        subtitle="Pick department → subject → topic, then save a draft and add questions."
      />
      <AdminExamGuide activeStep={2} compact />
      <div className="dashboard__content__wraper">
        <div className="dashboard__section__title">
          <h4>New Exam Draft</h4>
        </div>
        {apiError && <p className="login__error sp_bottom_15">{apiError}</p>}
        {message && <p className="form-success sp_bottom_15">{message}</p>}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="edtp-form-card">
          <div className="row g-3">
            <div className="col-md-4">
              <label htmlFor="departmentId">Department</label>
              <select
                id="departmentId"
                className={inputClassName('form-select', !!errors.departmentId)}
                {...register('departmentId')}
              >
                <option value="">Select department</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <FormError message={errors.departmentId?.message} />
            </div>
            <div className="col-md-4">
              <label htmlFor="subjectId">Subject</label>
              <select
                id="subjectId"
                className={inputClassName('form-select', !!errors.subjectId)}
                {...register('subjectId')}
                disabled={!departmentId}
              >
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <FormError message={errors.subjectId?.message} />
            </div>
            <div className="col-md-4">
              <label htmlFor="topicId">Topic</label>
              <select
                id="topicId"
                className={inputClassName('form-select', !!errors.topicId)}
                {...register('topicId')}
                disabled={!subjectId}
              >
                <option value="">Select topic</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <FormError message={errors.topicId?.message} />
              {subjectId && topics.length === 0 && !hierarchyLoading && (
                <p className="text-muted mb-0" style={{ fontSize: '0.8rem' }}>
                  No topics found for this subject. Ask org admin to seed subjects/topics.
                </p>
              )}
            </div>
            <div className="col-12">
              <label htmlFor="examTitle">Exam Title</label>
              <input id="examTitle" className={inputClassName('register__input', !!errors.title)} {...register('title')} />
              <FormError message={errors.title?.message} />
            </div>
            <div className="col-md-6">
              <label htmlFor="duration">Duration (minutes)</label>
              <select id="duration" className="form-select" {...register('duration')}>
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="60">60</option>
                <option value="90">90</option>
                <option value="120">120</option>
              </select>
            </div>
            <div className="col-12">
              <label htmlFor="aboutExam">Description (optional)</label>
              <textarea id="aboutExam" rows={3} className={inputClassName('register__input', !!errors.description)} {...register('description')} />
            </div>
            <div className="col-12">
              <button type="submit" className="default__button auth-submit-btn">Save &amp; Build Test</button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

export function ExamAttemptPage() {
  return <ExamAttemptPlayer />;
}

export function ExamResultPage() {
  const { attemptId } = useParams();
  const [result, setResult] = useState<ExamResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!attemptId) return;
    setLoading(true);
    examinationService
      .getResult(attemptId)
      .then(setResult)
      .catch((err) => setError(parseApiError(err)))
      .finally(() => setLoading(false));
  }, [attemptId]);

  useDashboardLoadingEffect(loading);

  if (error) return <p className="login__error">{error}</p>;
  if (!result) return null;

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
                {result.rank != null ? `#${result.rank}` : '—'}
              </div>
              <p>Rank</p>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-lg-6 sp_bottom_20">
          <div className="dashboard__single__counter">
            <div className="counter__content__wraper">
              <div className="counter__number">
                {result.percentile != null ? `${Number(result.percentile).toFixed(1)}%` : '—'}
              </div>
              <p>Percentile</p>
            </div>
          </div>
        </div>
      </div>
      {result.passing_marks != null && (
        <p className="sp_bottom_20">
          {Number(result.total_score) >= Number(result.passing_marks) ? (
            <span className="form-success">Passed (minimum {result.passing_marks} marks)</span>
          ) : (
            <span className="login__error">Did not meet passing marks ({result.passing_marks})</span>
          )}
        </p>
      )}
      <Link className="default__button" to="/dashboard/student-reviews">
        Back to Results
      </Link>
    </div>
  );
}

export function ProfileSettingsApiForm({ onSuccess }: { onSuccess?: () => void }) {
  const { user, refreshUser } = useAuth();
  const [message, setMessage] = useState('');
  const [apiError, setApiError] = useState('');
  const withLoader = useDashboardLoader();
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
    await withLoader(async () => {
      try {
        await examinationService.updateProfile({
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
        });
        await refreshUser();
        setMessage('Profile updated successfully.');
        onSuccess?.();
      } catch (err) {
        setApiError(parseApiError(err));
      }
    });
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
