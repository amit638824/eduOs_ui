import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useDashboardLoadingEffect } from '@/context/DashboardLoadingContext';
import { useOrganization } from '@/hooks/useOrganization';
import { examinationService, platformService } from '@/services';
import { resolveImageUrl } from '@/utils/image';
import { resolveLayoutRole } from '@/utils/dashboardRole';
import { siteContent } from '@/data/siteContent';
import type { AdminDashboardData, OrgAnalytics, StudentStats, TestAttempt } from '@/types/examination';
import type { Notification } from '@/services/platform.service';
import { ProfileSettingsApiForm } from '@/components/dashboard/examination/ExaminationPanels';
import { formatDate, formatRelativeDate } from '@/utils/dateFormat';
import { notify } from '@/lib/toast';

function sparkGeometry(values: number[]) {
  const points = values.length ? values : [0, 0];
  const max = Math.max(...points, 1);
  const min = Math.min(...points, 0);
  const span = max - min || 1;
  const coords = points.map((value, index) => {
    const x = points.length === 1 ? 50 : (index / (points.length - 1)) * 100;
    const y = 40 - ((value - min) / span) * 32;
    return { x, y };
  });
  const line = coords.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ');
  return { line, area: `${line} L100,45 L0,45 Z` };
}

function primaryRoleLabel(roles: string[]) {
  const order = [
    'super_admin',
    'org_admin',
    'staff',
    'branch_admin',
    'teacher',
    'examiner',
    'evaluator',
    'student',
    'parent',
    'support',
    'finance',
  ];
  const map: Record<string, string> = {
    super_admin: 'Super Admin',
    org_admin: 'Organization Admin',
    staff: 'Organization Staff',
    branch_admin: 'Branch Admin',
    teacher: 'Teacher',
    examiner: 'Examiner',
    evaluator: 'Evaluator',
    student: 'Student',
    parent: 'Parent',
    support: 'Support',
    finance: 'Finance',
  };
  const found = order.find((r) => roles.includes(r));
  return found ? map[found] : roles.join(', ');
}

function formatStatus(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ');
}

function initials(first: string, last: string) {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || 'U';
}

function usernameFromEmail(email: string) {
  return `@${email.split('@')[0]}`;
}

