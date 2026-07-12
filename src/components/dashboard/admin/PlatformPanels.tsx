import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { examinationService, platformService } from '@/services';
import { parseApiError } from '@/lib/errors';
import { FormError, inputClassName } from '@/components/ui/FormField';
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/context/AuthContext';
import * as yup from 'yup';

export function NotificationsPanel() {
  const [items, setItems] = useState<Awaited<ReturnType<typeof platformService.listNotifications>>['data']>([]);
  const [error, setError] = useState('');
  const [unread, setUnread] = useState(0);

  const load = async () => {
    try {
      const [list, count] = await Promise.all([
        platformService.listNotifications(1, 30),
        platformService.getUnreadCount(),
      ]);
      setItems(list.data);
      setUnread(count);
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (id: string) => {
    await platformService.markNotificationRead(id);
    await load();
  };

  const markAll = async () => {
    await platformService.markAllNotificationsRead();
    await load();
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

  const load = async () => {
    const [list, w] = await Promise.all([
      platformService.listPayments(1, 30),
      platformService.getWallet(),
    ]);
    setPayments(list.data);
    setWallet(w);
  };

  useEffect(() => {
    Promise.all([load(), platformService.getPaymentConfig()])
      .then(([, config]) => setPaymentConfig(config))
      .catch((err) => setError(parseApiError(err)));
  }, []);

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
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'EduTest Pro',
        description: 'Wallet Top-up',
        order_id: order.orderId,
        prefill: {
          email: user?.email,
          name: user ? `${user.firstName} ${user.lastName}` : undefined,
        },
        theme: { color: '#2563eb' },
        modal: { ondismiss: () => setPaying(false) },
        handler: async (response) => {
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
  password: yup.string().min(8).required(),
  firstName: yup.string().required(),
  lastName: yup.string().required(),
  role: yup.mixed<'student' | 'teacher' | 'org_admin'>().oneOf(['student', 'teacher', 'org_admin']).required(),
});

type CreateUserForm = yup.InferType<typeof createUserSchema>;

export function UsersManagementPanel() {
  const [users, setUsers] = useState<Awaited<ReturnType<typeof platformService.listUsers>>['data']>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateUserForm>({
    resolver: yupResolver(createUserSchema),
    defaultValues: { email: '', password: '', firstName: '', lastName: '', role: 'student' },
  });

  const load = async () => {
    try {
      const res = await platformService.listUsers(1, 50);
      setUsers(res.data);
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  useEffect(() => { load(); }, []);

  const onSubmit = async (values: CreateUserForm) => {
    setError('');
    try {
      await platformService.createUser(values);
      setMessage('User created.');
      reset();
      await load();
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title">
        <h4>User Management</h4>
        <span className="badge bg-primary">{users.length} users</span>
      </div>
      {error && <p className="login__error sp_bottom_15">{error}</p>}
      {message && <p className="form-success sp_bottom_15">{message}</p>}

      <div className="edtp-form-card">
        <h5>Add New User</h5>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row g-3">
            <div className="col-md-6 col-lg-3">
              <input className="register__input" placeholder="First name" {...register('firstName')} />
              <FormError message={errors.firstName?.message} />
            </div>
            <div className="col-md-6 col-lg-3">
              <input className="register__input" placeholder="Last name" {...register('lastName')} />
              <FormError message={errors.lastName?.message} />
            </div>
            <div className="col-md-6 col-lg-3">
              <input className="register__input" placeholder="Email" {...register('email')} />
              <FormError message={errors.email?.message} />
            </div>
            <div className="col-md-6 col-lg-2">
              <select className="form-select" {...register('role')}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="org_admin">Org Admin</option>
              </select>
            </div>
            <div className="col-md-6 col-lg-3">
              <input className="register__input" type="password" placeholder="Password" {...register('password')} />
              <FormError message={errors.password?.message} />
            </div>
            <div className="col-md-6 col-lg-2 d-flex align-items-start">
              <button type="submit" className="default__button w-100">Add User</button>
            </div>
          </div>
        </form>
      </div>

      <div className="edtp-user-grid d-lg-none">
        {users.map((u) => (
          <div key={u.id} className="edtp-user-card">
            <div className="edtp-user-card__avatar">
              {(u.first_name?.[0] ?? 'U').toUpperCase()}
            </div>
            <div className="edtp-user-card__name">{u.first_name} {u.last_name}</div>
            <div className="edtp-user-card__email">{u.email}</div>
            <div className="edtp-user-card__meta">
              {(u.roles as string[]).map((r) => (
                <span key={r} className="edtp-badge edtp-badge--role">{r}</span>
              ))}
              <span className={`edtp-badge ${u.status === 'active' ? 'edtp-badge--active' : 'edtp-badge--inactive'}`}>
                {u.status}
              </span>
            </div>
          </div>
        ))}
        {users.length === 0 && <p>No users found.</p>}
      </div>

      <div className="dashboard__table table-responsive d-none d-lg-block">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Roles</th><th>Status</th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.first_name} {u.last_name}</td>
                <td>{u.email}</td>
                <td>{(u.roles as string[]).join(', ')}</td>
                <td>
                  <span className={`edtp-badge ${u.status === 'active' ? 'edtp-badge--active' : 'edtp-badge--inactive'}`}>
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={4}>No users found.</td></tr>
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

  useEffect(() => {
    examinationService.listTests(1, 50).then((r) => setTests(r.data)).catch(() => undefined);
    platformService.getOrgOverviewReport().then(setOverview).catch(() => undefined);
  }, []);

  const loadReport = async (testId: string) => {
    setSelected(testId);
    try {
      const data = await platformService.getTestReport(testId);
      setReport(data);
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const exportCsv = async () => {
    if (!selected) return;
    const blob = await platformService.exportTestReport(selected);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-report-${selected}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
        <select className="form-select" value={selected} onChange={(e) => loadReport(e.target.value)}>
          <option value="">Select test for detailed report</option>
          {tests.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
        </select>
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

  useEffect(() => {
    platformService.listAuditLogs(1, 50)
      .then((r) => setLogs(r.data))
      .catch((err) => setError(parseApiError(err)));
  }, []);

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

  const load = async () => {
    try {
      const data = await platformService.listSessions();
      setSessions(data);
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  useEffect(() => { load(); }, []);

  const revoke = async (id: string) => {
    await platformService.revokeSession(id);
    await load();
  };

  const toggleMfa = async (enable: boolean) => {
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
  const { branches } = useOrganization();
  const [branchId, setBranchId] = useState('');
  const [departments, setDepartments] = useState<Awaited<ReturnType<typeof platformService.listDepartments>>['data']>([]);
  const [sessions, setSessions] = useState<Awaited<ReturnType<typeof platformService.listAcademicSessions>>['data']>([]);
  const [deptName, setDeptName] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (branches[0] && !branchId) setBranchId(branches[0].id);
    platformService.listAcademicSessions(1, 20).then((r) => setSessions(r.data)).catch(() => undefined);
  }, [branches, branchId]);

  useEffect(() => {
    if (!branchId) return;
    platformService.listDepartments(branchId).then((r) => setDepartments(r.data)).catch((err) => setError(parseApiError(err)));
  }, [branchId]);

  const addDept = async () => {
    if (!branchId || !deptName) return;
    await platformService.createDepartment(branchId, { name: deptName });
    setDeptName('');
    const r = await platformService.listDepartments(branchId);
    setDepartments(r.data);
  };

  const addSession = async () => {
    const year = new Date().getFullYear();
    await platformService.createAcademicSession({
      name: sessionName || `${year}-${year + 1}`,
      startDate: `${year}-04-01`,
      endDate: `${year + 1}-03-31`,
      isCurrent: true,
    });
    const r = await platformService.listAcademicSessions();
    setSessions(r.data);
    setSessionName('');
  };

  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title"><h4>Organization Structure</h4></div>
      {error && <p className="login__error sp_bottom_15">{error}</p>}
      <div className="row">
        <div className="col-md-6 sp_bottom_30">
          <h5>Departments</h5>
          <select className="form-select sp_bottom_15" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
            {branches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <div className="d-flex gap-2 sp_bottom_15">
            <input className="register__input" placeholder="Department name" value={deptName} onChange={(e) => setDeptName(e.target.value)} />
            <button type="button" className="default__button" onClick={addDept}>Add</button>
          </div>
          <ul>{departments.map((d) => <li key={d.id}>{d.name} {d.code && `(${d.code})`}</li>)}</ul>
        </div>
        <div className="col-md-6 sp_bottom_30">
          <h5>Academic Sessions</h5>
          <div className="d-flex gap-2 sp_bottom_15">
            <input className="register__input" placeholder="Session name" value={sessionName} onChange={(e) => setSessionName(e.target.value)} />
            <button type="button" className="default__button" onClick={addSession}>Add</button>
          </div>
          <ul>{sessions.map((s) => <li key={s.id}>{s.name} {s.is_current && '(current)'}</li>)}</ul>
        </div>
      </div>
    </div>
  );
}

export function TestBuilderPanel() {
  const { testId } = useParams();
  const [test, setTest] = useState<Record<string, unknown> | null>(null);
  const [questions, setQuestions] = useState<{ id: string; content?: { text?: string } }[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    if (!testId) return;
    try {
      const [t, q] = await Promise.all([
        examinationService.getTest(testId),
        examinationService.listQuestions(1, 100, 'approved'),
      ]);
      setTest(t as unknown as Record<string, unknown>);
      setQuestions(q.data);
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  useEffect(() => { load(); }, [testId]);

  const addQuestion = async (questionId: string) => {
    if (!testId) return;
    await examinationService.addQuestionToTest(testId, questionId);
    setMessage('Question added to test.');
    await load();
  };

  const publish = async () => {
    if (!testId) return;
    await examinationService.publishTest(testId);
    setMessage('Test published.');
    await load();
  };

  if (!testId) {
    return (
      <div className="dashboard__content__wraper">
        <p>Select a draft test from <Link to="/dashboard/teacher-course">My Tests</Link> to build it.</p>
      </div>
    );
  }

  const testQuestions = (test?.questions as { question_id: string }[]) ?? [];

  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title">
        <h4>Test Builder — {test?.title as string}</h4>
        <span>Status: {test?.status as string}</span>
      </div>
      {error && <p className="login__error sp_bottom_15">{error}</p>}
      {message && <p className="form-success sp_bottom_15">{message}</p>}
      <h5 className="sp_bottom_15">Questions in test ({testQuestions.length})</h5>
      <ul className="sp_bottom_30">
        {testQuestions.map((tq, i) => (
          <li key={tq.question_id}>Q{i + 1}: {tq.question_id}</li>
        ))}
      </ul>
      <h5 className="sp_bottom_15">Add from question bank</h5>
      <div className="dashboard__table table-responsive sp_bottom_20">
        <table>
          <thead><tr><th>Question</th><th /></tr></thead>
          <tbody>
            {questions.filter((q) => !testQuestions.some((tq) => tq.question_id === q.id)).map((q) => (
              <tr key={q.id}>
                <td>{q.content?.text}</td>
                <td>
                  <button type="button" className="default__button small-btn" onClick={() => addQuestion(q.id)}>
                    Add
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {(test?.status as string) === 'draft' && testQuestions.length > 0 && (
        <button type="button" className="default__button" onClick={publish}>Publish Test</button>
      )}
    </div>
  );
}

export function BrandingSettingsPanel() {
  const [facebook, setFacebook] = useState('');
  const [twitter, setTwitter] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    platformService.getSettings(['social_links', 'exam_rules']).then((rows) => {
      const social = rows.find((r) => r.key === 'social_links')?.value as Record<string, string> | undefined;
      if (social) {
        setFacebook(social.facebook ?? '');
        setTwitter(social.twitter ?? '');
      }
    }).catch(() => undefined);
  }, []);

  const save = async () => {
    await platformService.upsertSetting('social_links', { facebook, twitter, linkedin: '', instagram: '' });
    setMessage('Settings saved.');
  };

  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title"><h4>Branding & Integrations</h4></div>
      {message && <p className="form-success sp_bottom_15">{message}</p>}
      <div className="row">
        <div className="col-md-6 sp_bottom_15">
          <label>Facebook URL</label>
          <input className={inputClassName('register__input')} value={facebook} onChange={(e) => setFacebook(e.target.value)} />
        </div>
        <div className="col-md-6 sp_bottom_15">
          <label>Twitter URL</label>
          <input className={inputClassName('register__input')} value={twitter} onChange={(e) => setTwitter(e.target.value)} />
        </div>
        <div className="col-12">
          <button type="button" className="default__button" onClick={save}>Save Settings</button>
        </div>
      </div>
    </div>
  );
}
