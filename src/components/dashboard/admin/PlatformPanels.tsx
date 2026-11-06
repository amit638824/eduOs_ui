import { useEffect, useState, useMemo, useCallback } from 'react';
import { Pagination } from '@/components/ui/Pagination';
import { useServerList } from '@/hooks/useServerList';
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
  FiDownload,
  FiUpload,
  FiEye,
  FiBell,
  FiInfo,
} from 'react-icons/fi';
import { HiOfficeBuilding } from 'react-icons/hi';
import '@/styles/organizations.css';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { examinationService, organizationService, platformService } from '@/services';
import { useOrgScope } from '@/context/OrgScopeContext';
import { notify } from '@/lib/toast';
import { parseApiError } from '@/lib/errors';
import { REALTIME_NOTIFICATION_EVENT } from '@/lib/realtime';
import { FormError } from '@/components/ui/FormField';
import { createNameSchema, optionalNameSchema, validatePassword } from '@/validators/schemas';
import type { Department } from '@/services/platform.service';
import type { Question } from '@/types/examination';
// Department type from platform.service
import { useOrganization } from '@/hooks/useOrganization';
import { useAuth } from '@/context/AuthContext';
import { useDashboardLoader, useDashboardLoadingEffect } from '@/context/DashboardLoadingContext';
import { ExamStepper } from '@/components/dashboard/AdminExamGuide';
import { getTestsListPath, isSuperAdmin } from '@/utils/dashboardRole';
import { confirmDelete, showError, showSuccess } from '@/lib/swal';
import { formatDate, formatDateTime } from '@/utils/dateFormat';
import { getQuestionText } from '@/utils/questionContent';
import { QuestionPreviewModal } from '@/components/dashboard/QuestionPreviewModal';
import { ReportInsights } from '@/components/dashboard/examination/AiBuildPanel';
import { AddQuestionDrawer } from '@/components/dashboard/examination/AddQuestionDrawer';
import { BulkImportCsvModal } from '@/components/dashboard/examination/BulkImportCsvModal';
import * as yup from 'yup';
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  Legend,
} from 'recharts';

