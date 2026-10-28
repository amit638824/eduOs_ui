import { useEffect, useState, useMemo } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  FiPlus,
  FiSearch,
  FiX,
  FiUser,
  FiUsers,
  FiEdit3,
  FiTrash2,
  FiLayers,
  FiActivity,
  FiRefreshCw,
  FiCreditCard,
  FiShield,
  FiSmartphone,
  FiGlobe,
  FiCheckCircle,
  FiAlertTriangle,
  FiCopy,
  FiCheck,
} from 'react-icons/fi';
import { HiOfficeBuilding } from 'react-icons/hi';
import '@/styles/organizations.css';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { examinationService, platformService } from '@/services';
import { parseApiError } from '@/lib/errors';
import { FormError, PasswordInput } from '@/components/ui/FormField';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/context/AuthContext';
import { useDashboardLoader, useDashboardLoadingEffect } from '@/context/DashboardLoadingContext';
import { ExamStepper } from '@/components/dashboard/AdminExamGuide';
import DashboardPageHeader from '@/components/dashboard/DashboardPageHeader';
import { getTestsListPath, isSuperAdmin } from '@/utils/dashboardRole';
import { SearchField } from '@/components/ui/FieldHint';
import {
  EdtpAlert,
  EdtpBtn,
  EdtpEmpty,
  EdtpField,
  EdtpSelect,
} from '@/components/ui/CrudUI';
import { confirmDelete, showError, showSuccess } from '@/lib/swal';
import { formatDate, formatDateTime } from '@/utils/dateFormat';
import { DEFAULT_SUGGESTED_PASSWORD } from '@/utils/defaultPassword';
import { getQuestionText } from '@/utils/questionContent';
import { QuestionPreviewModal } from '@/components/dashboard/QuestionPreviewModal';
import { ReportInsights } from '@/components/dashboard/examination/AiBuildPanel';
import * as yup from 'yup';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function NotificationsPanel() {
  const [items, setItems] = useState<Awaited<ReturnType<typeof platformService.listNotifications>>['data']>([]);
  const [error, setError] = useState('');
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const withLoader = useDashboardLoader();

  const load = async () => {
    setLoading(true);
    try {
      const [list, count] = await Promise.all([
        platformService.listNotifications(1, 30),
        platformService.getUnreadCount(),
      ]);
      setItems(list.data);
      setUnread(count);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useDashboardLoadingEffect(loading);

  const markRead = async (id: string) => {
    await withLoader(async () => {
      await platformService.markNotificationRead(id);
      await load();
    });
  };

  const markAll = async () => {
    await withLoader(async () => {
      await platformService.markAllNotificationsRead();
      await load();
    });
  };

  return (
    <>
      <DashboardPageHeader
        badge="Inbox"
        title="Notifications"
        subtitle="Updates for your account, assigned tests, exam submissions and results."
      />
      <div className="dashboard__content__wraper">
        <div className="dashboard__section__title d-flex justify-content-between align-items-center">
          <h4>All notifications {unread > 0 && <span className="badge bg-primary ms-2">{unread}</span>}</h4>
          {unread > 0 && (
            <button type="button" className="default__button small-btn" onClick={markAll}>
              Mark all read
            </button>
          )}
        </div>
        {error && <p className="login__error sp_bottom_15">{error}</p>}
        <div className="dashboard__table table-responsive">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Channel</th>
                <th>Date</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {items.map((n) => (
                <tr key={n.id} className={n.is_read ? '' : 'fw-semibold'}>
                  <td>{n.title}<br /><small>{n.body}</small></td>
                  <td>{n.channel}</td>
                  <td>{formatDateTime(n.created_at)}</td>
                  <td>{n.is_read ? 'Read' : 'Unread'}</td>
                  <td>
                    {!n.is_read && (
                      <button type="button" className="default__button small-btn" onClick={() => markRead(n.id)}>
                        Mark read
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={5}>No notifications yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export function PaymentsPanel({ allowTopUp = false }: { allowTopUp?: boolean }) {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Awaited<ReturnType<typeof platformService.listPayments>>['data']>([]);
  const [wallet, setWallet] = useState<Record<string, unknown> | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<Awaited<ReturnType<typeof platformService.getPaymentConfig>> | null>(null);
  const [amount, setAmount] = useState('500');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [paying, setPaying] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [list, w] = await Promise.all([
      platformService.listPayments(1, 30),
      platformService.getWallet(),
    ]);
    setPayments(list.data);
    setWallet(w);
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([load(), platformService.getPaymentConfig()])
      .then(([, config]) => setPaymentConfig(config))
      .catch((err) => setError(parseApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  useDashboardLoadingEffect(loading || paying);

  useEffect(() => {
    if (!allowTopUp || paymentConfig?.gateway !== 'razorpay') return;
    if (document.querySelector('script[data-razorpay]')) return;
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpay = 'true';
    document.body.appendChild(script);
  }, [allowTopUp, paymentConfig?.gateway]);

  const handleTopUp = async () => {
    setError('');
    setMessage('');
    const numAmount = Number(amount);
    if (!numAmount || numAmount < 1) {
      setError('Enter a valid amount (min ₹1).');
      return;
    }
    if (!window.Razorpay) {
      setError('Payment gateway is loading. Please try again.');
      return;
    }
    setPaying(true);
    try {
      const order = await platformService.createRazorpayOrder(numAmount);
      // Stop overlay before Razorpay modal — otherwise loader stays forever over checkout
      setPaying(false);
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Mindsprint',
        description: 'Wallet Top-up',
        order_id: order.orderId,
        prefill: {
          email: user?.email,
          name: user ? `${user.firstName} ${user.lastName}` : undefined,
        },
        theme: { color: '#2563eb' },
        modal: { ondismiss: () => setPaying(false) },
        handler: async (response) => {
          setPaying(true);
          try {
            await platformService.verifyRazorpayPayment({
              paymentId: order.paymentId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setMessage('Payment successful! Wallet updated.');
            await load();
          } catch (err) {
            setError(parseApiError(err));
          } finally {
            setPaying(false);
          }
        },
      });
      rzp.open();
    } catch (err) {
      setError(parseApiError(err));
      setPaying(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const st = (p.status || '').toLowerCase();
      if (statusFilter === 'paid' && !st.includes('paid') && !st.includes('complete') && !st.includes('success')) return false;
      if (statusFilter === 'pending' && !st.includes('pend')) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase().includes(q);
        const emailMatch = (p.email || '').toLowerCase().includes(q);
        const amountMatch = String(p.amount || '').includes(q);
        return nameMatch || emailMatch || amountMatch;
      }
      return true;
    });
  }, [payments, statusFilter, searchQuery]);

  return (
    <div className="org-panel-root">
      {/* ── Top Stat Cards (Matching Image 2 Reference) ── */}
      <div className="org-stats-row">
        {/* Left Info Card */}
        <div className="org-info-card">
          <div className="org-info-card-icon">
            <FiCreditCard />
          </div>
          <div className="org-info-card-text">
            <h3 className="org-info-card-title">{allowTopUp ? 'My Wallet' : 'Payments & Wallet'}</h3>
            <p className="org-info-card-desc">
              {!allowTopUp
                ? 'Monitor platform transactions, payment settlements, and wallet balances.'
                : 'Manage wallet funds, view fee payments, and add account balance.'}
            </p>
          </div>
        </div>

        {/* Stat Card 1: Total Paid */}
        <div className="org-stat-card">
          <span className="org-stat-card-val org-stat-card-val--success">
            ₹{wallet?.total_paid != null ? String(wallet.total_paid) : '0'}
          </span>
          <span className="org-stat-card-lbl">Total Paid</span>
        </div>

        {/* Stat Card 2: Pending */}
        <div className="org-stat-card">
          <span className="org-stat-card-val org-stat-card-val--warning">
            ₹{wallet?.pending != null ? String(wallet.pending) : '0'}
          </span>
          <span className="org-stat-card-lbl">Pending</span>
        </div>
      </div>

      {error && (
        <div className="mad-alert-error" role="alert">
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="mad-alert-success" role="alert">
          <span>{message}</span>
        </div>
      )}

      {/* Top-up form for students/wallet */}
      {allowTopUp && paymentConfig?.gateway === 'razorpay' && (
        <div
          style={{
            background: 'var(--db-card, #ffffff)',
            border: '1px solid var(--db-border, #e2e8f0)',
            borderRadius: '16px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
              Add money to wallet
            </h4>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#64748b' }}>
              Instant secure deposit via Razorpay gateway.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="number"
              min={1}
              step={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount in INR"
              className="org-form-input"
              style={{ width: '140px', padding: '7px 12px' }}
            />
            <button
              type="button"
              className="org-add-btn"
              onClick={handleTopUp}
              disabled={paying}
            >
              {paying ? 'Processing…' : 'Pay with Razorpay'}
            </button>
          </div>
        </div>
      )}

      {/* ── Main Full-Width Table Card ── */}
      <div className="org-table-card">
        {/* Card Header with Search & Status Filter Pills */}
        <div className="org-card-header">
          <div className="org-title-group">
            <div className="org-title-row">
              <h3 className="org-card-title">All Transactions</h3>
              <span className="org-count-badge">
                {filteredPayments.length} {filteredPayments.length === 1 ? 'Record' : 'Records'}
              </span>
            </div>
            <p className="org-card-subtitle">
              Comprehensive ledger of student fee payments, wallet top-ups, and gateway orders
            </p>
          </div>

          <div className="org-controls-row">
            {/* Search Box */}
            <div className="org-search-box">
              <FiSearch className="org-search-icon" />
              <input
                type="text"
                className="org-search-input"
                placeholder="Search user, email, amount..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search payments"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="org-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <FiX />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="org-filter-pills" role="tablist" aria-label="Status filters">
              <button
                type="button"
                className={`org-pill${statusFilter === 'all' ? ' is-active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All ({payments.length})
              </button>
              <button
                type="button"
                className={`org-pill${statusFilter === 'paid' ? ' is-active' : ''}`}
                onClick={() => setStatusFilter('paid')}
              >
                Paid
              </button>
              <button
                type="button"
                className={`org-pill${statusFilter === 'pending' ? ' is-active' : ''}`}
                onClick={() => setStatusFilter('pending')}
              >
                Pending
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        {filteredPayments.length === 0 && !loading ? (
          <div className="org-empty-state">
            <FiCreditCard className="org-empty-icon" />
            <p className="org-empty-text">
              {searchQuery || statusFilter !== 'all'
                ? 'No transactions match the current filter.'
                : 'No payments recorded in this period.'}
            </p>
          </div>
        ) : (
          <div className="org-table-wrap">
            <table className="org-table">
              <thead>
                <tr>
                  <th>User / Account</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', paddingRight: '24px' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => {
                  const isPaid = (p.status || '').toLowerCase().includes('paid') || (p.status || '').toLowerCase().includes('success');
                  const initials = getUserInitials(p.first_name, p.last_name, p.email);

                  return (
                    <tr key={p.id}>
                      {/* User Cell */}
                      <td>
                        <div className="org-cell-flex">
                          <div className="org-avatar-badge">{initials}</div>
                          <div className="org-name-meta">
                            <span className="org-name-text">
                              {p.first_name} {p.last_name}
                            </span>
                            <span className="org-sub-meta">{p.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Amount Cell */}
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            color: '#0f172a',
                          }}
                        >
                          ₹{p.amount}{' '}
                          <small style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {p.currency}
                          </small>
                        </span>
                      </td>

                      {/* Status Cell */}
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            padding: '3px 10px',
                            borderRadius: '8px',
                            background: isPaid ? '#ecfdf5' : '#fef3c7',
                            color: isPaid ? '#059669' : '#d97706',
                            border: `1px solid ${isPaid ? '#a7f3d0' : '#fde68a'}`,
                            textTransform: 'capitalize',
                            display: 'inline-block',
                          }}
                        >
                          {p.status}
                        </span>
                      </td>

                      {/* Date Cell */}
                      <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                        <span style={{ fontSize: '0.825rem', color: '#64748b' }}>
                          {formatDate(p.created_at)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function getUserInitials(firstName?: string, lastName?: string, email?: string) {
  if (firstName && lastName) return (firstName[0] + lastName[0]).toUpperCase();
  if (firstName) return firstName.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return 'U';
}

const createUserSchema = yup.object({
  email: yup.string().email().required(),
  password: yup
    .string()
    .transform((v) => (v == null || v === '' ? undefined : v))
    .optional()
    .min(8, 'Password must be at least 8 characters'),
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  role: yup.mixed<'student' | 'teacher' | 'org_admin' | 'staff'>().oneOf(['student', 'teacher', 'org_admin', 'staff']).required(),
  enrollmentNo: yup.string().trim().max(50).optional(),
});

type CreateUserForm = {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher' | 'org_admin' | 'staff';
  enrollmentNo?: string;
};

export function UsersManagementPanel({
  lockedRole,
  title,
}: {
  lockedRole?: 'student' | 'teacher' | 'org_admin' | 'staff';
  title?: string;
} = {}) {
  const [users, setUsers] = useState<Awaited<ReturnType<typeof platformService.listUsers>>['data']>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const withLoader = useDashboardLoader();
  const { user: authUser } = useAuth();
  const canDeleteUsers =
    isSuperAdmin(authUser?.roles ?? []) || (authUser?.roles.includes('org_admin') ?? false);
  const defaultRole = lockedRole ?? 'student';
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
    setError: setFormError,
  } = useForm<CreateUserForm>({
    // yup InferType + optional password conflicts with RHF Resolver generics
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(createUserSchema) as any,
    defaultValues: {
      email: '',
      password: DEFAULT_SUGGESTED_PASSWORD,
      firstName: '',
      lastName: '',
      role: defaultRole,
      enrollmentNo: '',
    },
  });
  const watchedRole = watch('role');
  const showEnrollmentField = lockedRole === 'student' || watchedRole === 'student';

  const load = async () => {
    setLoading(true);
    try {
      const res = await platformService.listUsers(1, 100, undefined, lockedRole);
      setUsers(res.data);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [lockedRole]);

  useEffect(() => {
    if (editingId || !showEnrollmentField) return;
    platformService
      .previewEnrollmentNumber()
      .then((no) => setValue('enrollmentNo', no))
      .catch(() => undefined);
  }, [editingId, showEnrollmentField, setValue]);

  useDashboardLoadingEffect(loading);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

  const resetForm = () => {
    setEditingId(null);
    reset({
      email: '',
      password: DEFAULT_SUGGESTED_PASSWORD,
      firstName: '',
      lastName: '',
      role: defaultRole,
      enrollmentNo: '',
    });
    if (defaultRole === 'student' || lockedRole === 'student') {
      platformService
        .previewEnrollmentNumber()
        .then((no) => setValue('enrollmentNo', no))
        .catch(() => undefined);
    }
  };

  const openAddDrawer = () => {
    resetForm();
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    resetForm();
  };

  const startEdit = (u: (typeof users)[number]) => {
    setEditingId(u.id);
    const role =
      (u.roles as string[]).find((r) => ['student', 'teacher', 'org_admin', 'staff'].includes(r)) as
      | 'student'
      | 'teacher'
      | 'org_admin'
      | 'staff'
      | undefined;
    reset({
      email: u.email,
      password: '',
      firstName: u.first_name,
      lastName: u.last_name,
      role: lockedRole ?? role ?? 'student',
      enrollmentNo: u.enrollment_no ?? '',
    });
    setIsDrawerOpen(true);
  };

  const onSubmit = async (values: CreateUserForm) => {
    setError('');
    if (!editingId && (!values.password || values.password.length < 8)) {
      setFormError('password', { message: 'Password must be at least 8 characters' });
      return;
    }
    await withLoader(async () => {
      try {
        const role = lockedRole ?? values.role;
        if (editingId) {
          await platformService.updateUser(editingId, {
            firstName: values.firstName,
            lastName: values.lastName,
            role,
            enrollmentNo: showEnrollmentField ? values.enrollmentNo?.trim() : undefined,
          });
          showSuccess('Updated', 'User details saved.');
        } else {
          await platformService.createUser({
            email: values.email,
            password: values.password!,
            firstName: values.firstName,
            lastName: values.lastName,
            role,
            enrollmentNo: showEnrollmentField ? values.enrollmentNo?.trim() : undefined,
          });
          showSuccess('Created', 'Login credentials emailed.');
        }
        closeDrawer();
        await load();
      } catch (err) {
        setError(parseApiError(err));
      }
    });
  };

  const setStatus = async (userId: string, status: 'active' | 'inactive') => {
    setError('');
    await withLoader(async () => {
      try {
        await platformService.updateUserStatus(userId, status);
        showSuccess(
          status === 'active' ? 'Activated' : 'Deactivated',
          status === 'active' ? 'Account is active and can log in.' : 'Account is deactivated and cannot log in.',
        );
        await load();
      } catch (err) {
        setError(parseApiError(err));
      }
    });
  };

  const removeUser = async (userId: string, name: string) => {
    const ok = await confirmDelete({
      title: 'Permanently delete user?',
      text: `“${name}” will be permanently deleted from the database. This cannot be undone.`,
      confirmText: 'Yes, delete forever',
    });
    if (!ok) return;
    setError('');
    try {
      await withLoader(async () => {
        await platformService.deleteUser(userId);
        if (editingId === userId) closeDrawer();
        await load();
      });
      showSuccess('Deleted!', `${name} has been removed.`);
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const heading =
    title ??
    (lockedRole === 'teacher'
      ? 'Faculty'
      : lockedRole === 'student'
        ? 'Students'
        : lockedRole === 'staff'
          ? 'Staff'
          : 'User Management');

  const pageSubtitle =
    lockedRole === 'teacher'
      ? 'Manage teaching faculty, course instructors, department leaders, and academic staff.'
      : lockedRole === 'student'
        ? 'Manage student registrations, academic enrollment numbers, test eligibility, and cohort access.'
        : lockedRole === 'staff'
          ? 'Manage institutional staff, examination controllers, proctors, and administrative officers.'
          : 'Comprehensive platform directory — add, onboard, and manage role permissions across the institution.';

  const addBtnLabel =
    lockedRole === 'teacher'
      ? 'Add Faculty'
      : lockedRole === 'student'
        ? 'Add Student'
        : lockedRole === 'staff'
          ? 'Add Staff'
          : 'Add User';

  const cardSubtitle =
    lockedRole === 'teacher'
      ? 'Directory of active faculty instructors and department teachers'
      : lockedRole === 'student'
        ? 'Directory of enrolled students, examination cohorts, and registrations'
        : lockedRole === 'staff'
          ? 'Directory of platform administrators, proctors, and support staff'
          : 'Directory of all registered institution users, permissions, and roles';

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (statusFilter === 'active' && u.status !== 'active') return false;
      if (statusFilter === 'inactive' && u.status === 'active') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const fullName = `${u.first_name} ${u.last_name}`.toLowerCase();
        const email = u.email.toLowerCase();
        const enrollment = (u.enrollment_no ?? '').toLowerCase();
        return fullName.includes(q) || email.includes(q) || enrollment.includes(q);
      }
      return true;
    });
  }, [users, statusFilter, searchQuery]);

  const activeCount = useMemo(() => users.filter((u) => u.status === 'active').length, [users]);
  const inactiveCount = useMemo(() => users.filter((u) => u.status !== 'active').length, [users]);

  return (
    <div className="org-panel-root">
      {/* ── Top Bar with Heading, Sub-heading & Add Gradient Button ── */}
      <div className="org-top-bar">
        <div className="org-top-text">
          <h1 className="org-page-title">{heading}</h1>
          <p className="org-page-desc">{pageSubtitle}</p>
        </div>

        <button
          type="button"
          className="org-add-btn"
          onClick={openAddDrawer}
          id="btnOpenAddUser"
        >
          <FiPlus className="org-add-btn-icon" />
          <span>{addBtnLabel}</span>
        </button>
      </div>

      {error && (
        <div className="mad-alert-error" role="alert">
          <span>{error}</span>
        </div>
      )}

      {/* ── Full Width Table Card ── */}
      <div className="org-table-card">
        {/* Card Header with Search & Status Filter Pills */}
        <div className="org-card-header">
          <div className="org-title-group">
            <div className="org-title-row">
              <h3 className="org-card-title">All {heading}</h3>
              <span className="org-count-badge">
                {filteredUsers.length} {filteredUsers.length === 1 ? 'Member' : 'Members'}
              </span>
            </div>
            <p className="org-card-subtitle">
              {cardSubtitle}
            </p>
          </div>

          <div className="org-controls-row">
            {/* Search Box */}
            <div className="org-search-box">
              <FiSearch className="org-search-icon" />
              <input
                type="text"
                className="org-search-input"
                placeholder={`Search ${heading.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label={`Search ${heading.toLowerCase()}`}
              />
              {searchQuery && (
                <button
                  type="button"
                  className="org-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <FiX />
                </button>
              )}
            </div>

            {/* Status Filter Pills */}
            <div className="org-filter-pills" role="tablist" aria-label="Status filters">
              <button
                type="button"
                className={`org-pill${statusFilter === 'all' ? ' is-active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All ({users.length})
              </button>
              <button
                type="button"
                className={`org-pill${statusFilter === 'active' ? ' is-active' : ''}`}
                onClick={() => setStatusFilter('active')}
              >
                Active ({activeCount})
              </button>
              <button
                type="button"
                className={`org-pill${statusFilter === 'inactive' ? ' is-active' : ''}`}
                onClick={() => setStatusFilter('inactive')}
              >
                Inactive ({inactiveCount})
              </button>
            </div>
          </div>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="org-empty-state">
            <FiUsers className="org-empty-icon" />
            <p className="org-empty-text">
              {searchQuery || statusFilter !== 'all'
                ? 'No members match the current filter.'
                : `No ${heading.toLowerCase()} found. Click "${addBtnLabel}" to add the first one.`}
            </p>
          </div>
        ) : (
          <div className="org-table-wrap">
            <table className="org-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  {lockedRole === 'student' && <th>Enrollment</th>}
                  {!lockedRole && <th>Roles</th>}
                  <th>Status</th>
                  <th className="org-th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const isActive = u.status === 'active';
                  const initials = getUserInitials(u.first_name, u.last_name, u.email);
                  const primaryRole = (u.roles as string[])[0] || 'student';
                  return (
                    <tr key={u.id}>
                      {/* Name Cell */}
                      <td>
                        <div className="org-cell-flex">
                          <div className="org-avatar-badge">{initials}</div>
                          <div className="org-name-meta">
                            <span className="org-name-text">
                              {u.first_name} {u.last_name}
                            </span>
                            {u.enrollment_no && lockedRole !== 'student' && (
                              <span className="org-sub-meta">
                                <span className="org-slug-tag">{u.enrollment_no}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email Cell */}
                      <td>
                        <span style={{ color: '#475569', fontSize: '0.875rem' }}>{u.email}</span>
                      </td>

                      {/* Enrollment Cell if Student */}
                      {lockedRole === 'student' && (
                        <td>
                          <span className="org-slug-tag">{u.enrollment_no || '—'}</span>
                        </td>
                      )}

                      {/* Role Cell if General */}
                      {!lockedRole && (
                        <td>
                          <span className={`org-role-badge org-role-badge--${primaryRole}`}>
                            {primaryRole.replace('_', ' ')}
                          </span>
                        </td>
                      )}

                      {/* Status Toggle Switch Cell (NO text badge) */}
                      <td>
                        <div className="org-status-cell">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isActive}
                            aria-label={isActive ? 'Deactivate account' : 'Activate account'}
                            className={`org-ios-switch${isActive ? ' is-active' : ''}`}
                            onClick={() => void setStatus(u.id, isActive ? 'inactive' : 'active')}
                          >
                            <span className="org-ios-thumb" />
                          </button>
                        </div>
                      </td>

                      {/* Actions Cell with Colorful Icons */}
                      <td>
                        <div
                          className="org-actions-cell"
                          style={{ justifyContent: 'flex-end', paddingRight: '8px' }}
                        >
                          <button
                            type="button"
                            className="org-icon-btn org-icon-btn--edit"
                            title={`Edit ${u.first_name}`}
                            aria-label={`Edit ${u.first_name}`}
                            onClick={() => startEdit(u)}
                          >
                            <FiEdit3 />
                          </button>
                          {canDeleteUsers && (
                            <button
                              type="button"
                              className="org-icon-btn org-icon-btn--delete"
                              title={`Delete ${u.first_name}`}
                              aria-label={`Delete ${u.first_name}`}
                              onClick={() => void removeUser(u.id, `${u.first_name} ${u.last_name}`)}
                            >
                              <FiTrash2 />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Side-Drawer Component (UNDER TOPNAV: top 72px) ── */}
      <div
        className={`org-drawer-overlay${isDrawerOpen ? ' is-open' : ''}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <aside
        className={`org-drawer${isDrawerOpen ? ' is-open' : ''}`}
        aria-label={editingId ? 'Edit user' : addBtnLabel}
      >
        <div className="org-drawer-header">
          <div className="org-drawer-title-wrap">
            <div className="org-drawer-badge-icon">
              <FiUser />
            </div>
            <div>
              <h3 className="org-drawer-title">{editingId ? 'Edit User' : addBtnLabel}</h3>
              <p className="org-drawer-desc">
                {editingId
                  ? 'Update user account information and roles.'
                  : 'Enter details to onboard a new member to the platform.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="org-drawer-close-btn"
            onClick={closeDrawer}
            aria-label="Close drawer"
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="org-drawer-body">
            <div className="org-grid-2">
              <div className="org-form-field">
                <label className="org-form-label">
                  First Name <span className="org-required-star">*</span>
                </label>
                <input
                  className="org-form-input"
                  placeholder="e.g. John"
                  {...register('firstName')}
                />
                <FormError message={errors.firstName?.message} />
              </div>

              <div className="org-form-field">
                <label className="org-form-label">
                  Last Name <span className="org-required-star">*</span>
                </label>
                <input
                  className="org-form-input"
                  placeholder="e.g. Doe"
                  {...register('lastName')}
                />
                <FormError message={errors.lastName?.message} />
              </div>
            </div>

            <div className="org-form-field">
              <label className="org-form-label">
                Email Address <span className="org-required-star">*</span>
              </label>
              <input
                type="email"
                className="org-form-input"
                placeholder="e.g. user@institution.edu"
                disabled={Boolean(editingId)}
                {...register('email')}
              />
              <FormError message={errors.email?.message} />
            </div>

            {!lockedRole ? (
              <div className="org-form-field">
                <label className="org-form-label">
                  Role <span className="org-required-star">*</span>
                </label>
                <select className="org-form-select" {...register('role')}>
                  <option value="student">Student</option>
                  <option value="teacher">Faculty / Teacher</option>
                  <option value="staff">Staff</option>
                  <option value="org_admin">Organization Administrator</option>
                </select>
                <FormError message={errors.role?.message} />
              </div>
            ) : (
              <input type="hidden" {...register('role')} />
            )}

            {showEnrollmentField && (
              <div className="org-form-field">
                <label className="org-form-label">
                  Enrollment Number
                </label>
                <input
                  className="org-form-input"
                  placeholder="ENR-2026-0001"
                  {...register('enrollmentNo')}
                />
                <span className="org-form-hint">Auto-generated. You can edit before saving.</span>
                <FormError message={errors.enrollmentNo?.message} />
              </div>
            )}

            {!editingId && (
              <div className="org-form-field">
                <label className="org-form-label">
                  Password <span className="org-required-star">*</span>
                </label>
                <Controller
                  name="password"
                  control={control}
                  defaultValue={DEFAULT_SUGGESTED_PASSWORD}
                  render={({ field }) => (
                    <PasswordInput
                      {...field}
                      className="org-form-input"
                      defaultVisible
                      hasError={Boolean(errors.password)}
                      autoComplete="new-password"
                    />
                  )}
                />
                <span className="org-form-hint">
                  Suggested: {DEFAULT_SUGGESTED_PASSWORD} — user can change after login.
                </span>
                <FormError message={errors.password?.message} />
              </div>
            )}
          </div>

          {/* Drawer Footer (Cancel & Submit 50-50 width) */}
          <div className="org-drawer-footer">
            <button type="button" className="org-drawer-cancel" onClick={closeDrawer}>
              Cancel
            </button>
            <button type="submit" className="org-drawer-submit">
              {editingId ? 'Save Changes' : 'Create & Email Login'}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

export function ReportsPanel() {
  const [tests, setTests] = useState<{ id: string; title: string; status?: string }[]>([]);
  const [selected, setSelected] = useState('');
  const [report, setReport] = useState<{
    test?: { title?: string; status?: string; total_marks?: number };
    stats?: {
      attempt_count?: number;
      avg_score?: number | string;
      max_score?: number | string;
      min_score?: number | string;
      pass_rate?: number;
      passed?: number;
    };
    results?: Record<string, unknown>[];
  } | null>(null);
  const [overview, setOverview] = useState<Record<string, unknown> | null>(null);
  const [analytics, setAnalytics] = useState<import('@/types/examination').OrgAnalytics | null>(null);
  const [testAnalytics, setTestAnalytics] = useState<{
    total_attempts?: number;
    completed?: number;
    avg_percentage?: number | string;
    highest_score?: number | string;
    lowest_score?: number | string;
    pass_rate?: number;
    score_distribution?: {
      below_40: number;
      from_40_60: number;
      from_60_80: number;
      above_80: number;
    };
  } | null>(null);
  const [questionAnalytics, setQuestionAnalytics] = useState<Awaited<
    ReturnType<typeof examinationService.getTestQuestionAnalytics>
  > | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const withLoader = useDashboardLoader();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      examinationService.listTests(1, 50).then((r) => setTests(r.data)),
      platformService.getOrgOverviewReport().then(setOverview),
      examinationService.getAnalyticsOverview().then(setAnalytics).catch(() => null),
    ])
      .catch((err) => setError(parseApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  useDashboardLoadingEffect(loading || reportLoading);

  const loadReport = async (testId: string) => {
    setSelected(testId);
    setError('');
    if (!testId) {
      setReport(null);
      setTestAnalytics(null);
      setQuestionAnalytics(null);
      return;
    }
    setReportLoading(true);
    try {
      const [data, ta, qa] = await Promise.all([
        platformService.getTestReport(testId),
        examinationService.getTestAnalytics(testId).catch(() => null),
        examinationService.getTestQuestionAnalytics(testId).catch(() => null),
      ]);
      setReport(data as typeof report);
      setTestAnalytics(ta?.stats ?? null);
      setQuestionAnalytics(qa);
    } catch (err) {
      setError(parseApiError(err));
      setReport(null);
      setTestAnalytics(null);
      setQuestionAnalytics(null);
    } finally {
      setReportLoading(false);
    }
  };

  const exportReport = async (format: 'csv' | 'pdf') => {
    if (!selected) return;
    await withLoader(async () => {
      try {
        if (format === 'pdf') {
          const data = report ?? ((await platformService.getTestReport(selected)) as unknown as NonNullable<typeof report>);
          if (!data) throw new Error('No report data');
          const { downloadTestReportReactPdf } = await import('@/pdf/downloadCertificate');
          await downloadTestReportReactPdf({
            testTitle: String(data.test?.title ?? selectedTitle ?? 'Test'),
            stats: {
              attempt_count: Number(data.stats?.attempt_count ?? data.results?.length ?? 0),
              avg_score: data.stats?.avg_score,
              max_score: data.stats?.max_score,
              min_score: data.stats?.min_score,
              pass_rate: data.stats?.pass_rate,
              passed: data.stats?.passed,
            },
            results: (data.results ?? []) as import('@/pdf/TestReportDocument').TestReportPdfRow[],
            filename: `test-report-${selected}.pdf`,
          });
          showSuccess('Exported', 'PDF download started.');
          return;
        }
        const blob = await platformService.exportTestReport(selected, 'csv');
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `test-report-${selected}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showSuccess('Exported', 'CSV download started.');
      } catch (err) {
        setError(parseApiError(err));
      }
    });
  };

  const recomputeRanks = async () => {
    if (!selected) return;
    await withLoader(async () => {
      try {
        const res = await platformService.computeRanks(selected);
        showSuccess('Ranks updated', `${res.count} result(s) ranked.`);
        await loadReport(selected);
      } catch (err) {
        showError('Rank update failed', parseApiError(err));
      }
    });
  };

  const issueCert = async (resultId: string) => {
    await withLoader(async () => {
      try {
        const cert = await examinationService.issueCertificate(resultId);
        showSuccess('Certificate issued', cert.certificate_no);
        const { downloadCertificateReactPdf } = await import('@/pdf/downloadCertificate');
        await downloadCertificateReactPdf(cert);
        if (selected) await loadReport(selected);
      } catch (err) {
        showError('Could not issue', parseApiError(err));
      }
    });
  };

  const overviewCards: {
    key: string;
    label: string;
    hint: string;
    prefix?: string;
    suffix?: string;
  }[] = [
      { key: 'users', label: 'Users', hint: 'Active accounts' },
      { key: 'tests', label: 'Tests', hint: 'Created exams' },
      { key: 'attempts', label: 'Attempts', hint: 'Student attempts' },
      { key: 'assignments', label: 'Assignments', hint: 'Student–test links' },
      { key: 'certificates', label: 'Certificates', hint: 'Issued' },
      { key: 'pass_rate', label: 'Pass rate', hint: 'Org-wide', suffix: '%' },
      { key: 'revenue', label: 'Revenue', hint: 'Completed payments', prefix: '₹' },
    ];

  const results = report?.results ?? [];
  const stats = report?.stats;
  const selectedTitle = tests.find((t) => t.id === selected)?.title ?? report?.test?.title;
  const dist = testAnalytics?.score_distribution ?? analytics?.score_distribution;
  const distTitle = selected && testAnalytics?.score_distribution ? 'Test score distribution' : 'Org score distribution';

  return (
    <>
      <DashboardPageHeader
        badge="Insights"
        title="Reports & Analytics"
        subtitle="Organization overview, score distribution, per-test ranks, CSV/PDF export, and certificates."
      />
      <div className="dashboard__content__wraper">
        {error && <EdtpAlert type="error">{error}</EdtpAlert>}

        <div className="sca-report-overview">
          {overviewCards.map((card) => (
            <div key={card.key} className="sca-report-stat">
              <span className="sca-report-stat__label">{card.label}</span>
              <strong className="sca-report-stat__value">
                {card.prefix ?? ''}
                {overview ? String(overview[card.key] ?? '0') : '—'}
                {card.suffix ?? ''}
              </strong>
              <span className="sca-report-stat__hint">{card.hint}</span>
            </div>
          ))}
        </div>

        {dist && (
          <section className="edtp-form-card sca-report-panel sp_bottom_20">
            <h5 className="mb-2">{distTitle}</h5>
            {selected && testAnalytics && (
              <p className="text-muted sp_bottom_15" style={{ fontSize: '0.8125rem' }}>
                Attempts {testAnalytics.total_attempts ?? 0} · Completed {testAnalytics.completed ?? 0} · Avg{' '}
                {Number(testAnalytics.avg_percentage ?? 0).toFixed(1)}% · Pass rate{' '}
                {Number(testAnalytics.pass_rate ?? 0).toFixed(1)}%
              </p>
            )}
            <div className="sca-score-bars">
              {[
                { label: '< 40%', value: Number(dist.below_40 ?? 0) },
                { label: '40–60%', value: Number(dist.from_40_60 ?? 0) },
                { label: '60–80%', value: Number(dist.from_60_80 ?? 0) },
                { label: '80%+', value: Number(dist.above_80 ?? 0) },
              ].map((b) => {
                const total =
                  Number(dist.below_40 ?? 0) +
                  Number(dist.from_40_60 ?? 0) +
                  Number(dist.from_60_80 ?? 0) +
                  Number(dist.above_80 ?? 0);
                const pct = total > 0 ? Math.round((b.value / total) * 100) : 0;
                return (
                  <div key={b.label} className="sca-score-bars__row">
                    <span className="sca-score-bars__label">{b.label}</span>
                    <div className="sca-score-bars__track">
                      <div className="sca-score-bars__fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="sca-score-bars__value">
                      {b.value} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {selected && questionAnalytics ? (
          <section className="edtp-form-card sca-report-panel sp_bottom_20">
            <h5 className="mb-2">Question analytics</h5>
            <p className="text-muted sp_bottom_15" style={{ fontSize: '0.8125rem' }}>
              Correct rate, time spent, the most common wrong answer, and which items need more teaching.
            </p>
            <ReportInsights testId={selected} />
            {questionAnalytics.hard_questions.length > 0 ? (
              <div className="sp_bottom_15">
                <strong>Hard questions</strong>
                <ul className="mb-0">
                  {questionAnalytics.hard_questions.map((q) => (
                    <li key={q.question_id}>
                      {q.text || q.question_id.slice(0, 8)} —{' '}
                      {q.correct_pct != null ? `${q.correct_pct}% correct` : 'n/a'} · avg{' '}
                      {q.avg_time_sec}s · n={q.answered_count}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {questionAnalytics.questions.length > 0 ? (
              <div className="sp_bottom_20">
                <h6 className="mb-3">Answer option selection</h6>
                <p className="text-muted" style={{ fontSize: '0.8125rem' }}>
                  Compare how many students selected each answer option. Wrong options
                  can help identify confusing questions or distractors.
                </p>

                {questionAnalytics.questions.map((q) => {
                  const chartData = q.distractors.map((d, index) => ({
                    option: `Option ${index + 1}`,
                    selected: d.selected_count,
                    percentage: d.selected_pct,
                    correct: d.is_correct,
                  }));

                  return (
                    <div key={q.question_id} className="sp_bottom_20">
                      <strong>
                        {q.text || q.question_id.slice(0, 8)}
                      </strong>

                      {chartData.length > 0 ? (
                        <div style={{ width: '100%', height: 260, marginTop: 12 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={chartData}
                              layout="vertical"
                              margin={{ top: 8, right: 24, left: 16, bottom: 8 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" allowDecimals={false} />
                              <YAxis
                                type="category"
                                dataKey="option"
                                width={90}
                              />
                              <Tooltip
                                formatter={(value, _name, item) => [
                                  `${value} students (${item.payload.percentage}%)`,
                                  item.payload.correct ? 'Correct option' : 'Wrong option',
                                ]}
                              />
                              <Bar
                                dataKey="selected"
                                name="Students"
                                fill="#6366f1"
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <p className="text-muted mb-0">
                          No answer-option data available for this question.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : null}
            <div className="dashboard__table table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Type</th>
                    <th>Answered</th>
                    <th>Correct</th>
                    <th>Correct %</th>
                    <th>Avg time</th>
                    <th>Most common wrong answer</th>
                    <th>Teaching note</th>
                  </tr>
                </thead>
                <tbody>
                  {questionAnalytics.questions.map((q) => {
                    const wrong = [...q.distractors]
                      .filter((d) => !d.is_correct)
                      .sort((a, b) => b.selected_count - a.selected_count)[0];
                    const wrongText =
                      wrong && typeof wrong.content === 'object' && wrong.content && 'text' in wrong.content
                        ? String((wrong.content as { text?: string }).text ?? '')
                        : '';
                    return (
                      <tr key={q.question_id}>
                        <td>{q.text || q.question_id.slice(0, 8)}</td>
                        <td>{q.type}</td>
                        <td>{q.answered_count}</td>
                        <td>{q.correct_count}</td>
                        <td>{q.correct_pct != null ? `${q.correct_pct}%` : '—'}</td>
                        <td>{q.avg_time_sec}s</td>
                        <td>
                          {wrong
                            ? `${wrongText || 'Option'} · ${wrong.selected_pct}% (${wrong.selected_count})`
                            : '—'}
                        </td>
                        <td>
                          {q.correct_pct != null && q.correct_pct < 40
                            ? 'Needs more teaching'
                            : q.correct_pct != null && q.correct_pct >= 80
                              ? 'Well understood'
                              : '—'}
                        </td>
                      </tr>
                    );
                  })}
                  {questionAnalytics.questions.length === 0 ? (
                    <tr>
                      <td colSpan={8}>No graded answers yet for this test.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        <section className="edtp-form-card sca-report-panel">
          <div className="sca-report-panel__head">
            <div>
              <h5 className="mb-1">Test report</h5>
              <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
                Choose a test to view ranks, export CSV/PDF, and issue certificates for passers.
              </p>
            </div>
            {selected && (
              <div className="d-flex flex-wrap gap-2">
                <EdtpBtn variant="ghost" onClick={() => void recomputeRanks()}>
                  Recompute ranks
                </EdtpBtn>
                <EdtpBtn variant="secondary" onClick={() => void exportReport('csv')} disabled={results.length === 0}>
                  Export CSV
                </EdtpBtn>
                <EdtpBtn variant="primary" onClick={() => void exportReport('pdf')} disabled={results.length === 0}>
                  Export PDF
                </EdtpBtn>
              </div>
            )}
          </div>

          <EdtpField label="Select test">
            <EdtpSelect value={selected} onChange={(e) => void loadReport(e.target.value)}>
              <option value="">Select test for detailed report</option>
              {tests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}{t.status ? ` (${t.status})` : ''}
                </option>
              ))}
            </EdtpSelect>
          </EdtpField>

          {!selected && (
            <EdtpEmpty>Select a test above to load student results and rankings.</EdtpEmpty>
          )}

          {selected && report && (
            <>
              <div className="sca-report-meta">
                <div>
                  <span className="sca-report-meta__label">Test</span>
                  <strong>{selectedTitle}</strong>
                </div>
                <div>
                  <span className="sca-report-meta__label">Attempts</span>
                  <strong>{stats?.attempt_count ?? results.length}</strong>
                </div>
                <div>
                  <span className="sca-report-meta__label">Avg score</span>
                  <strong>{Number(stats?.avg_score ?? 0).toFixed(1)}</strong>
                </div>
                <div>
                  <span className="sca-report-meta__label">Pass rate</span>
                  <strong>{Number(stats?.pass_rate ?? 0).toFixed(1)}%</strong>
                </div>
              </div>

              {results.length === 0 ? (
                <EdtpEmpty>
                  No submitted results for this test yet. Assign students and wait for attempts.
                </EdtpEmpty>
              ) : (
                <div className="dashboard__table table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Student</th>
                        <th>Email</th>
                        <th>Score</th>
                        <th>%</th>
                        <th>Certificate</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, i) => (
                        <tr key={(r.result_id as string) ?? (r.id as string) ?? i}>
                          <td>
                            <span className="sca-report-rank">{(r.rank as number) ?? i + 1}</span>
                          </td>
                          <td>
                            {r.first_name as string} {r.last_name as string}
                          </td>
                          <td>{(r.email as string) ?? '—'}</td>
                          <td>
                            {r.total_score as number}/{r.max_score as number}
                          </td>
                          <td>{Number(r.percentage).toFixed(1)}%</td>
                          <td>
                            {(r.certificate_no as string) || (
                              <EdtpBtn
                                variant="ghost"
                                onClick={() => void issueCert(String(r.result_id ?? r.id))}
                              >
                                Issue
                              </EdtpBtn>
                            )}
                          </td>
                          <td>
                            {r.attempt_id ? (
                              <Link
                                to={`/dashboard/exam-result/${r.attempt_id as string}`}
                                className="edtp-btn edtp-btn--secondary edtp-btn--sm"
                              >
                                View
                              </Link>
                            ) : (
                              '—'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </>
  );
}

export function AuditLogPanel() {
  const [logs, setLogs] = useState<Awaited<ReturnType<typeof platformService.listAuditLogs>>['data']>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState<'all' | 'create' | 'update' | 'delete'>('all');
  const withLoader = useDashboardLoader();

  const loadLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const r = await platformService.listAuditLogs(1, 100);
      setLogs(r.data);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLogs();
  }, []);

  useDashboardLoadingEffect(loading);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const act = (l.action || '').toLowerCase();
      if (actionFilter === 'create' && !act.includes('create') && !act.includes('add')) return false;
      if (actionFilter === 'update' && !act.includes('update') && !act.includes('edit')) return false;
      if (actionFilter === 'delete' && !act.includes('delete') && !act.includes('remove')) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const actionMatch = act.includes(q);
        const resourceMatch = (l.resource || '').toLowerCase().includes(q);
        const userMatch = (l.user_email || '').toLowerCase().includes(q);
        return actionMatch || resourceMatch || userMatch;
      }
      return true;
    });
  }, [logs, actionFilter, searchQuery]);

  return (
    <div className="org-panel-root">
      {/* ── Top Bar ── */}
      <div className="org-top-bar">
        <div className="org-top-text">
          <h1 className="org-page-title">Audit Logs</h1>
          <p className="org-page-desc">
            Track administrative actions, security events, authentication attempts, and data modifications.
          </p>
        </div>

        <button
          type="button"
          className="org-add-btn"
          onClick={() => void withLoader(loadLogs)}
          id="btnRefreshAuditLogs"
        >
          <FiRefreshCw className="org-add-btn-icon" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {error && (
        <div className="mad-alert-error" role="alert">
          <span>{error}</span>
        </div>
      )}

      {/* ── Full Width Table Card ── */}
      <div className="org-table-card">
        <div className="org-card-header">
          <div className="org-title-group">
            <div className="org-title-row">
              <h3 className="org-card-title">System Activity Logs</h3>
              <span className="org-count-badge">
                {filteredLogs.length} {filteredLogs.length === 1 ? 'Event' : 'Events'}
              </span>
            </div>
            <p className="org-card-subtitle">
              Comprehensive audit trail of platform events and administrator operations
            </p>
          </div>

          <div className="org-controls-row">
            {/* Search Box */}
            <div className="org-search-box">
              <FiSearch className="org-search-icon" />
              <input
                type="text"
                className="org-search-input"
                placeholder="Search action, resource, user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search audit logs"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="org-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <FiX />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="org-filter-pills" role="tablist" aria-label="Action filters">
              <button
                type="button"
                className={`org-pill${actionFilter === 'all' ? ' is-active' : ''}`}
                onClick={() => setActionFilter('all')}
              >
                All ({logs.length})
              </button>
              <button
                type="button"
                className={`org-pill${actionFilter === 'create' ? ' is-active' : ''}`}
                onClick={() => setActionFilter('create')}
              >
                Create
              </button>
              <button
                type="button"
                className={`org-pill${actionFilter === 'update' ? ' is-active' : ''}`}
                onClick={() => setActionFilter('update')}
              >
                Update
              </button>
              <button
                type="button"
                className={`org-pill${actionFilter === 'delete' ? ' is-active' : ''}`}
                onClick={() => setActionFilter('delete')}
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {filteredLogs.length === 0 && !loading ? (
          <div className="org-empty-state">
            <FiActivity className="org-empty-icon" />
            <p className="org-empty-text">
              {searchQuery || actionFilter !== 'all'
                ? 'No audit logs match the current filter.'
                : 'No audit logs recorded yet.'}
            </p>
          </div>
        ) : (
          <div className="org-table-wrap">
            <table className="org-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>User / Actor</th>
                  <th style={{ textAlign: 'right', paddingRight: '24px' }}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((l) => {
                  const act = (l.action || '').toLowerCase();
                  const isDelete = act.includes('delete') || act.includes('remove');
                  const isCreate = act.includes('create') || act.includes('add');
                  const isUpdate = act.includes('update') || act.includes('edit');

                  return (
                    <tr key={l.id}>
                      {/* Action Cell */}
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: isDelete ? '#fef2f2' : isCreate ? '#ecfdf5' : isUpdate ? '#eff6ff' : '#f1f5f9',
                            color: isDelete ? '#dc2626' : isCreate ? '#059669' : isUpdate ? '#2563eb' : '#475569',
                            border: `1px solid ${isDelete ? '#fecaca' : isCreate ? '#a7f3d0' : isUpdate ? '#bfdbfe' : '#e2e8f0'}`,
                            display: 'inline-block',
                          }}
                        >
                          {l.action}
                        </span>
                      </td>

                      {/* Resource Cell */}
                      <td>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: '#334155',
                            background: '#f8fafc',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          {l.resource}
                        </span>
                      </td>

                      {/* User Cell */}
                      <td>
                        <div className="org-cell-flex">
                          <div className="org-avatar-badge" style={{ width: 28, height: 28, fontSize: '0.72rem' }}>
                            {l.user_email ? l.user_email.slice(0, 2).toUpperCase() : 'SY'}
                          </div>
                          <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#1e293b' }}>
                            {l.user_email ?? 'System'}
                          </span>
                        </div>
                      </td>

                      {/* Timestamp Cell */}
                      <td style={{ textAlign: 'right', paddingRight: '24px' }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {formatDateTime(l.created_at)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDeviceInfo(info: unknown) {
  if (!info) return { platform: 'Desktop Device', browser: 'Web Browser' };
  let parsed = info;
  if (typeof info === 'string') {
    try {
      parsed = JSON.parse(info);
    } catch {
      return { platform: info, browser: 'Browser' };
    }
  }
  if (typeof parsed === 'object' && parsed !== null) {
    const obj = parsed as Record<string, string>;
    const platform = obj.platform || 'Windows';
    let browser = 'Chrome';
    const ua = obj.userAgent || '';
    if (ua.includes('Edg/')) browser = 'Edge';
    else if (ua.includes('Chrome/')) browser = 'Chrome';
    else if (ua.includes('Firefox/')) browser = 'Firefox';
    else if (ua.includes('Safari/') && !ua.includes('Chrome')) browser = 'Safari';
    return { platform, browser };
  }
  return { platform: 'Desktop Device', browser: 'Web Browser' };
}

export function SessionsSecurityPanel() {
  const { refreshUser } = useAuth();
  const [sessions, setSessions] = useState<Record<string, unknown>[]>([]);
  const [mfaInfo, setMfaInfo] = useState('');
  const [copiedMfaCode, setCopiedMfaCode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'revoked'>('all');
  const withLoader = useDashboardLoader();

  const load = async () => {
    setLoading(true);
    try {
      const data = await platformService.listSessions();
      setSessions(data);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  useDashboardLoadingEffect(loading);

  const revoke = async (id: string) => {
    const ok = await confirmDelete({
      title: 'Revoke this session?',
      text: 'The device will be logged out immediately and required to sign in again.',
      confirmText: 'Yes, revoke session',
    });
    if (!ok) return;

    await withLoader(async () => {
      try {
        await platformService.revokeSession(id);
        showSuccess('Revoked', 'Session terminated successfully.');
        await load();
      } catch (err) {
        setError(parseApiError(err));
      }
    });
  };

  const toggleMfa = async (enable: boolean) => {
    await withLoader(async () => {
      try {
        if (enable) {
          const result = await platformService.enableMfa();
          if (result.devBackupCode) {
            setMfaInfo(`MFA enabled. Backup code (dev): ${result.devBackupCode}`);
          } else {
            setMfaInfo('MFA enabled.');
          }
        } else {
          await platformService.disableMfa();
          setMfaInfo('MFA disabled.');
        }
        await refreshUser();
      } catch (err) {
        setError(parseApiError(err));
      }
    });
  };

  const activeCount = useMemo(() => sessions.filter((s) => s.is_active).length, [sessions]);
  const revokedCount = useMemo(() => sessions.filter((s) => !s.is_active).length, [sessions]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      if (statusFilter === 'active' && !s.is_active) return false;
      if (statusFilter === 'revoked' && s.is_active) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const ip = String(s.ip_address ?? '').toLowerCase();
        const dev = JSON.stringify(s.device_info ?? '').toLowerCase();
        return ip.includes(q) || dev.includes(q);
      }
      return true;
    });
  }, [sessions, statusFilter, searchQuery]);

  return (
    <div className="org-panel-root">
      {/* ── Top Stat Cards (Matching Image 2 Reference) ── */}
      <div className="org-stats-row">
        {/* Left Info Card */}
        <div className="org-info-card">
          <div className="org-info-card-icon">
            <FiShield />
          </div>
          <div className="org-info-card-text">
            <h3 className="org-info-card-title">Sessions & Security</h3>
            <p className="org-info-card-desc">
              Manage authorized devices, active browser sessions, and Multi-Factor Authentication.
            </p>
          </div>
        </div>

        {/* Stat Card 1: Active Sessions */}
        <div className="org-stat-card">
          <span className="org-stat-card-val org-stat-card-val--success">{activeCount}</span>
          <span className="org-stat-card-lbl">Active Sessions</span>
        </div>

        {/* Stat Card 2: Total Sessions */}
        <div className="org-stat-card">
          <span className="org-stat-card-val">{sessions.length}</span>
          <span className="org-stat-card-lbl">Total Recorded</span>
        </div>
      </div>

      {error && (
        <div className="mad-alert-error" role="alert">
          <span>{error}</span>
        </div>
      )}

      {mfaInfo && (
        <div
          style={{
            background: mfaInfo.toLowerCase().includes('disabled')
              ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)'
              : 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
            border: `1.5px solid ${
              mfaInfo.toLowerCase().includes('disabled') ? '#fcd34d' : '#6ee7b7'
            }`,
            borderRadius: '14px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 4px 14px rgba(16, 185, 129, 0.15)',
          }}
          role="alert"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: mfaInfo.toLowerCase().includes('disabled') ? '#fef3c7' : '#d1fae5',
                color: mfaInfo.toLowerCase().includes('disabled') ? '#d97706' : '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.35rem',
                flexShrink: 0,
              }}
            >
              {mfaInfo.toLowerCase().includes('disabled') ? <FiAlertTriangle /> : <FiCheckCircle />}
            </div>
            <div>
              <span
                style={{
                  display: 'block',
                  fontWeight: 800,
                  fontSize: '0.94rem',
                  color: mfaInfo.toLowerCase().includes('disabled') ? '#92400e' : '#065f46',
                }}
              >
                {mfaInfo.toLowerCase().includes('disabled')
                  ? 'Two-Factor Authentication Disabled'
                  : 'Two-Factor Authentication (2FA) Activated!'}
              </span>
              <div
                style={{
                  fontSize: '0.84rem',
                  color: mfaInfo.toLowerCase().includes('disabled') ? '#b45309' : '#047857',
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginTop: '4px',
                }}
              >
                {mfaInfo.includes('Backup code') ? (
                  <>
                    <span style={{ fontWeight: 600 }}>Emergency Recovery Backup Code (Dev):</span>
                    <strong
                      style={{
                        fontFamily: 'monospace',
                        fontSize: '1.05rem',
                        letterSpacing: '0.08em',
                        background: '#ffffff',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        border: '2px dashed #059669',
                        color: '#065f46',
                        boxShadow: '0 2px 6px rgba(5, 150, 105, 0.15)',
                      }}
                    >
                      {mfaInfo.replace(/.*Backup code \(dev\):\s*/, '')}
                    </strong>
                    <button
                      type="button"
                      onClick={() => {
                        const code = mfaInfo.replace(/.*Backup code \(dev\):\s*/, '').trim();
                        void navigator.clipboard.writeText(code);
                        setCopiedMfaCode(true);
                        setTimeout(() => setCopiedMfaCode(false), 2000);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: copiedMfaCode ? '#059669' : '#ffffff',
                        border: '1px solid #059669',
                        color: copiedMfaCode ? '#ffffff' : '#059669',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      title="Copy backup code"
                    >
                      {copiedMfaCode ? <FiCheck /> : <FiCopy />}
                      <span>{copiedMfaCode ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </>
                ) : (
                  <span style={{ fontWeight: 600 }}>{mfaInfo}</span>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMfaInfo('')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: mfaInfo.toLowerCase().includes('disabled') ? '#92400e' : '#065f46',
              fontSize: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              padding: '6px',
            }}
            aria-label="Dismiss message"
          >
            <FiX />
          </button>
        </div>
      )}

      {/* MFA Quick Controls Card */}
      <div
        style={{
          background: 'var(--db-card, #ffffff)',
          border: '1px solid var(--db-border, #e2e8f0)',
          borderRadius: '16px',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: '#eff6ff',
              color: '#225ce5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.15rem',
            }}
          >
            <FiShield />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
              Two-Factor Authentication (2FA / MFA)
            </h4>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b' }}>
              Strengthen administrator login security with multi-factor verification tokens.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="org-add-btn"
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            onClick={() => void toggleMfa(true)}
          >
            Enable MFA
          </button>
          <button
            type="button"
            className="org-drawer-cancel"
            style={{ width: 'auto', padding: '6px 14px', fontSize: '0.8rem' }}
            onClick={() => void toggleMfa(false)}
          >
            Disable MFA
          </button>
        </div>
      </div>

      {/* ── Main Full-Width Table Card ── */}
      <div className="org-table-card">
        {/* Card Header with Search & Status Filter Pills */}
        <div className="org-card-header">
          <div className="org-title-group">
            <div className="org-title-row">
              <h3 className="org-card-title">Authorized Device Sessions</h3>
              <span className="org-count-badge">
                {filteredSessions.length} {filteredSessions.length === 1 ? 'Device' : 'Devices'}
              </span>
            </div>
            <p className="org-card-subtitle">
              Review authorized IP addresses, client browser applications, and sign-in activities
            </p>
          </div>

          <div className="org-controls-row">
            {/* Search Box */}
            <div className="org-search-box">
              <FiSearch className="org-search-icon" />
              <input
                type="text"
                className="org-search-input"
                placeholder="Search IP, device, browser..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search sessions"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="org-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <FiX />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="org-filter-pills" role="tablist" aria-label="Status filters">
              <button
                type="button"
                className={`org-pill${statusFilter === 'all' ? ' is-active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All ({sessions.length})
              </button>
              <button
                type="button"
                className={`org-pill${statusFilter === 'active' ? ' is-active' : ''}`}
                onClick={() => setStatusFilter('active')}
              >
                Active ({activeCount})
              </button>
              <button
                type="button"
                className={`org-pill${statusFilter === 'revoked' ? ' is-active' : ''}`}
                onClick={() => setStatusFilter('revoked')}
              >
                Revoked ({revokedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        {filteredSessions.length === 0 && !loading ? (
          <div className="org-empty-state">
            <FiSmartphone className="org-empty-icon" />
            <p className="org-empty-text">
              {searchQuery || statusFilter !== 'all'
                ? 'No device sessions match the current filter.'
                : 'No login sessions found.'}
            </p>
          </div>
        ) : (
          <div className="org-table-wrap">
            <table className="org-table">
              <thead>
                <tr>
                  <th>Device / Browser</th>
                  <th>IP Address</th>
                  <th>Signed In</th>
                  <th>Status</th>
                  <th className="org-th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((s) => {
                  const dev = formatDeviceInfo(s.device_info);
                  const isActive = Boolean(s.is_active);

                  return (
                    <tr key={s.id as string}>
                      {/* Device Cell */}
                      <td>
                        <div className="org-cell-flex">
                          <div
                            className="org-avatar-badge"
                            style={{
                              background: isActive ? '#eff6ff' : '#f1f5f9',
                              color: isActive ? '#2563eb' : '#64748b',
                            }}
                          >
                            <FiGlobe />
                          </div>
                          <div className="org-name-meta">
                            <span className="org-name-text">
                              {dev.platform} · {dev.browser}
                            </span>
                            <span className="org-sub-meta">Desktop Browser Session</span>
                          </div>
                        </div>
                      </td>

                      {/* IP Address Cell */}
                      <td>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: '#334155',
                            background: '#f8fafc',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          {String(s.ip_address ?? '—')}
                        </span>
                      </td>

                      {/* Created Date Cell */}
                      <td>
                        <span style={{ fontSize: '0.825rem', color: '#64748b' }}>
                          {formatDateTime(s.created_at as string)}
                        </span>
                      </td>

                      {/* Status Cell */}
                      <td>
                        <span
                          style={{
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            padding: '3px 10px',
                            borderRadius: '8px',
                            background: isActive ? '#ecfdf5' : '#f1f5f9',
                            color: isActive ? '#059669' : '#64748b',
                            border: `1px solid ${isActive ? '#a7f3d0' : '#e2e8f0'}`,
                            display: 'inline-block',
                          }}
                        >
                          {isActive ? 'Active' : 'Revoked'}
                        </span>
                      </td>

                      {/* Actions Cell */}
                      <td>
                        <div
                          className="org-actions-cell"
                          style={{ justifyContent: 'flex-end', paddingRight: '8px' }}
                        >
                          {isActive ? (
                            <button
                              type="button"
                              className="org-drawer-cancel"
                              style={{
                                width: 'auto',
                                padding: '4px 10px',
                                fontSize: '0.76rem',
                                color: '#dc2626',
                                borderColor: '#fecaca',
                                background: '#fef2f2',
                              }}
                              onClick={() => void revoke(s.id as string)}
                            >
                              Revoke
                            </button>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Expired</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export function OrgStructurePanel() {
  const { branches, loading: orgLoading } = useOrganization();
  const [branchId, setBranchId] = useState('');
  const [departments, setDepartments] = useState<Awaited<ReturnType<typeof platformService.listDepartments>>['data']>([]);
  const [deptName, setDeptName] = useState('');
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [deptLoading, setDeptLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const withLoader = useDashboardLoader();

  const reloadDepartments = async (id = branchId) => {
    if (!id) return;
    const r = await platformService.listDepartments(id);
    setDepartments(r.data);
  };

  useEffect(() => {
    if (branches[0] && !branchId) setBranchId(branches[0].id);
  }, [branches, branchId]);

  useEffect(() => {
    if (!branchId) return;
    setDeptLoading(true);
    platformService.listDepartments(branchId)
      .then((r) => setDepartments(r.data))
      .catch((err) => setError(parseApiError(err)))
      .finally(() => setDeptLoading(false));
  }, [branchId]);

  useDashboardLoadingEffect(orgLoading || deptLoading);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

  const openAddDrawer = () => {
    setEditingDeptId(null);
    setDeptName('');
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingDeptId(null);
    setDeptName('');
  };

  const startEditDept = (d: { id: string; name: string }) => {
    setEditingDeptId(d.id);
    setDeptName(d.name);
    setIsDrawerOpen(true);
  };

  const saveDept = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!branchId || !deptName.trim()) return;
    setError('');
    await withLoader(async () => {
      try {
        if (editingDeptId) {
          await platformService.updateDepartment(editingDeptId, { name: deptName.trim() });
          showSuccess('Updated', 'Department updated successfully.');
        } else {
          await platformService.createDepartment(branchId, { name: deptName.trim() });
          showSuccess('Created', 'Department added successfully.');
        }
        closeDrawer();
        await reloadDepartments();
      } catch (err) {
        setError(parseApiError(err));
      }
    });
  };

  const deleteDept = async (id: string, name: string) => {
    const ok = await confirmDelete({
      title: 'Delete department?',
      text: `“${name}” will be permanently deleted. This cannot be undone.`,
      confirmText: 'Yes, delete it!',
    });
    if (!ok) return;
    setError('');
    try {
      await withLoader(async () => {
        await platformService.deleteDepartment(id);
        if (editingDeptId === id) closeDrawer();
        await reloadDepartments();
      });
      showSuccess('Deleted!', 'Department has been deleted.');
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const selectedBranchName = branches.find((b) => b.id === branchId)?.name || 'Main Campus';

  const filteredDepts = useMemo(() => {
    return departments.filter((d) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = d.name.toLowerCase().includes(q);
        const matchesCode = d.code ? d.code.toLowerCase().includes(q) : false;
        return matchesName || matchesCode;
      }
      return true;
    });
  }, [departments, searchQuery]);

  return (
    <div className="org-panel-root">
      {/* ── Top Bar ── */}
      <div className="org-top-bar">
        <div className="org-top-text">
          <h1 className="org-page-title">Departments</h1>
          <p className="org-page-desc">
            Organize institutional branches, academic departments, division faculties, and curriculum structures.
          </p>
        </div>

        <button
          type="button"
          className="org-add-btn"
          onClick={openAddDrawer}
          id="btnOpenAddDept"
        >
          <FiPlus className="org-add-btn-icon" />
          <span>Add Department</span>
        </button>
      </div>

      {error && (
        <div className="mad-alert-error" role="alert">
          <span>{error}</span>
        </div>
      )}

      {/* ── Full Width Table Card ── */}
      <div className="org-table-card">
        <div className="org-card-header">
          <div className="org-title-group">
            <div className="org-title-row">
              <h3 className="org-card-title">All Departments</h3>
              <span className="org-count-badge">
                {filteredDepts.length} {filteredDepts.length === 1 ? 'Department' : 'Departments'}
              </span>
            </div>
            <p className="org-card-subtitle">
              Campus: <strong>{selectedBranchName}</strong> · Manage division curriculums and subject faculties
            </p>
          </div>

          <div className="org-controls-row">
            {/* Branch Switcher if multiple branches */}
            {branches.length > 1 && (
              <div style={{ minWidth: 160 }}>
                <select
                  className="org-form-select"
                  style={{ padding: '6px 12px', fontSize: '0.8125rem' }}
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  aria-label="Select Branch"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Search Box */}
            <div className="org-search-box">
              <FiSearch className="org-search-icon" />
              <input
                type="text"
                className="org-search-input"
                placeholder="Search departments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search departments"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="org-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>
        </div>

        {filteredDepts.length === 0 ? (
          <div className="org-empty-state">
            <HiOfficeBuilding className="org-empty-icon" />
            <p className="org-empty-text">
              {searchQuery
                ? 'No departments match the search query.'
                : 'No departments added under this branch yet. Click "Add Department" to create one.'}
            </p>
          </div>
        ) : (
          <div className="org-table-wrap">
            <table className="org-table">
              <thead>
                <tr>
                  <th>Department Name</th>
                  <th>Branch / Campus</th>
                  <th className="org-th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDepts.map((d) => (
                  <tr key={d.id}>
                    {/* Name Cell */}
                    <td>
                      <div className="org-cell-flex">
                        <div className="org-avatar-badge" style={{ background: '#eff6ff', color: '#2563eb' }}>
                          <FiLayers />
                        </div>
                        <div className="org-name-meta">
                          <span className="org-name-text">{d.name}</span>
                          {d.code && (
                            <span className="org-sub-meta">
                              <span className="org-slug-tag">{d.code}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Branch Cell */}
                    <td>
                      <span className="org-role-badge org-role-badge--student">
                        {selectedBranchName}
                      </span>
                    </td>

                    {/* Actions Cell */}
                    <td>
                      <div
                        className="org-actions-cell"
                        style={{ justifyContent: 'flex-end', paddingRight: '8px' }}
                      >
                        <button
                          type="button"
                          className="org-icon-btn org-icon-btn--edit"
                          title={`Edit ${d.name}`}
                          aria-label={`Edit ${d.name}`}
                          onClick={() => startEditDept(d)}
                        >
                          <FiEdit3 />
                        </button>
                        <button
                          type="button"
                          className="org-icon-btn org-icon-btn--delete"
                          title={`Delete ${d.name}`}
                          aria-label={`Delete ${d.name}`}
                          onClick={() => void deleteDept(d.id, d.name)}
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Side-Drawer Component (UNDER TOPNAV: top 72px) ── */}
      <div
        className={`org-drawer-overlay${isDrawerOpen ? ' is-open' : ''}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <aside
        className={`org-drawer${isDrawerOpen ? ' is-open' : ''}`}
        aria-label={editingDeptId ? 'Edit Department' : 'Add Department'}
      >
        <div className="org-drawer-header">
          <div className="org-drawer-title-wrap">
            <div className="org-drawer-badge-icon">
              <HiOfficeBuilding />
            </div>
            <div>
              <h3 className="org-drawer-title">
                {editingDeptId ? 'Edit Department' : 'Add Department'}
              </h3>
              <p className="org-drawer-desc">
                {editingDeptId
                  ? 'Update academic division details and curriculum assignment.'
                  : 'Add a new department to organize courses and faculties.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="org-drawer-close-btn"
            onClick={closeDrawer}
            aria-label="Close drawer"
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={(e) => void saveDept(e)} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="org-drawer-body">
            <div className="org-form-field">
              <label className="org-form-label">
                Branch / Campus <span className="org-required-star">*</span>
              </label>
              <select
                className="org-form-select"
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <span className="org-form-hint">Selected campus branch for this department.</span>
            </div>

            <div className="org-form-field">
              <label className="org-form-label">
                Department Name <span className="org-required-star">*</span>
              </label>
              <input
                className="org-form-input"
                placeholder="e.g. Computer Science & Engineering"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
                autoFocus
              />
              <span className="org-form-hint">E.g. Electrical Engineering, Business Management, Mathematics.</span>
            </div>
          </div>

          {/* Drawer Footer (Cancel & Submit 50-50 width) */}
          <div className="org-drawer-footer">
            <button type="button" className="org-drawer-cancel" onClick={closeDrawer}>
              Cancel
            </button>
            <button type="submit" className="org-drawer-submit">
              {editingDeptId ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

export function TestBuilderPanel() {
  const { testId } = useParams();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const testsListPath = getTestsListPath(user?.roles ?? []);
  const [test, setTest] = useState<{
    title?: string;
    status?: string;
    duration_minutes?: number;
    total_marks?: number;
    passing_marks?: number | null;
    instructions?: string | null;
    config?: Record<string, unknown> | null;
    questions?: {
      question_id: string;
      type?: string;
      content?: { text?: string } | string;
      marks?: number;
    }[];
    assignments?: { student_id: string; first_name: string; last_name: string; email: string }[];
  } | null>(null);
  const [bankQuestions, setBankQuestions] = useState<{ id: string; content?: { text?: string }; type?: string }[]>([]);
  const [students, setStudents] = useState<Awaited<ReturnType<typeof examinationService.listAssignableStudents>>['data']>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [assignDepartmentId, setAssignDepartmentId] = useState('');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [questionSearch, setQuestionSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [assignedSearch, setAssignedSearch] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<'build' | 'publish' | 'assign'>('build');
  const [publishMode, setPublishMode] = useState<'live_now' | 'schedule'>('live_now');
  const [scheduleStart, setScheduleStart] = useState('');
  const [scheduleEnd, setScheduleEnd] = useState('');
  const [previewQuestionId, setPreviewQuestionId] = useState<string | null>(null);
  const [hardQuestions, setHardQuestions] = useState<
    { question_id: string; text: string; correct_pct: number | null; answered_count: number }[]
  >([]);
  const withLoader = useDashboardLoader();
  const { branches } = useOrganization();

  const loadStudents = async (departmentId?: string) => {
    const sResult = await examinationService.listAssignableStudents(1, 200, departmentId || undefined);
    setStudents(sResult.data.filter((st) => st.status === 'active'));
  };

  const load = async () => {
    if (!testId) return;
    setLoading(true);
    setError('');
    try {
      const [tResult, qResult, sResult, deptLists] = await Promise.allSettled([
        examinationService.getTest(testId),
        examinationService.listQuestions(1, 100, 'approved'),
        examinationService.listAssignableStudents(1, 200, assignDepartmentId || undefined),
        Promise.all(
          branches.map((b) =>
            platformService.listDepartments(b.id, 1, 100).then((r) => r.data).catch(() => []),
          ),
        ),
      ]);

      if (tResult.status === 'fulfilled') {
        setTest(tResult.value as typeof test);
      } else {
        setError(parseApiError(tResult.reason));
        return;
      }

      if (qResult.status === 'fulfilled') {
        setBankQuestions(qResult.value.data);
      } else {
        setBankQuestions([]);
        setError(parseApiError(qResult.reason));
      }

      if (sResult.status === 'fulfilled') {
        setStudents(sResult.value.data.filter((st) => st.status === 'active'));
      } else {
        setStudents([]);
        if (qResult.status === 'fulfilled') {
          setError(parseApiError(sResult.reason));
        }
      }

      if (deptLists.status === 'fulfilled') {
        const flat = deptLists.value.flat().map((d) => ({ id: d.id, name: d.name }));
        const seen = new Set<string>();
        setDepartments(flat.filter((d) => (seen.has(d.id) ? false : (seen.add(d.id), true))));
      }

      try {
        const qa = await examinationService.getTestQuestionAnalytics(testId);
        setHardQuestions(qa?.hard_questions ?? []);
      } catch {
        setHardQuestions([]);
      }
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [testId, branches]);

  useEffect(() => {
    if (!testId) return;
    void loadStudents(assignDepartmentId).catch((err) => setError(parseApiError(err)));
  }, [assignDepartmentId, testId]);

  useEffect(() => {
    setMessage('');
    setError('');
    setSelectedQuestionIds([]);
    setSelectedStudentIds([]);
  }, [testId]);

  useDashboardLoadingEffect(loading);

  const testQuestions = test?.questions ?? [];
  const assignments = test?.assignments ?? [];
  const assignedIds = new Set(assignments.map((a) => a.student_id));
  const isLive = test?.status === 'live';
  const isPublished = isLive || test?.status === 'scheduled';

  useEffect(() => {
    if (!test) return;
    const step = params.get('step');
    if (!isPublished && step === 'publish' && (test.questions?.length ?? 0) > 0) {
      setPhase('publish');
      return;
    }
    if (isPublished && step === 'assign') {
      setPhase('assign');
      return;
    }
    if (isPublished) setPhase('assign');
  }, [isPublished, test, params]);

  const qSearch = questionSearch.trim().toLowerCase();
  const sSearch = studentSearch.trim().toLowerCase();
  const aSearch = assignedSearch.trim().toLowerCase();

  const availableQuestions = bankQuestions
    .filter((q) => !testQuestions.some((tq) => tq.question_id === q.id))
    .filter((q) => {
      if (!qSearch) return true;
      const text = getQuestionText(q.content, '').toLowerCase();
      return text.includes(qSearch) || (q.type ?? '').toLowerCase().includes(qSearch);
    });

  const unassignedStudents = students
    .filter((s) => !assignedIds.has(s.student_id))
    .filter((s) => {
      if (!sSearch) return true;
      const name = `${s.first_name} ${s.last_name}`.toLowerCase();
      return name.includes(sSearch) || s.email.toLowerCase().includes(sSearch);
    });

  const filteredAssignments = assignments.filter((a) => {
    if (!aSearch) return true;
    const name = `${a.first_name} ${a.last_name}`.toLowerCase();
    return name.includes(aSearch) || a.email.toLowerCase().includes(aSearch);
  });

  const allQuestionsSelected =
    availableQuestions.length > 0 &&
    availableQuestions.every((q) => selectedQuestionIds.includes(q.id));
  const allStudentsSelected =
    unassignedStudents.length > 0 &&
    unassignedStudents.every((s) => selectedStudentIds.includes(s.student_id));

  const toggleQuestion = (id: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAllQuestions = () => {
    if (allQuestionsSelected) {
      setSelectedQuestionIds((prev) => prev.filter((id) => !availableQuestions.some((q) => q.id === id)));
    } else {
      setSelectedQuestionIds((prev) => {
        const next = new Set(prev);
        availableQuestions.forEach((q) => next.add(q.id));
        return [...next];
      });
    }
  };

  const toggleStudent = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const toggleAllStudents = () => {
    if (allStudentsSelected) {
      setSelectedStudentIds((prev) =>
        prev.filter((id) => !unassignedStudents.some((s) => s.student_id === id)),
      );
    } else {
      setSelectedStudentIds((prev) => {
        const next = new Set(prev);
        unassignedStudents.forEach((s) => next.add(s.student_id));
        return [...next];
      });
    }
  };

  const submitSelectedQuestions = async () => {
    if (!testId || selectedQuestionIds.length === 0) return;
    setMessage('');
    setError('');
    const alreadyOnTest = new Set(testQuestions.map((tq) => tq.question_id));
    const toAdd = selectedQuestionIds.filter((id) => !alreadyOnTest.has(id));
    if (toAdd.length === 0) {
      setMessage('Selected question(s) are already on this test.');
      setSelectedQuestionIds([]);
      await load();
      return;
    }
    await withLoader(async () => {
      try {
        let added = 0;
        const failures: string[] = [];
        for (const questionId of toAdd) {
          try {
            await examinationService.addQuestionToTest(testId, questionId);
            added += 1;
          } catch (err) {
            failures.push(parseApiError(err));
          }
        }
        setSelectedQuestionIds([]);
        await load();
        if (added > 0) {
          setMessage(
            failures.length
              ? `${added} question(s) added. ${failures.length} skipped.`
              : `${added} question(s) added. Review and publish when ready.`,
          );
          setPhase('publish');
        } else {
          setError(failures[0] ?? 'Could not add questions to this test.');
        }
      } catch (err) {
        setError(parseApiError(err));
        await load();
      }
    });
  };

  const removeQuestion = async (questionId: string) => {
    if (!testId) return;
    const ok = await confirmDelete({
      title: 'Remove question?',
      text: 'This question will be removed from the test.',
      confirmText: 'Yes, remove',
    });
    if (!ok) return;
    setError('');
    await withLoader(async () => {
      try {
        await examinationService.removeQuestionFromTest(testId, questionId);
        setMessage('Question removed from test.');
        await load();
      } catch (err) {
        setError(parseApiError(err));
      }
    });
  };

  const moveQuestion = async (questionId: string, direction: -1 | 1) => {
    if (!testId) return;
    const ids = testQuestions.map((q) => q.question_id);
    const idx = ids.indexOf(questionId);
    const swapWith = idx + direction;
    if (idx < 0 || swapWith < 0 || swapWith >= ids.length) return;
    const next = [...ids];
    [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
    setError('');
    await withLoader(async () => {
      try {
        const updated = await examinationService.reorderTestQuestions(testId, next);
        setTest(updated as typeof test);
        setMessage('Question order updated.');
      } catch (err) {
        setError(parseApiError(err));
      }
    });
  };

  const checklist = {
    hasQuestions: testQuestions.length > 0,
    hasDuration: Number(test?.duration_minutes ?? 0) > 0,
    hasPassingMarks: test?.passing_marks != null && Number(test.passing_marks) >= 0,
    hasInstructions: Boolean(String(test?.instructions ?? '').trim()),
    hasAssignees: assignments.length > 0,
  };
  const canPublish = checklist.hasQuestions && checklist.hasDuration;

  const publish = async () => {
    if (!testId) return;
    setMessage('');
    setError('');
    if (testQuestions.length === 0) {
      setError('Add at least one question before publishing.');
      return;
    }
    if (publishMode === 'schedule' && !scheduleStart.trim()) {
      setError('Choose schedule date & time.');
      return;
    }
    await withLoader(async () => {
      try {
        const scheduledStart =
          publishMode === 'schedule' && scheduleStart
            ? new Date(scheduleStart).toISOString()
            : null;
        const scheduledEnd =
          publishMode === 'schedule' && scheduleEnd
            ? new Date(scheduleEnd).toISOString()
            : null;
        const published = await examinationService.publishTest(testId, {
          mode: publishMode,
          scheduledStart,
          scheduledEnd,
        });
        await load();
        const isScheduled = (published as { status?: string }).status === 'scheduled';
        setMessage(
          isScheduled
            ? 'Test scheduled. Assign students — they will see a countdown until it goes live.'
            : 'Test is live. Assign students so they can attempt it.',
        );
        setPhase('assign');
        showSuccess(
          isScheduled ? 'Scheduled' : 'Published',
          isScheduled
            ? 'Test will go live at the scheduled time.'
            : 'Test is live. Assign students next.',
        );
      } catch (err) {
        const msg = parseApiError(err);
        setError(msg);
        showError('Publish failed', msg);
      }
    });
  };

  const submitSelectedStudents = async () => {
    if (!testId || selectedStudentIds.length === 0) return;
    setMessage('');
    setError('');
    await withLoader(async () => {
      try {
        for (const studentId of selectedStudentIds) {
          await examinationService.assignTestToStudent(testId, studentId);
        }
        setMessage(`Test assigned to ${selectedStudentIds.length} student(s).`);
        setSelectedStudentIds([]);
        await load();
      } catch (err) {
        setError(parseApiError(err));
      }
    });
  };

  const unassignStudent = async (studentId: string, name: string) => {
    if (!testId) return;
    const ok = await confirmDelete({
      title: 'Unassign student?',
      text: `Remove “${name}” from this test?`,
      confirmText: 'Yes, unassign',
    });
    if (!ok) return;
    setError('');
    await withLoader(async () => {
      try {
        await examinationService.unassignStudentFromTest(testId, studentId);
        setMessage(`${name} unassigned.`);
        await load();
      } catch (err) {
        setError(parseApiError(err));
      }
    });
  };

  if (!testId) {
    return (
      <div className="dashboard__content__wraper">
        <p>Select a draft test from <Link to={testsListPath}>My Tests</Link> to build it.</p>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard__content__wraper sp_bottom_20">
        <div className="dashboard__section__title d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div>
            <h4 className="mb-1">Test Builder — {test?.title}</h4>
            <p className="mb-0 text-muted" style={{ fontSize: '0.875rem' }}>
              {test?.duration_minutes} min · {test?.total_marks ?? 0} marks · Status:{' '}
              <span className={`edtp-badge ${isLive ? 'edtp-badge--active' : 'edtp-badge--role'}`}>{test?.status}</span>
              {' · '}
              {phase === 'build' && 'Add questions, then continue.'}
              {phase === 'publish' && 'Review the paper, then publish.'}
              {phase === 'assign' && 'Choose who can attempt this exam.'}
            </p>
          </div>
          <Link to={testsListPath} className="dashboard__small__btn__2">← Back to Tests</Link>
        </div>
      </div>
      <ExamStepper
        activeStep={phase === 'assign' ? 3 : phase === 'publish' ? 2 : 1}
        canOpen={(step) => {
          if (isPublished) return step === 3;
          if (step === 1) return true;
          if (step === 2) return testQuestions.length > 0;
          return false;
        }}
        onStep={(step) => {
          if (step === 1) setPhase('build');
          if (step === 2) setPhase('publish');
          if (step === 3) setPhase('assign');
        }}
        steps={[
          { step: 1, title: 'Questions', desc: 'Add from the bank' },
          { step: 2, title: 'Publish', desc: 'Review and release' },
          { step: 3, title: 'Assign', desc: 'Choose students' },
        ]}
      />
      <p className="exam-stepper__help">
        {phase === 'build' && 'Tick the questions, press Submit Selected, then Continue to Publish.'}
        {phase === 'publish' && 'Check the list. Publish now, or pick a start time. Students cannot see a draft.'}
        {phase === 'assign' && 'Choose the students, then press Assign Selected. They will see this exam in My Tests.'}
      </p>
      <div className="dashboard__content__wraper">
        {error && <p className="login__error sp_bottom_15">{error}</p>}
        {message && <p className="form-success sp_bottom_15">{message}</p>}

        <div className={`sca-exam-builder-grid${phase !== 'build' ? ' sca-exam-builder-grid--single' : ''}`}>
          {phase !== 'assign' && (
          <section className="edtp-form-card">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 sp_bottom_10">
              <h5 className="mb-0">Questions in this test ({testQuestions.length})</h5>
              {phase === 'publish' && !isPublished && (
                <EdtpBtn variant="secondary" onClick={() => setPhase('build')}>
                  ← Edit questions
                </EdtpBtn>
              )}
            </div>
            {testQuestions.length === 0 ? (
              <p className="text-muted mb-0">No questions yet. Select from the question bank and submit.</p>
            ) : (
              <ol className="sca-exam-builder-qlist">
                {testQuestions.map((tq, i) => {
                  const label = getQuestionText(tq.content);
                  return (
                    <li key={tq.question_id}>
                      <span className="sca-exam-builder-qlist__num">Q{i + 1}</span>
                      <span className="edtp-q-cell">{label}</span>
                      <span className="edtp-badge edtp-badge--role">{tq.type ?? '—'}</span>
                      <EdtpBtn variant="ghost" onClick={() => setPreviewQuestionId(tq.question_id)}>
                        Preview
                      </EdtpBtn>
                      {phase === 'build' && !isPublished && (
                        <>
                          <EdtpBtn
                            variant="ghost"
                            disabled={i === 0}
                            onClick={() => void moveQuestion(tq.question_id, -1)}
                          >
                            Up
                          </EdtpBtn>
                          <EdtpBtn
                            variant="ghost"
                            disabled={i === testQuestions.length - 1}
                            onClick={() => void moveQuestion(tq.question_id, 1)}
                          >
                            Down
                          </EdtpBtn>
                          <EdtpBtn variant="danger" onClick={() => void removeQuestion(tq.question_id)}>
                            Remove
                          </EdtpBtn>
                        </>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}

            {phase === 'build' && hardQuestions.length > 0 && (
              <div className="edtp-form-card sp_bottom_15">
                <h6 className="mb-2">Hard questions (from past attempts)</h6>
                <ul className="mb-0" style={{ fontSize: '0.875rem' }}>
                  {hardQuestions.slice(0, 5).map((q) => (
                    <li key={q.question_id}>
                      {q.text || q.question_id.slice(0, 8)} —{' '}
                      {q.correct_pct != null ? `${q.correct_pct}%` : 'n/a'} correct (n={q.answered_count})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {phase === 'build' && testQuestions.length > 0 && (
              <div className="sca-exam-builder-actions">
                <span className="sca-exam-builder-actions__count">
                  Ready for publish when you are done adding questions.
                </span>
                <div className="sca-exam-builder-actions__btns">
                  <EdtpBtn variant="primary" onClick={() => setPhase('publish')}>
                    Continue to Publish →
                  </EdtpBtn>
                </div>
              </div>
            )}

            {phase === 'publish' && !isPublished && (
              <div className="sca-exam-builder-publish">
                <p className="text-muted mb-3" style={{ fontSize: '0.9rem' }}>
                  Review the checklist, then choose when this test becomes available.
                </p>
                <ul className="sp_bottom_15" style={{ fontSize: '0.9rem', paddingLeft: '1.1rem' }}>
                  <li style={{ color: checklist.hasQuestions ? '#15803d' : '#b91c1c' }}>
                    {checklist.hasQuestions ? '✓' : '✗'} At least one question ({testQuestions.length})
                  </li>
                  <li style={{ color: checklist.hasDuration ? '#15803d' : '#b91c1c' }}>
                    {checklist.hasDuration ? '✓' : '✗'} Duration set ({test?.duration_minutes ?? 0} min)
                  </li>
                  <li style={{ color: checklist.hasPassingMarks ? '#15803d' : '#64748b' }}>
                    {checklist.hasPassingMarks ? '✓' : '○'} Passing marks ({test?.passing_marks ?? '—'})
                  </li>
                  <li style={{ color: checklist.hasInstructions ? '#15803d' : '#64748b' }}>
                    {checklist.hasInstructions ? '✓' : '○'} Instructions filled
                  </li>
                  <li style={{ color: checklist.hasAssignees ? '#15803d' : '#64748b' }}>
                    {checklist.hasAssignees ? '✓' : '○'} Students assigned ({assignments.length}) — can assign after publish
                  </li>
                </ul>
                <div className="row g-3 sp_bottom_15">
                  <div className="col-md-6">
                    <EdtpField label="Publish mode">
                      <EdtpSelect
                        value={publishMode}
                        onChange={(e) => setPublishMode(e.target.value as 'live_now' | 'schedule')}
                      >
                        <option value="live_now">Live now</option>
                        <option value="schedule">Schedule for later</option>
                      </EdtpSelect>
                    </EdtpField>
                  </div>
                  {publishMode === 'schedule' && (
                    <>
                      <div className="col-md-6">
                        <EdtpField label="Go live at" hint="Students see a countdown until this time.">
                          <input
                            type="datetime-local"
                            className="register__input"
                            value={scheduleStart}
                            onChange={(e) => setScheduleStart(e.target.value)}
                          />
                        </EdtpField>
                      </div>
                      <div className="col-md-6">
                        <EdtpField label="End at (optional)">
                          <input
                            type="datetime-local"
                            className="register__input"
                            value={scheduleEnd}
                            onChange={(e) => setScheduleEnd(e.target.value)}
                          />
                        </EdtpField>
                      </div>
                    </>
                  )}
                </div>
                <EdtpBtn
                  variant="primary"
                  size="md"
                  disabled={!canPublish}
                  onClick={() => void publish()}
                >
                  {publishMode === 'schedule' ? 'Schedule Test' : 'Publish Test'}
                </EdtpBtn>
              </div>
            )}
          </section>
          )}

          {phase === 'build' && !isPublished && (
            <section className="edtp-form-card">
              <h5 className="sp_bottom_15">Add from Question Bank</h5>
              <SearchField
                value={questionSearch}
                onChange={setQuestionSearch}
                placeholder="Search questions by text or type…"
              />
              <div className="dashboard__table table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: 48 }}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={allQuestionsSelected}
                          onChange={toggleAllQuestions}
                          disabled={availableQuestions.length === 0}
                          aria-label="Select all questions"
                        />
                      </th>
                      <th>Question</th>
                      <th>Type</th>
                      <th style={{ width: 100 }} />
                    </tr>
                  </thead>
                  <tbody>
                    {availableQuestions.map((q) => {
                      const label = getQuestionText(q.content);
                      return (
                        <tr key={q.id}>
                          <td>
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={selectedQuestionIds.includes(q.id)}
                              onChange={() => toggleQuestion(q.id)}
                              aria-label={`Select question ${label}`}
                            />
                          </td>
                          <td className="edtp-q-cell">{label}</td>
                          <td><span className="edtp-badge edtp-badge--role">{q.type}</span></td>
                          <td>
                            <EdtpBtn variant="ghost" onClick={() => setPreviewQuestionId(q.id)}>
                              Preview
                            </EdtpBtn>
                          </td>
                        </tr>
                      );
                    })}
                    {availableQuestions.length === 0 && (
                      <tr>
                        <td colSpan={4}>
                          {qSearch
                            ? 'No questions match your search.'
                            : bankQuestions.length === 0
                              ? (
                                <>No approved questions. <Link to="/dashboard/admin-question-bank">Add questions</Link> first.</>
                              )
                              : 'All available questions are already in this test.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {availableQuestions.length > 0 && (
                <div className="sca-exam-builder-actions">
                  <span className="sca-exam-builder-actions__count">
                    {selectedQuestionIds.length} selected
                  </span>
                  <div className="sca-exam-builder-actions__btns">
                    <EdtpBtn variant="secondary" onClick={toggleAllQuestions}>
                      {allQuestionsSelected ? 'Clear All' : 'Select All'}
                    </EdtpBtn>
                    <EdtpBtn
                      variant="primary"
                      disabled={selectedQuestionIds.length === 0}
                      onClick={() => void submitSelectedQuestions()}
                    >
                      Submit Selected
                    </EdtpBtn>
                  </div>
                </div>
              )}
            </section>
          )}

          {phase === 'assign' && (
            <section className="edtp-form-card">
              <div className="sp_bottom_15">
                <h5 className="mb-1">Assign to Students</h5>
                <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
                  Filter by department, search, select students, then submit.
                </p>
              </div>
              <div className="row g-2 sp_bottom_15">
                <div className="col-md-4">
                  <EdtpField label="Department filter">
                    <EdtpSelect
                      value={assignDepartmentId}
                      onChange={(e) => {
                        setAssignDepartmentId(e.target.value);
                        setSelectedStudentIds([]);
                      }}
                    >
                      <option value="">All departments</option>
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </EdtpSelect>
                  </EdtpField>
                </div>
                <div className="col-md-8 d-flex align-items-end">
                  <SearchField
                    value={studentSearch}
                    onChange={setStudentSearch}
                    placeholder="Search by name or email…"
                  />
                </div>
              </div>
              <div className="dashboard__table table-responsive sp_bottom_15">
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: 48 }}>
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={allStudentsSelected}
                          onChange={toggleAllStudents}
                          disabled={unassignedStudents.length === 0}
                          aria-label="Select all students"
                        />
                      </th>
                      <th>Name</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unassignedStudents.map((s) => (
                      <tr key={s.student_id}>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedStudentIds.includes(s.student_id)}
                            onChange={() => toggleStudent(s.student_id)}
                            aria-label={`Select ${s.first_name} ${s.last_name}`}
                          />
                        </td>
                        <td>{s.first_name} {s.last_name}</td>
                        <td>{s.email}</td>
                      </tr>
                    ))}
                    {unassignedStudents.length === 0 && (
                      <tr>
                        <td colSpan={3}>
                          {sSearch
                            ? 'No students match your search.'
                            : students.length === 0
                              ? 'No active students found.'
                              : 'All students are already assigned.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {unassignedStudents.length > 0 && (
                <div className="sca-exam-builder-actions sp_bottom_20">
                  <span className="sca-exam-builder-actions__count">
                    {selectedStudentIds.length} selected
                  </span>
                  <div className="sca-exam-builder-actions__btns">
                    <EdtpBtn variant="secondary" onClick={toggleAllStudents}>
                      {allStudentsSelected ? 'Clear All' : 'Select All'}
                    </EdtpBtn>
                    <EdtpBtn
                      variant="primary"
                      disabled={selectedStudentIds.length === 0}
                      onClick={() => void submitSelectedStudents()}
                    >
                      Assign Selected
                    </EdtpBtn>
                  </div>
                </div>
              )}

              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 sp_bottom_10">
                <h6 className="mb-0">Assigned ({assignments.length})</h6>
              </div>
              {assignments.length > 0 && (
                <SearchField
                  value={assignedSearch}
                  onChange={setAssignedSearch}
                  placeholder="Search assigned students…"
                />
              )}
              {assignments.length === 0 ? (
                <p className="text-muted mb-0">No students assigned yet.</p>
              ) : (
                <div className="dashboard__table table-responsive">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAssignments.map((a) => (
                        <tr key={a.student_id}>
                          <td>{a.first_name} {a.last_name}</td>
                          <td>{a.email}</td>
                          <td>
                            <EdtpBtn
                              variant="danger"
                              onClick={() =>
                                void unassignStudent(a.student_id, `${a.first_name} ${a.last_name}`)
                              }
                            >
                              Unassign
                            </EdtpBtn>
                          </td>
                        </tr>
                      ))}
                      {filteredAssignments.length === 0 && (
                        <tr><td colSpan={3}>No assigned students match your search.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
      <QuestionPreviewModal
        questionId={previewQuestionId}
        onClose={() => setPreviewQuestionId(null)}
      />
    </>
  );
}