export default function DashboardProfilePage() {
  const { user } = useAuth();
  const { organization, branches, loading: orgLoading } = useOrganization();
  const [editing, setEditing] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'security' | 'permissions' | 'audit'>('overview');
  const [activityFilter, setActivityFilter] = useState<'all' | 'exams' | 'logins' | 'security'>('all');
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
  const [orgStats, setOrgStats] = useState<OrgAnalytics | null>(null);
  const [adminDash, setAdminDash] = useState<AdminDashboardData | null>(null);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const layoutRole = user ? resolveLayoutRole(user.roles) : 'student';

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const tasks: Promise<unknown>[] = [
      platformService.listNotifications(1, 8).then((r) => {
        setNotifications(r.data);
      }).catch(() => undefined),
    ];

    if (layoutRole === 'student') {
      tasks.push(
        examinationService.getMyStats().then(setStudentStats).catch(() => setStudentStats(null)),
        examinationService.listAttempts(1, 20).then((r) => setAttempts(r.data)).catch(() => undefined),
      );
    } else {
      tasks.push(
        examinationService.getAnalyticsOverview().then(setOrgStats).catch(() => undefined),
        examinationService.getAdminDashboard().then(setAdminDash).catch(() => undefined),
        examinationService.listAttempts(1, 8).then((r) => setAttempts(r.data)).catch(() => undefined),
      );
    }

    Promise.all(tasks)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [user, layoutRole]);

  useDashboardLoadingEffect(loading || orgLoading);

  const avatarUrl = user ? resolveImageUrl(user.avatarUrl) : '';
  const usePhotoAvatar = Boolean(avatarUrl);

  const organizationName = useMemo(() => {
    if (organization?.name) return organization.name;
    return siteContent.brand.name;
  }, [organization]);

  const branchName = useMemo(() => {
    if (!user?.branchId || !branches.length) return null;
    return branches.find((b) => b.id === user.branchId)?.name ?? null;
  }, [user, branches]);

  const locationText = useMemo(() => {
    if (branchName) return branchName;
    return organizationName;
  }, [branchName, organizationName]);

  const memberSince = user?.createdAt ? formatDate(user.createdAt) : '—';

  const statPills = layoutRole === 'student'
    ? [
        { value: studentStats?.assigned_tests ?? 0, label: 'Assigned' },
        { value: studentStats?.attempts ?? 0, label: 'Attempts' },
        { value: studentStats?.results ?? 0, label: 'Results' },
      ]
    : [
        { value: adminDash?.totals.students ?? orgStats?.students ?? 0, label: 'Students' },
        { value: adminDash?.totals.tests ?? orgStats?.tests ?? 0, label: 'Tests' },
        { value: adminDash?.totals.attempts ?? orgStats?.attempts ?? 0, label: 'Attempts' },
      ];
  const testsCount = layoutRole === 'student'
    ? (studentStats?.assigned_tests ?? 0)
    : (adminDash?.totals.tests ?? orgStats?.tests ?? 0);
  const studentsCount = layoutRole === 'student'
    ? (studentStats?.in_progress ?? 0)
    : (adminDash?.totals.students ?? orgStats?.students ?? 0);
  const attemptsCount = layoutRole === 'student'
    ? (studentStats?.attempts ?? 0)
    : (adminDash?.totals.attempts ?? orgStats?.attempts ?? 0);
  const trends = adminDash?.trends ?? { tests: 0, students: 0, attempts: 0 };

  const sparks = useMemo(() => {
    return {
      tests: sparkGeometry(adminDash?.sparklines?.tests ?? [0, 0]),
      students: sparkGeometry(adminDash?.sparklines?.students ?? [0, 0]),
      attempts: sparkGeometry(adminDash?.sparklines?.attempts ?? [0, 0]),
    };
  }, [adminDash]);

  // Build rich activity timeline events
  const allActivities = useMemo(() => {
    const list: Array<{
      id: string;
      title: string;
      sub: string;
      time: string;
      type: 'all' | 'exams' | 'logins' | 'security';
      badge: string;
      badgeType: 'active' | 'exam' | 'export' | 'perm' | 'account';
    }> = [];

    // Session login event
    if (user?.lastLoginAt) {
      list.push({
        id: 'login-1',
        title: 'Signed in',
        sub: 'Your latest portal session',
        time: formatRelativeDate(user.lastLoginAt),
        type: 'logins',
        badge: 'Active Session',
        badgeType: 'active',
      });
    }

    if (attempts.length > 0) {
      attempts.slice(0, 2).forEach((a, idx) => {
        list.push({
          id: `attempt-${idx}`,
          title: a.test_title ?? 'Examination',
          sub: `Attempt status: ${a.status.replace(/_/g, ' ')}`,
          time: formatRelativeDate(a.started_at),
          type: 'exams',
          badge: 'Exam Event',
          badgeType: 'exam',
        });
      });
    }

    if (notifications.length > 0) {
      notifications.slice(0, 2).forEach((n, idx) => {
        list.push({
          id: `notif-${idx}`,
          title: n.title,
          sub: n.body || 'System notification received',
          time: formatRelativeDate(n.created_at),
          type: 'security',
          badge: 'Security Notice',
          badgeType: 'perm',
        });
      });
    }

    return list;
  }, [user, attempts, notifications]);

  const filteredActivities = useMemo(() => {
    if (activityFilter === 'all') return allActivities;
    return allActivities.filter((a) => a.type === activityFilter);
  }, [allActivities, activityFilter]);

  
  const handleExportAuditCsv = () => {
    if (!user) return;
    try {
      const headers = ['Event', 'Category', 'Details', 'Timestamp', 'Status'];
      const rows = [];

      allActivities.forEach((act) => {
        rows.push([
          `"${(act.title || '').replace(/"/g, '""')}"`,
          `"${(act.type || '').toUpperCase()}"`,
          `"${(act.sub || '').replace(/"/g, '""')}"`,
          `"${act.time || ''}"`,
          `"${(act.badge || '').replace(/"/g, '""')}"`,
        ]);
      });

      if (user.createdAt) {
        rows.push([
          '"Account Registration"',
          '"SECURITY"',
          '"Student account registered on Mindsprint"',
          `"${formatDate(user.createdAt)}"`,
          '"Confirmed"',
        ]);
      }

      if (attempts.length > 0) {
        attempts.forEach((att, idx) => {
          rows.push([
            `"${(att.test_title || `Exam Attempt #${idx + 1}`).replace(/"/g, '""')}"`,
            '"EXAMS"',
            `"Status: ${att.status || 'completed'} | Score: ${att.total_score ?? 'N/A'}"`,
            `"${att.started_at ? formatDate(att.started_at) : 'Recent'}"`,
            `"${att.status || 'recorded'}"`,
          ]);
        });
      }

      const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeName = (user.firstName || user.email.split('@')[0] || 'student')
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-');
      const dateStr = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.setAttribute('download', `audit-log-${safeName}-${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      notify.success('Audit log CSV downloaded successfully.');
    } catch {
      notify.error('Failed to generate audit log CSV.');
    }
  };

  if (!user) return null;

  const fullName = `${user.firstName} ${user.lastName}`.trim() || user.email;

  return (
    <div className="sca-profile edtp-profile-enhanced">
      {/* ── CARD 1: EXECUTIVE PROFILE HERO HEADER ── */}
      <div className="edtp-profile-card edtp-profile-hero-card">
        <div className="edtp-profile-banner" aria-hidden="true" />
        
        <div className="edtp-profile-hero-body">
          <div className="edtp-profile-hero-top">
            {/* Avatar with Green Online Dot */}
            <div className="edtp-profile-avatar-wrapper">
              {usePhotoAvatar ? (
                <img src={avatarUrl} alt={fullName} className="edtp-profile-avatar-img" />
              ) : (
                <div className="edtp-profile-avatar-initials" aria-hidden="true">
                  {initials(user.firstName || user.email, user.lastName || '')}
                </div>
              )}
              <span className="edtp-profile-online-dot" title="Active Online" />
            </div>

            {/* Uncrowded, Non-Overlapping Identity Details */}
            <div className="edtp-profile-identity-col">
              <h1 className="edtp-profile-name">{fullName}</h1>

              <div className="edtp-profile-meta-row">
                <span className="edtp-profile-handle">{usernameFromEmail(user.email)}</span>
                <span className="edtp-badge edtp-badge--role">{primaryRoleLabel(user.roles)}</span>
                <span className="edtp-badge edtp-badge--active">
                  <span className="edtp-badge-dot" />
                  {formatStatus(user.status || 'active')}
                </span>
              </div>

              <div className="edtp-profile-details-row">
                <span>
                  <strong>Organization:</strong> {organizationName}
                </span>
                <span className="edtp-meta-separator">•</span>
                <span>
                  <strong>Location:</strong> {locationText}
                </span>
                <span className="edtp-meta-separator">•</span>
                <span>
                  <strong>Member Since:</strong> {memberSince}
                </span>
              </div>
            </div>

            {/* Right Side: Quick Stats & Actions */}
            <div className="edtp-profile-hero-actions-col">
              <div className="edtp-profile-stat-pills">
                {statPills.map((pill) => (
                  <div key={pill.label} className="edtp-stat-pill">
                    <span className="edtp-stat-pill-val">{pill.value}</span>
                    <span className="edtp-stat-pill-lbl">{pill.label}</span>
                  </div>
                ))}
              </div>

              <div className="edtp-hero-buttons">
                <button
                  type="button"
                  className="edtp-btn edtp-btn-secondary"
                  onClick={() => setEditing((e) => !e)}
                >
                  <i className="icofont-edit-alt" />
                  {editing ? 'Close Edit' : 'Edit Profile'}
                </button>
                <Link to={`/dashboard/${layoutRole}-settings`} className="edtp-btn edtp-btn-primary">
                  <i className="icofont-ui-lock" />
                  Security
                </Link>
              </div>
            </div>
          </div>

          {/* Sub-Navigation Tabs */}
          <div className="edtp-profile-subtabs">
            <button
              type="button"
              className={`edtp-subtab-btn ${activeSubTab === 'overview' ? 'edtp-subtab-btn--active' : ''}`}
              onClick={() => setActiveSubTab('overview')}
            >
              Profile Overview
            </button>
            <button
              type="button"
              className={`edtp-subtab-btn ${activeSubTab === 'security' ? 'edtp-subtab-btn--active' : ''}`}
              onClick={() => setActiveSubTab('security')}
            >
              Security & Access
            </button>
            <button
              type="button"
              className={`edtp-subtab-btn ${activeSubTab === 'permissions' ? 'edtp-subtab-btn--active' : ''}`}
              onClick={() => setActiveSubTab('permissions')}
            >
              Role Permissions
            </button>
            <button
              type="button"
              className={`edtp-subtab-btn ${activeSubTab === 'audit' ? 'edtp-subtab-btn--active' : ''}`}
              onClick={() => setActiveSubTab('audit')}
            >
              Audit History
            </button>
          </div>
        </div>
      </div>

      {editing && (
        <div className="sca-profile__edit-panel edtp-form-card" style={{ marginBottom: 24 }}>
          <h5>Edit Profile Credentials</h5>
          <ProfileSettingsApiForm onSuccess={() => setEditing(false)} />
        </div>
      )}

      {/* ── 2-COLUMN BALANCED CONTENT GRID ── */}
      <div className="edtp-profile-grid">
        {/* ==================== TAB 1: PROFILE OVERVIEW ==================== */}
        {activeSubTab === 'overview' && (
          <>
            {/* LEFT COLUMN: Personal Information Card */}
            <div className="edtp-profile-col-left">
              <div className="edtp-profile-card">
                <div className="edtp-card-header">
                  <div>
                    <h3 className="edtp-card-title">Personal Information</h3>
                    <p className="edtp-card-subtitle">Identity, contact details, and organization role mapping</p>
                  </div>
                  <button
                    type="button"
                    className="edtp-inline-edit-btn"
                    onClick={() => setEditing((e) => !e)}
                    title="Edit Details"
                  >
                    {editing ? 'Close' : 'Edit'}
                  </button>
                </div>

                <div className="edtp-tiles-list">
                  <div className="edtp-tile-item">
                    <div className="edtp-tile-text">
                      <span className="edtp-tile-label">Email Address</span>
                      <span className="edtp-tile-value">{user.email}</span>
                    </div>
                    <span className="edtp-badge edtp-badge--verified">Verified</span>
                  </div>

                  <div className="edtp-tile-item">
                    <div className="edtp-tile-text">
                      <span className="edtp-tile-label">Phone Number</span>
                      <span className="edtp-tile-value">{user.phone || '—'}</span>
                    </div>
                    <span className="edtp-badge edtp-badge--primary">Primary</span>
                  </div>

                  <div className="edtp-tile-item">
                    <div className="edtp-tile-text">
                      <span className="edtp-tile-label">System Role</span>
                      <span className="edtp-tile-value">{primaryRoleLabel(user.roles)}</span>
                    </div>
                    <span className="edtp-badge edtp-badge--scope">{primaryRoleLabel(user.roles)}</span>
                  </div>

                  <div className="edtp-tile-item">
                    <div className="edtp-tile-text">
                      <span className="edtp-tile-label">Organization</span>
                      <span className="edtp-tile-value">{organizationName}</span>
                    </div>
                    <span className="edtp-badge edtp-badge--neutral">Org Scoped</span>
                  </div>

                  <div className="edtp-tile-item">
                    <div className="edtp-tile-text">
                      <span className="edtp-tile-label">Registration Date</span>
                      <span className="edtp-tile-value">{memberSince}</span>
                    </div>
                    <span className="edtp-badge edtp-badge--verified">Confirmed</span>
                  </div>

                  <div className="edtp-tile-item">
                    <div className="edtp-tile-text">
                      <span className="edtp-tile-label">Email Verification</span>
                      <span className="edtp-tile-value">
                        {user.emailVerified ? 'Verified' : 'Not verified'}
                      </span>
                    </div>
                    <span className="edtp-badge edtp-badge--verified">Secure</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: 3 Sparkline Stat Cards + Academic Summary */}
            <div className="edtp-profile-col-right">
              {/* 3 Dashboard Metric Cards */}
              <div className="edtp-profile-stats-row">
                {/* Card 1: Assigned Tests */}
                <div className="mad-v3-stat-card">
                  <div className="mad-v3-stat-top">
                    <div className="mad-v3-stat-icon mad-v3-stat-icon--blue">
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                        <path d="M13 2H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7l-5-5z" />
                        <path d="M13 2v5h5" />
                      </svg>
                    </div>
                    <button type="button" className="mad-v3-kebab" aria-label="Options">
                      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                        <circle cx="10" cy="4" r="1.5" />
                        <circle cx="10" cy="10" r="1.5" />
                        <circle cx="10" cy="16" r="1.5" />
                      </svg>
                    </button>
                  </div>

                  <div className="mad-v3-stat-mid">
                    <div className="mad-v3-stat-value-group">
                      <span className="mad-v3-stat-num">{testsCount}</span>
                      <span className="mad-v3-stat-title">{layoutRole === 'student' ? 'Assigned Tests' : 'Total Tests'}</span>
                    </div>
                    <div className="mad-v3-sparkline-box">
                      <svg viewBox="0 0 100 45" className="mad-v3-sparkline-svg" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="spBlueProfile" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d={sparks.tests.area} fill="url(#spBlueProfile)" />
                        <path d={sparks.tests.line} fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>

                  <div className={`mad-v3-stat-trend${trends.tests < 0 ? ' mad-v3-stat-trend--down' : ''}`}>
                    <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12" className="trend-arrow">
                      <path d="M8 2.5l4.5 4.5-1.1 1.1L8.8 5.5v8H7.2v-8L4.6 8.1 3.5 7 8 2.5z" />
                    </svg>
                    <span>{trends.tests}%</span> <span className="trend-lbl">from last month</span>
                  </div>
                </div>

                {/* Card 2: In Progress */}
                <div className="mad-v3-stat-card">
                  <div className="mad-v3-stat-top">
                    <div className="mad-v3-stat-icon mad-v3-stat-icon--green">
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                        <path d="M17 17v-1.5a3.5 3.5 0 00-3.5-3.5h-7A3.5 3.5 0 003 15.5V17" />
                        <circle cx="10" cy="6" r="3.5" />
                      </svg>
                    </div>
                    <button type="button" className="mad-v3-kebab" aria-label="Options">
                      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                        <circle cx="10" cy="4" r="1.5" />
                        <circle cx="10" cy="10" r="1.5" />
                        <circle cx="10" cy="16" r="1.5" />
                      </svg>
                    </button>
                  </div>

                  <div className="mad-v3-stat-mid">
                    <div className="mad-v3-stat-value-group">
                      <span className="mad-v3-stat-num">{studentsCount}</span>
                      <span className="mad-v3-stat-title">{layoutRole === 'student' ? 'In Progress' : 'Total Students'}</span>
                    </div>
                    <div className="mad-v3-sparkline-box">
                      <svg viewBox="0 0 100 45" className="mad-v3-sparkline-svg" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="spGreenProfile" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d={sparks.students.area} fill="url(#spGreenProfile)" />
                        <path d={sparks.students.line} fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>

                  <div className={`mad-v3-stat-trend${trends.students < 0 ? ' mad-v3-stat-trend--down' : ''}`}>
                    <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12" className="trend-arrow">
                      <path d="M8 2.5l4.5 4.5-1.1 1.1L8.8 5.5v8H7.2v-8L4.6 8.1 3.5 7 8 2.5z" />
                    </svg>
                    <span>{trends.students}%</span> <span className="trend-lbl">from last month</span>
                  </div>
                </div>

                {/* Card 3: Total Attempts */}
                <div className="mad-v3-stat-card">
                  <div className="mad-v3-stat-top">
                    <div className="mad-v3-stat-icon mad-v3-stat-icon--purple">
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                        <path d="M7 10l2 2 4-4" />
                        <rect x="3" y="3" width="14" height="14" rx="3" />
                      </svg>
                    </div>
                    <button type="button" className="mad-v3-kebab" aria-label="Options">
                      <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                        <circle cx="10" cy="4" r="1.5" />
                        <circle cx="10" cy="10" r="1.5" />
                        <circle cx="10" cy="16" r="1.5" />
                      </svg>
                    </button>
                  </div>

                  <div className="mad-v3-stat-mid">
                    <div className="mad-v3-stat-value-group">
                      <span className="mad-v3-stat-num">{attemptsCount}</span>
                      <span className="mad-v3-stat-title">'Attempts'</span>
                    </div>
                    <div className="mad-v3-sparkline-box">
                      <svg viewBox="0 0 100 45" className="mad-v3-sparkline-svg" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="spPurpleProfile" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path d={sparks.attempts.area} fill="url(#spPurpleProfile)" />
                        <path d={sparks.attempts.line} fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </div>
                  </div>

                  <div className={`mad-v3-stat-trend${trends.attempts < 0 ? ' mad-v3-stat-trend--down' : ''}`}>
                    <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12" className="trend-arrow">
                      <path d="M8 2.5l4.5 4.5-1.1 1.1L8.8 5.5v8H7.2v-8L4.6 8.1 3.5 7 8 2.5z" />
                    </svg>
                    <span>{trends.attempts}%</span> <span className="trend-lbl">from last month</span>
                  </div>
                </div>
              </div>

              {/* Academic & Portal Summary Card */}
              <div className="edtp-profile-card">
                <div className="edtp-card-header">
                  <div>
                    <h3 className="edtp-card-title">Academic & Portal Summary</h3>
                    <p className="edtp-card-subtitle">Quick overview of course assessments and certification status</p>
                  </div>
                </div>
                <div className="edtp-tiles-list">
                  <div className="edtp-tile-item">
                    <div className="edtp-tile-text">
                      <span className="edtp-tile-label">Current Enrollment Track</span>
                      <span className="edtp-tile-value">{organizationName} Examination Portal</span>
                    </div>
                    <span className="edtp-badge edtp-badge--verified">Active</span>
                  </div>
                  <div className="edtp-tile-item">
                    <div className="edtp-tile-text">
                      <span className="edtp-tile-label">Assigned Tests</span>
                      <span className="edtp-tile-value">{testsCount} Assessment(s)</span>
                    </div>
                    <Link to="/dashboard/student-course" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#2563eb' }}>
                      View Tests →
                    </Link>
                  </div>
                  <div className="edtp-tile-item">
                    <div className="edtp-tile-text">
                      <span className="edtp-tile-label">Completed Exam Attempts</span>
                      <span className="edtp-tile-value">{attemptsCount} Attempt(s) logged</span>
                    </div>
                    <Link to="/dashboard/student-attempts" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#2563eb' }}>
                      View History →
                    </Link>
                  </div>
                  <div className="edtp-tile-item">
                    <div className="edtp-tile-text">
                      <span className="edtp-tile-label">Certificates Earned</span>
                      <span className="edtp-tile-value">{studentStats?.results ?? 0} Published Certificate(s)</span>
                    </div>
                    <Link to="/dashboard/student-certificates" style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#2563eb' }}>
                      Certificates →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ==================== TAB 2: SECURITY & ACCESS ==================== */}
        {activeSubTab === 'security' && (
          <>
            {/* LEFT COLUMN: Security Overview Card */}
            <div className="edtp-profile-col-left">
              <div className="edtp-profile-card">
                <div className="edtp-card-header">
                  <div>
                    <h3 className="edtp-card-title">Security & Protection</h3>
                    <p className="edtp-card-subtitle">Account safeguards and authentication methods</p>
                  </div>
                </div>
                <div className="edtp-tiles-list">
                  <div className="edtp-tile-item">
                    <div className="edtp-tile-text">
                      <span className="edtp-tile-label">Password Status</span>
                      <span className="edtp-tile-value">Encrypted & Active</span>
                    </div>
                    <span className="edtp-badge edtp-badge--verified">Protected</span>
                  </div>
                  <div className="edtp-tile-item">
                    <div className="edtp-tile-text">
                      <span className="edtp-tile-label">Two-Factor Auth (2FA)</span>
                      <span className="edtp-tile-value">{user.mfaEnabled ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <span className={`edtp-badge ${user.mfaEnabled ? 'edtp-badge--verified' : 'edtp-badge--neutral'}`}>
                      {user.mfaEnabled ? 'Active' : 'Optional'}
                    </span>
                  </div>
                  <div className="edtp-tile-item">
                    <div className="edtp-tile-text">
                      <span className="edtp-tile-label">Email Verification</span>
                      <span className="edtp-tile-value">{user.emailVerified ? 'Verified' : 'Pending'}</span>
                    </div>
                    <span className="edtp-badge edtp-badge--verified">Secure</span>
                  </div>
                  <div className="edtp-tile-item">
                    <div className="edtp-tile-text">
                      <span className="edtp-tile-label">Session Protection</span>
                      <span className="edtp-tile-value">JWT Bearer (HTTP-Only)</span>
                    </div>
                    <span className="edtp-badge edtp-badge--primary">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Password & 2FA Management */}
            <div className="edtp-profile-col-right">
              {/* Password Action Card */}
              <div className="edtp-profile-card">
                <div className="edtp-card-header">
                  <div>
                    <h3 className="edtp-card-title">Password Management</h3>
                    <p className="edtp-card-subtitle">Change or update your account password</p>
                  </div>
                  <Link to={`/dashboard/${layoutRole}-settings`} className="edtp-inline-edit-btn" style={{ fontWeight: 700 }}>
                    Settings →
                  </Link>
                </div>
                <div className="edtp-tiles-list">
                  <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--db-muted, #64748b)', lineHeight: 1.5 }}>
                    Your password protects your exams, scorecards, and certificates. You can update your password anytime from the student settings tab.
                  </p>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                    <Link
                      to={`/dashboard/${layoutRole}-settings`}
                      className="org-add-btn"
                      style={{ textDecoration: 'none', padding: '8px 24px', fontSize: '0.85rem' }}
                    >
                      Update Password
                    </Link>
                  </div>
                </div>
              </div>

              {/* 2FA Action Card */}
              <div className="edtp-profile-card">
                <div className="edtp-card-header">
                  <div>
                    <h3 className="edtp-card-title">Two-Factor Authentication (2FA)</h3>
                    <p className="edtp-card-subtitle">Add multi-factor verification to your sign-in process</p>
                  </div>
                </div>
                <div className="edtp-security-alert-box" style={{ margin: '20px 24px' }}>
                  <div className="edtp-alert-header">
                    <i className="icofont-shield-alt edtp-alert-icon" />
                    <div>
                      <h4 className="edtp-alert-title">
                        Two-Factor Authentication: {user.mfaEnabled ? 'Enabled' : 'Not Enabled'}
                      </h4>
                      <p className="edtp-alert-desc">
                        Connect an authenticator app (Google Authenticator, Microsoft Authenticator) so logins require a one-time code.
                      </p>
                    </div>
                  </div>
                  <Link to={`/dashboard/${layoutRole}-settings`} className="edtp-alert-btn">
                    {user.mfaEnabled ? 'Manage 2FA Settings →' : 'Enable 2FA Now →'}
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ==================== TAB 3: ROLE PERMISSIONS ==================== */}
        {activeSubTab === 'permissions' && (
          <>
            {/* LEFT COLUMN: Role Mapping Card */}
            <div className="edtp-profile-col-left">
              <div className="edtp-profile-card">
                <div className="edtp-card-header">
                  <div>
                    <h3 className="edtp-card-title">Role Assignment</h3>
                    <p className="edtp-card-subtitle">Institutional access role and scope</p>
                  </div>
                </div>
                <div className="edtp-tiles-list">
                  <div className="edtp-tile-item">
                    <div className="edtp-tile-text">
                      <span className="edtp-tile-label">Primary Role</span>
                      <span className="edtp-tile-value">{primaryRoleLabel(user.roles)}</span>
                    </div>
                    <span className="edtp-badge edtp-badge--scope">{primaryRoleLabel(user.roles)}</span>
                  </div>
                  <div className="edtp-tile-item">
                    <div className="edtp-tile-text">
                      <span className="edtp-tile-label">Organization Scope</span>
                      <span className="edtp-tile-value">{organizationName}</span>
                    </div>
                    <span className="edtp-badge edtp-badge--neutral">Org Scoped</span>
                  </div>
                  <div className="edtp-tile-item">
                    <div className="edtp-tile-text">
                      <span className="edtp-tile-label">Branch / Cohort</span>
                      <span className="edtp-tile-value">{branchName || 'Main Campus'}</span>
                    </div>
                    <span className="edtp-badge edtp-badge--primary">Assigned</span>
                  </div>
                  <div className="edtp-tile-item">
                    <div className="edtp-tile-text">
                      <span className="edtp-tile-label">Account Status</span>
                      <span className="edtp-tile-value">{formatStatus(user.status || 'active')}</span>
                    </div>
                    <span className="edtp-badge edtp-badge--verified">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Detailed Permissions List */}
            <div className="edtp-profile-col-right">
              <div className="edtp-profile-card">
                <div className="edtp-card-header">
                  <div>
                    <h3 className="edtp-card-title">Authorized Capabilities</h3>
                    <p className="edtp-card-subtitle">Permissions granted to your user account within this portal</p>
                  </div>
                  <span className="edtp-badge edtp-badge--verified">Standard Privileges</span>
                </div>
                <div className="edtp-tiles-list">
                  <div className="edtp-tile-item">
                    <div className="edtp-tile-text">
                      <span className="edtp-tile-label">Assessment Access</span>
                      <span className="edtp-tile-value">Take Assigned Online Exams & Quizzes</span>
                    </div>
                    <span className="edtp-badge edtp-badge--verified">Granted</span>
                  </div>
                  <div className="edtp-tile-item">
                    <div className="edtp-tile-text">
                      <span className="edtp-tile-label">Performance Reports</span>
                      <span className="edtp-tile-value">View Test Results, Scorecards & Analytics</span>
                    </div>
                    <span className="edtp-badge edtp-badge--verified">Granted</span>
                  </div>
                  <div className="edtp-tile-item">
                    <div className="edtp-tile-text">
                      <span className="edtp-tile-label">Certificates & Awards</span>
                      <span className="edtp-tile-value">Download Verified PDF Certificates</span>
                    </div>
                    <span className="edtp-badge edtp-badge--verified">Granted</span>
                  </div>
                  <div className="edtp-tile-item">
                    <div className="edtp-tile-text">
                      <span className="edtp-tile-label">Account Management</span>
                      <span className="edtp-tile-value">Update Profile, Phone Number & Password</span>
                    </div>
                    <span className="edtp-badge edtp-badge--verified">Granted</span>
                  </div>
                  <div className="edtp-tile-item">
                    <div className="edtp-tile-text">
                      <span className="edtp-tile-label">Authoring & Faculty Tools</span>
                      <span className="edtp-tile-value">Create Tests, Manage Question Banks</span>
                    </div>
                    <span className="edtp-badge edtp-badge--neutral">Faculty Only</span>
                  </div>
                  <div className="edtp-tile-item">
                    <div className="edtp-tile-text">
                      <span className="edtp-tile-label">Platform Administration</span>
                      <span className="edtp-tile-value">Tenant Settings, Billing & User Directory</span>
                    </div>
                    <span className="edtp-badge edtp-badge--neutral">Admin Only</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ==================== TAB 4: AUDIT HISTORY ==================== */}
        {activeSubTab === 'audit' && (
          <>
            {/* LEFT COLUMN: Audit Log Summary Card */}
            <div className="edtp-profile-col-left">
              <div className="edtp-profile-card">
                <div className="edtp-card-header">
                  <div>
                    <h3 className="edtp-card-title">Audit Log Summary</h3>
                    <p className="edtp-card-subtitle">Activity records & compliance logging</p>
                  </div>
                </div>
                <div className="edtp-tiles-list">
                  <div className="edtp-tile-item">
                    <div className="edtp-tile-text">
                      <span className="edtp-tile-label">Logged Events</span>
                      <span className="edtp-tile-value">{allActivities.length + attempts.length + 1} Records</span>
                    </div>
                    <span className="edtp-badge edtp-badge--primary">Tracked</span>
                  </div>
                  <div className="edtp-tile-item">
                    <div className="edtp-tile-text">
                      <span className="edtp-tile-label">Current Session</span>
                      <span className="edtp-tile-value">Active Now</span>
                    </div>
                    <span className="edtp-badge edtp-badge--verified">Secure</span>
                  </div>
                  <div className="edtp-tile-item">
                    <div className="edtp-tile-text">
                      <span className="edtp-tile-label">Last Sign In</span>
                      <span className="edtp-tile-value">{user.lastLoginAt ? formatRelativeDate(user.lastLoginAt) : 'Recent'}</span>
                    </div>
                    <span className="edtp-badge edtp-badge--neutral">Session</span>
                  </div>
                  <div className="edtp-tile-item">
                    <div className="edtp-tile-text">
                      <span className="edtp-tile-label">Export Format</span>
                      <span className="edtp-tile-value">CSV (Comma Separated)</span>
                    </div>
                    <span className="edtp-badge edtp-badge--verified">Ready</span>
                  </div>

                  <div style={{ marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={handleExportAuditCsv}
                      className="org-add-btn"
                      style={{ width: '100%', padding: '10px 16px', fontSize: '0.85rem', justifyContent: 'center' }}
                    >
                      Export Audit Log (.CSV)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Recent Account Activity & Security Audit */}
            <div className="edtp-profile-col-right">
              <div className="edtp-profile-card edtp-activity-card">
                <div className="edtp-card-header edtp-card-header--with-filters">
                  <div>
                    <h3 className="edtp-card-title">Recent Account Activity & Security Audit</h3>
                    <p className="edtp-card-subtitle">
                      Real-time chronological log of administrative operations and sessions
                    </p>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="edtp-filter-pills">
                    <button
                      type="button"
                      className={`edtp-filter-pill ${activityFilter === 'all' ? 'edtp-filter-pill--active' : ''}`}
                      onClick={() => setActivityFilter('all')}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      className={`edtp-filter-pill ${activityFilter === 'exams' ? 'edtp-filter-pill--active' : ''}`}
                      onClick={() => setActivityFilter('exams')}
                    >
                      Exams
                    </button>
                    <button
                      type="button"
                      className={`edtp-filter-pill ${activityFilter === 'logins' ? 'edtp-filter-pill--active' : ''}`}
                      onClick={() => setActivityFilter('logins')}
                    >
                      Logins
                    </button>
                    <button
                      type="button"
                      className={`edtp-filter-pill ${activityFilter === 'security' ? 'edtp-filter-pill--active' : ''}`}
                      onClick={() => setActivityFilter('security')}
                    >
                      Security
                    </button>
                  </div>
                </div>

                {/* Vertical Timeline with Connected Line */}
                <div className="edtp-timeline-container">
                  <div className="edtp-timeline-line" aria-hidden="true" />
                  <div className="edtp-timeline-list">
                    {filteredActivities.length === 0 && (
                      <p className="edtp-timeline-sub" style={{ margin: '8px 0 0 28px' }}>No activity yet.</p>
                    )}
                    {filteredActivities.map((act) => (
                      <div key={act.id} className="edtp-timeline-item">
                        <div className="edtp-timeline-node" aria-hidden="true" />
                        <div className="edtp-timeline-content">
                          <div className="edtp-timeline-header">
                            <span className="edtp-timeline-title">{act.title}</span>
                            <span className={`edtp-event-tag edtp-event-tag--${act.badgeType}`}>
                              {act.badge}
                            </span>
                            <span className="edtp-timeline-time">{act.time}</span>
                          </div>
                          <p className="edtp-timeline-sub">{act.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="edtp-card-footer">
                  <span>Showing latest administrative activities</span>
                  <span className="edtp-meta-separator">•</span>
                  <button
                    type="button"
                    className="edtp-footer-link"
                    onClick={handleExportAuditCsv}
                  >
                    Download Full Audit Log (CSV)
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