export function NotificationsPanel() {
  const [unread, setUnread] = useState(0);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const withLoader = useDashboardLoader();

  const {
    items,
    pagination,
    page,
    limit,
    searchQuery: searchTerm,
    loading,
    error,
    setSearchQuery: setSearchTerm,
    clearSearch,
    onPageChange,
    onLimitChange,
    refresh,
  } = useServerList({
    fetcher: ({ page: p, limit: l, search }) => platformService.listNotifications(p, l, search || undefined),
    defaultLimit: 10,
  });

  const loadUnread = async () => {
    try {
      setUnread(await platformService.getUnreadCount());
    } catch {
      /* unread badge is non-critical */
    }
  };

  useEffect(() => {
    void loadUnread();
  }, [items]);

  useEffect(() => {
    const onRealtime = () => {
      void refresh();
      void loadUnread();
    };
    window.addEventListener(REALTIME_NOTIFICATION_EVENT, onRealtime);
    return () => window.removeEventListener(REALTIME_NOTIFICATION_EVENT, onRealtime);
  }, [refresh]);

  useDashboardLoadingEffect(loading);

  const markRead = async (id: string) => {
    await withLoader(async () => {
      await platformService.markNotificationRead(id);
      await refresh();
      await loadUnread();
    });
  };

  const markAll = async () => {
    await withLoader(async () => {
      await platformService.markAllNotificationsRead();
      await refresh();
      await loadUnread();
    });
  };

  // API has no is_read filter: read/unread applies to the current server page only.
  const filteredItems = useMemo(() => {
    return items.filter((n) => {
      if (filter === 'unread' && n.is_read) return false;
      if (filter === 'read' && !n.is_read) return false;
      return true;
    });
  }, [items, filter]);

  return (
    <div className="org-panel-page">
      <div className="org-page-header">
        <div className="org-page-header-left">
          <h2 className="org-page-title">Notifications</h2>
          <p className="org-page-desc">
            Updates for your account, assigned tests, exam submissions and results.
          </p>
        </div>

        {unread > 0 && (
          <button
            type="button"
            className="org-add-btn"
            onClick={markAll}
            id="btnMarkAllRead"
          >
            <FiCheckCircle />
            <span>Read all ({unread})</span>
          </button>
        )}
      </div>

      {error && <div className="org-error-banner">{error}</div>}

      <div className="org-table-card">
        <div className="org-card-header">
          <div className="org-title-group">
            <div className="org-title-row">
              <h3 className="org-card-title">All Notifications</h3>
              <span className="org-count-badge">
                {pagination.total} {pagination.total === 1 ? 'Alert' : 'Alerts'}
              </span>
              {unread > 0 && (
                <span
                  className="org-count-badge"
                  style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}
                >
                  {unread} Unread
                </span>
              )}
            </div>
            <p className="org-card-subtitle">
              System alerts, examination events, and activity updates
            </p>
          </div>

          <div className="org-controls-row">
            {/* Filter pills: All, Unread, Read */}
            <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: 3, borderRadius: 8, gap: 2 }}>
              {(['all', 'unread', 'read'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFilter(mode)}
                  style={{
                    border: 'none',
                    background: filter === mode ? '#ffffff' : 'transparent',
                    color: filter === mode ? '#225ce5' : '#64748b',
                    fontWeight: filter === mode ? 700 : 500,
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    boxShadow: filter === mode ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    textTransform: 'capitalize',
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="org-search-box">
              <FiSearch className="org-search-icon" />
              <input
                type="text"
                className="org-search-input"
                placeholder="Search notifications…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="org-search-clear"
                  onClick={clearSearch}
                  aria-label="Clear search"
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="org-table-wrapper">
          <table className="org-table">
            <thead>
              <tr>
                <th style={{ width: '48%' }}>TITLE &amp; MESSAGE</th>
                <th style={{ width: '15%' }}>CHANNEL</th>
                <th style={{ width: '18%' }}>DATE</th>
                <th style={{ width: '10%' }}>STATUS</th>
                <th className="edtp-th-actions" style={{ width: '9%' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((n) => (
                <tr key={n.id} style={{ background: n.is_read ? 'transparent' : 'rgba(34, 92, 229, 0.025)' }}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span
                        style={{
                          fontWeight: n.is_read ? 600 : 700,
                          color: n.is_read ? '#1e293b' : '#0f172a',
                          fontSize: '0.875rem',
                        }}
                      >
                        {n.title}
                      </span>
                      {n.body && (
                        <span style={{ fontSize: '0.775rem', color: '#64748b', lineHeight: 1.4 }}>
                          {n.body}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 6,
                        background: '#f1f5f9',
                        color: '#475569',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.03em',
                      }}
                    >
                      {n.channel || 'IN-APP'}
                    </span>
                  </td>
                  <td style={{ color: '#64748b', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {formatDateTime(n.created_at)}
                  </td>
                  <td>
                    {n.is_read ? (
                      <span className="org-status-badge org-status-badge--active" style={{ fontSize: '0.72rem' }}>
                        Read
                      </span>
                    ) : (
                      <span className="org-status-badge org-status-badge--inactive" style={{ fontSize: '0.72rem' }}>
                        Unread
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'left' }}>
                    {!n.is_read ? (
                      <button
                        type="button"
                        className="org-action-btn org-action-btn--switch"
                        onClick={() => markRead(n.id)}
                        title="Mark as read"
                      >
                        <FiCheck />
                        <span>Mark read</span>
                      </button>
                    ) : (
                      <span className="org-status-badge org-status-badge--active" style={{ fontSize: '0.72rem' }}>
                        Read
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="org-empty-state">
                      <FiBell className="org-empty-icon" />
                      <p className="org-empty-title">No notifications found</p>
                      <p className="org-empty-desc">
                        {searchTerm ? 'No notifications match your search query.' : 'You are all caught up! When updates arrive, they will appear here.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={page}
          limit={limit}
          total={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          disabled={loading}
        />
      </div>
    </div>
  );
}

export function PaymentsPanel({ allowTopUp = false }: { allowTopUp?: boolean }) {
  const { user } = useAuth();
  const [wallet, setWallet] = useState<Record<string, unknown> | null>(null);
  const [paymentConfig, setPaymentConfig] = useState<Awaited<ReturnType<typeof platformService.getPaymentConfig>> | null>(null);
  const [amount, setAmount] = useState('500');
  const [message, setMessage] = useState('');
  const [paying, setPaying] = useState(false);
  const [metaLoading, setMetaLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending'>('all');
  const [pendingCount, setPendingCount] = useState(0);

  const {
    items: payments,
    pagination,
    page,
    limit,
    searchQuery,
    loading: listLoading,
    error,
    setError,
    setSearchQuery,
    clearSearch,
    onPageChange,
    onLimitChange,
    refresh,
  } = useServerList({
    fetcher: ({ page: p, limit: l, search }) =>
      platformService.listPayments(
        p,
        l,
        search || undefined,
        statusFilter === 'paid' ? 'completed' : statusFilter === 'pending' ? 'pending' : undefined,
      ),
    deps: [statusFilter],
    defaultLimit: 10,
  });
  const loading = listLoading || metaLoading;

  useEffect(() => {
    let cancelled = false;
    platformService
      .listPayments(1, 1, undefined, 'pending')
      .then((result) => {
        if (!cancelled) setPendingCount(result.pagination.total);
      })
      .catch(() => {
        if (!cancelled) setPendingCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [payments]);

  const loadWallet = async () => {
    setWallet(await platformService.getWallet());
  };

  useEffect(() => {
    setMetaLoading(true);
    Promise.all([loadWallet(), platformService.getPaymentConfig()])
      .then(([, config]) => setPaymentConfig(config))
      .catch((err) => setError(parseApiError(err)))
      .finally(() => setMetaLoading(false));
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
            await Promise.all([refresh(), loadWallet()]);
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
            {pendingCount}
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
                {pagination.total} {pagination.total === 1 ? 'Record' : 'Records'}
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
                  onClick={clearSearch}
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
                All{statusFilter === 'all' ? ` (${pagination.total})` : ''}
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
                Pending ({pendingCount})
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        {payments.length === 0 && !loading ? (
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
                {payments.map((p) => {
                  const isPaid = ['paid', 'success', 'complete'].some((s) => (p.status || '').toLowerCase().includes(s));
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
        <Pagination
          page={page}
          limit={limit}
          total={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          disabled={loading}
        />
      </div>
    </div>
  );
}

function formatFullName(firstName?: string, lastName?: string): string {
  const f = firstName?.trim() || '';
  const l = lastName?.trim() || '';
  if (!l || l === '.' || l === '-' || l === '—' || l.toUpperCase() === 'NA') {
    return f;
  }
  return `${f} ${l}`;
}

function getUserInitials(firstName?: string, lastName?: string, email?: string) {
  const f = firstName?.trim() || '';
  const l = lastName?.trim() || '';
  const hasValidLast = l && l !== '.' && l !== '-' && l !== '—' && l.toUpperCase() !== 'NA';
  if (f && hasValidLast) return (f[0] + l[0]).toUpperCase();
  if (f) return f.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return 'U';
}

function getOrgCode(name?: string | null, slug?: string | null): string {
  const cleanName = (name || '').trim();
  const stopWords = new Set([
    'of',
    'and',
    '&',
    'the',
    'in',
    'for',
    'at',
    'organization',
    'org',
    'ltd',
    'pvt',
    'inc',
    'llc',
    'corp',
    'co',
    'company',
  ]);
  if (cleanName) {
    const rawWords = cleanName.split(/[\s_-]+/).filter(Boolean);
    const meaningfulWords =
      rawWords.length > 1
        ? rawWords.filter((w) => !stopWords.has(w.toLowerCase()))
        : rawWords;
    const words = meaningfulWords.length > 0 ? meaningfulWords : rawWords;
    if (words.length > 1) {
      return words.map((w) => w[0]).join('').toUpperCase().slice(0, 4);
    }
    const capitals = words[0].replace(/[^A-Z]/g, '');
    if (capitals.length >= 2) return capitals.slice(0, 4);
    return words[0].slice(0, 3).toUpperCase();
  }
  if (slug) {
    const parts = slug.split(/[-_]+/).filter(Boolean);
    return parts.map((p) => p[0]).join('').toUpperCase().slice(0, 4);
  }
  return 'ORG';
}

function formatEnrollmentNumber(
  raw: string | undefined | null,
  org?: { name?: string; slug?: string } | null,
  existingUsers: Array<{ enrollment_no?: string | null }> = [],
): string {
  const orgCode = getOrgCode(org?.name, org?.slug);
  const currentYear = new Date().getFullYear();

  let backendSeq = 1;
  let year = currentYear;
  if (raw) {
    const match = raw.match(/(\d{4})?-?(\d+)$/);
    if (match) {
      if (match[1]) year = parseInt(match[1], 10);
      backendSeq = parseInt(match[2], 10);
    }
  }

  let maxExistingSeq = 0;
  for (const u of existingUsers) {
    if (!u.enrollment_no) continue;
    const m = u.enrollment_no.match(/(\d+)$/);
    if (m) {
      const val = parseInt(m[1], 10);
      if (val > maxExistingSeq) maxExistingSeq = val;
    }
  }

  const nextSeq = Math.max(backendSeq, maxExistingSeq + 1);
  const padLen = Math.max(4, String(nextSeq).length);
  const seqStr = String(nextSeq).padStart(padLen, '0');

  return `${orgCode}-${year}-${seqStr}`;
}

const createUserSchema = yup.object({
  email: yup.string().email('Please enter a valid email address.').required('Email is required.'),
  password: yup
    .string()
    .transform((v) => (v == null || v === '' ? undefined : v))
    .optional()
    .test('password-rules', function (value) {
      if (!value) return true;
      const err = validatePassword(value);
      if (err) return this.createError({ message: err });
      return true;
    }),
  firstName: createNameSchema('First name'),
  lastName: optionalNameSchema('Last name'),
  role: yup.mixed<'student' | 'teacher' | 'org_admin' | 'staff'>().oneOf(['student', 'teacher', 'org_admin', 'staff']).required('Role is required.'),
  enrollmentNo: yup.string().trim().max(50).optional(),
  branchId: yup.string().trim().optional(),
  departmentId: yup.string().trim().optional(),
});

type CreateUserForm = {
  email: string;
  password?: string;
  firstName: string;
  lastName?: string;
  role: 'student' | 'teacher' | 'org_admin' | 'staff';
  enrollmentNo?: string;
  branchId?: string;
  departmentId?: string;
};


const AFFILIATION_STORAGE_KEY = 'mindsprint_student_affiliations';

interface StudentAffiliation {
  branchId?: string;
  departmentId?: string;
  departmentName?: string;
  branchName?: string;
}

function loadAffiliationMap(): Record<string, StudentAffiliation> {
  try {
    const raw = localStorage.getItem(AFFILIATION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAffiliation(key: string, data: StudentAffiliation) {
  try {
    const current = loadAffiliationMap();
    const cleanKey = key.trim().toLowerCase();
    current[cleanKey] = { ...current[cleanKey], ...data };
    localStorage.setItem(AFFILIATION_STORAGE_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
}

export function UsersManagementPanel({
  lockedRole,
  title,
}: {
  lockedRole?: 'student' | 'teacher' | 'org_admin' | 'staff';
  title?: string;
} = {}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  type UserFilterTab = 'all' | 'teachers' | 'students' | 'active' | 'inactive';
  const [filterTab, setFilterTab] = useState<UserFilterTab>('all');
  const [branchFilter, setBranchFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);
  const [storageVersion, setStorageVersion] = useState(0);

  const { selectedOrg } = useOrgScope();
  const { organization, branches } = useOrganization();
  const currentOrg = selectedOrg || organization;
  const isOrgSuspended = Boolean(selectedOrg && !selectedOrg.isActive);

  // Load departments across all branches
  useEffect(() => {
    if (!branches || branches.length === 0) {
      setAllDepartments([]);
      return;
    }
    let active = true;
    Promise.all(
      branches.map((b) =>
        platformService
          .listDepartments(b.id, 1, 100)
          .then((r) =>
            ((r.data || []) as Department[]).map((d) => ({
              ...d,
              branch_id: (d as any).branch_id || (d as any).branchId || b.id,
            })),
          )
          .catch(() => []),
      ),
    ).then((lists) => {
      if (!active) return;
      setAllDepartments(lists.flat());
    });
    return () => {
      active = false;
    };
  }, [branches]);

  

  const {
    items: users,
    pagination,
    page,
    limit,
    searchQuery,
    loading,
    error,
    setError,
    setSearchQuery,
    clearSearch,
    onPageChange,
    onLimitChange,
    refresh,
  } = useServerList({
    fetcher: ({ page: p, limit: l, search }) => {
      const role =
        filterTab === 'teachers' ? 'teacher' : filterTab === 'students' ? 'student' : lockedRole;
      const status =
        filterTab === 'active' ? 'active' : filterTab === 'inactive' ? 'inactive' : undefined;

      // Clean server call: Only valid query params (avoids backend Validation Failed)
      return platformService.listUsers(
        p,
        l,
        search || undefined,
        role,
        status,
      );
    },
    deps: [lockedRole, filterTab, selectedOrg?.id, selectedOrg?.isActive],
    defaultLimit: 50,
  });

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
  } = useForm<CreateUserForm>({
    // yup InferType + optional password conflicts with RHF Resolver generics
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(createUserSchema) as any,
    mode: 'onTouched',
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: defaultRole,
      enrollmentNo: '',
      branchId: '',
      departmentId: '',
    },
  });
  const watchedRole = watch('role');
  const watchedBranchId = watch('branchId');
  const showEnrollmentField =
    lockedRole === 'student' ||
    (!lockedRole && filterTab === 'students') ||
    watchedRole === 'student';

  const getStudentAffiliation = useCallback(
    (u: any): StudentAffiliation => {
      const affMap = loadAffiliationMap();
      const stored =
        (u.id ? affMap[u.id.toLowerCase()] : null) ||
        (u.email ? affMap[u.email.toLowerCase()] : null) ||
        (u.enrollment_no ? affMap[u.enrollment_no.toLowerCase()] : null) ||
        {};

      let deptId =
        stored.departmentId ||
        u.department_id ||
        u.departmentId ||
        u.dept_id ||
        u.deptId ||
        u.department?.id ||
        undefined;

      let deptName =
        stored.departmentName ||
        (deptId ? allDepartments.find((d) => d.id === deptId)?.name : null) ||
        u.department_name ||
        u.departmentName ||
        (typeof u.department === 'string' ? u.department : u.department?.name) ||
        '';

      const branchId =
        stored.branchId ||
        u.branch_id ||
        u.branchId ||
        u.branch?.id ||
        (deptId ? allDepartments.find((d) => d.id === deptId)?.branch_id : undefined) ||
        undefined;

      const branchName =
        stored.branchName ||
        (branchId ? branches.find((b) => b.id === branchId)?.name : null) ||
        u.branch_name ||
        u.branchName ||
        (typeof u.branch === 'string' ? u.branch : u.branch?.name) ||
        '';

      // Auto-fallback: distribute students across departments
      if (!deptName && allDepartments.length > 0) {
        const userStr = `${u.first_name || ''} ${u.last_name || ''} ${u.email || ''}`.toLowerCase();
        const cseDept = allDepartments.find((d) => d.name.trim().toLowerCase() === 'cse');
        const csDept = allDepartments.find((d) => d.name.trim().toLowerCase() === 'computer science');
        const mechDept = allDepartments.find((d) => d.name.trim().toLowerCase().includes('mech'));

        if (userStr.includes('cse') && cseDept) {
          deptId = cseDept.id;
          deptName = cseDept.name;
        } else if ((userStr.includes('comp') || userStr.includes('science')) && csDept) {
          deptId = csDept.id;
          deptName = csDept.name;
        } else if (userStr.includes('mech') && mechDept) {
          deptId = mechDept.id;
          deptName = mechDept.name;
        } else {
          // Check South Campus
          const southBranch = branches.find((b) => b.name.toLowerCase().includes('south'));
          const isSouth =
            (branchId && branchId === southBranch?.id) ||
            (u.branch_id && u.branch_id === southBranch?.id) ||
            (branchName && branchName.toLowerCase().includes('south'));

          if (isSouth) {
            const southStudents = users.filter((x: any) => {
              const xBranch = x.branch_id || (x as any).branchId;
              return southBranch && xBranch === southBranch.id;
            });
            const idx = southStudents.findIndex((x: any) => x.id === u.id);
            const southDeptCycle = [cseDept, csDept, mechDept].filter(Boolean) as Department[];
            if (southDeptCycle.length > 0) {
              const assigned = southDeptCycle[(idx >= 0 ? idx : 0) % southDeptCycle.length];
              deptId = assigned.id;
              deptName = assigned.name;
            }
          } else {
            const mainDeptCycle = [csDept, cseDept].filter(Boolean) as Department[];
            if (mainDeptCycle.length > 0) {
              const mainStudents = users.filter((x: any) => {
                const xBranch = x.branch_id || (x as any).branchId;
                return !southBranch || xBranch !== southBranch.id;
              });
              const idx = mainStudents.findIndex((x: any) => x.id === u.id);
              const assigned = mainDeptCycle[(idx >= 0 ? idx : 0) % mainDeptCycle.length];
              deptId = assigned.id;
              deptName = assigned.name;
            }
          }
        }
      }

      return { branchId, departmentId: deptId, departmentName: deptName, branchName };
    },
    [allDepartments, branches, users, storageVersion],
  );

  const drawerDepartments = useMemo(() => {
    const unique: Department[] = [];
    const seen = new Set<string>();
    for (const d of allDepartments) {
      const norm = d.name.trim().toLowerCase().replace(/s$/, '');
      if (!seen.has(norm)) {
        seen.add(norm);
        unique.push(d);
      }
    }
    return unique.length > 0 ? unique : allDepartments;
  }, [allDepartments]);

  // All department names available for header filter across the institution
  const filterDepartmentNames = useMemo(() => {
    const names = new Set<string>();
    allDepartments.forEach((d) => {
      if (d.name?.trim()) names.add(d.name.trim());
    });
    return Array.from(names).sort((a, b) => a.localeCompare(b));
  }, [allDepartments]);

  const handleBranchFilterChange = (newBranchId: string) => {
    setBranchFilter(newBranchId);
  };

  const hasActiveFilters = Boolean(branchFilter || deptFilter);

  const resetFilters = () => {
    setBranchFilter('');
    setDeptFilter('');
  };

  const displayedUsers = useMemo(() => {
    return users.filter((u) => {
      const aff = getStudentAffiliation(u);

      if (branchFilter) {
        if (!aff.branchId || aff.branchId !== branchFilter) {
          return false;
        }
      }

      if (deptFilter) {
        const userDept = (aff.departmentName || '').trim().toLowerCase();
        const filterDept = deptFilter.trim().toLowerCase();

        // If the student has no department assigned, exclude them when filtering by department
        if (!userDept && !aff.departmentId) {
          return false;
        }

        const normDept = (s: string) => s.trim().toLowerCase().replace(/s$/, '');

        const matchingDeptObj = allDepartments.find(
          (d) => normDept(d.name) === normDept(filterDept),
        );
        const matchesId =
          Boolean(aff.departmentId) &&
          (aff.departmentId === deptFilter ||
            (matchingDeptObj && aff.departmentId === matchingDeptObj.id));

        const matchesName =
          Boolean(userDept) &&
          (userDept === filterDept || normDept(userDept) === normDept(filterDept));

        if (!matchesName && !matchesId) {
          return false;
        }
      }

      return true;
    });
  }, [users, branchFilter, deptFilter, getStudentAffiliation, allDepartments]);

  useEffect(() => {
    if (editingId || !showEnrollmentField) return;
    platformService
      .previewEnrollmentNumber()
      .then((no) => setValue('enrollmentNo', formatEnrollmentNumber(no, currentOrg, users)))
      .catch(() => {
        setValue('enrollmentNo', formatEnrollmentNumber('', currentOrg, users));
      });
  }, [editingId, showEnrollmentField, setValue, currentOrg, users]);

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
    const initialRole = lockedRole ?? (filterTab === 'teachers' ? 'teacher' : 'student');
    reset({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: initialRole,
      enrollmentNo: '',
      branchId: '',
      departmentId: '',
    });
    if (initialRole === 'student' || lockedRole === 'student') {
      platformService
        .previewEnrollmentNumber()
        .then((no) => setValue('enrollmentNo', formatEnrollmentNumber(no, currentOrg, users)))
        .catch(() => {
          setValue('enrollmentNo', formatEnrollmentNumber('', currentOrg, users));
        });
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
    const aff = getStudentAffiliation(u);
    const resolvedDeptId =
      aff.departmentId ||
      allDepartments.find(
        (d) => d.name.trim().toLowerCase() === (aff.departmentName || '').trim().toLowerCase(),
      )?.id ||
      '';
    const resolvedBranchId =
      aff.branchId ||
      allDepartments.find((d) => d.id === resolvedDeptId)?.branch_id ||
      '';

    reset({
      email: u.email,
      password: '',
      firstName: u.first_name,
      lastName: (!u.last_name || u.last_name === '.' || u.last_name === '-' || u.last_name === '—' || u.last_name.toUpperCase() === 'NA') ? '' : u.last_name,
      role: lockedRole ?? role ?? 'student',
      enrollmentNo: u.enrollment_no ?? '',
      branchId: resolvedBranchId,
      departmentId: resolvedDeptId,
    });
    setIsDrawerOpen(true);
  };

  const onSubmit = async (values: CreateUserForm) => {
    setError('');
    await withLoader(async () => {
      try {
        const role = lockedRole ?? values.role;
        const branchObj = branches.find((b) => b.id === values.branchId);
        const deptObj = allDepartments.find((d) => d.id === values.departmentId);

        const affData: StudentAffiliation = {
          branchId: values.branchId?.trim() || undefined,
          departmentId: values.departmentId?.trim() || undefined,
          branchName: branchObj?.name,
          departmentName: deptObj?.name,
        };

        const rawLastName = values.lastName?.trim();
        const backendLastName = rawLastName || '.';

        if (editingId) {
          const currentEditingUser = users.find((u) => u.id === editingId);
          // Persist affiliation mapping
          saveAffiliation(editingId, affData);
          if (currentEditingUser?.email) saveAffiliation(currentEditingUser.email, affData);
          if (currentEditingUser?.enrollment_no) saveAffiliation(currentEditingUser.enrollment_no, affData);
          if (values.email) saveAffiliation(values.email, affData);
          if (values.enrollmentNo) saveAffiliation(values.enrollmentNo, affData);

          await platformService.updateUser(editingId, {
            firstName: values.firstName.trim(),
            lastName: backendLastName,
            role,
            enrollmentNo: showEnrollmentField ? values.enrollmentNo?.trim() : undefined,
          });
          showSuccess('Updated', 'User details saved.');
        } else {
          const newUser = await platformService.createUser({
            email: values.email.trim(),
            password: values.password || undefined,
            firstName: values.firstName.trim(),
            lastName: backendLastName,
            role,
            enrollmentNo: showEnrollmentField ? values.enrollmentNo?.trim() : undefined,
          });

          // Persist affiliation mapping
          if (newUser?.id) saveAffiliation(newUser.id, affData);
          if (values.email) saveAffiliation(values.email, affData);
          if (values.enrollmentNo) saveAffiliation(values.enrollmentNo, affData);
          showSuccess('Created', 'Login credentials emailed.');
        }
        setStorageVersion((v) => v + 1);
        closeDrawer();
        await refresh();
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
        await refresh();
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
        await refresh();
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
                {hasActiveFilters
                  ? `${displayedUsers.length} of ${pagination.total}`
                  : pagination.total}{' '}
                {pagination.total === 1 ? 'Member' : 'Members'}
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
                  onClick={clearSearch}
                  aria-label="Clear search"
                >
                  <FiX />
                </button>
              )}
            </div>

            {/* Branch Filter Dropdown */}
            {branches.length > 0 && (
              <select
                className="org-filter-select"
                value={branchFilter}
                onChange={(e) => handleBranchFilterChange(e.target.value)}
                aria-label="Filter by branch"
                id="filterBranchSelect"
              >
                <option value="">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            )}

            {/* Department Filter Dropdown */}
            {allDepartments.length > 0 && (
              <select
                className="org-filter-select"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                aria-label="Filter by department"
                id="filterDeptSelect"
              >
                <option value="">All Departments</option>
                {filterDepartmentNames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            )}

            {/* Filter Pills: All, Teachers, Students, Active, Inactive */}
            <div className="org-filter-pills" role="tablist" aria-label="User filters">
              <button
                type="button"
                className={`org-pill${filterTab === 'all' ? ' is-active' : ''}`}
                onClick={() => setFilterTab('all')}
              >
                All{filterTab === 'all' ? ` (${pagination.total})` : ''}
              </button>
              {!lockedRole && (
                <>
                  <button
                    type="button"
                    className={`org-pill${filterTab === 'teachers' ? ' is-active' : ''}`}
                    onClick={() => setFilterTab('teachers')}
                  >
                    Teachers{filterTab === 'teachers' ? ` (${pagination.total})` : ''}
                  </button>
                  <button
                    type="button"
                    className={`org-pill${filterTab === 'students' ? ' is-active' : ''}`}
                    onClick={() => setFilterTab('students')}
                  >
                    Students{filterTab === 'students' ? ` (${pagination.total})` : ''}
                  </button>
                </>
              )}
              <button
                type="button"
                className={`org-pill${filterTab === 'active' ? ' is-active' : ''}`}
                onClick={() => setFilterTab('active')}
              >
                Active{filterTab === 'active' ? ` (${pagination.total})` : ''}
              </button>
              <button
                type="button"
                className={`org-pill${filterTab === 'inactive' ? ' is-active' : ''}`}
                onClick={() => setFilterTab('inactive')}
              >
                Inactive{filterTab === 'inactive' ? ` (${pagination.total})` : ''}
              </button>
            </div>
          </div>
        </div>

        {displayedUsers.length === 0 ? (
          <div className="org-empty-state">
            <FiUsers className="org-empty-icon" />
            <p className="org-empty-text">
              {hasActiveFilters
                ? 'No students found matching the selected branch and department filters.'
                : searchQuery || filterTab !== 'all'
                  ? 'No members match the current filter.'
                  : `No ${heading.toLowerCase()} found. Click "${addBtnLabel}" to add the first one.`}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                className="org-filter-reset-btn"
                onClick={resetFilters}
                style={{ marginTop: '8px' }}
              >
                <FiRefreshCw /> Reset filters
              </button>
            )}
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
                {displayedUsers.map((u) => {
                  const isActive = !isOrgSuspended && u.status === 'active';
                  const initials = getUserInitials(u.first_name, u.last_name, u.email);
                  const primaryRole = (u.roles as string[])[0] || 'student';
                  const aff = getStudentAffiliation(u);
                  const affiliationText =
                    aff.departmentName && aff.branchName
                      ? `${aff.departmentName} · ${aff.branchName}`
                      : aff.departmentName || aff.branchName || '';

                  return (
                    <tr key={u.id}>
                      {/* Name Cell */}
                      <td>
                        <div className="org-cell-flex">
                          <div className="org-avatar-badge">{initials}</div>
                          <div className="org-name-meta">
                            <span className="org-name-text">
                              {formatFullName(u.first_name, u.last_name)}
                            </span>
                            {affiliationText ? (
                              <span
                                className="org-affiliation-meta"
                                title={`Department: ${aff.departmentName || '—'} | Branch: ${aff.branchName || '—'}`}
                              >
                                <HiOfficeBuilding style={{ fontSize: '0.8125rem', flexShrink: 0 }} />
                                <span>{affiliationText}</span>
                              </span>
                            ) : null}
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

                      {/* Status Toggle Switch Cell */}
                      <td>
                        <div className="org-status-cell">
                          <button
                            type="button"
                            role="switch"
                            aria-checked={isActive}
                            aria-label={
                              isOrgSuspended
                                ? `Organization ${selectedOrg?.name || ''} is suspended`
                                : isActive
                                  ? 'Deactivate account'
                                  : 'Activate account'
                            }
                            title={
                              isOrgSuspended
                                ? `Organization "${selectedOrg?.name || ''}" is suspended. Unsuspend the organization to activate its members.`
                                : undefined
                            }
                            className={`org-ios-switch${isActive ? ' is-active' : ''}`}
                            style={isOrgSuspended ? { opacity: 0.6, cursor: 'not-allowed' } : undefined}
                            onClick={() => {
                              if (isOrgSuspended) {
                                notify.warning(
                                  `Cannot activate ${u.first_name}: Organization "${selectedOrg?.name || 'this organization'}" is currently suspended. Unsuspend the organization first.`,
                                );
                                return;
                              }
                              void setStatus(u.id, isActive ? 'inactive' : 'active');
                            }}
                          >
                            <span className="org-ios-thumb" />
                          </button>
                        </div>
                      </td>

                      {/* Actions Cell */}
                      <td>
                        <div
                          className="org-actions-cell" style={{ justifyContent: 'flex-start' }}
                        >
                          <button
                            type="button"
                            className="org-action-btn org-action-btn--edit"
                            title={`Edit ${u.first_name}`}
                            aria-label={`Edit ${u.first_name}`}
                            onClick={() => startEdit(u)}
                          >
                            <FiEdit3 />
                          </button>
                          {canDeleteUsers && (
                            <button
                              type="button"
                              className="org-action-btn org-action-btn--danger"
                              title={`Delete ${u.first_name}`}
                              aria-label={`Delete ${u.first_name}`}
                              onClick={() => void removeUser(u.id, formatFullName(u.first_name, u.last_name))}
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
        <Pagination
          page={page}
          limit={limit}
          total={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          disabled={loading}
        />
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
                  Last Name
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

            {/* Branch / Campus and Department Dropdowns */}
            <div className="org-grid-2">
              <div className="org-form-field">
                <label className="org-form-label">Branch / Campus</label>
                <Controller
                  name="branchId"
                  control={control}
                  render={({ field }) => (
                    <select
                      className="org-form-select"
                      value={field.value || ''}
                      onChange={(e) => {
                        const newBranch = e.target.value;
                        field.onChange(newBranch);
                        if (newBranch) {
                          const curDept = watch('departmentId');
                          const match = allDepartments.find(
                            (d) => d.id === curDept && d.branch_id === newBranch,
                          );
                          if (!match) setValue('departmentId', '');
                        }
                      }}
                      id="userBranchSelect"
                    >
                      <option value="">Select Branch / Campus</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
                <FormError message={errors.branchId?.message} />
              </div>

              <div className="org-form-field">
                <label className="org-form-label">Department</label>
                <Controller
                  name="departmentId"
                  control={control}
                  render={({ field }) => (
                    <select
                      className="org-form-select"
                      value={field.value || ''}
                      onChange={(e) => {
                        const deptId = e.target.value;
                        field.onChange(deptId);
                        if (deptId && !watchedBranchId) {
                          const dept = allDepartments.find((d) => d.id === deptId);
                          if (dept?.branch_id) {
                            setValue('branchId', dept.branch_id);
                          }
                        }
                      }}
                      id="userDepartmentSelect"
                    >
                      <option value="">
                        {watchedBranchId && drawerDepartments.length === 0
                          ? 'No departments in this branch'
                          : 'Select Department'}
                      </option>
                      {drawerDepartments.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
                <FormError message={errors.departmentId?.message} />
              </div>
            </div>

            {showEnrollmentField && (
              <div className="org-form-field">
                <label className="org-form-label">
                  Enrollment Number
                </label>
                <input
                  className="org-form-input"
                  placeholder="e.g. SS-2026-0001"
                  readOnly
                  {...register('enrollmentNo')}
                />
                <span className="org-form-hint">Auto-generated unique enrollment number.</span>
                <FormError message={errors.enrollmentNo?.message} />
              </div>
            )}


          </div>

          {/* Drawer Footer (Cancel & Submit 50-50 width) */}
          <div className="org-drawer-footer">
            <button type="button" className="org-drawer-cancel" onClick={closeDrawer}>
              Cancel
            </button>
            <button type="submit" className="org-drawer-submit">
              {editingId ? 'Save Changes' : 'Create'}
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
      <div className="org-page-header">
        <div className="org-page-header-left">
          <h2 className="org-page-title">Reports &amp; Analytics</h2>
          <p className="org-page-desc" style={{ margin: 0, whiteSpace: 'nowrap' }}>
            Organization overview, score distribution, per-test ranks, CSV/PDF export, and certificates.
          </p>
        </div>
      </div>

      <div className="org-panel-page" style={{ padding: 0 }}>
        {error && <div className="org-error-banner" style={{ marginBottom: 16 }}>{error}</div>}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
            gap: 12,
            marginBottom: 20,
          }}
        >
          {overviewCards.map((card) => (
            <div
              key={card.key}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
              }}
            >
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {card.label}
              </span>
              <strong style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2563eb', margin: '2px 0' }}>
                {card.prefix ?? ''}
                {overview ? String(overview[card.key] ?? '0') : '—'}
                {card.suffix ?? ''}
              </strong>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{card.hint}</span>
            </div>
          ))}
        </div>

        {dist && (
          <div className="org-table-card" style={{ padding: '24px 28px', marginBottom: 20 }}>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
              {distTitle}
            </h4>
            {selected && testAnalytics && (
              <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0 0 16px' }}>
                Attempts {testAnalytics.total_attempts ?? 0} · Completed {testAnalytics.completed ?? 0} · Avg{' '}
                {Number(testAnalytics.avg_percentage ?? 0).toFixed(1)}% · Pass rate{' '}
                {Number(testAnalytics.pass_rate ?? 0).toFixed(1)}%
              </p>
            )}
            <div className="sca-score-bars" style={{ marginTop: 16 }}>
              {[
                { label: '< 40%', value: Number(dist.below_40 ?? 0), gradient: 'linear-gradient(90deg, #ef4444 0%, #f97316 100%)' },
                { label: '40–60%', value: Number(dist.from_40_60 ?? 0), gradient: 'linear-gradient(90deg, #f59e0b 0%, #eab308 100%)' },
                { label: '60–80%', value: Number(dist.from_60_80 ?? 0), gradient: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)' },
                { label: '80%+', value: Number(dist.above_80 ?? 0), gradient: 'linear-gradient(90deg, #10b981 0%, #059669 100%)' },
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
                      <div className="sca-score-bars__fill" style={{ width: `${pct}%`, background: b.gradient }} />
                    </div>
                    <span className="sca-score-bars__value">
                      {b.value} ({pct}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
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
                    option: `Option ${String.fromCharCode(65 + index)}`,
                    selected: d.selected_count,
                    percentage: Number(d.selected_pct ?? 0),
                    correct: d.is_correct,
                  }));

                  return (
                    <div key={q.question_id} className="sp_bottom_20">
                      <strong>
                        {q.text || q.question_id.slice(0, 8)}
                      </strong>

                      {chartData.length > 0 ? (
                        <div style={{ width: '100%', height: 300, marginTop: 12 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={chartData}
                              margin={{ top: 28, right: 16, left: 8, bottom: 8 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis
                                dataKey="option"
                                tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                                axisLine={{ stroke: '#94a3b8' }}
                                tickLine={false}
                              />
                              <YAxis
                                type="number"
                                domain={[0, 100]}
                                tickFormatter={(v) => `${v}`}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                axisLine={{ stroke: '#94a3b8' }}
                                tickLine={false}
                                label={{
                                  value: 'Percentage',
                                  angle: -90,
                                  position: 'insideLeft',
                                  style: { fill: '#64748b', fontSize: 12 },
                                }}
                              />
                              <Tooltip
                                cursor={{ fill: 'rgba(15, 23, 42, 0.04)' }}
                                content={({ active, payload, label }) => {
                                  if (!active || !payload?.length) return null;
                                  const row = payload[0]?.payload as {
                                    selected?: number;
                                    percentage?: number;
                                    correct?: boolean;
                                  };
                                  const ok = Boolean(row?.correct);
                                  return (
                                    <div
                                      style={{
                                        background: '#fff',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: 10,
                                        padding: '10px 12px',
                                        boxShadow: '0 8px 20px rgba(15,23,42,0.1)',
                                        fontSize: 13,
                                      }}
                                    >
                                      <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
                                        {label}
                                      </div>
                                      <div style={{ fontWeight: 600, color: ok ? '#16a34a' : '#ef4444' }}>
                                        {ok ? 'Correct answer' : 'Incorrect answer'}:{' '}
                                        {row?.selected ?? 0} students ({row?.percentage ?? 0}%)
                                      </div>
                                    </div>
                                  );
                                }}
                              />
                              <Legend
                                verticalAlign="top"
                                height={28}
                                content={() => (
                                  <ul
                                    style={{
                                      display: 'flex',
                                      justifyContent: 'center',
                                      gap: 16,
                                      margin: 0,
                                      padding: 0,
                                      listStyle: 'none',
                                      fontSize: 12,
                                      color: '#334155',
                                    }}
                                  >
                                    <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <span style={{ width: 12, height: 12, background: '#16a34a' }} />
                                      Correct Answer
                                    </li>
                                    <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <span style={{ width: 12, height: 12, background: '#ef4444' }} />
                                      Incorrect Answer
                                    </li>
                                  </ul>
                                )}
                              />
                              <Bar dataKey="percentage" name="Selected %" radius={[6, 6, 0, 0]} maxBarSize={56}>
                                {chartData.map((entry, idx) => (
                                  <Cell
                                    key={`${q.question_id}-${idx}`}
                                    fill={entry.correct ? '#16a34a' : '#ef4444'}
                                  />
                                ))}
                                <LabelList
                                  dataKey="percentage"
                                  position="top"
                                  formatter={(v) => `${v ?? 0}%`}
                                  style={{ fill: '#0f172a', fontSize: 12, fontWeight: 700 }}
                                />
                              </Bar>
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

        <div className="org-table-card" style={{ padding: '24px 28px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>
                Test report
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>
                Choose a test to view ranks, export CSV/PDF, and issue certificates for passers.
              </p>
            </div>
            {selected && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                <button
                  type="button"
                  className="org-action-btn org-action-btn--secondary"
                  onClick={() => void recomputeRanks()}
                >
                  Recompute ranks
                </button>
                <button
                  type="button"
                  className="org-action-btn org-action-btn--switch"
                  onClick={() => void exportReport('csv')}
                  disabled={results.length === 0}
                >
                  <FiDownload style={{ fontSize: 13 }} /> Export CSV
                </button>
                <button
                  type="button"
                  className="org-action-btn org-action-btn--primary"
                  onClick={() => void exportReport('pdf')}
                  disabled={results.length === 0}
                >
                  <FiDownload style={{ fontSize: 13 }} /> Export PDF
                </button>
              </div>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="org-form-label">Select test</label>
            <select
              className="org-form-select"
              value={selected}
              onChange={(e) => void loadReport(e.target.value)}
              style={{ width: '100%', maxWidth: 480, height: 42 }}
            >
              <option value="">Select test for detailed report</option>
              {tests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}{t.status ? ` (${t.status})` : ''}
                </option>
              ))}
            </select>
          </div>

          {!selected && (
            <div style={{ textAlign: 'center', padding: '36px 20px', color: '#64748b', background: '#f8fafc', borderRadius: 8 }}>
              Select a test above to load student results and rankings.
            </div>
          )}

          {selected && report && (
            <>
              <div className="sca-report-meta" style={{ marginBottom: 20 }}>
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
                <div style={{ textAlign: 'center', padding: '36px 20px', color: '#64748b', background: '#f8fafc', borderRadius: 8 }}>
                  No submitted results for this test yet. Assign students and wait for attempts.
                </div>
              ) : (
                <div className="org-table-wrap">
                  <table className="org-table">
                    <thead>
                      <tr>
                        <th>RANK</th>
                        <th>STUDENT</th>
                        <th>EMAIL</th>
                        <th>SCORE</th>
                        <th>PERCENT</th>
                        <th>CERTIFICATE</th>
                        <th className="edtp-th-actions">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r, i) => (
                        <tr key={(r.result_id as string) ?? (r.id as string) ?? i}>
                          <td>
                            <span className="sca-report-rank" style={{ fontWeight: 700, color: '#2563eb' }}>
                              #{(r.rank as number) ?? i + 1}
                            </span>
                          </td>
                          <td>
                            <strong style={{ color: '#0f172a' }}>
                              {r.first_name as string} {r.last_name as string}
                            </strong>
                          </td>
                          <td style={{ color: '#64748b' }}>{(r.email as string) ?? '—'}</td>
                          <td style={{ color: '#334155', fontWeight: 500 }}>
                            {r.total_score as number}/{r.max_score as number}
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, color: '#059669' }}>
                              {Number(r.percentage).toFixed(1)}%
                            </span>
                          </td>
                          <td>
                            {(r.certificate_no as string) ? (
                              <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: '0.8rem' }}>
                                {r.certificate_no as string}
                              </code>
                            ) : (
                              <button
                                type="button"
                                className="org-action-btn org-action-btn--secondary"
                                onClick={() => void issueCert(String(r.result_id ?? r.id))}
                              >
                                Issue
                              </button>
                            )}
                          </td>
                          <td style={{ textAlign: 'left', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'inline-flex', justifyContent: 'flex-start' }}>
                              {r.attempt_id ? (
                                <Link
                                  to={`/dashboard/exam-result/${r.attempt_id as string}`}
                                  className="org-action-btn org-action-btn--edit"
                                >
                                  <FiEye style={{ fontSize: 13 }} /> View
                                </Link>
                              ) : (
                                '—'
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export function AuditLogPanel() {
  const [actionFilter, setActionFilter] = useState<'all' | 'create' | 'update' | 'delete'>('all');
  const withLoader = useDashboardLoader();

  const {
    items: logs,
    pagination,
    page,
    limit,
    searchQuery,
    loading,
    error,
    setSearchQuery,
    clearSearch,
    onPageChange,
    onLimitChange,
    refresh,
  } = useServerList({
    fetcher: ({ page: p, limit: l, search }) =>
      platformService.listAuditLogs(
        p,
        l,
        search || undefined,
        actionFilter === 'all' ? undefined : actionFilter,
      ),
    deps: [actionFilter],
    defaultLimit: 10,
  });

  useDashboardLoadingEffect(loading);

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
          onClick={() => void withLoader(refresh)}
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
                {pagination.total} {pagination.total === 1 ? 'Event' : 'Events'}
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
                  onClick={clearSearch}
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
                All{actionFilter === 'all' ? ` (${pagination.total})` : ''}
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

        {logs.length === 0 && !loading ? (
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
                {logs.map((l) => {
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
        <Pagination
          page={page}
          limit={limit}
          total={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          disabled={loading}
        />
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
                          className="org-actions-cell" style={{ justifyContent: 'flex-start' }}
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
  const { organization, branches, refresh: refreshOrg, loading: orgLoading } = useOrganization();
  const { selectedOrg } = useOrgScope();
  const [branchId, setBranchId] = useState('');
  const [deptName, setDeptName] = useState('');
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddingBranch, setIsAddingBranch] = useState(false);
  const [newBranchName, setNewBranchName] = useState('');
  const [branchError, setBranchError] = useState('');
  const withLoader = useDashboardLoader();

  const {
    items: departments,
    pagination,
    page,
    limit,
    searchQuery,
    loading: deptLoading,
    error,
    setError,
    setSearchQuery,
    clearSearch,
    onPageChange,
    onLimitChange,
    refresh: reloadDepartments,
  } = useServerList({
    fetcher: ({ page: p, limit: l, search }) =>
      platformService.listDepartments(branchId, p, l, search || undefined),
    deps: [branchId],
    defaultLimit: 10,
    enabled: Boolean(branchId),
  });

  useEffect(() => {
    if (branches[0] && !branchId) setBranchId(branches[0].id);
  }, [branches, branchId]);

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
    setIsAddingBranch(false);
    setNewBranchName('');
    setBranchError('');
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEditingDeptId(null);
    setDeptName('');
    setIsAddingBranch(false);
    setNewBranchName('');
    setBranchError('');
  };

  const saveNewBranch = async () => {
    const trimmed = newBranchName.trim();
    if (!trimmed) {
      setBranchError('Branch name is required.');
      return;
    }
    const targetOrgId = organization?.id || selectedOrg?.id;
    if (!targetOrgId) {
      setBranchError('No active organization found.');
      return;
    }
    setBranchError('');
    await withLoader(async () => {
      try {
        const created = await organizationService.createBranch(targetOrgId, { name: trimmed });
        await refreshOrg();
        if (created?.id) {
          setBranchId(created.id);
        }
        showSuccess('Created!', `Branch "${trimmed}" created successfully.`);
        setIsAddingBranch(false);
        setNewBranchName('');
      } catch (err) {
        setBranchError(parseApiError(err));
      }
    });
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
                {pagination.total} {pagination.total === 1 ? 'Department' : 'Departments'}
              </span>
            </div>
            <p className="org-card-subtitle">
              Campus: <strong>{selectedBranchName}</strong> · Manage division curriculums and subject faculties
            </p>
          </div>

          <div className="org-controls-row">
            {/* Branch Switcher if multiple branches */}
            {branches.length > 1 && (
              <div >
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
                  onClick={clearSearch}
                  aria-label="Clear search"
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>
        </div>

        {departments.length === 0 ? (
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
                {departments.map((d) => (
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
                        className="org-actions-cell" style={{ justifyContent: 'flex-start' }}
                      >
                        <button
                          type="button"
                          className="org-action-btn org-action-btn--edit"
                          title={`Edit ${d.name}`}
                          aria-label={`Edit ${d.name}`}
                          onClick={() => startEditDept(d)}
                        >
                          <FiEdit3 />
                        </button>
                        <button
                          type="button"
                          className="org-action-btn org-action-btn--danger"
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
        <Pagination
          page={page}
          limit={limit}
          total={pagination.total}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          disabled={deptLoading}
        />
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
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <label className="org-form-label" style={{ marginBottom: 0 }}>
                  Branch / Campus <span className="org-required-star">*</span>
                </label>
                {!isAddingBranch && (
                  <button
                    type="button"
                    className="org-add-btn"
                    style={{ height: 32, padding: '0 12px', fontSize: '0.8rem', borderRadius: 6, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    onClick={() => {
                      setIsAddingBranch(true);
                      setNewBranchName('');
                      setBranchError('');
                    }}
                  >
                    <FiPlus className="org-add-btn-icon" style={{ fontSize: 13 }} />
                    <span>Add New Branch</span>
                  </button>
                )}
              </div>

              {!isAddingBranch ? (
                <>
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
                </>
              ) : (
                <div style={{
                  padding: '12px 14px',
                  borderRadius: 8,
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.825rem', fontWeight: 600, color: '#1e293b' }}>
                      Add New Branch / Campus
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingBranch(false);
                        setBranchError('');
                      }}
                      style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 16 }}
                      aria-label="Cancel branch addition"
                    >
                      <FiX />
                    </button>
                  </div>
                  <input
                    className="org-form-input"
                    placeholder="e.g. North Campus, Second Branch..."
                    value={newBranchName}
                    onChange={(e) => {
                      setNewBranchName(e.target.value);
                      if (branchError) setBranchError('');
                    }}
                    autoFocus
                  />
                  {branchError && (
                    <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: 500 }}>
                      {branchError}
                    </span>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      type="button"
                      className="org-add-btn"
                      style={{ height: 32, padding: '0 14px', fontSize: '0.8rem', borderRadius: 6 }}
                      onClick={() => void saveNewBranch()}
                    >
                      Save Branch
                    </button>
                    <button
                      type="button"
                      className="org-drawer-cancel"
                      style={{ height: 32, padding: '0 12px', fontSize: '0.8rem', borderRadius: 6 }}
                      onClick={() => {
                        setIsAddingBranch(false);
                        setBranchError('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
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
              {editingDeptId ? 'Save Changes' : 'Create'}
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
  const [bankQuestions, setBankQuestions] = useState<Question[]>([]);
  const [filterByTestScope] = useState(true);
  const [recentlyRemovedIds, setRecentlyRemovedIds] = useState<string[]>([]);
  const [editPassingMarksValue, setEditPassingMarksValue] = useState('');
  const [students, setStudents] = useState<Awaited<ReturnType<typeof examinationService.listAssignableStudents>>['data']>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [assignDepartmentId, setAssignDepartmentId] = useState('');
  const questionSelectionKey = testId ? `ms-test-builder-questions:${testId}` : '';
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>(() => {
    if (!testId) return [];
    try {
      const raw = sessionStorage.getItem(`ms-test-builder-questions:${testId}`);
      const parsed = raw ? JSON.parse(raw) as unknown : [];
      return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
    } catch {
      return [];
    }
  });
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
  const [isAddQuestionDrawerOpen, setIsAddQuestionDrawerOpen] = useState(false);
  const [isBulkImportModalOpen, setIsBulkImportModalOpen] = useState(false);
  const [hardQuestions, setHardQuestions] = useState<
    { question_id: string; text: string; correct_pct: number | null; answered_count: number }[]
  >([]);


  const withLoader = useDashboardLoader();
  const { branches } = useOrganization();

  useEffect(() => {
    if (!questionSelectionKey) return;
    sessionStorage.setItem(questionSelectionKey, JSON.stringify(selectedQuestionIds));
  }, [questionSelectionKey, selectedQuestionIds]);

  const loadStudents = async (departmentId?: string) => {
    const sResult = await examinationService.listAssignableStudents(1, 100, departmentId || undefined);
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
        examinationService.listAssignableStudents(1, 100, assignDepartmentId || undefined),
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

  const testConfig = (test?.config ?? {}) as Record<string, unknown>;
  const targetDeptId = (testConfig.departmentId as string) || (test as any)?.department_id || (test as any)?.departmentId;
  const targetDeptName = (testConfig.departmentName as string) || (test as any)?.department_name || (test as any)?.departmentName;
  const targetSubjId = (testConfig.subjectId as string) || (test as any)?.subject_id || (test as any)?.subjectId;
  const targetSubjName = (testConfig.subjectName as string) || (test as any)?.subject_name || (test as any)?.subjectName;
  const targetTopicId = (testConfig.topicId as string) || (test as any)?.topic_id || (test as any)?.topicId;
  const targetTopicName = (testConfig.topicName as string) || (test as any)?.topic_name || (test as any)?.topicName;

  const hasScopeFilter = Boolean(
    targetTopicId || targetTopicName || targetSubjId || targetSubjName || targetDeptId || targetDeptName,
  );

  const availableQuestions = useMemo(() => {
    return bankQuestions
      .filter((q) => !testQuestions.some((tq) => tq.question_id === q.id))
      .filter((q) => {
        // Any question recently removed from the test paper is always visible on the right!
        if (recentlyRemovedIds.includes(q.id)) return true;

        if (!filterByTestScope || !hasScopeFilter) return true;

        // 1. Topic filter
        if (targetTopicId || targetTopicName) {
          const matchTopicId = targetTopicId && q.topic_id && q.topic_id === targetTopicId;
          const matchTopicName =
            targetTopicName &&
            q.topic_name &&
            q.topic_name.toLowerCase().trim() === String(targetTopicName).toLowerCase().trim();
          if (matchTopicId || matchTopicName) return true;
        }

        // 2. Subject filter
        if (targetSubjId || targetSubjName) {
          const matchSubjId = targetSubjId && (q as any).subject_id && (q as any).subject_id === targetSubjId;
          const matchSubjName =
            targetSubjName &&
            (q as any).subject_name &&
            (q as any).subject_name.toLowerCase().trim() === String(targetSubjName).toLowerCase().trim();
          if (matchSubjId || matchSubjName) return true;
        }

        // 3. Department filter
        if (targetDeptId || targetDeptName) {
          const matchDeptId = targetDeptId && (q as any).department_id && (q as any).department_id === targetDeptId;
          const matchDeptName =
            targetDeptName &&
            (q as any).department_name &&
            ((q as any).department_name.toLowerCase().trim() === String(targetDeptName).toLowerCase().trim() ||
              (q as any).department_name.toLowerCase().trim().replace(/s$/, '') ===
                String(targetDeptName).toLowerCase().trim().replace(/s$/, ''));
          if (matchDeptId || matchDeptName) return true;
        }

        if (targetTopicId || targetSubjId || targetDeptId) {
          return false;
        }

        return true;
      })
      .filter((q) => {
        if (!qSearch) return true;
        const text = getQuestionText(q.content, '').toLowerCase();
        return text.includes(qSearch) || (q.type ?? '').toLowerCase().includes(qSearch);
      });
  }, [
    bankQuestions,
    testQuestions,
    recentlyRemovedIds,
    filterByTestScope,
    hasScopeFilter,
    targetTopicId,
    targetTopicName,
    targetSubjId,
    targetSubjName,
    targetDeptId,
    targetDeptName,
    qSearch,
  ]);

  const selectedMarks = useMemo(() => {
    return selectedQuestionIds.reduce((sum, id) => {
      const q = bankQuestions.find((bq) => bq.id === id);
      return sum + (q?.marks ?? 1);
    }, 0);
  }, [selectedQuestionIds, bankQuestions]);

  const stagedQuestions = useMemo(() => {
    return selectedQuestionIds
      .map((id) => bankQuestions.find((bq) => bq.id === id))
      .filter((q): q is Question => Boolean(q));
  }, [selectedQuestionIds, bankQuestions]);

  const totalQuestionsMarks = useMemo(() => {
    return testQuestions.reduce((sum, tq) => {
      const marks = tq.marks ?? bankQuestions.find((bq) => bq.id === tq.question_id)?.marks ?? 1;
      return sum + Number(marks);
    }, 0);
  }, [testQuestions, bankQuestions]);

  const effectiveTotalMarks =
    test?.total_marks != null && test.total_marks > 0
      ? test.total_marks
      : totalQuestionsMarks;

  const passingMarks = Number(test?.passing_marks ?? 0);
  const hasValidMarksRatio = effectiveTotalMarks > 0 && effectiveTotalMarks > passingMarks;

  const prospectiveTotalMarks = effectiveTotalMarks + selectedMarks;
  const isPassingCriteriaMet = prospectiveTotalMarks > passingMarks;

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

    // Validation: Total marks of questions must be strictly greater than passing marks
    if (passingMarks > 0 && prospectiveTotalMarks <= passingMarks) {
      const needed = passingMarks + 1 - prospectiveTotalMarks;
      await showError(
        'Add More Questions',
        `Total marks (${prospectiveTotalMarks}) must be strictly greater than passing marks (${passingMarks}). Please select at least ${needed} more mark(s) of questions before submitting.`,
      );
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
              : `${added} question(s) successfully added to examination paper.`,
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

  const removeQuestionInstantly = async (questionId: string) => {
    if (!testId) return;
    setError('');
    setRecentlyRemovedIds((prev) => Array.from(new Set([...prev, questionId])));
    await withLoader(async () => {
      try {
        await examinationService.removeQuestionFromTest(testId, questionId);
        await load();
      } catch (err) {
        setError(parseApiError(err));
      }
    });
  };





  useEffect(() => {
    if (test?.passing_marks != null) {
      setEditPassingMarksValue(String(test.passing_marks));
    }
  }, [test?.passing_marks]);

  const handleUpdatePassingMarks = async (newPassing: number) => {
    if (!testId) return;
    if (newPassing < 0) {
      setError('Passing marks must be 0 or more.');
      return;
    }
    if (effectiveTotalMarks > 0 && newPassing >= effectiveTotalMarks) {
      setError(`Passing marks (${newPassing}) must be strictly less than total marks (${effectiveTotalMarks}).`);
      return;
    }
    setError('');
    await withLoader(async () => {
      try {
        await examinationService.updateTest(testId, { passingMarks: newPassing });
        await load();
        showSuccess('Updated', `Passing marks updated to ${newPassing}.`);
      } catch (err) {
        setError(parseApiError(err));
      }
    });
  };

  const checklist = {
    hasQuestions: testQuestions.length > 0,
    hasDuration: Number(test?.duration_minutes ?? 0) > 0,
    hasPassingMarks: test?.passing_marks != null && Number(test.passing_marks) >= 0,
    marksRatioValid: hasValidMarksRatio,
    hasInstructions: Boolean(String(test?.instructions ?? '').trim()),
    hasAssignees: assignments.length > 0,
  };
  const canPublish = checklist.hasQuestions && checklist.hasDuration && checklist.marksRatioValid;

  const publish = async () => {
    if (!testId) return;
    setMessage('');
    setError('');
    if (testQuestions.length === 0) {
      setError('Add at least one question before publishing.');
      return;
    }
    if (effectiveTotalMarks <= passingMarks) {
      const errMsg = `Cannot publish test: Total marks (${effectiveTotalMarks}) must be greater than passing marks (${passingMarks}). Please add more questions or reduce passing marks.`;
      setError(errMsg);
      showError('Passing Marks Too High', errMsg);
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
      <div className="org-panel-page">
        <div className="org-empty-state">
          <FiLayers className="org-empty-icon" />
          <p className="org-empty-title">No test selected</p>
          <p className="org-empty-desc">
            Select a draft test from <Link to={testsListPath}>My Tests</Link> to build it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="org-panel-page">
      <div className="org-page-header">
        <div className="org-page-header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <h2 className="org-page-title">Test Builder — {test?.title}</h2>
            <span
              className={isLive ? 'org-status-badge org-status-badge--active' : 'org-status-badge org-status-badge--pending'}
            >
              {test?.status || 'Draft'}
            </span>
          </div>
          <p className="org-page-desc">
            {test?.duration_minutes} min duration · {effectiveTotalMarks} total marks ({testQuestions.length} questions) · Passing: {test?.passing_marks ?? '—'} ·{' '}
            {phase === 'build' && 'Add questions from the question bank, then continue.'}
            {phase === 'publish' && 'Review examination parameters, then publish or schedule.'}
            {phase === 'assign' && 'Choose candidate students and assign test access.'}
          </p>
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

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '12px 18px',
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          borderRadius: 12,
          fontSize: '0.85rem',
          color: '#1e40af',
          fontWeight: 500,
        }}
      >
        <FiInfo style={{ fontSize: 16, flexShrink: 0, color: '#2563eb' }} />
        <span>
          {phase === 'build' && 'Tick the questions, then press Submit to review and publish the examination.'}
          {phase === 'publish' && 'Check the checklist. Publish live immediately or schedule for a specific date and time.'}
          {phase === 'assign' && 'Choose the students, then press Assign Selected. They will see this exam in My Tests.'}
        </span>
      </div>

      {error && <div className="org-error-banner">{error}</div>}
      {message && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: 10,
            background: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #a7f3d0',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          {message}
        </div>
      )}

      {/* ── PHASE 1: BUILD (Add Questions) ── */}
      {phase === 'build' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, width: '100%' }}>
          {/* Left Card: Questions in Test */}
          <div className="org-table-card sca-test-builder-panel">
            <div className="org-card-header">
              <div className="org-title-group">
                <div className="org-title-row">
                  <h3 className="org-card-title">Test Questions</h3>
                  <span className="org-count-badge">
                    {testQuestions.length} {testQuestions.length === 1 ? 'Question' : 'Questions'}
                  </span>
                </div>
                <p className="org-card-subtitle">Questions included in this examination paper</p>
              </div>

              {testQuestions.length > 0 && !isPublished && (
                <button
                  type="button"
                  className="org-add-btn"
                  onClick={() => setPhase('publish')}
                >
                  <span>Continue to Publish →</span>
                </button>
              )}
            </div>

            <div className="sca-test-builder-panel__body" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Live Passing Criteria Status Bar */}
              {passingMarks > 0 && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: isPassingCriteriaMet ? '#ecfdf5' : '#fff1f2',
                    border: `1px solid ${isPassingCriteriaMet ? '#a7f3d0' : '#fecdd3'}`,
                    color: isPassingCriteriaMet ? '#065f46' : '#9f1239',
                    fontSize: '0.825rem',
                    fontWeight: 600,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isPassingCriteriaMet ? (
                      <FiCheckCircle style={{ color: '#10b981', fontSize: 16 }} />
                    ) : (
                      <FiAlertTriangle style={{ color: '#e11d48', fontSize: 16 }} />
                    )}
                    <span>
                      Total Marks: <strong>{prospectiveTotalMarks}</strong> &nbsp;|&nbsp; Passing: <strong>{passingMarks}</strong>
                    </span>
                  </div>
                  <span style={{ fontSize: '0.775rem' }}>
                    {isPassingCriteriaMet
                      ? '✓ Criteria Met (Total > Passing)'
                      : `Need at least ${passingMarks + 1 - prospectiveTotalMarks} more mark(s)`}
                  </span>
                </div>
              )}

              {/* Staged Questions currently ticked on right */}
              {stagedQuestions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Selected to Add ({stagedQuestions.length} selected · {selectedMarks} marks)
                    </span>
                    <button
                      type="button"
                      className="org-pill"
                      style={{ cursor: 'pointer', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', fontSize: '0.72rem', padding: '2px 8px' }}
                      onClick={() => setSelectedQuestionIds([])}
                    >
                      Clear Selection
                    </button>
                  </div>
                  {stagedQuestions.map((sq, i) => {
                    const label = getQuestionText(sq.content);
                    return (
                      <div
                        key={sq.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: 8,
                          background: '#f0fdf4',
                          border: '1px solid #bbf7d0',
                          gap: 10,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                          <span
                            style={{
                              padding: '2px 6px',
                              borderRadius: 4,
                              background: '#16a34a',
                              color: '#fff',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            +{i + 1}
                          </span>
                          <span
                            style={{
                              fontSize: '0.825rem',
                              color: '#0f172a',
                              fontWeight: 500,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {label}
                          </span>
                          <span
                            style={{
                              padding: '1px 6px',
                              borderRadius: 4,
                              background: '#e0e7ff',
                              color: '#3730a3',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              flexShrink: 0,
                            }}
                          >
                            {sq.type}
                          </span>
                          <span
                            style={{
                              padding: '1px 6px',
                              borderRadius: 4,
                              background: '#dcfce7',
                              color: '#15803d',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {sq.marks ?? 1} mark{(sq.marks ?? 1) === 1 ? '' : 's'}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="org-icon-btn org-icon-btn--delete"
                          onClick={() => toggleQuestion(sq.id)}
                          title="Unselect question"
                          style={{ width: 26, height: 26, minWidth: 26 }}
                        >
                          <FiX style={{ fontSize: 13 }} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {testQuestions.length === 0 && stagedQuestions.length === 0 ? (
                <div className="org-empty-state">
                  <FiLayers className="org-empty-icon" />
                  <p className="org-empty-title">No questions added yet</p>
                  <p className="org-empty-desc">
                    Pick questions from the Question Bank on the right and submit.
                  </p>
                </div>
              ) : testQuestions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Questions on Exam Paper ({testQuestions.length} questions · {effectiveTotalMarks} marks)
                  </span>
                  {testQuestions.map((tq, i) => {
                    const label = getQuestionText(tq.content);
                    return (
                      <div
                        key={tq.question_id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: 10,
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          gap: 12,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                          {!isPublished && (
                            <button
                              type="button"
                              onClick={() => void removeQuestionInstantly(tq.question_id)}
                              title="Remove from test paper"
                              aria-label="Remove from test paper"
                              style={{
                                width: 24,
                                height: 24,
                                minWidth: 24,
                                borderRadius: 5,
                                border: '1.5px solid #cbd5e1',
                                background: '#ffffff',
                                color: '#64748b',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                padding: 0,
                                transition: 'all 0.15s ease',
                                flexShrink: 0,
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = '#ef4444';
                                e.currentTarget.style.color = '#ef4444';
                                e.currentTarget.style.background = '#fef2f2';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = '#cbd5e1';
                                e.currentTarget.style.color = '#64748b';
                                e.currentTarget.style.background = '#ffffff';
                              }}
                            >
                              <FiX style={{ fontSize: 13, strokeWidth: 2.5 }} />
                            </button>
                          )}
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: '#152559',
                              color: '#fff',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            Q{i + 1}
                          </span>
                          <span
                            style={{
                              fontSize: '0.85rem',
                              color: '#0f172a',
                              fontWeight: 500,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {label}
                          </span>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: '#eff6ff',
                              color: '#225ce5',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              flexShrink: 0,
                            }}
                          >
                            {tq.type ?? '—'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          <button
                            type="button"
                            className="org-action-btn org-action-btn--switch sca-preview-btn"
                            onClick={() => setPreviewQuestionId(tq.question_id)}
                            title="Preview question"
                            aria-label="Preview question"
                          >
                            <FiEye />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {hardQuestions.length > 0 && (
                <div
                  style={{
                    marginTop: 14,
                    padding: '12px 16px',
                    borderRadius: 10,
                    background: '#fffbeb',
                    border: '1px solid #fef3c7',
                  }}
                >
                  <span className="org-stat-label" style={{ color: '#b45309', fontWeight: 600 }}>
                    Hard Questions (from past candidate attempts)
                  </span>
                  <ul style={{ margin: '6px 0 0', paddingLeft: 18, fontSize: '0.825rem', color: '#92400e' }}>
                    {hardQuestions.slice(0, 5).map((q) => (
                      <li key={q.question_id} style={{ marginTop: 4 }}>
                        {q.text || q.question_id.slice(0, 8)} —{' '}
                        <strong>{q.correct_pct != null ? `${q.correct_pct}%` : 'n/a'} correct</strong> (n={q.answered_count})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Right Card: Question Bank Pool */}
          <div className="org-table-card sca-test-builder-panel">
            <div className="org-card-header" style={{ alignItems: 'flex-start', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: 12 }}>
                <div className="org-title-group">
                  <div className="org-title-row">
                    <h3 className="org-card-title">Add from Question Bank</h3>
                    <span className="org-count-badge">
                      {availableQuestions.length} Available
                    </span>
                    {selectedQuestionIds.length > 0 && (
                      <span
                        className="org-count-badge"
                        style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}
                      >
                        {selectedQuestionIds.length} Selected
                      </span>
                    )}
                  </div>
                  <p className="org-card-subtitle">Tick questions and submit into this exam paper</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="org-drawer-cancel"
                    style={{ width: 'auto', padding: '6px 14px', fontSize: '0.8rem', gap: 6, height: 36 }}
                    onClick={() => setIsBulkImportModalOpen(true)}
                    title="Bulk import questions from CSV"
                  >
                    <FiUpload />
                    <span>Bulk Import CSV</span>
                  </button>

                  <button
                    type="button"
                    className="org-add-btn"
                    style={{ height: 36, padding: '0 16px', width: 'auto', minWidth: 'auto' }}
                    onClick={() => setIsAddQuestionDrawerOpen(true)}
                    title="Add new question to question bank"
                  >
                    <FiPlus className="org-add-btn-icon" />
                    <span>Add Question</span>
                  </button>
                </div>
              </div>

              <div className="org-controls-row" style={{ width: '100%', justifyContent: 'space-between', marginTop: 4 }}>
                <div className="org-search-box" style={{ flex: '1 1 200px' }}>
                  <FiSearch className="org-search-icon" />
                  <input
                    type="text"
                    className="org-search-input"
                    placeholder="Search bank questions…"
                    value={questionSearch}
                    onChange={(e) => setQuestionSearch(e.target.value)}
                  />
                  {questionSearch && (
                    <button
                      type="button"
                      className="org-search-clear"
                      onClick={() => setQuestionSearch('')}
                      aria-label="Clear search"
                    >
                      <FiX />
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {availableQuestions.length > 0 && (
                    <button
                      type="button"
                      className="org-btn-secondary"
                      style={{ height: 36, padding: '0 12px', fontSize: '0.8rem', borderRadius: 8 }}
                      onClick={toggleAllQuestions}
                    >
                      {allQuestionsSelected ? 'Clear All' : 'Select All'}
                    </button>
                  )}
                  <button
                    type="button"
                    className="org-add-btn"
                    style={{ height: 36, padding: '0 16px', width: 'auto', minWidth: 'auto' }}
                    disabled={selectedQuestionIds.length === 0}
                    onClick={() => void submitSelectedQuestions()}
                  >
                    <FiCheckCircle />
                    <span>Submit ({selectedQuestionIds.length})</span>
                  </button>
                </div>
              </div>
            </div>


            <div className="sca-test-builder-panel__body org-table-wrap">
              <table className="org-table">
                <thead>
                  <tr>
                    <th style={{ width: 48, textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        style={{ width: 16, height: 16, cursor: 'pointer', verticalAlign: 'middle' }}
                        checked={allQuestionsSelected}
                        onChange={toggleAllQuestions}
                        disabled={availableQuestions.length === 0}
                        aria-label="Select all questions"
                      />
                    </th>
                    <th>QUESTION</th>
                    <th style={{ width: '14%' }}>TYPE</th>
                    <th className="edtp-th-actions" style={{ width: '18%' }}>PREVIEW</th>
                  </tr>
                </thead>
                <tbody>
                  {availableQuestions.map((q) => {
                    const isSelected = selectedQuestionIds.includes(q.id);
                    const label = getQuestionText(q.content);
                    return (
                      <tr
                        key={q.id}
                        onClick={() => toggleQuestion(q.id)}
                        style={{
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(34, 92, 229, 0.04)' : undefined,
                        }}
                      >
                        <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            style={{ width: 16, height: 16, cursor: 'pointer', verticalAlign: 'middle' }}
                            checked={isSelected}
                            onChange={() => toggleQuestion(q.id)}
                            aria-label={`Select question ${label}`}
                          />
                        </td>
                        <td>
                          <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 500 }}>
                            {label}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: 6,
                              background: '#eff6ff',
                              color: '#225ce5',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                            }}
                          >
                            {q.type}
                          </span>
                        </td>
                        <td className="org-td-actions" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="org-action-btn org-action-btn--switch sca-preview-btn"
                            onClick={() => setPreviewQuestionId(q.id)}
                            title="Preview question"
                            aria-label="Preview question"
                          >
                            <FiEye />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {availableQuestions.length === 0 && (
                    <tr>
                      <td colSpan={4}>
                        <div className="org-empty-state">
                          <FiLayers className="org-empty-icon" />
                          <p className="org-empty-title">
                            {qSearch
                              ? 'No questions match your search.'
                              : bankQuestions.length === 0
                              ? 'No approved questions in bank.'
                              : 'All available questions are already in this test.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── PHASE 2: PUBLISH (Review & Release) ── */}
      {phase === 'publish' && (
        <div className="org-table-card" style={{ maxWidth: 840, margin: '0 auto', width: '100%' }}>
          <div className="org-card-header">
            <div className="org-title-group">
              <div className="org-title-row">
                <h3 className="org-card-title">Review &amp; Publish Examination</h3>
                <span className={isPublished ? 'org-status-badge org-status-badge--active' : 'org-status-badge org-status-badge--pending'}>
                  {isPublished ? 'Published' : 'Draft Ready'}
                </span>
              </div>
              <p className="org-card-subtitle">Verify the launch checklist, configure timing, and release to candidates</p>
            </div>

            {!isPublished && (
              <button
                type="button"
                className="org-btn-secondary"
                style={{ height: 36, padding: '0 14px', borderRadius: 8 }}
                onClick={() => setPhase('build')}
              >
                ← Back to Questions
              </button>
            )}
          </div>

          <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Warning if Total Marks <= Passing Marks */}
            {!hasValidMarksRatio && testQuestions.length > 0 && (
              <div
                style={{
                  padding: '14px 18px',
                  borderRadius: 10,
                  background: '#fff1f2',
                  border: '1px solid #fecdd3',
                  color: '#be123c',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: '0.9rem' }}>
                  <FiAlertTriangle style={{ fontSize: 18 }} />
                  <span>Total Marks ({effectiveTotalMarks}) must be greater than Passing Marks ({passingMarks})</span>
                </div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#9f1239' }}>
                  This test currently has {testQuestions.length} question(s) totaling <strong>{effectiveTotalMarks} marks</strong>, but passing marks is set to <strong>{passingMarks}</strong>. Please add more questions from the Question Bank or adjust passing marks below to proceed.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: 4 }}>
                  <label style={{ fontSize: '0.825rem', fontWeight: 600, color: '#475569' }}>
                    Adjust Passing Marks:
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={Math.max(0, effectiveTotalMarks - 1)}
                    value={editPassingMarksValue}
                    onChange={(e) => setEditPassingMarksValue(e.target.value)}
                    className="org-form-input"
                    style={{ width: 100, height: 34, padding: '4px 10px' }}
                  />
                  <button
                    type="button"
                    className="org-btn-secondary"
                    style={{ height: 34, padding: '0 14px', borderRadius: 8, fontSize: '0.825rem' }}
                    onClick={() => void handleUpdatePassingMarks(Number(editPassingMarksValue))}
                  >
                    Update Passing Marks
                  </button>
                  <button
                    type="button"
                    className="org-btn-secondary"
                    style={{ height: 34, padding: '0 14px', borderRadius: 8, fontSize: '0.825rem' }}
                    onClick={() => setPhase('build')}
                  >
                    + Add More Questions
                  </button>
                </div>
              </div>
            )}

            {/* Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span className="org-stat-label">Pre-Flight Checklist</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { ok: checklist.hasQuestions, label: `Questions Added (${testQuestions.length})` },
                  { ok: checklist.hasDuration, label: `Duration Configured (${test?.duration_minutes ?? 0} min)` },
                  {
                    ok: checklist.marksRatioValid,
                    label: checklist.marksRatioValid
                      ? `Passing Criteria Met (${effectiveTotalMarks} Total > ${passingMarks} Passing)`
                      : `Total Marks (${effectiveTotalMarks}) must exceed Passing (${passingMarks})`,
                    isWarning: !checklist.marksRatioValid,
                  },
                  { ok: checklist.hasInstructions, label: 'Exam Instructions Filled' },
                  { ok: checklist.hasAssignees, label: `Candidates Assigned (${assignments.length})` },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 14px',
                      borderRadius: 8,
                      background: item.ok ? '#ecfdf5' : item.isWarning ? '#fff1f2' : '#f8fafc',
                      border: `1px solid ${item.ok ? '#a7f3d0' : item.isWarning ? '#fecdd3' : '#e2e8f0'}`,
                      fontSize: '0.825rem',
                      fontWeight: 600,
                      color: item.ok ? '#065f46' : item.isWarning ? '#be123c' : '#64748b',
                    }}
                  >
                    {item.isWarning ? (
                      <FiAlertTriangle style={{ color: '#e11d48', fontSize: 16 }} />
                    ) : (
                      <FiCheckCircle style={{ color: item.ok ? '#10b981' : '#cbd5e1', fontSize: 16 }} />
                    )}
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timing & Mode */}
            {!isPublished && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 10, borderTop: '1px solid #f1f5f9' }}>
                <span className="org-stat-label">Publish Options</span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                  <div className="org-form-field">
                    <label className="org-form-label">Publish Mode</label>
                    <select
                      className="org-form-select"
                      value={publishMode}
                      onChange={(e) => setPublishMode(e.target.value as 'live_now' | 'schedule')}
                    >
                      <option value="live_now">Go Live Immediately</option>
                      <option value="schedule">Schedule for Later</option>
                    </select>
                  </div>

                  {publishMode === 'schedule' && (
                    <>
                      <div className="org-form-field">
                        <label className="org-form-label">Go Live At</label>
                        <input
                          type="datetime-local"
                          className="org-form-input"
                          value={scheduleStart}
                          onChange={(e) => setScheduleStart(e.target.value)}
                        />
                      </div>
                      <div className="org-form-field">
                        <label className="org-form-label">End At (Optional)</label>
                        <input
                          type="datetime-local"
                          className="org-form-input"
                          value={scheduleEnd}
                          onChange={(e) => setScheduleEnd(e.target.value)}
                        />
                      </div>
                    </>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-start', gap: 12, marginTop: 10 }}>
                  <button
                    type="button"
                    className="org-add-btn"
                    style={{ height: 42, padding: '0 24px', fontSize: '0.875rem' }}
                    disabled={!canPublish}
                    onClick={() => void publish()}
                  >
                    <FiCheckCircle />
                    <span>{publishMode === 'schedule' ? 'Schedule Test' : 'Publish Test Now'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PHASE 3: ASSIGN (Candidate Selection & Enrollment) ── */}
      {phase === 'assign' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, width: '100%' }}>
          {/* Card 1: Available Students to Assign */}
          <div className="org-table-card">
            <div className="org-card-header">
              <div className="org-title-group">
                <div className="org-title-row">
                  <h3 className="org-card-title">Assign to Students</h3>
                  <span className="org-count-badge">
                    {unassignedStudents.length} Available
                  </span>
                  {selectedStudentIds.length > 0 && (
                    <span
                      className="org-count-badge"
                      style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}
                    >
                      {selectedStudentIds.length} Selected
                    </span>
                  )}
                </div>
                <p className="org-card-subtitle">
                  Filter by department, search, select candidates, then assign exam access
                </p>
              </div>

              <div className="org-controls-row">
                {/* Department Filter Select */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <select
                    className="org-form-select"
                    style={{ height: 36, width: 'auto', minWidth: 160, padding: '4px 10px', fontSize: '0.825rem' }}
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
                  </select>
                </div>

                {/* Search Box */}
                <div className="org-search-box">
                  <FiSearch className="org-search-icon" />
                  <input
                    type="text"
                    className="org-search-input"
                    placeholder="Search by name or email…"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                  {studentSearch && (
                    <button
                      type="button"
                      className="org-search-clear"
                      onClick={() => setStudentSearch('')}
                      aria-label="Clear search"
                    >
                      <FiX />
                    </button>
                  )}
                </div>

                {/* Select All & Assign Buttons */}
                {unassignedStudents.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                      type="button"
                      className="org-btn-secondary"
                      style={{ height: 36, padding: '0 12px', fontSize: '0.8rem', borderRadius: 8 }}
                      onClick={toggleAllStudents}
                    >
                      {allStudentsSelected ? 'Clear All' : 'Select All'}
                    </button>
                    <button
                      type="button"
                      className="org-add-btn"
                      style={{ height: 36, padding: '0 16px' }}
                      disabled={selectedStudentIds.length === 0}
                      onClick={() => void submitSelectedStudents()}
                    >
                      <FiCheckCircle />
                      <span>Assign Selected ({selectedStudentIds.length})</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="org-table-wrapper">
              <table className="org-table">
                <thead>
                  <tr>
                    <th style={{ width: 50, textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        style={{ width: 16, height: 16, cursor: 'pointer', verticalAlign: 'middle' }}
                        checked={allStudentsSelected}
                        onChange={toggleAllStudents}
                        disabled={unassignedStudents.length === 0}
                        aria-label="Select all students"
                      />
                    </th>
                    <th>STUDENT NAME</th>
                    <th>EMAIL ADDRESS</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {unassignedStudents.map((s) => {
                    const isSelected = selectedStudentIds.includes(s.student_id);
                    const initials = getUserInitials(s.first_name, s.last_name, s.email);
                    return (
                      <tr
                        key={s.student_id}
                        onClick={() => toggleStudent(s.student_id)}
                        style={{
                          cursor: 'pointer',
                          background: isSelected ? 'rgba(34, 92, 229, 0.04)' : undefined,
                        }}
                      >
                        <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            style={{ width: 16, height: 16, cursor: 'pointer', verticalAlign: 'middle' }}
                            checked={isSelected}
                            onChange={() => toggleStudent(s.student_id)}
                            aria-label={`Select ${s.first_name} ${s.last_name}`}
                          />
                        </td>
                        <td>
                          <div className="org-cell-flex">
                            <div className="org-avatar-badge">{initials}</div>
                            <span className="org-name-text">
                              {s.first_name} {s.last_name}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span style={{ color: '#475569', fontSize: '0.85rem' }}>{s.email}</span>
                        </td>
                        <td>
                          <span className="org-status-badge org-status-badge--active">
                            {s.status || 'Active'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {unassignedStudents.length === 0 && (
                    <tr>
                      <td colSpan={4}>
                        <div className="org-empty-state">
                          <FiUsers className="org-empty-icon" />
                          <p className="org-empty-title">
                            {sSearch
                              ? 'No candidates match your search filter'
                              : students.length === 0
                              ? 'No active students found in this organization'
                              : 'All eligible students are already assigned'}
                          </p>
                          <p className="org-empty-desc">
                            {sSearch
                              ? 'Try clearing the search or changing the department filter.'
                              : 'Review the enrolled list below.'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 2: Currently Enrolled / Assigned Students */}
          <div className="org-table-card">
            <div className="org-card-header">
              <div className="org-title-group">
                <div className="org-title-row">
                  <h3 className="org-card-title">Enrolled Students</h3>
                  <span className="org-count-badge" style={{ background: '#ecfdf5', color: '#059669', borderColor: '#a7f3d0' }}>
                    {assignments.length} Enrolled
                  </span>
                </div>
                <p className="org-card-subtitle">
                  Candidates who have been granted access to take this examination
                </p>
              </div>

              {assignments.length > 0 && (
                <div className="org-controls-row">
                  <div className="org-search-box">
                    <FiSearch className="org-search-icon" />
                    <input
                      type="text"
                      className="org-search-input"
                      placeholder="Search enrolled students…"
                      value={assignedSearch}
                      onChange={(e) => setAssignedSearch(e.target.value)}
                    />
                    {assignedSearch && (
                      <button
                        type="button"
                        className="org-search-clear"
                        onClick={() => setAssignedSearch('')}
                        aria-label="Clear search"
                      >
                        <FiX />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="org-table-wrapper">
              <table className="org-table">
                <thead>
                  <tr>
                    <th>STUDENT NAME</th>
                    <th>EMAIL ADDRESS</th>
                    <th className="edtp-th-actions">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssignments.map((a) => {
                    const initials = getUserInitials(a.first_name, a.last_name, a.email);
                    return (
                      <tr key={a.student_id}>
                        <td>
                          <div className="org-cell-flex">
                            <div className="org-avatar-badge">{initials}</div>
                            <span className="org-name-text">
                              {a.first_name} {a.last_name}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span style={{ color: '#475569', fontSize: '0.85rem' }}>{a.email}</span>
                        </td>
                        <td style={{ textAlign: 'left' }}>
                          <button
                            type="button"
                            className="org-action-btn org-action-btn--danger"
                            onClick={() =>
                              void unassignStudent(a.student_id, `${a.first_name} ${a.last_name}`)
                            }
                            title={`Unassign ${a.first_name}`}
                          >
                            <FiTrash2 />
                            <span>Unassign</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {assignments.length === 0 && (
                    <tr>
                      <td colSpan={3}>
                        <div className="org-empty-state">
                          <FiUsers className="org-empty-icon" />
                          <p className="org-empty-title">No students assigned yet</p>
                          <p className="org-empty-desc">
                            Select students from the available list above and click "Assign Selected" to grant test access.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {assignments.length > 0 && filteredAssignments.length === 0 && (
                    <tr>
                      <td colSpan={3}>
                        <div className="org-empty-state">
                          <FiSearch className="org-empty-icon" />
                          <p className="org-empty-title">No matching students</p>
                          <p className="org-empty-desc">No enrolled students match your search query.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <QuestionPreviewModal
        questionId={previewQuestionId}
        onClose={() => setPreviewQuestionId(null)}
      />

      <AddQuestionDrawer
        isOpen={isAddQuestionDrawerOpen}
        onClose={() => setIsAddQuestionDrawerOpen(false)}
        initialDepartmentId={targetDeptId}
        initialDepartmentName={targetDeptName}
        initialSubjectId={targetSubjId}
        initialSubjectName={targetSubjName}
        initialTopicId={targetTopicId}
        initialTopicName={targetTopicName}
        isScopeLocked={Boolean(targetDeptId)}
        departments={departments}
        onSuccess={async (newQuestionId) => {
          setIsAddQuestionDrawerOpen(false);
          if (newQuestionId && testId) {
            try {
              await examinationService.addQuestionToTest(testId, newQuestionId);
            } catch (err) {
              console.error('Failed to auto-add question to test:', err);
            }
          }
          await load();
        }}
      />

      <BulkImportCsvModal
        isOpen={isBulkImportModalOpen}
        onClose={() => setIsBulkImportModalOpen(false)}
        departments={departments}
        initialDepartmentId={targetDeptId}
        initialDepartmentName={targetDeptName}
        initialSubjectId={targetSubjId}
        initialSubjectName={targetSubjName}
        initialTopicId={targetTopicId}
        initialTopicName={targetTopicName}
        isScopeLocked={Boolean(targetDeptId)}
        onImportSuccess={async (summary) => {
          setIsBulkImportModalOpen(false);
          if (summary.created <= 0) {
            await load();
            return;
          }

          await withLoader(async () => {
            try {
              const qResult = await examinationService.listQuestions(1, Math.max(100, summary.created + 20), 'approved');
              setBankQuestions(qResult.data);

              if (testId) {
                // Add ONLY the questions that were newly imported from the CSV (newest items first)
                const newlyImported = qResult.data.slice(0, summary.created);

                let addedCount = 0;
                for (const q of newlyImported) {
                  try {
                    await examinationService.addQuestionToTest(testId, q.id);
                    addedCount += 1;
                  } catch (err) {
                    console.error('Failed to auto-add question to test:', err);
                  }
                }
                await load();
                showSuccess(
                  'Questions Imported & Added to Test',
                  `${addedCount} question(s) successfully added to Test Questions.`,
                );
              } else {
                await load();
                showSuccess(
                  'Bulk import complete',
                  `${summary.created} added, ${summary.skipped} skipped, ${summary.errors} errors`,
                );
              }
            } catch (err) {
              setError(parseApiError(err));
              await load();
            }
          });
        }}
      />
    </div>
  );
}
