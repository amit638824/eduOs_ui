import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import type { DashboardCounter, DashboardTableRow } from '@/types/dashboard';
import { useAuth } from '@/context/AuthContext';
import { buildProfileFields } from '@/data/dashboardNavigation';
import { useOrganization } from '@/hooks/useOrganization';
import { organizationService, platformService } from '@/services';
import * as authService from '@/services/auth.service';
import { parseApiError } from '@/lib/errors';
import { FormError, PasswordInput, inputClassName } from '@/components/ui/FormField';
import { ProfileSettingsApiForm } from '@/components/dashboard/examination/ExaminationPanels';
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
  assignments,
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
  title: string;
  counters: DashboardCounter[];
}) {
  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title">
        <h4>{title}</h4>
      </div>
      <div className="row">
        {counters.map((counter) => (
          <div key={counter.label} className="col-xl-4 col-lg-6 col-md-12 col-12">
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
  const { user } = useAuth();
  if (!user) return null;

  const fields = buildProfileFields(user);

  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title">
        <h4>My Profile</h4>
      </div>
      <div className="row">
        {fields.map((field, index) => (
          <div key={field.label} className="col-12">
            <div className="row">
              <div className="col-lg-4 col-md-4">
                <div className={`dashboard__form${index > 0 ? ' dashboard__form__margin' : ''}`}>
                  {field.label}
                </div>
              </div>
              <div className="col-lg-8 col-md-8">
                <div className={`dashboard__form${index > 0 ? ' dashboard__form__margin' : ''}`}>
                  {field.value}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
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
  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title">
        <h4>Assignment</h4>
      </div>
      <DashboardFilterRow />
      <hr className="mt-40" />
      <div className="row">
        <div className="col-xl-12">
          <div className="dashboard__table table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Assignment Name</th>
                  <th>Total Marks</th>
                  <th>Total Submit</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {assignments.map((row, i) => (
                  <tr key={row.title} className={i % 2 === 1 ? 'dashboard__table__row' : undefined}>
                    <th>
                      <span>{row.title}</span>
                      <p>
                        course: <a href="#!">{row.course}</a>
                      </p>
                    </th>
                    <td>
                      <p>{row.marks}</p>
                    </td>
                    <td>
                      <p>{row.submitted}</p>
                    </td>
                    <td>
                      <div className="dashboard__button__group">
                        <a className="dashboard__small__btn__2" href="#!">
                          <i className="icofont-edit" />
                          Edit
                        </a>
                        <a className="dashboard__small__btn__2 dashboard__small__btn__3" href="#!">
                          <i className="icofont-paper-plane" /> Submit
                        </a>
                        <a className="dashboard__small__btn__2" href="#!">
                          <i className="icofont-download" /> Download
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
    try {
      await organizationService.updateOrganization(organization.id, values);
      setMessage('Organization updated successfully.');
      await onSaved();
    } catch (err) {
      setApiError(parseApiError(err));
    }
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

function PasswordChangeForm() {
  const [message, setMessage] = useState('');
  const [apiError, setApiError] = useState('');
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
    try {
      await authService.changePassword(values.currentPassword, values.newPassword);
      setMessage('Password updated successfully.');
      reset();
    } catch (err) {
      setApiError(parseApiError(err));
    }
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
                autoComplete="off"
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
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SocialLinksFormValues>({
    resolver: yupResolver(socialLinksSchema),
    defaultValues: { facebook: '', twitter: '', linkedin: '', instagram: '' },
  });

  useEffect(() => {
    platformService.getSettings(['social_links']).then((rows) => {
      const social = rows.find((r) => r.key === 'social_links')?.value as SocialLinksFormValues | undefined;
      if (social) reset(social);
    }).catch(() => undefined);
  }, [reset]);

  const onSubmit = async (values: SocialLinksFormValues) => {
    setApiError('');
    try {
      await platformService.upsertSetting('social_links', values);
      setMessage('Social links saved successfully.');
    } catch (err) {
      setApiError(parseApiError(err));
    }
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
          <div className="dashboard__form__button">
            <button type="submit" className="default__button">
              Save Social Links
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
    formState: { errors },
  } = useForm<CreateTestFormValues>({
    resolver: yupResolver(createTestSchema),
    defaultValues: {
      title: '',
      slug: '',
      category: 'sat',
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
                  placeholder="e.g. SAT Math Practice Test 1"
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
                  placeholder="sat-math-practice-1"
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
              <select className="form-select" {...register('category')}>
                <option value="sat">SAT & ACT</option>
                <option value="ap">AP Exams</option>
                <option value="state">State Assessment</option>
                <option value="cert">Certification</option>
              </select>
              <FormError message={errors.category?.message} />
            </div>
          </div>
          <div className="col-xl-6 col-lg-6 sp_bottom_20">
            <div className="dashboard__select__heading">
              <span>Duration (minutes)</span>
            </div>
            <div className="dashboard__selector">
              <select className="form-select" {...register('duration')}>
                <option value="60">60 min</option>
                <option value="90">90 min</option>
                <option value="120">120 min</option>
                <option value="180">180 min</option>
              </select>
              <FormError message={errors.duration?.message} />
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
  const { organization, refresh } = useOrganization();
  const isAdmin = user?.roles.some((r) =>
    ['super_admin', 'org_admin', 'branch_admin'].includes(r),
  );
  const tabs = isAdmin
    ? ['Profile', 'Organization', 'Password', 'Social Icon']
    : ['Profile', 'Password', 'Social Icon'];
  const [activeTab, setActiveTab] = useState('Profile');

  if (!user) return null;

  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title">
        <h4>Account Settings</h4>
      </div>
      <div className="row">
        <div className="col-xl-12 sp_bottom_20">
          <DashboardTabButtons tabs={tabs} active={activeTab} onChange={setActiveTab} />
        </div>
        <div className="col-xl-12">
          {activeTab === 'Profile' && <ProfileSettingsApiForm />}
          {activeTab === 'Organization' && isAdmin && (
            <OrganizationSettingsForm organization={organization} onSaved={refresh} />
          )}
          {activeTab === 'Password' && <PasswordChangeForm />}
          {activeTab === 'Social Icon' && <SocialLinksForm />}
        </div>
      </div>
    </div>
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
              Join EduTest Pro — built by TechWagger — and help students prepare for SAT, ACT, AP, and
              state assessments. Share your expertise through practice exams, quizzes, and proctored
              sessions.
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
