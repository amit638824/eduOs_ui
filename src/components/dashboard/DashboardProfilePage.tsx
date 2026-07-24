import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useDashboardLoadingEffect } from '@/context/DashboardLoadingContext';
import { useOrganization } from '@/hooks/useOrganization';
import { examinationService, platformService } from '@/services';
import { resolveImageUrl } from '@/utils/image';
import { resolveLayoutRole, resolveDashboardRole } from '@/utils/dashboardRole';
import { siteContent } from '@/data/siteContent';
import type { OrgAnalytics, StudentStats, TestAttempt } from '@/types/examination';
import type { Notification } from '@/services/platform.service';
import { ProfileSettingsApiForm } from '@/components/dashboard/examination/ExaminationPanels';
import { formatDate, formatRelativeDate } from '@/utils/dateFormat';

function primaryRoleLabel(roles: string[]) {
  const order = [
    'super_admin',
    'org_admin',
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
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
  const [orgStats, setOrgStats] = useState<OrgAnalytics | null>(null);
  const [attempts, setAttempts] = useState<TestAttempt[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [assignedTests, setAssignedTests] = useState(0);
  const [resultsCount, setResultsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const layoutRole = user ? resolveLayoutRole(user.roles) : 'student';
  const apiRole = user ? resolveDashboardRole(user.roles) : 'student';

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const tasks: Promise<unknown>[] = [
      platformService.listNotifications(1, 8).then((r) => {
        setNotifications(r.data);
        setUnreadCount(r.data.filter((n) => !n.is_read).length);
      }),
      platformService.getUnreadCount().then(setUnreadCount).catch(() => undefined),
    ];

    if (layoutRole === 'student') {
      tasks.push(
        examinationService.getMyStats().then(setStudentStats).catch(() => setStudentStats(null)),
        examinationService.listMyAssignedTests().then((tests) => setAssignedTests(tests.length)),
        examinationService.listMyResults().then((results) => setResultsCount(results.length)),
        examinationService.listAttempts(1, 20).then((r) => setAttempts(r.data)),
      );
    } else {
      tasks.push(
        examinationService.getAnalyticsOverview().then(setOrgStats),
        examinationService.listAttempts(1, 8).then((r) => setAttempts(r.data)),
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
    if (user?.roles.includes('super_admin')) return 'Platform Administration';
    return siteContent.brand.name;
  }, [organization, user]);

  const branchName = useMemo(() => {
    if (!user?.branchId || !branches.length) return null;
    return branches.find((b) => b.id === user.branchId)?.name ?? null;
  }, [user, branches]);

  const locationText = useMemo(() => {
    if (branchName) return `${branchName}, Jaunpur`;
    return organizationName;
  }, [branchName, organizationName]);

  const memberSince = user?.createdAt ? formatDate(user.createdAt) : '—';

  const statCards = useMemo(() => {
    if (layoutRole === 'student' && studentStats) {
      return [
        { label: 'Assigned Tests', value: studentStats.assigned_tests, icon: 'icofont-book-alt' },
        { label: 'Attempts', value: studentStats.attempts, icon: 'icofont-ui-clock' },
        { label: 'Results', value: studentStats.results, icon: 'icofont-certificate-alt-1' },
      ];
    }
    if (layoutRole === 'student') {
      return [
        { label: 'Assigned Tests', value: assignedTests, icon: 'icofont-book-alt' },
        { label: 'Results', value: resultsCount, icon: 'icofont-certificate-alt-1' },
        { label: 'Notifications', value: unreadCount, icon: 'icofont-notification' },
      ];
    }
    if (orgStats) {
      return [
        { label: 'Students', value: orgStats.students, icon: 'icofont-users-alt-4' },
        { label: 'Tests', value: orgStats.tests, icon: 'icofont-file-document' },
        { label: 'Attempts', value: orgStats.attempts, icon: 'icofont-chart-bar-graph' },
      ];
    }
    return [
      { label: 'Notifications', value: unreadCount, icon: 'icofont-notification' },
      { label: 'Branch', value: branchName ?? '—', icon: 'icofont-location-pin' },
      { label: 'Member Since', value: memberSince, icon: 'icofont-calendar' },
    ];
  }, [layoutRole, studentStats, orgStats, assignedTests, resultsCount, unreadCount, branchName, memberSince]);

  const activityItems = useMemo(() => {
    const items: { title: string; time: string }[] = [];

    notifications.slice(0, 4).forEach((n) => {
      items.push({ title: n.title, time: formatRelativeDate(n.created_at) });
    });

    if (apiRole === 'student') {
      attempts.slice(0, 4).forEach((a) => {
        const status = a.status.replace(/_/g, ' ');
        items.push({
          title: `${a.test_title ?? 'Test'} — ${status.charAt(0).toUpperCase()}${status.slice(1)}`,
          time: formatRelativeDate(a.started_at),
        });
      });
    }

    if (user?.lastLoginAt) {
      items.push({ title: 'Last login to portal', time: formatRelativeDate(user.lastLoginAt) });
    }

    if (user?.createdAt) {
      items.push({ title: 'Account created', time: formatRelativeDate(user.createdAt) });
    }

    return items.slice(0, 8);
  }, [notifications, attempts, user]);

  if (!user) return null;

  const fullName = `${user.firstName} ${user.lastName}`.trim();

  return (
    <div className="sca-profile">
      <div className="sca-profile__hero">
        <div className="sca-profile__cover" aria-hidden="true" />
        <div className="sca-profile__hero-body">
          <div className="sca-profile__hero-inner">
            <div className="sca-profile__identity">
              <div className="sca-profile__avatar-wrap">
                {usePhotoAvatar ? (
                  <img src={avatarUrl} alt={fullName} className="sca-profile__avatar" />
                ) : (
                  <div className="sca-profile__avatar sca-profile__avatar--initials" aria-hidden="true">
                    {initials(user.firstName, user.lastName)}
                  </div>
                )}
              </div>
              <div className="sca-profile__meta">
                <h1 className="sca-profile__name">{fullName}</h1>
                <p className="sca-profile__handle">{usernameFromEmail(user.email)}</p>
                <p className="sca-profile__location">
                  <i className="icofont-location-pin" aria-hidden="true" />
                  {locationText}
                </p>
                <p className="sca-profile__subtitle">{organizationName}</p>
                <div className="sca-profile__tags">
                  <span className="edtp-badge edtp-badge--role">{primaryRoleLabel(user.roles)}</span>
                  <span className={`edtp-badge ${user.status === 'active' ? 'edtp-badge--active' : 'edtp-badge--inactive'}`}>
                    {formatStatus(user.status)}
                  </span>
                </div>
              </div>
            </div>
            <button
              type="button"
              className="sca-profile__edit-btn"
              onClick={() => setEditing((e) => !e)}
            >
              <i className="icofont-edit-alt" aria-hidden="true" />
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {editing && (
        <div className="sca-profile__edit-panel edtp-form-card">
          <h5>Edit Profile</h5>
          <ProfileSettingsApiForm onSuccess={() => setEditing(false)} />
        </div>
      )}

      <div className="sca-profile__grid">
        <aside className="sca-profile__card">
          <div className="sca-profile__card-head">
            <h3>Personal Information</h3>
          </div>
          <dl className="sca-profile__info-list">
            <div className="sca-profile__info-row">
              <dt>Email</dt>
              <dd><a href={`mailto:${user.email}`}>{user.email}</a></dd>
            </div>
            <div className="sca-profile__info-row">
              <dt>Phone</dt>
              <dd>{user.phone || '—'}</dd>
            </div>
            <div className="sca-profile__info-row">
              <dt>Role</dt>
              <dd>{primaryRoleLabel(user.roles)}</dd>
            </div>
            <div className="sca-profile__info-row">
              <dt>Organization</dt>
              <dd>{organizationName}</dd>
            </div>
            {branchName && (
              <div className="sca-profile__info-row">
                <dt>Branch</dt>
                <dd>{branchName}</dd>
              </div>
            )}
            <div className="sca-profile__info-row">
              <dt>Registered</dt>
              <dd>{memberSince}</dd>
            </div>
            <div className="sca-profile__info-row">
              <dt>Email Verified</dt>
              <dd>{user.emailVerified ? 'Verified' : 'Not verified'}</dd>
            </div>
            <div className="sca-profile__info-row">
              <dt>Two-Factor Auth</dt>
              <dd>{user.mfaEnabled ? 'Enabled' : 'Not enabled'}</dd>
            </div>
            <div className="sca-profile__info-row">
              <dt>Account Status</dt>
              <dd>{formatStatus(user.status)}</dd>
            </div>
          </dl>
          <div className="sca-profile__quick-links">
            <Link to={`/dashboard/${layoutRole}-settings`} className="sca-profile__link-btn">
              Account Settings
            </Link>
            <Link to={`/dashboard/${layoutRole}-message`} className="sca-profile__link-btn sca-profile__link-btn--muted">
              Notifications
            </Link>
          </div>
        </aside>

        <div className="sca-profile__main">
          <div className="sca-profile__stats">
            {statCards.map((card) => (
              <div key={card.label} className="sca-profile__stat-card">
                <i className={card.icon} />
                <div>
                  <span className="sca-profile__stat-value">{card.value}</span>
                  <span className="sca-profile__stat-label">{card.label}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="sca-profile__card">
            <div className="sca-profile__card-head">
              <h3>Recent Activity</h3>
            </div>
            {activityItems.length > 0 ? (
              <ul className="sca-profile__activity">
                {activityItems.map((item, i) => (
                  <li key={`${item.title}-${i}`}>
                    <span className="sca-profile__activity-title">{item.title}</span>
                    <span className="sca-profile__activity-time">{item.time}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="sca-profile__empty">No recent activity yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
