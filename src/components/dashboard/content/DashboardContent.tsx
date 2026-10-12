import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { DashboardCounter, DashboardTableRow } from '@/types/dashboard';
import { useAuth } from '@/context/AuthContext';
import { useDashboardLoader, useDashboardLoadingEffect } from '@/context/DashboardLoadingContext';
import DashboardProfilePage from '@/components/dashboard/DashboardProfilePage';
import { useOrganization } from '@/hooks/useOrganization';
import { organizationService, platformService, examinationService } from '@/services';
import * as authService from '@/services/auth.service';
import { parseApiError } from '@/lib/errors';
import { normalizePositiveIntInput } from '@/utils/positiveIntInput';
import { FormError, PasswordInput, inputClassName } from '@/components/ui/FormField';
import { EdtpSelect, EdtpBtn } from '@/components/ui/CrudUI';
import { confirmDelete, showError } from '@/lib/swal';
import { formatCountdown, msUntil } from '@/utils/countdown';
import { ProfileSettingsApiForm } from '@/components/dashboard/examination/ExaminationPanels';
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader';
import { useOrgScope } from '@/context/OrgScopeContext';
import {
  becomeTeacherSchema,
  createTestSchema,
  createTestVideoSchema,
  organizationSchema,
  passwordChangeSchema,
  socialLinksSchema,
  type BecomeTeacherFormValues,
  type CreateTestFormValues,
  type CreateTestVideoFormValues,
  type OrganizationFormValues,
  type PasswordChangeFormValues,
  type SocialLinksFormValues,
} from '@/validators/schemas';
import {
  dashboardCourses,
  messageContacts,
  quizAttempts,
  reviewsReceived,
  orderHistory,
  announcements,
} from '@/data/dashboardData';
import {
  DashboardFilterRow,
  DashboardStarRating,
  DashboardCourseCard,
  DashboardTabButtons,
} from './DashboardShared';

