import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { examinationService, platformService } from '@/services';
import { parseApiError } from '@/lib/errors';
import { FormError } from '@/components/ui/FormField';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/context/AuthContext';
import { useDashboardLoader, useDashboardLoadingEffect } from '@/context/DashboardLoadingContext';
import AdminExamGuide from '@/components/dashboard/AdminExamGuide';
import { getTestsListPath } from '@/utils/dashboardRole';
import { SearchField } from '@/components/ui/FieldHint';
import {
  EdtpAlert,
  EdtpBtn,
  EdtpEmpty,
  EdtpField,
  EdtpFormActions,
  EdtpPanel,
  EdtpRowActions,
  EdtpSelect,
} from '@/components/ui/CrudUI';
import { confirmDelete, showSuccess } from '@/lib/swal';
import * as yup from 'yup';

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
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title d-flex justify-content-between align-items-center">
        <h4>Notifications {unread > 0 && <span className="badge bg-primary ms-2">{unread}</span>}</h4>
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
                <td>{new Date(n.created_at).toLocaleString()}</td>
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
        name: 'Super Computer Academy',
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

  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title"><h4>{allowTopUp ? 'My Wallet' : 'Payments & Wallet'}</h4></div>
      {!allowTopUp && (
        <p className="text-muted sp_bottom_15" style={{ fontSize: '0.875rem' }}>
          View-only for Super Admin. Payment mutations are blocked for this role.
        </p>
      )}
      {error && <p className="login__error sp_bottom_15">{error}</p>}
      {message && <p className="form-success sp_bottom_15">{message}</p>}
      {wallet && (
        <div className="row sp_bottom_30">
          <div className="col-md-4">
            <div className="dashboard__single__counter">
              <div className="counter__content__wraper">
                <div className="counter__number">₹{wallet.total_paid as string}</div>
                <p>Total Paid</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="dashboard__single__counter">
              <div className="counter__content__wraper">
                <div className="counter__number">₹{wallet.pending as string}</div>
                <p>Pending</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {allowTopUp && paymentConfig?.gateway === 'razorpay' && (
        <div className="sp_bottom_30">
          <h5 className="sp_bottom_15">Add money to wallet</h5>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <input
              className="register__input"
              type="number"
              min={1}
              step={1}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount in INR"
              style={{ maxWidth: 180 }}
            />
            <button
              type="button"
              className="default__button"
              onClick={handleTopUp}
              disabled={paying}
            >
              {paying ? 'Processing…' : 'Pay with Razorpay'}
            </button>
          </div>
          <p className="mt-2"><small>Secure payment via Razorpay (test mode).</small></p>
        </div>
      )}
      {allowTopUp && paymentConfig?.gateway === 'demo' && (
        <p className="sp_bottom_20">Payment gateway is not configured on the server.</p>
      )}
      <div className="dashboard__table table-responsive">
        <table>
          <thead>
            <tr>
              <th>User</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td>{p.first_name} {p.last_name}<br /><small>{p.email}</small></td>
                <td>₹{p.amount} {p.currency}</td>
                <td>{p.status}</td>
                <td>{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
            {payments.length === 0 && <tr><td colSpan={4}>No payments found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
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
  role: yup.mixed<'student' | 'teacher' | 'org_admin'>().oneOf(['student', 'teacher', 'org_admin']).required(),
});

type CreateUserForm = {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'teacher' | 'org_admin';
};

export function UsersManagementPanel({
  lockedRole,
  title,
}: {
  lockedRole?: 'student' | 'teacher' | 'org_admin';
  title?: string;
} = {}) {
  const [users, setUsers] = useState<Awaited<ReturnType<typeof platformService.listUsers>>['data']>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const withLoader = useDashboardLoader();
  const defaultRole = lockedRole ?? 'student';
  const { register, handleSubmit, reset, formState: { errors }, setError: setFormError } = useForm<CreateUserForm>({
    // yup InferType + optional password conflicts with RHF Resolver generics
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(createUserSchema) as any,
    defaultValues: { email: '', password: '', firstName: '', lastName: '', role: defaultRole },
  });

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

  useEffect(() => { void load(); }, [lockedRole]);

  useDashboardLoadingEffect(loading);

  const resetForm = () => {
    setEditingId(null);
    reset({ email: '', password: '', firstName: '', lastName: '', role: defaultRole });
  };

  const startEdit = (u: (typeof users)[number]) => {
    setEditingId(u.id);
    const role =
      (u.roles as string[]).find((r) => ['student', 'teacher', 'org_admin'].includes(r)) as
        | 'student'
        | 'teacher'
        | 'org_admin'
        | undefined;
    reset({
      email: u.email,
      password: '',
      firstName: u.first_name,
      lastName: u.last_name,
      role: lockedRole ?? role ?? 'student',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const onSubmit = async (values: CreateUserForm) => {
    setError('');
    setMessage('');
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
          });
          setMessage('User updated.');
          showSuccess('Updated', 'User details saved.');
        } else {
          await platformService.createUser({
            email: values.email,
            password: values.password!,
            firstName: values.firstName,
            lastName: values.lastName,
            role,
          });
          setMessage(
            lockedRole === 'teacher'
              ? 'Faculty member added.'
              : lockedRole === 'student'
                ? 'Student added.'
                : 'User created.',
          );
          showSuccess('Created', 'Login credentials emailed.');
        }
        resetForm();
        await load();
      } catch (err) {
        setError(parseApiError(err));
      }
    });
  };

  const setStatus = async (userId: string, status: 'active' | 'suspended') => {
    setError('');
    await withLoader(async () => {
      try {
        await platformService.updateUserStatus(userId, status);
        showSuccess(status === 'active' ? 'Activated' : 'Suspended', `User is now ${status}.`);
        await load();
      } catch (err) {
        setError(parseApiError(err));
      }
    });
  };

  const removeUser = async (userId: string, name: string) => {
    const ok = await confirmDelete({
      title: 'Delete user?',
      text: `“${name}” will be removed from this organization.`,
      confirmText: 'Yes, delete',
    });
    if (!ok) return;
    setError('');
    try {
      await withLoader(async () => {
        await platformService.deleteUser(userId);
        if (editingId === userId) resetForm();
        await load();
      });
      showSuccess('Deleted!', `${name} has been removed.`);
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const heading =
    title ??
    (lockedRole === 'teacher' ? 'Faculty' : lockedRole === 'student' ? 'Students' : 'User Management');
  const addLabel = editingId
    ? 'Update User'
    : lockedRole === 'teacher'
      ? 'Add Faculty'
      : lockedRole === 'student'
        ? 'Add Student'
        : 'Add User';

  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title">
        <h4>{heading}</h4>
        <span className="badge bg-primary">{users.length}</span>
      </div>
      {error && <EdtpAlert type="error">{error}</EdtpAlert>}
      {message && <EdtpAlert type="success">{message}</EdtpAlert>}

      <div className="edtp-form-card">
        <h5>{editingId ? 'Edit user' : addLabel}</h5>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row g-3">
            <div className="col-md-6 col-lg-3">
              <EdtpField label="First name">
                <input className="register__input" placeholder="First name" {...register('firstName')} />
                <FormError message={errors.firstName?.message} />
              </EdtpField>
            </div>
            <div className="col-md-6 col-lg-3">
              <EdtpField label="Last name">
                <input className="register__input" placeholder="Last name" {...register('lastName')} />
                <FormError message={errors.lastName?.message} />
              </EdtpField>
            </div>
            <div className="col-md-6 col-lg-3">
              <EdtpField label="Email">
                <input
                  className="register__input"
                  placeholder="Email"
                  disabled={Boolean(editingId)}
                  {...register('email')}
                />
                <FormError message={errors.email?.message} />
              </EdtpField>
            </div>
            {!lockedRole ? (
              <div className="col-md-6 col-lg-2">
                <EdtpField label="Role">
                  <EdtpSelect {...register('role')}>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="org_admin">Org Admin</option>
                  </EdtpSelect>
                </EdtpField>
              </div>
            ) : (
              <input type="hidden" {...register('role')} />
            )}
            {!editingId && (
              <div className="col-md-6 col-lg-3">
                <EdtpField label="Password">
                  <input className="register__input" type="password" placeholder="Password" {...register('password')} />
                  <FormError message={errors.password?.message} />
                </EdtpField>
              </div>
            )}
            <div className="col-12">
              <EdtpFormActions>
                <EdtpBtn type="submit" variant="primary" size="md">
                  {addLabel}
                </EdtpBtn>
                {editingId && (
                  <EdtpBtn type="button" variant="ghost" size="md" onClick={resetForm}>
                    Cancel
                  </EdtpBtn>
                )}
              </EdtpFormActions>
            </div>
          </div>
        </form>
      </div>

      <div className="dashboard__table table-responsive">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Roles</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className={editingId === u.id ? 'edtp-row--editing' : undefined}>
                <td>{u.first_name} {u.last_name}</td>
                <td>{u.email}</td>
                <td>{(u.roles as string[]).join(', ')}</td>
                <td>
                  <span className={`edtp-badge ${u.status === 'active' ? 'edtp-badge--active' : 'edtp-badge--inactive'}`}>
                    {u.status}
                  </span>
                </td>
                <td>
                  <EdtpRowActions>
                    <EdtpBtn variant="secondary" onClick={() => startEdit(u)}>Edit</EdtpBtn>
                    {u.status === 'active' ? (
                      <EdtpBtn variant="danger" onClick={() => void setStatus(u.id, 'suspended')}>Suspend</EdtpBtn>
                    ) : (
                      <EdtpBtn variant="success" onClick={() => void setStatus(u.id, 'active')}>Activate</EdtpBtn>
                    )}
                    <EdtpBtn
                      variant="danger"
                      onClick={() => void removeUser(u.id, `${u.first_name} ${u.last_name}`)}
                    >
                      Delete
                    </EdtpBtn>
                  </EdtpRowActions>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5}>No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ReportsPanel() {
  const [tests, setTests] = useState<{ id: string; title: string }[]>([]);
  const [selected, setSelected] = useState('');
  const [report, setReport] = useState<Record<string, unknown> | null>(null);
  const [overview, setOverview] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const withLoader = useDashboardLoader();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      examinationService.listTests(1, 50).then((r) => setTests(r.data)),
      platformService.getOrgOverviewReport().then(setOverview),
    ])
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  useDashboardLoadingEffect(loading || reportLoading);

  const loadReport = async (testId: string) => {
    setSelected(testId);
    if (!testId) {
      setReport(null);
      return;
    }
    setReportLoading(true);
    try {
      const data = await platformService.getTestReport(testId);
      setReport(data);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setReportLoading(false);
    }
  };

  const exportCsv = async () => {
    if (!selected) return;
    await withLoader(async () => {
      const blob = await platformService.exportTestReport(selected);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `test-report-${selected}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title"><h4>Reports & Analytics</h4></div>
      {error && <p className="login__error sp_bottom_15">{error}</p>}
      {overview && (
        <div className="row sp_bottom_30">
          {['users', 'tests', 'attempts', 'revenue'].map((key) => (
            <div key={key} className="col-md-3 sp_bottom_15">
              <div className="dashboard__single__counter">
                <div className="counter__content__wraper">
                  <div className="counter__number">{String(overview[key] ?? '—')}</div>
                  <p>{key.charAt(0).toUpperCase() + key.slice(1)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="sp_bottom_20">
        <EdtpSelect value={selected} onChange={(e) => loadReport(e.target.value)}>
          <option value="">Select test for detailed report</option>
          {tests.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </EdtpSelect>
      </div>
      {selected && (
        <button type="button" className="default__button sp_bottom_20" onClick={exportCsv}>
          Export CSV
        </button>
      )}
      {report && (
        <div className="dashboard__table table-responsive">
          <table>
            <thead>
              <tr><th>Student</th><th>Score</th><th>%</th><th>Rank</th></tr>
            </thead>
            <tbody>
              {((report.results as Record<string, unknown>[]) ?? []).map((r) => (
                <tr key={r.id as string}>
                  <td>{r.first_name as string} {r.last_name as string}</td>
                  <td>{r.total_score as number}/{r.max_score as number}</td>
                  <td>{Number(r.percentage).toFixed(1)}%</td>
                  <td>{r.rank as number ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function AuditLogPanel() {
  const [logs, setLogs] = useState<Awaited<ReturnType<typeof platformService.listAuditLogs>>['data']>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    platformService.listAuditLogs(1, 50)
      .then((r) => setLogs(r.data))
      .catch((err) => setError(parseApiError(err)))
      .finally(() => setLoading(false));
  }, []);

  useDashboardLoadingEffect(loading);

  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title"><h4>Audit Logs</h4></div>
      {error && <p className="login__error sp_bottom_15">{error}</p>}
      <div className="dashboard__table table-responsive">
        <table>
          <thead>
            <tr><th>Action</th><th>Resource</th><th>User</th><th>Time</th></tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id}>
                <td>{l.action}</td>
                <td>{l.resource}</td>
                <td>{l.user_email ?? '—'}</td>
                <td>{new Date(l.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {logs.length === 0 && <tr><td colSpan={4}>No audit logs.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function SessionsSecurityPanel() {
  const { refreshUser } = useAuth();
  const [sessions, setSessions] = useState<Record<string, unknown>[]>([]);
  const [mfaInfo, setMfaInfo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
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

  useEffect(() => { void load(); }, []);

  useDashboardLoadingEffect(loading);

  const revoke = async (id: string) => {
    await withLoader(async () => {
      await platformService.revokeSession(id);
      await load();
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

  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title"><h4>Sessions & Security</h4></div>
      {error && <p className="login__error sp_bottom_15">{error}</p>}
      {mfaInfo && <p className="form-success sp_bottom_15">{mfaInfo}</p>}
      <div className="sp_bottom_30">
        <button type="button" className="default__button me-2" onClick={() => toggleMfa(true)}>Enable MFA</button>
        <button type="button" className="default__button" onClick={() => toggleMfa(false)}>Disable MFA</button>
      </div>
      <div className="dashboard__table table-responsive">
        <table>
          <thead>
            <tr><th>Device</th><th>IP</th><th>Created</th><th>Active</th><th /></tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id as string}>
                <td>{JSON.stringify(s.device_info)}</td>
                <td>{String(s.ip_address ?? '')}</td>
                <td>{new Date(s.created_at as string).toLocaleString()}</td>
                <td>{s.is_active ? 'Yes' : 'No'}</td>
                <td>
                  {s.is_active ? (
                    <button type="button" className="default__button small-btn" onClick={() => revoke(s.id as string)}>
                      Revoke
                    </button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
  const [message, setMessage] = useState('');
  const [deptLoading, setDeptLoading] = useState(false);
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

  const saveDept = async () => {
    if (!branchId || !deptName.trim()) return;
    setError('');
    setMessage('');
    await withLoader(async () => {
      try {
        if (editingDeptId) {
          await platformService.updateDepartment(editingDeptId, { name: deptName.trim() });
          setMessage('Department updated.');
        } else {
          await platformService.createDepartment(branchId, { name: deptName.trim() });
          setMessage('Department added.');
        }
        setDeptName('');
        setEditingDeptId(null);
        await reloadDepartments();
      } catch (err) {
        setError(parseApiError(err));
      }
    });
  };

  const startEditDept = (d: { id: string; name: string }) => {
    setEditingDeptId(d.id);
    setDeptName(d.name);
  };

  const deleteDept = async (id: string) => {
    const ok = await confirmDelete({
      title: 'Delete department?',
      text: "You won't be able to revert this!",
      confirmText: 'Yes, delete it!',
    });
    if (!ok) return;
    setError('');
    try {
      await withLoader(async () => {
        await platformService.deleteDepartment(id);
        if (editingDeptId === id) {
          setEditingDeptId(null);
          setDeptName('');
        }
        await reloadDepartments();
      });
      setMessage('Department deleted.');
      showSuccess('Deleted!', 'Department has been deleted.');
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title">
        <h4>Departments</h4>
      </div>
      {error && <EdtpAlert type="error">{error}</EdtpAlert>}
      {message && <EdtpAlert type="success">{message}</EdtpAlert>}
      <EdtpPanel
        title="Manage departments"
        subtitle={editingDeptId ? 'Editing selected department' : 'Add departments under a branch'}
      >
        <div className="row g-3">
          <div className="col-md-5">
            <EdtpField label="Branch" htmlFor="orgBranch">
              <EdtpSelect
                id="orgBranch"
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </EdtpSelect>
            </EdtpField>
          </div>
          <div className="col-md-7">
            <EdtpField
              label={editingDeptId ? 'Edit department' : 'Department name'}
              htmlFor="deptName"
            >
              <input
                id="deptName"
                className="register__input"
                placeholder="e.g. Computer Science"
                value={deptName}
                onChange={(e) => setDeptName(e.target.value)}
              />
            </EdtpField>
          </div>
        </div>
        <EdtpFormActions>
          <EdtpBtn variant="primary" size="md" onClick={saveDept}>
            {editingDeptId ? 'Update' : 'Add department'}
          </EdtpBtn>
          {editingDeptId && (
            <EdtpBtn
              variant="ghost"
              size="md"
              onClick={() => {
                setEditingDeptId(null);
                setDeptName('');
              }}
            >
              Cancel
            </EdtpBtn>
          )}
        </EdtpFormActions>
        {departments.length === 0 ? (
          <EdtpEmpty>No departments yet. Add one above to get started.</EdtpEmpty>
        ) : (
          <ul className="edtp-data-list">
            {departments.map((d) => (
              <li key={d.id} className={editingDeptId === d.id ? 'edtp-list-item--editing' : undefined}>
                <span>{d.name}{d.code ? ` (${d.code})` : ''}</span>
                <EdtpRowActions>
                  <EdtpBtn variant="secondary" onClick={() => startEditDept(d)}>
                    Edit
                  </EdtpBtn>
                  <EdtpBtn variant="danger" onClick={() => void deleteDept(d.id)}>
                    Delete
                  </EdtpBtn>
                </EdtpRowActions>
              </li>
            ))}
          </ul>
        )}
      </EdtpPanel>
    </div>
  );
}

export function TestBuilderPanel() {
  const { testId } = useParams();
  const { user } = useAuth();
  const testsListPath = getTestsListPath(user?.roles ?? []);
  const [test, setTest] = useState<{
    title?: string;
    status?: string;
    duration_minutes?: number;
    total_marks?: number;
    questions?: { question_id: string; type?: string; content?: { text?: string }; marks?: number }[];
    assignments?: { student_id: string; first_name: string; last_name: string; email: string }[];
  } | null>(null);
  const [bankQuestions, setBankQuestions] = useState<{ id: string; content?: { text?: string }; type?: string }[]>([]);
  const [students, setStudents] = useState<Awaited<ReturnType<typeof examinationService.listAssignableStudents>>['data']>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [questionSearch, setQuestionSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [assignedSearch, setAssignedSearch] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const withLoader = useDashboardLoader();

  const load = async () => {
    if (!testId) return;
    setLoading(true);
    setError('');
    try {
      const [tResult, qResult, sResult] = await Promise.allSettled([
        examinationService.getTest(testId),
        examinationService.listQuestions(1, 100, 'approved'),
        examinationService.listAssignableStudents(1, 100),
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
        // Don't wipe test/questions if only students list failed
        if (qResult.status === 'fulfilled') {
          setError(parseApiError(sResult.reason));
        }
      }
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [testId]);

  useDashboardLoadingEffect(loading);

  const testQuestions = test?.questions ?? [];
  const assignments = test?.assignments ?? [];
  const assignedIds = new Set(assignments.map((a) => a.student_id));
  const isLive = test?.status === 'live';
  const activeStep = isLive ? 5 : testQuestions.length > 0 ? 4 : 3;

  const qSearch = questionSearch.trim().toLowerCase();
  const sSearch = studentSearch.trim().toLowerCase();
  const aSearch = assignedSearch.trim().toLowerCase();

  const availableQuestions = bankQuestions
    .filter((q) => !testQuestions.some((tq) => tq.question_id === q.id))
    .filter((q) => {
      if (!qSearch) return true;
      const text = (q.content?.text ?? '').toLowerCase();
      const type = (q.type ?? '').toLowerCase();
      return text.includes(qSearch) || type.includes(qSearch);
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
    await withLoader(async () => {
      try {
        for (const questionId of selectedQuestionIds) {
          await examinationService.addQuestionToTest(testId, questionId);
        }
        setMessage(`${selectedQuestionIds.length} question(s) added to test.`);
        setSelectedQuestionIds([]);
        await load();
      } catch (err) {
        setError(parseApiError(err));
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

  const publish = async () => {
    if (!testId) return;
    setMessage('');
    await withLoader(async () => {
      try {
        await examinationService.publishTest(testId);
        setMessage('Test published! Now assign students below.');
        await load();
      } catch (err) {
        setError(parseApiError(err));
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
            </p>
          </div>
          <Link to={testsListPath} className="dashboard__small__btn__2">← Back to Tests</Link>
        </div>
      </div>
      <AdminExamGuide activeStep={activeStep} compact />
      <div className="dashboard__content__wraper">
        {error && <p className="login__error sp_bottom_15">{error}</p>}
        {message && <p className="form-success sp_bottom_15">{message}</p>}

        <div className="sca-exam-builder-grid">
          <section className="edtp-form-card">
            <h5>Questions in this test ({testQuestions.length})</h5>
            {testQuestions.length === 0 ? (
              <p className="text-muted mb-0">No questions yet. Select from the question bank and submit.</p>
            ) : (
              <ol className="sca-exam-builder-qlist">
                {testQuestions.map((tq, i) => (
                  <li key={tq.question_id}>
                    <span className="sca-exam-builder-qlist__num">Q{i + 1}</span>
                    <span>{tq.content?.text ?? 'Question'}</span>
                    <span className="edtp-badge edtp-badge--role">{tq.type}</span>
                    {!isLive && (
                      <EdtpBtn variant="danger" onClick={() => void removeQuestion(tq.question_id)}>
                        Remove
                      </EdtpBtn>
                    )}
                  </li>
                ))}
              </ol>
            )}
            {!isLive && testQuestions.length > 0 && (
              <button type="button" className="default__button sp_top_15" onClick={publish}>
                Publish Test
              </button>
            )}
          </section>

          {!isLive && (
            <section className="edtp-form-card">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 sp_bottom_15">
                <h5 className="mb-0">Add from Question Bank</h5>
                <button
                  type="button"
                  className="default__button"
                  disabled={selectedQuestionIds.length === 0}
                  onClick={() => void submitSelectedQuestions()}
                >
                  Submit Selected ({selectedQuestionIds.length})
                </button>
              </div>
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
                    </tr>
                  </thead>
                  <tbody>
                    {availableQuestions.map((q) => (
                      <tr key={q.id}>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedQuestionIds.includes(q.id)}
                            onChange={() => toggleQuestion(q.id)}
                            aria-label={`Select question ${q.content?.text ?? q.id}`}
                          />
                        </td>
                        <td>{q.content?.text}</td>
                        <td><span className="edtp-badge edtp-badge--role">{q.type}</span></td>
                      </tr>
                    ))}
                    {availableQuestions.length === 0 && (
                      <tr>
                        <td colSpan={3}>
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
                <div className="d-flex flex-wrap gap-2 sp_top_15">
                  <button type="button" className="dashboard__small__btn__2" onClick={toggleAllQuestions}>
                    {allQuestionsSelected ? 'Clear All' : 'Select All'}
                  </button>
                  <button
                    type="button"
                    className="default__button"
                    disabled={selectedQuestionIds.length === 0}
                    onClick={() => void submitSelectedQuestions()}
                  >
                    Submit Selected ({selectedQuestionIds.length})
                  </button>
                </div>
              )}
            </section>
          )}

          {isLive && (
            <section className="edtp-form-card">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 sp_bottom_15">
                <div>
                  <h5 className="mb-1">Assign to Students</h5>
                  <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
                    Search, select students, then submit. Students see tests under My Tests.
                  </p>
                </div>
                <button
                  type="button"
                  className="default__button"
                  disabled={selectedStudentIds.length === 0}
                  onClick={() => void submitSelectedStudents()}
                >
                  Submit Selected ({selectedStudentIds.length})
                </button>
              </div>
              <SearchField
                value={studentSearch}
                onChange={setStudentSearch}
                placeholder="Search by name or email…"
              />
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
                <div className="d-flex flex-wrap gap-2 sp_bottom_20">
                  <button type="button" className="dashboard__small__btn__2" onClick={toggleAllStudents}>
                    {allStudentsSelected ? 'Clear All' : 'Select All'}
                  </button>
                  <button
                    type="button"
                    className="default__button"
                    disabled={selectedStudentIds.length === 0}
                    onClick={() => void submitSelectedStudents()}
                  >
                    Submit Selected ({selectedStudentIds.length})
                  </button>
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
    </>
  );
}