export function DashboardCounters({
  title,
  counters,
}: {
  title?: string;
  counters: DashboardCounter[];
}) {
  return (
    <div className="dashboard__content__wraper">
      {title ? (
        <div className="dashboard__section__title">
          <h4>{title}</h4>
        </div>
      ) : null}
      <div className="row">
        {counters.map((counter) => (
          <div key={counter.label} className="col-xl-3 col-lg-4 col-md-6 col-12">
            <div className="dashboard__single__counter">
              <div className="counterarea__text__wraper">
                <div className="counter__img">
                  <img loading="lazy" src={counter.icon} alt="" />
                </div>
                <div className="counter__content__wraper">
                  <div className="counter__number">
                    <span className="counter">{counter.value}</span>
                    {counter.suffix}
                  </div>
                  <p>{counter.label}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardFeedbackTable({
  title,
  rows,
  seeMoreHref = '/exams',
}: {
  title: string;
  rows: DashboardTableRow[];
  seeMoreHref?: string;
}) {
  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title">
        <h4>{title}</h4>
        <Link to={seeMoreHref}>See More...</Link>
      </div>
      <div className="row">
        <div className="col-xl-12">
          <div className="dashboard__table table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Exam / Course Name</th>
                  <th>Enrolled</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.name} className={i % 2 === 1 ? 'dashboard__table__row' : undefined}>
                    <th>
                      <Link to="/exams">{row.name}</Link>
                    </th>
                    <td>{row.enrolled}</td>
                    <td>
                      <DashboardStarRating count={row.rating} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardProfileContent() {
  return <DashboardProfilePage />;
}

export function DashboardMessageContent() {
  const [activeContact, setActiveContact] = useState(0);
  const contact = messageContacts[activeContact];

  return (
    <div className="dashboard__message__content__main">
      <div className="dashboard__message__content__main__title dashboard__message__content__main__title__2">
        <h3>Messages</h3>
      </div>
      <div className="dashboard__meessage__wraper">
        <div className="row">
          <div className="col-xl-5 col-lg-6 col-md-12 col-12">
            <div className="dashboard__meessage">
              <div className="dashboard__meessage__chat">
                <h3>Chats</h3>
              </div>
              <div className="dashboard__meessage__search">
                <button type="button">
                  <i className="icofont-search-1" />
                </button>
                <input type="text" placeholder="Search" />
              </div>
              <div className="dashboard__meessage__contact">
                <ul>
                  {messageContacts.map((c, i) => (
                    <li key={c.name}>
                      <button
                        type="button"
                        className="dashboard__meessage__contact__wrap dashboard-message-contact-btn"
                        onClick={() => setActiveContact(i)}
                      >
                        <div className="dashboard__meessage__chat__img">
                          <span className="dashboard__meessage__dot online" />
                          <img loading="lazy" src={c.img} alt={c.name} />
                        </div>
                        <div className="dashboard__meessage__meta">
                          <h5>{c.name}</h5>
                          <p className="preview">{c.preview}</p>
                          <span className="chat__time">{c.time}</span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="col-xl-7 col-lg-6 col-md-12 col-12">
            <div className="dashboard__meessage__content__wrap">
              <div className="dashboard__meessage__profile">
                <div className="dashboard__meessage__profile__img">
                  <img loading="lazy" src={contact.img} alt={contact.name} />
                </div>
                <div className="dashboard__meessage__profile__meta">
                  <h5>{contact.name}</h5>
                  <p>Stay focused, stay prepared</p>
                </div>
                <div className="dashboard__meessage__profile__chat__option">
                  <a href="#!" onClick={(e) => e.preventDefault()}>
                    <i className="icofont-phone" />
                  </a>
                  <a href="#!" onClick={(e) => e.preventDefault()}>
                    <i className="icofont-ui-video-chat" />
                  </a>
                </div>
              </div>
              <div className="dashboard__meessage__sent">
                <ul>
                  <li>
                    <div className="dashboard__meessage__sent__item__img">
                      <img loading="lazy" src={contact.img} alt="" />
                    </div>
                    <div className="dashboard__meessage__sent__item__content">
                      <p>{contact.preview}</p>
                      <span className="time">{contact.time}</span>
                      <p>Let me know if you have any questions about your exam prep.</p>
                      <span className="time">Just now</span>
                    </div>
                  </li>
                  <li className="dashboard__meessage__sent__item">
                    <div className="dashboard__meessage__sent__item__content">
                      <p>Thanks! I will review my results tonight.</p>
                      <span className="time">4:40 PM</span>
                    </div>
                    <div className="dashboard__meessage__sent__item__img">
                      <img loading="lazy" src="/img/teacher/teacher__2.png" alt="" />
                    </div>
                  </li>
                </ul>
              </div>
              <div className="dashboard__meessage__input">
                <input type="text" placeholder="Type something" />
                <i className="icofont-attachment attachment" aria-hidden="true" />
                <button type="button" className="submit">
                  <i className="icofont-arrow-right" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardCoursesContent({
  title,
  showTabs,
}: {
  title: string;
  showTabs?: boolean;
}) {
  const [activeTab, setActiveTab] = useState('Publish');

  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title">
        <h4>{title}</h4>
      </div>
      {showTabs && (
        <div className="col-xl-12 sp_bottom_20">
          <DashboardTabButtons
            tabs={['Publish', 'Pending', 'Draft']}
            active={activeTab}
            onChange={setActiveTab}
          />
        </div>
      )}
      <div className="row">
        {dashboardCourses.map((course) => (
          <DashboardCourseCard key={course.title} course={course} />
        ))}
      </div>
    </div>
  );
}

export function DashboardWishlistContent() {
  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title">
        <h4>Wishlist</h4>
      </div>
      <div className="row">
        {dashboardCourses.map((course) => (
          <DashboardCourseCard key={course.title} course={course} />
        ))}
      </div>
    </div>
  );
}

export function DashboardQuizAttemptsContent({ title }: { title: string }) {
  const resultClass = (result: string) => {
    if (result === 'Cancel') return 'dashboard__td dashboard__td--cancel';
    if (result === 'Over') return 'dashboard__td dashboard__td--over';
    return 'dashboard__td';
  };

  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title">
        <h4>{title}</h4>
      </div>
      <DashboardFilterRow />
      <hr className="mt-40" />
      <div className="row">
        <div className="col-xl-12">
          <div className="dashboard__table table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Qus</th>
                  <th>TM</th>
                  <th>CA</th>
                  <th>Result</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {quizAttempts.map((row, i) => (
                  <tr key={row.title} className={i % 2 === 1 ? 'dashboard__table__row' : undefined}>
                    <th>
                      <p>{row.date}</p>
                      <span>{row.title}</span>
                      <p>
                        Student: <a href="#!">{row.student}</a>
                      </p>
                    </th>
                    <td>
                      <p>{row.qus}</p>
                    </td>
                    <td>
                      <p>{row.tm}</p>
                    </td>
                    <td>
                      <p>{row.ca}</p>
                    </td>
                    <td>
                      <span className={resultClass(row.result)}>{row.result}</span>
                    </td>
                    <td>
                      <div className="dashboard__button__group">
                        <a className="dashboard__small__btn__2" href="#!">
                          <i className="icofont-eye" />
                          View
                        </a>
                        <a className="dashboard__small__btn__2 dashboard__small__btn__3" href="#!">
                          <i className="icofont-trash" /> Delete
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardAssignmentsContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isStudent = user?.roles.includes('student') && !user.roles.some((r) =>
    ['org_admin', 'super_admin', 'staff', 'teacher'].includes(r),
  );
  const [rows, setRows] = useState<
    {
      id: string;
      title: string;
      status?: string;
      total_marks?: number;
      duration_minutes?: number;
      assigned_count?: number;
      submitted_count?: number;
      attempt_count?: number;
      attempt_status?: string | null;
      result_percentage?: number | null;
      result_attempt_id?: string | null;
      attempt_id?: string | null;
      scheduled_start?: string | null;
      scheduled_at?: string | null;
    }[]
  >([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState<string | null>(null);
  const [nowTick, setNowTick] = useState(() => Date.now());

  useEffect(() => {
    setLoading(true);
    setError('');
    const load = isStudent
      ? examinationService.listMyAssignedTests().then((data) =>
          setRows(
            data.map((t) => ({
              id: t.id,
              title: t.title,
              status: t.status,
              total_marks: t.total_marks ?? undefined,
              duration_minutes: t.duration_minutes,
              attempt_status: t.attempt_status,
              result_percentage: t.result_percentage,
              result_attempt_id: t.result_attempt_id,
              attempt_id: t.attempt_id,
              scheduled_start: t.scheduled_start,
              scheduled_at: t.scheduled_at,
            })),
          ),
        )
      : examinationService.listAssignmentSummaries().then(setRows);

    load
      .catch((err) => setError(parseApiError(err)))
      .finally(() => setLoading(false));
  }, [isStudent]);

  useEffect(() => {
    if (!isStudent) return;
    const id = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [isStudent]);

  useDashboardLoadingEffect(loading);

  const start = async (testId: string) => {
    setStartingId(testId);
    setError('');
    try {
      const attempt = await examinationService.startAttempt(testId);
      navigate(`/dashboard/exam/${testId}/attempt/${attempt.id}`);
    } catch (err) {
      const msg = parseApiError(err);
      setError(msg);
      showError('Cannot start', msg);
      examinationService.listMyAssignedTests().then((data) =>
        setRows(
          data.map((t) => ({
            id: t.id,
            title: t.title,
            status: t.status,
            total_marks: t.total_marks ?? undefined,
            duration_minutes: t.duration_minutes,
            attempt_status: t.attempt_status,
            result_percentage: t.result_percentage,
            result_attempt_id: t.result_attempt_id,
            attempt_id: t.attempt_id,
            scheduled_start: t.scheduled_start,
            scheduled_at: t.scheduled_at,
          })),
        ),
      ).catch(() => undefined);
    } finally {
      setStartingId(null);
    }
  };

  const renderStudentAction = (row: (typeof rows)[number]) => {
    const st = row.attempt_status;
    if (st === 'submitted' || st === 'auto_submitted') {
      const resultId = row.result_attempt_id ?? row.attempt_id;
      return resultId ? (
        <Link to={`/dashboard/exam-result/${resultId}`} className="dashboard__small__btn__2">
          View Result
        </Link>
      ) : (
        <span className="text-muted">Completed</span>
      );
    }
    if (st === 'in_progress' && row.attempt_id) {
      return (
        <EdtpBtn
          variant="primary"
          size="sm"
          onClick={() => navigate(`/dashboard/exam/${row.id}/attempt/${row.attempt_id}`)}
        >
          Resume
        </EdtpBtn>
      );
    }
    void nowTick;
    const startAt = row.scheduled_start ?? row.scheduled_at;
    const wait = startAt ? msUntil(startAt) : null;
    if (wait != null && wait > 0) {
      return <span className="text-muted">Starts in {formatCountdown(wait)}</span>;
    }
    return (
      <EdtpBtn
        variant="primary"
        size="sm"
        disabled={startingId === row.id}
        onClick={() => void start(row.id)}
      >
        {startingId === row.id ? 'Starting…' : 'Start'}
      </EdtpBtn>
    );
  };

  return (
    <>
      <DashboardPageHeader
        badge="Exams"
        title="Assignments"
        subtitle={
          isStudent
            ? 'Tests assigned to you. Start, resume, or view results here.'
            : 'Assignment coverage across tests — who is assigned and how many have submitted.'
        }
      />
      <div className="dashboard__content__wraper">
        {error && <p className="login__error sp_bottom_15">{error}</p>}
        <div className="dashboard__table table-responsive">
          <table>
            <thead>
              <tr>
                <th>Assignment / Test</th>
                <th>Marks</th>
                {isStudent ? (
                  <>
                    <th>Status</th>
                    <th>Progress</th>
                  </>
                ) : (
                  <>
                    <th>Assigned</th>
                    <th>Submitted</th>
                    <th>Attempts</th>
                  </>
                )}
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.title}</strong>
                    {row.status && (
                      <p className="mb-0 text-muted" style={{ fontSize: '0.8125rem' }}>
                        {row.status}
                        {row.duration_minutes ? ` · ${row.duration_minutes} min` : ''}
                      </p>
                    )}
                  </td>
                  <td>{row.total_marks ?? '—'}</td>
                  {isStudent ? (
                    <>
                      <td>{row.attempt_status?.replace('_', ' ') ?? 'Not started'}</td>
                      <td>
                        {row.result_percentage != null
                          ? `${Number(row.result_percentage).toFixed(1)}%`
                          : '—'}
                      </td>
                      <td>{renderStudentAction(row)}</td>
                    </>
                  ) : (
                    <>
                      <td>{row.assigned_count ?? 0}</td>
                      <td>{row.submitted_count ?? 0}</td>
                      <td>{row.attempt_count ?? 0}</td>
                      <td>
                        <Link
                          to={`/dashboard/test-builder/${row.id}`}
                          className="dashboard__small__btn__2"
                        >
                          Manage
                        </Link>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={isStudent ? 5 : 6}>
                    {isStudent
                      ? 'No tests assigned yet.'
                      : 'No tests found. Create and assign a test from Test Builder.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export function DashboardReviewsContent() {
  const [activeTab, setActiveTab] = useState('Received');

  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title">
        <h4>Reviews</h4>
      </div>
      <div className="row">
        <div className="col-xl-12 sp_bottom_20">
          <DashboardTabButtons tabs={['Received', 'Given']} active={activeTab} onChange={setActiveTab} />
        </div>
        <div className="col-xl-12">
          <div className="dashboard__table table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Date</th>
                  <th>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {reviewsReceived.map((row, i) => (
                  <tr key={`${row.student}-${row.date}`} className={i % 2 === 1 ? 'dashboard__table__row' : undefined}>
                    <th>{row.student}</th>
                    <td>{row.date}</td>
                    <td>
                      <span className="dashboard__star__course">
                        Course: <a href="#!">{row.course}</a>
                      </span>
                      <DashboardStarRating count={row.rating} />
                      <span className="dashboard__rating__count"> ({row.rating} Reviews)</span>
                      <p className="dashboard__small__text">{row.text}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardOrderHistoryContent() {
  const statusClass = (status: string) => {
    if (status === 'Processing' || status === 'Canceled') return 'dashboard__td dashboard__td__2';
    return 'dashboard__td';
  };

  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title">
        <h4>Order History</h4>
      </div>
      <div className="row">
        <div className="col-xl-12">
          <div className="dashboard__table table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Course Name</th>
                  <th>Date</th>
                  <th>Price</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orderHistory.map((row, i) => (
                  <tr key={row.id} className={i % 2 === 1 ? 'dashboard__table__row' : undefined}>
                    <th>{row.id}</th>
                    <td>{row.course}</td>
                    <td>{row.date}</td>
                    <td>{row.price}</td>
                    <td>
                      <span className={statusClass(row.status)}>{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardAnnouncementsContent() {
  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title">
        <h4>Announcements</h4>
      </div>
      <div className="dashboard__Announcement__wraper">
        <div className="row">
          <div className="col-xl-8 col-lg-6 col-md-6 col-12">
            <div className="dashboard__Announcement">
              <h5>Notify your all students.</h5>
              <p>Create Announcement</p>
            </div>
          </div>
          <div className="col-xl-4 col-lg-6 col-md-6 col-12">
            <a className="default__button" href="#!">
              Add New Announcement
            </a>
          </div>
        </div>
      </div>
      <DashboardFilterRow />
      <hr className="mt-40" />
      <div className="row">
        <div className="col-xl-12">
          <div className="dashboard__table table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Course</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {announcements.map((row, i) => (
                  <tr key={row.title} className={i % 2 === 1 ? 'dashboard__table__row' : undefined}>
                    <th>{row.title}</th>
                    <td>{row.course}</td>
                    <td>{row.date}</td>
                    <td>
                      <span className="dashboard__td">{row.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrganizationSettingsForm({
  organization,
  onSaved,
}: {
  organization: ReturnType<typeof useOrganization>['organization'];
  onSaved: () => Promise<void>;
}) {
  const [apiError, setApiError] = useState('');
  const [message, setMessage] = useState('');
  const withLoader = useDashboardLoader();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OrganizationFormValues>({
    resolver: yupResolver(organizationSchema),
    defaultValues: { name: '', slug: '' },
  });

  useEffect(() => {
    if (organization) {
      reset({ name: organization.name, slug: organization.slug });
    }
  }, [organization, reset]);

  const onSubmit = async (values: OrganizationFormValues) => {
    if (!organization) return;
    setApiError('');
    setMessage('');
    await withLoader(async () => {
      try {
        await organizationService.updateOrganization(organization.id, values);
        setMessage('Organization updated successfully.');
        await onSaved();
      } catch (err) {
        setApiError(parseApiError(err));
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {apiError && <p className="login__error sp_bottom_15">{apiError}</p>}
      {message && <p className="form-success sp_bottom_15">{message}</p>}
      <div className="row">
        <div className="col-xl-6 sp_bottom_20">
          <div className="dashboard__form__wraper">
            <div className="dashboard__form__input">
              <label htmlFor="orgName">Organization Name</label>
              <input
                id="orgName"
                type="text"
                className={inputClassName('', !!errors.name)}
                {...register('name')}
              />
              <FormError message={errors.name?.message} />
            </div>
          </div>
        </div>
        <div className="col-xl-6 sp_bottom_20">
          <div className="dashboard__form__wraper">
            <div className="dashboard__form__input">
              <label htmlFor="orgSlug">Slug</label>
              <input
                id="orgSlug"
                type="text"
                className={inputClassName('', !!errors.slug)}
                {...register('slug')}
              />
              <FormError message={errors.slug?.message} />
            </div>
          </div>
        </div>
        <div className="col-xl-12">
          <div className="dashboard__form__button">
            <button type="submit" className="default__button" disabled={!organization}>
              Save Organization
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function AutoIssueCertificatesForm() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [apiError, setApiError] = useState('');
  const withLoader = useDashboardLoader();
  const { selectedOrgId } = useOrgScope();

  useEffect(() => {
    setLoading(true);
    platformService
      .getSettings(['certificates.auto_issue'])
      .then((rows) => {
        const raw = rows.find((r) => r.key === 'certificates.auto_issue')?.value;
        setEnabled(raw === true || raw === 'true');
      })
      .catch(() => setEnabled(false))
      .finally(() => setLoading(false));
  }, [selectedOrgId]);

  useDashboardLoadingEffect(loading);

  const save = async (next: boolean) => {
    setApiError('');
    setMessage('');
    await withLoader(async () => {
      try {
        await platformService.upsertSetting('certificates.auto_issue', next);
        setEnabled(next);
        setMessage(next ? 'Certificates will auto-issue on pass.' : 'Auto-issue certificates turned off.');
      } catch (err) {
        setApiError(parseApiError(err));
      }
    });
  };

  return (
    <div className="sp_top_30">
      <h5 className="sp_bottom_15">Certificates</h5>
      {apiError && <p className="login__error sp_bottom_15">{apiError}</p>}
      {message && <p className="form-success sp_bottom_15">{message}</p>}
      <label className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
        <input
          type="checkbox"
          checked={enabled}
          disabled={loading}
          onChange={(e) => void save(e.target.checked)}
        />
        <span>Auto-issue certificates when a student passes</span>
      </label>
      <p className="text-muted mb-0 sp_top_10" style={{ fontSize: '0.8125rem' }}>
        When enabled, submitting a passing attempt issues a certificate automatically.
      </p>
    </div>
  );
}

function CertificateBrandingForm() {
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#102A43');
  const [accentColor, setAccentColor] = useState('#C9A227');
  const [sealText, setSealText] = useState('AUTHENTIC');
  const [templateId, setTemplateId] = useState<'classic' | 'modern' | 'minimal'>('classic');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [apiError, setApiError] = useState('');
  const withLoader = useDashboardLoader();
  const { selectedOrgId } = useOrgScope();

  useEffect(() => {
    setLoading(true);
    platformService
      .getSettings(['certificates.branding'])
      .then((rows) => {
        const raw = rows.find((r) => r.key === 'certificates.branding')?.value as
          | Record<string, string>
          | undefined;
        if (raw) {
          setLogoUrl(String(raw.logoUrl ?? ''));
          setPrimaryColor(String(raw.primaryColor ?? '#102A43'));
          setAccentColor(String(raw.accentColor ?? '#C9A227'));
          setSealText(String(raw.sealText ?? 'AUTHENTIC'));
          const t = String(raw.templateId ?? 'classic');
          setTemplateId(t === 'modern' || t === 'minimal' ? t : 'classic');
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [selectedOrgId]);

  useDashboardLoadingEffect(loading);

  const save = async () => {
    setApiError('');
    setMessage('');
    await withLoader(async () => {
      try {
        await platformService.upsertSetting('certificates.branding', {
          logoUrl: logoUrl.trim() || undefined,
          primaryColor,
          accentColor,
          sealText: sealText.trim() || 'AUTHENTIC',
          templateId,
        });
        setMessage('Certificate branding saved.');
      } catch (err) {
        setApiError(parseApiError(err));
      }
    });
  };

  return (
    <div className="sp_top_30">
      <h5 className="sp_bottom_15">Certificate branding</h5>
      {apiError && <p className="login__error sp_bottom_15">{apiError}</p>}
      {message && <p className="form-success sp_bottom_15">{message}</p>}
      <div className="row">
        <div className="col-md-6 sp_bottom_15">
          <label>Logo URL</label>
          <input className="register__input" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://…" />
        </div>
        <div className="col-md-3 sp_bottom_15">
          <label>Primary color</label>
          <input className="register__input" type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} />
        </div>
        <div className="col-md-3 sp_bottom_15">
          <label>Accent color</label>
          <input className="register__input" type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
        </div>
        <div className="col-md-6 sp_bottom_15">
          <label>Seal text</label>
          <input className="register__input" value={sealText} onChange={(e) => setSealText(e.target.value)} />
        </div>
        <div className="col-md-6 sp_bottom_15">
          <label>Template</label>
          <EdtpSelect value={templateId} onChange={(e) => setTemplateId(e.target.value as typeof templateId)}>
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
            <option value="minimal">Minimal</option>
          </EdtpSelect>
        </div>
        <div className="col-12">
          <button type="button" className="default__button" onClick={() => void save()} disabled={loading}>
            Save branding
          </button>
        </div>
      </div>
    </div>
  );
}

function PasswordChangeForm() {
  const [message, setMessage] = useState('');
  const [apiError, setApiError] = useState('');
  const withLoader = useDashboardLoader();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordChangeFormValues>({
    resolver: yupResolver(passwordChangeSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (values: PasswordChangeFormValues) => {
    setApiError('');
    setMessage('');
    await withLoader(async () => {
      try {
        await authService.changePassword(values.currentPassword, values.newPassword);
        setMessage('Password updated successfully.');
        reset();
      } catch (err) {
        setApiError(parseApiError(err));
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {apiError && <p className="login__error sp_bottom_15">{apiError}</p>}
      {message && <p className="form-success sp_bottom_15">{message}</p>}
      <div className="row">
        <div className="col-xl-12 sp_bottom_20">
          <div className="dashboard__form__wraper">
            <div className="dashboard__form__input">
              <label htmlFor="currentPass">Current Password</label>
              <PasswordInput
                id="currentPass"
                hasError={!!errors.currentPassword}
                autoComplete="current-password"
                className="register__input"
                {...register('currentPassword')}
              />
              <FormError message={errors.currentPassword?.message} />
            </div>
          </div>
        </div>
        <div className="col-xl-12 sp_bottom_20">
          <div className="dashboard__form__wraper">
            <div className="dashboard__form__input">
              <label htmlFor="newPass">New Password</label>
              <PasswordInput
                id="newPass"
                hasError={!!errors.newPassword}
                autoComplete="new-password"
                className="register__input"
                {...register('newPassword')}
              />
              <FormError message={errors.newPassword?.message} />
            </div>
          </div>
        </div>
        <div className="col-xl-12 sp_bottom_20">
          <div className="dashboard__form__wraper">
            <div className="dashboard__form__input">
              <label htmlFor="confirmPass">Confirm Password</label>
              <PasswordInput
                id="confirmPass"
                hasError={!!errors.confirmPassword}
                autoComplete="new-password"
                className="register__input"
                {...register('confirmPassword')}
              />
              <FormError message={errors.confirmPassword?.message} />
            </div>
          </div>
        </div>
        <div className="col-xl-12">
          <div className="dashboard__form__button">
            <button type="submit" className="default__button">
              Update Password
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function SocialLinksForm() {
  const [message, setMessage] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(true);
  const withLoader = useDashboardLoader();
  const { selectedOrgId } = useOrgScope();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SocialLinksFormValues>({
    resolver: yupResolver(socialLinksSchema),
    defaultValues: { facebook: '', twitter: '', linkedin: '', instagram: '' },
  });

  const load = async () => {
    setLoading(true);
    try {
      const rows = await platformService.getSettings(['social_links']);
      const social = rows.find((r) => r.key === 'social_links')?.value as SocialLinksFormValues | undefined;
      reset(social ?? { facebook: '', twitter: '', linkedin: '', instagram: '' });
    } catch {
      reset({ facebook: '', twitter: '', linkedin: '', instagram: '' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [selectedOrgId]);

  useDashboardLoadingEffect(loading);

  const onSubmit = async (values: SocialLinksFormValues) => {
    setApiError('');
    setMessage('');
    await withLoader(async () => {
      try {
        await platformService.upsertSetting('social_links', values);
        setMessage('Branding social links saved.');
      } catch (err) {
        setApiError(parseApiError(err));
      }
    });
  };

  const resetForm = () => {
    reset({ facebook: '', twitter: '', linkedin: '', instagram: '' });
    setMessage('');
    setApiError('');
  };

  const clearSaved = async () => {
    const ok = await confirmDelete({
      title: 'Reset branding links?',
      text: 'This deletes saved social links for the selected organization.',
      confirmText: 'Yes, reset',
    });
    if (!ok) return;
    setApiError('');
    await withLoader(async () => {
      try {
        await platformService.deleteSetting('social_links');
        resetForm();
        setMessage('Social links cleared for this organization.');
      } catch (err) {
        setApiError(parseApiError(err));
      }
    });
  };

  const fields = [
    { id: 'facebook', label: 'Facebook' },
    { id: 'twitter', label: 'Twitter' },
    { id: 'linkedin', label: 'LinkedIn' },
    { id: 'instagram', label: 'Instagram' },
  ] as const;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {apiError && <p className="login__error sp_bottom_15">{apiError}</p>}
      {message && <p className="form-success sp_bottom_15">{message}</p>}
      <div className="row">
        {fields.map((field) => (
          <div key={field.id} className="col-xl-6 sp_bottom_20">
            <div className="dashboard__form__wraper">
              <div className="dashboard__form__input">
                <label htmlFor={field.id}>{field.label} URL</label>
                <input
                  id={field.id}
                  type="url"
                  placeholder={`https://${field.id}.com/...`}
                  className={inputClassName('', !!errors[field.id])}
                  {...register(field.id)}
                />
                <FormError message={errors[field.id]?.message} />
              </div>
            </div>
          </div>
        ))}
        <div className="col-xl-12">
          <div className="dashboard__form__button d-flex flex-wrap gap-2">
            <button type="submit" className="default__button">
              Save Branding Links
            </button>
            <button type="button" className="dashboard__small__btn__2" onClick={resetForm}>
              Clear Form
            </button>
            <button type="button" className="dashboard__small__btn__2" onClick={() => void clearSaved()}>
              Delete Saved Links
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function CreateTestInfoForm() {
  const [message, setMessage] = useState('');
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateTestFormValues>({
    resolver: yupResolver(createTestSchema),
    defaultValues: {
      title: '',
      slug: '',
      category: 'hardware',
      duration: '90',
      description: '',
    },
  });

  const onSubmit = () => {
    setMessage('Exam info saved successfully.');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {message && <p className="form-success sp_bottom_15">{message}</p>}
      <div className="become__instructor__form">
        <div className="row">
          <div className="col-xl-12 sp_bottom_20">
            <div className="dashboard__form__wraper">
              <div className="dashboard__form__input">
                <label htmlFor="examTitle">Exam Title</label>
                <input
                  id="examTitle"
                  type="text"
                  placeholder="e.g. CCC Mock Test — July 2026"
                  className={inputClassName('', !!errors.title)}
                  {...register('title')}
                />
                <FormError message={errors.title?.message} />
              </div>
            </div>
          </div>
          <div className="col-xl-12 sp_bottom_20">
            <div className="dashboard__form__wraper">
              <div className="dashboard__form__input">
                <label htmlFor="examSlug">Exam Slug</label>
                <input
                  id="examSlug"
                  type="text"
                  placeholder="ccc-mock-july-2026"
                  className={inputClassName('', !!errors.slug)}
                  {...register('slug')}
                />
                <FormError message={errors.slug?.message} />
              </div>
            </div>
          </div>
          <div className="col-xl-6 col-lg-6 sp_bottom_20">
            <div className="dashboard__select__heading">
              <span>Category</span>
            </div>
            <div className="dashboard__selector">
              <EdtpSelect {...register('category')}>
                <option value="hardware">Hardware & Networking</option>
                <option value="software">Computer Application</option>
                <option value="diploma">Diploma Course</option>
                <option value="govt">CCC / O Level</option>
              </EdtpSelect>
              <FormError message={errors.category?.message} />
            </div>
          </div>
          <div className="col-xl-6 col-lg-6 sp_bottom_20">
            <div className="dashboard__form__wraper">
              <div className="dashboard__form__input">
                <label htmlFor="examDuration">Duration (minutes)</label>
                <input
                  id="examDuration"
                  type="number"
                  min={1}
                  step={1}
                  placeholder="e.g. 90"
                  className={inputClassName('register__input edtp-number-input', !!errors.duration)}
                  {...register('duration', {
                    onBlur: (e) => {
                      setValue('duration', normalizePositiveIntInput(e.target.value, 60), {
                        shouldValidate: true,
                      });
                    },
                  })}
                />
                <FormError message={errors.duration?.message} />
              </div>
            </div>
          </div>
          <div className="col-xl-12 sp_bottom_20">
            <div className="dashboard__form__wraper">
              <div className="dashboard__form__input">
                <label htmlFor="aboutExam">About Exam</label>
                <textarea
                  id="aboutExam"
                  rows={6}
                  placeholder="Exam description..."
                  className={inputClassName('', !!errors.description)}
                  {...register('description')}
                />
                <FormError message={errors.description?.message} />
              </div>
            </div>
          </div>
          <div className="col-xl-12">
            <div className="dashboard__form__button create__course__margin">
              <button type="submit" className="default__button">
                Update Info
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

function CreateTestVideoForm() {
  const [message, setMessage] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTestVideoFormValues>({
    resolver: yupResolver(createTestVideoSchema),
    defaultValues: { videoUrl: '' },
  });

  const onSubmit = () => {
    setMessage('Video URL saved successfully.');
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {message && <p className="form-success sp_bottom_15">{message}</p>}
      <div className="become__instructor__form">
        <div className="row">
          <div className="col-xl-12 sp_bottom_20">
            <div className="dashboard__form__wraper">
              <div className="dashboard__form__input">
                <label htmlFor="videoUrl">Add Your Video URL</label>
                <input
                  id="videoUrl"
                  type="text"
                  placeholder="Add your Video URL here"
                  className={inputClassName('', !!errors.videoUrl)}
                  {...register('videoUrl')}
                />
                <FormError message={errors.videoUrl?.message} />
              </div>
            </div>
          </div>
          <div className="col-xl-12">
            <div className="dashboard__form__button">
              <button type="submit" className="default__button">
                Save Video
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

function BecomeTeacherForm() {
  const [message, setMessage] = useState('');
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BecomeTeacherFormValues>({
    resolver: yupResolver(becomeTeacherSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      agreeToPrivacy: false,
    },
  });

  const onSubmit = () => {
    setMessage('Application submitted successfully.');
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {message && <p className="form-success sp_bottom_15">{message}</p>}
      <div className="row">
        <div className="col-xl-12 sp_bottom_20">
          <div className="dashboard__form__wraper">
            <div className="dashboard__form__input">
              <label htmlFor="fi">First Name</label>
              <input
                id="fi"
                type="text"
                placeholder="John"
                className={inputClassName('', !!errors.firstName)}
                {...register('firstName')}
              />
              <FormError message={errors.firstName?.message} />
            </div>
          </div>
        </div>
        <div className="col-xl-12 sp_bottom_20">
          <div className="dashboard__form__wraper">
            <div className="dashboard__form__input">
              <label htmlFor="ln">Last Name</label>
              <input
                id="ln"
                type="text"
                placeholder="Doe"
                className={inputClassName('', !!errors.lastName)}
                {...register('lastName')}
              />
              <FormError message={errors.lastName?.message} />
            </div>
          </div>
        </div>
        <div className="col-xl-12 sp_bottom_20">
          <div className="dashboard__form__wraper">
            <div className="dashboard__form__input">
              <label htmlFor="em">Email</label>
              <input
                id="em"
                type="email"
                placeholder="Email"
                className={inputClassName('', !!errors.email)}
                {...register('email')}
              />
              <FormError message={errors.email?.message} />
            </div>
          </div>
        </div>
        <div className="col-xl-12 sp_bottom_20">
          <div className="dashboard__form__wraper">
            <div className="dashboard__form__input">
              <label htmlFor="ph">Phone</label>
              <input
                id="ph"
                type="tel"
                placeholder="Phone"
                className={inputClassName('', !!errors.phone)}
                {...register('phone')}
              />
              <FormError message={errors.phone?.message} />
            </div>
          </div>
        </div>
        <div className="col-xl-12 sp_bottom_20">
          <div className="become__instructor__check">
            <input
              className="become__instructor__check__input"
              type="checkbox"
              id="privacyCheck"
              {...register('agreeToPrivacy')}
            />
            <label className="become__instructor__check__label" htmlFor="privacyCheck">
              You agree to our friendly <Link to="/privacy">Privacy policy</Link>.
            </label>
          </div>
          <FormError message={errors.agreeToPrivacy?.message} />
        </div>
        <div className="col-xl-12">
          <div className="dashboard__form__button">
            <button type="submit" className="default__button">
              Submit Application
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

export function DashboardSettingsContent() {
  const { user } = useAuth();
  const { organization, refresh, loading: orgLoading } = useOrganization();
  const isAdmin = user?.roles.some((r) =>
    ['super_admin', 'org_admin', 'branch_admin'].includes(r),
  );
  const isStudent = Boolean(user?.roles.includes('student'));
  // Branding is org-level; never show to students
  const tabs = isAdmin
    ? ['Profile', 'Organization', 'Password', 'Branding']
    : isStudent
      ? ['Profile', 'Password']
      : ['Profile', 'Password', 'Branding'];
  const [activeTab, setActiveTab] = useState('Profile');

  useDashboardLoadingEffect(orgLoading && activeTab === 'Organization');

  if (!user) return null;

  return (
    <>
      <DashboardPageHeader
        badge="Account"
        title="Settings"
        subtitle={
          isStudent
            ? 'Manage your profile and password.'
            : 'Manage organization profile, branding, password and preferences for the selected tenant.'
        }
      />
      <div className="dashboard__content__wraper">
        <DashboardTabButtons tabs={tabs} active={activeTab} onChange={setActiveTab} />
        <div>
          {activeTab === 'Profile' && <ProfileSettingsApiForm />}
          {activeTab === 'Organization' && isAdmin && (
            <>
              <OrganizationSettingsForm organization={organization} onSaved={refresh} />
              <AutoIssueCertificatesForm />
              <CertificateBrandingForm />
            </>
          )}
          {activeTab === 'Password' && <PasswordChangeForm />}
          {activeTab === 'Branding' && !isStudent && <SocialLinksForm />}
        </div>
      </div>
    </>
  );
}

export function DashboardCreateCourseContent() {
  return (
    <div className="create__course">
      <div className="create__course__accordion__wraper">
        <div className="accordion" id="createCourseAccordion">
          <div className="accordion-item">
            <h2 className="accordion-header">
              <button
                className="accordion-button"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#courseInfo"
              >
                Exam Info
              </button>
            </h2>
            <div id="courseInfo" className="accordion-collapse collapse show" data-bs-parent="#createCourseAccordion">
              <div className="accordion-body">
                <CreateTestInfoForm />
              </div>
            </div>
          </div>
          <div className="accordion-item">
            <h2 className="accordion-header">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#courseVideo"
              >
                Exam Intro Video
              </button>
            </h2>
            <div id="courseVideo" className="accordion-collapse collapse" data-bs-parent="#createCourseAccordion">
              <div className="accordion-body">
                <CreateTestVideoForm />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardBecomeInstructorContent() {
  const rules = [
    'Valid teaching certification or subject expertise',
    'Experience creating exam prep content',
    'Commitment to curriculum and assessment standards',
    'Ability to proctor online exams',
    'Strong communication with students',
  ];

  return (
    <div className="become__instructor">
      <div className="become__instructor__heading">
        <h2>Apply As Instructor</h2>
      </div>
      <div className="row">
        <div className="col-xl-6 col-lg-6 col-md-12 col-12">
          <div className="become__instructor__text">
            <h3 className="become__instructor__small__heading">Become an Instructor</h3>
            <p>
              Join Edumatra and help students prepare for online mock tests, certificate
              exams, CCC, O Level, and diploma assessments in Hardware, Software & Networking.
            </p>
            <h3 className="become__instructor__small__heading">Instructor Rules</h3>
            <p>All instructors must meet our quality and compliance standards for online exam preparation.</p>
            <div className="become__instructor__list">
              <ul>
                {rules.map((rule) => (
                  <li key={rule}>
                    <div className="become__instructor__img">
                      <img loading="lazy" src="/img/dashbord/check__1.png" alt="" />
                    </div>
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="col-xl-6 col-lg-6 col-md-12 col-12">
          <div className="become__instructor__form">
            <BecomeTeacherForm />
          </div>
        </div>
      </div>
    </div>
  );
}
