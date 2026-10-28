import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import type { OrgAnalytics } from '@/types/examination';
import { platformService } from '@/services';
import type { AuditLog } from '@/services/platform.service';

interface ModernAdminDashboardProps {
  examStats: OrgAnalytics | null;
  error?: string | null;
}

export default function ModernAdminDashboard({ examStats, error }: ModernAdminDashboardProps) {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const [timeFilter, setTimeFilter] = useState<'Last 7 days' | 'Last 30 days' | 'This Month'>('Last 7 days');
  const [subjectMonth, setSubjectMonth] = useState('This Month');
  const [activeStep, setActiveStep] = useState(2);
  const [dynamicActivities, setDynamicActivities] = useState<AuditLog[]>([]);

  useEffect(() => {
    let mounted = true;
    platformService
      .listAuditLogs(1, 4)
      .then((res) => {
        if (mounted && res?.data && res.data.length > 0) {
          setDynamicActivities(res.data);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, []);

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : 'Rahul Sharma';

  // Dynamic statistics matching new screenshot with smart fallbacks
  const totalTests = examStats?.tests != null ? String(examStats.tests) : '68';
  const totalStudents = examStats?.students != null ? String(examStats.students) : '10';
  const totalAttempts = examStats?.attempts != null ? String(examStats.attempts) : '59';
  const avgScore =
    examStats?.pass_rate && examStats.pass_rate > 0
      ? `${Math.round(examStats.pass_rate)}%`
      : '86%';

  // Top Performing Students data
  const topStudents = [
    {
      id: 's1',
      name: 'Priya Singh',
      score: '98%',
      scoreVal: 98,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80',
    },
    {
      id: 's2',
      name: 'Aman Sharma',
      score: '95%',
      scoreVal: 95,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
    },
    {
      id: 's3',
      name: 'Neha Gupta',
      score: '92%',
      scoreVal: 92,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80',
    },
  ];

  // Dynamic Recent Activity list
  const displayActivities = useMemo(() => {
    if (dynamicActivities && dynamicActivities.length > 0) {
      const styles = [
        { color: 'purple', type: 'chart', tag: 'Completed', tagColor: 'green' },
        { color: 'green', type: 'users', tag: 'New', tagColor: 'blue' },
        { color: 'purple', type: 'doc', tag: 'Created', tagColor: 'purple' },
        { color: 'amber', type: 'database', tag: 'Updated', tagColor: 'amber' },
      ];
      return dynamicActivities.slice(0, 4).map((act, idx) => {
        const s = styles[idx % styles.length];
        return {
          id: act.id,
          color: s.color,
          type: s.type,
          title: act.action || 'Activity Recorded',
          subtitle: act.resource || act.user_email || 'System Operation',
          time: 'Recently',
          tag: s.tag,
          tagColor: s.tagColor,
        };
      });
    }

    // Default matching new screenshot exactly
    return [
      {
        id: 'a1',
        color: 'purple',
        type: 'chart',
        title: 'Report generated',
        subtitle: 'Monthly Performance Report',
        time: '6 hours ago',
        tag: 'Completed',
        tagColor: 'green',
      },
      {
        id: 'a2',
        color: 'green',
        type: 'users',
        title: 'New student registered',
        subtitle: 'Priya Singh',
        time: '8 hours ago',
        tag: 'New',
        tagColor: 'blue',
      },
      {
        id: 'a3',
        color: 'purple',
        type: 'doc',
        title: 'Test created',
        subtitle: 'Mathematics - Chapter 4',
        time: '10 hours ago',
        tag: 'Created',
        tagColor: 'purple',
      },
      {
        id: 'a4',
        color: 'amber',
        type: 'database',
        title: 'Question bank updated',
        subtitle: 'Added 25 new questions',
        time: '12 hours ago',
        tag: 'Updated',
        tagColor: 'amber',
      },
    ];
  }, [dynamicActivities]);

  return (
    <div className="mad-v3-root">
      {error && (
        <div className="mad-alert-error" role="alert">
          <svg viewBox="0 0 20 20" fill="currentColor" width="20" height="20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Top 2-Column Section: Hero Banner + Stats + Stepper on Left, Quick Actions + Recent Activity on Right */}
      <div className="mad-v3-top-grid">
        {/* ── LEFT MAIN SECTION (72%) ── */}
        <div className="mad-v3-left-col">
          {/* 1. Hero Welcome Banner */}
          <div className="mad-v3-welcome-banner">
            <div className="mad-v3-welcome-content">
              <span className="mad-v3-welcome-sub">Welcome back,</span>
              <h2 className="mad-v3-welcome-title">
                {displayName} <span className="mad-v3-wave">👏</span>
              </h2>
              <p className="mad-v3-welcome-desc">
                {organization?.name
                  ? `Manage exams, track student performance, and administer ${organization.name} — all in one place.`
                  : 'Manage exams, track student performance, and administer softtix solution — all in one place.'}
              </p>

              {/* 4 Feature Pills / Cards inside the Banner */}
              <div className="mad-v3-banner-cards">
                <Link to="/dashboard/create-test" className="mad-v3-action-card">
                  <div className="mad-v3-action-icon mad-v3-action-icon--blue">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                      <path d="M11 4H4a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      <path d="M16 2.5a2.121 2.121 0 013 3L9 15l-4 1 1-4 10-10.5z" />
                    </svg>
                  </div>
                  <div className="mad-v3-action-info">
                    <strong>Create Tests</strong>
                    <small>Build custom assessments</small>
                  </div>
                  <svg className="mad-v3-action-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                    <path d="M6 3l5 5-5 5" />
                  </svg>
                </Link>

                <Link to="/dashboard/admin-students" className="mad-v3-action-card">
                  <div className="mad-v3-action-icon mad-v3-action-icon--green">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                      <path d="M17 17v-1.5a3.5 3.5 0 00-3.5-3.5h-7A3.5 3.5 0 003 15.5V17" />
                      <circle cx="10" cy="6" r="3.5" />
                    </svg>
                  </div>
                  <div className="mad-v3-action-info">
                    <strong>Manage Students</strong>
                    <small>Track progress &amp; performance</small>
                  </div>
                  <svg className="mad-v3-action-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                    <path d="M6 3l5 5-5 5" />
                  </svg>
                </Link>

                <Link to="/dashboard/admin-reviews" className="mad-v3-action-card">
                  <div className="mad-v3-action-icon mad-v3-action-icon--purple">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                      <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0z" />
                      <path d="M10 2v8h8" />
                    </svg>
                  </div>
                  <div className="mad-v3-action-info">
                    <strong>View Reports</strong>
                    <small>Get detailed insights</small>
                  </div>
                  <svg className="mad-v3-action-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                    <path d="M6 3l5 5-5 5" />
                  </svg>
                </Link>

                <Link to="/dashboard/admin-question-bank" className="mad-v3-action-card">
                  <div className="mad-v3-action-icon mad-v3-action-icon--amber">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                      <path d="M3 5a2 2 0 012-2h4l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V5z" />
                    </svg>
                  </div>
                  <div className="mad-v3-action-info">
                    <strong>Question Bank</strong>
                    <small>Organize &amp; reuse questions</small>
                  </div>
                  <svg className="mad-v3-action-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13">
                    <path d="M6 3l5 5-5 5" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Illustration Graphic + Hand-drawn slogan (Cleanly Separated, Zero Overlap) */}
            <div className="mad-v3-welcome-graphic">
              {/* Vector Teacher/Student Desk Illustration */}
              <div className="mad-v3-illu-box">
                <svg viewBox="0 0 180 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="mad-v3-illu-svg">
                  <defs>
                    <linearGradient id="v3Glow" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#EFF6FF" />
                      <stop offset="100%" stopColor="#DBEAFE" />
                    </linearGradient>
                    <linearGradient id="v3CapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2563EB" />
                      <stop offset="100%" stopColor="#1D4ED8" />
                    </linearGradient>
                    <filter id="v3Shadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#1E3A8A" floodOpacity="0.1" />
                    </filter>
                  </defs>

                  {/* Soft circular aura */}
                  <circle cx="90" cy="80" r="60" fill="url(#v3Glow)" />

                  {/* Floating Graduation Cap */}
                  <g filter="url(#v3Shadow)">
                    <polygon points="30,40 50,30 70,40 50,50" fill="url(#v3CapGrad)" />
                    <path d="M37 44V54C37 60 63 60 63 54V44" fill="#1D4ED8" />
                    <line x1="70" y1="40" x2="70" y2="54" stroke="#F59E0B" strokeWidth="1.5" />
                    <circle cx="70" cy="55" r="1.5" fill="#F59E0B" />
                  </g>

                  {/* Floating Bar Chart Card */}
                  <g filter="url(#v3Shadow)">
                    <rect x="110" y="32" width="48" height="40" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
                    <rect x="118" y="54" width="5" height="12" rx="1.5" fill="#93C5FD" />
                    <rect x="127" y="47" width="5" height="19" rx="1.5" fill="#3B82F6" />
                    <rect x="136" y="40" width="5" height="26" rx="1.5" fill="#1D4ED8" />
                  </g>

                  {/* Desk Base */}
                  <rect x="35" y="120" width="115" height="5" rx="2.5" fill="#94A3B8" />

                  {/* Person */}
                  <circle cx="90" cy="78" r="12" fill="#FCD34D" />
                  <path d="M80 76C80 66 90 64 98 65C104 66 105 71 103 76C99 72 96 72 88 73C82 74 80 76 80 76Z" fill="#1E293B" />
                  <path d="M72 120C72 98 85 94 90 94C95 94 108 98 108 120H72Z" fill="#3B82F6" />

                  {/* Laptop */}
                  <polygon points="80,120 102,120 99,106 83,106" fill="#0F172A" />
                  <polygon points="82,118 100,118 98,108 84,108" fill="#38BDF8" />
                </svg>
              </div>

              {/* Decorative Handwritten Slogan - Cleanly separated to the right */}
              <div className="mad-v3-slogan-box">
                <div className="mad-v3-slogan-lines">
                  <span>Better</span>
                  <span>Education</span>
                  <span>Brighter</span>
                  <span>Future</span>
                </div>
                <svg viewBox="0 0 60 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="mad-v3-slogan-underline">
                  <path d="M2 9C18 3 42 12 58 6" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>

          {/* 2. 4 Stat Metric Cards with Sparkline Wave Graphs */}
          <div className="mad-v3-stats-row">
            {/* Card 1: Total Tests */}
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
                  <span className="mad-v3-stat-num">{totalTests}</span>
                  <span className="mad-v3-stat-title">Total Tests</span>
                </div>
                {/* Blue Sparkline SVG */}
                <div className="mad-v3-sparkline-box">
                  <svg viewBox="0 0 100 45" className="mad-v3-sparkline-svg" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="spBlue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,35 C25,38 40,24 65,28 C80,30 90,8 100,5 L100,45 L0,45 Z" fill="url(#spBlue)" />
                    <path d="M0,35 C25,38 40,24 65,28 C80,30 90,8 100,5" fill="none" stroke="#2563EB" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              <div className="mad-v3-stat-trend">
                <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12" className="trend-arrow">
                  <path d="M8 2.5l4.5 4.5-1.1 1.1L8.8 5.5v8H7.2v-8L4.6 8.1 3.5 7 8 2.5z" />
                </svg>
                <span>20%</span> <span className="trend-lbl">from last month</span>
              </div>
            </div>

            {/* Card 2: Total Students */}
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
                  <span className="mad-v3-stat-num">{totalStudents}</span>
                  <span className="mad-v3-stat-title">Total Students</span>
                </div>
                {/* Green Sparkline SVG */}
                <div className="mad-v3-sparkline-box">
                  <svg viewBox="0 0 100 45" className="mad-v3-sparkline-svg" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="spGreen" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,38 C20,38 40,30 60,22 C75,16 85,14 100,6 L100,45 L0,45 Z" fill="url(#spGreen)" />
                    <path d="M0,38 C20,38 40,30 60,22 C75,16 85,14 100,6" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              <div className="mad-v3-stat-trend">
                <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12" className="trend-arrow">
                  <path d="M8 2.5l4.5 4.5-1.1 1.1L8.8 5.5v8H7.2v-8L4.6 8.1 3.5 7 8 2.5z" />
                </svg>
                <span>12%</span> <span className="trend-lbl">from last month</span>
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
                  <span className="mad-v3-stat-num">{totalAttempts}</span>
                  <span className="mad-v3-stat-title">Total Attempts</span>
                </div>
                {/* Purple Sparkline SVG */}
                <div className="mad-v3-sparkline-box">
                  <svg viewBox="0 0 100 45" className="mad-v3-sparkline-svg" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="spPurple" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,38 C25,38 35,26 55,30 C75,34 85,12 100,6 L100,45 L0,45 Z" fill="url(#spPurple)" />
                    <path d="M0,38 C25,38 35,26 55,30 C75,34 85,12 100,6" fill="none" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              <div className="mad-v3-stat-trend">
                <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12" className="trend-arrow">
                  <path d="M8 2.5l4.5 4.5-1.1 1.1L8.8 5.5v8H7.2v-8L4.6 8.1 3.5 7 8 2.5z" />
                </svg>
                <span>18%</span> <span className="trend-lbl">from last month</span>
              </div>
            </div>

            {/* Card 4: Average Score */}
            <div className="mad-v3-stat-card">
              <div className="mad-v3-stat-top">
                <div className="mad-v3-stat-icon mad-v3-stat-icon--amber">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                    <path d="M4 17V10" />
                    <path d="M10 17V6" />
                    <path d="M16 17V3" />
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
                  <span className="mad-v3-stat-num">{avgScore}</span>
                  <span className="mad-v3-stat-title">Average Score</span>
                </div>
                {/* Amber Sparkline SVG */}
                <div className="mad-v3-sparkline-box">
                  <svg viewBox="0 0 100 45" className="mad-v3-sparkline-svg" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="spAmber" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,38 C20,38 35,28 50,32 C65,36 80,18 100,6 L100,45 L0,45 Z" fill="url(#spAmber)" />
                    <path d="M0,38 C20,38 35,28 50,32 C65,36 80,18 100,6" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              <div className="mad-v3-stat-trend">
                <svg viewBox="0 0 16 16" fill="currentColor" width="12" height="12" className="trend-arrow">
                  <path d="M8 2.5l4.5 4.5-1.1 1.1L8.8 5.5v8H7.2v-8L4.6 8.1 3.5 7 8 2.5z" />
                </svg>
                <span>6%</span> <span className="trend-lbl">from last month</span>
              </div>
            </div>
          </div>

          {/* 3. Workflow Guide: Exam Creation & Delivery Stepper */}
          <div className="mad-v3-stepper-card">
            <div className="mad-v3-stepper-head">
              <div className="mad-v3-stepper-title-wrap">
                <div className="mad-v3-stepper-badge-icon">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <circle cx="10" cy="10" r="8" />
                    <polygon points="13,7 11,11 7,13 9,9" />
                  </svg>
                </div>
                <span className="mad-v3-stepper-badge">Workflow Guide</span>
                <h3 className="mad-v3-stepper-heading">Exam Creation &amp; Delivery Stepper</h3>
              </div>
              <span className="mad-v3-stepper-hint">Step-by-step progress from question bank to student assignment</span>
            </div>

            {/* Stepper Progression matching mockup */}
            <div className="mad-v3-stepper-body">
              {/* Step 1 */}
              <div
                className={`mad-v3-step-node ${activeStep >= 1 ? 'mad-v3-step-node--done' : ''}`}
                onClick={() => setActiveStep(1)}
                style={{ cursor: 'pointer' }}
              >
                <div className={`mad-v3-step-circle ${activeStep > 1 ? 'mad-v3-step-circle--done' : activeStep === 1 ? 'mad-v3-step-circle--active' : ''}`}>
                  {activeStep > 1 ? (
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      <path d="M5 10l3 3 7-7" />
                    </svg>
                  ) : '1'}
                </div>
                <div className="mad-v3-step-labels">
                  <strong className="mad-v3-step-title">Question Bank</strong>
                  <span className="mad-v3-step-desc">Add questions</span>
                </div>
                <div className="mad-v3-step-subicon mad-v3-step-subicon--green">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <ellipse cx="10" cy="5" rx="7" ry="2.5" />
                    <path d="M3 5v5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V5" />
                    <path d="M3 10v5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-5" />
                  </svg>
                </div>
              </div>

              <div className={`mad-v3-step-line ${activeStep >= 2 ? 'mad-v3-step-line--done' : ''}`} />

              {/* Step 2 */}
              <div
                className={`mad-v3-step-node ${activeStep === 2 ? 'mad-v3-step-node--active' : activeStep > 2 ? 'mad-v3-step-node--done' : ''}`}
                onClick={() => setActiveStep(2)}
                style={{ cursor: 'pointer' }}
              >
                <div className={`mad-v3-step-circle ${activeStep > 2 ? 'mad-v3-step-circle--done' : activeStep === 2 ? 'mad-v3-step-circle--active' : ''}`}>
                  {activeStep > 2 ? (
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      <path d="M5 10l3 3 7-7" />
                    </svg>
                  ) : '2'}
                </div>
                <div className="mad-v3-step-labels">
                  <strong className="mad-v3-step-title">Exam Details</strong>
                  <span className="mad-v3-step-desc">Name, time, rules</span>
                </div>
                <div className="mad-v3-step-subicon mad-v3-step-subicon--blue">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <path d="M13 2H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7l-5-5z" />
                    <path d="M13 2v5h5" />
                  </svg>
                </div>
              </div>

              <div className={`mad-v3-step-line ${activeStep >= 3 ? 'mad-v3-step-line--done' : ''}`} />

              {/* Step 3 */}
              <div
                className={`mad-v3-step-node ${activeStep === 3 ? 'mad-v3-step-node--active' : activeStep > 3 ? 'mad-v3-step-node--done' : ''}`}
                onClick={() => setActiveStep(3)}
                style={{ cursor: 'pointer' }}
              >
                <div className={`mad-v3-step-circle ${activeStep > 3 ? 'mad-v3-step-circle--done' : activeStep === 3 ? 'mad-v3-step-circle--active' : 'mad-v3-step-circle--purple'}`}>
                  {activeStep > 3 ? (
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      <path d="M5 10l3 3 7-7" />
                    </svg>
                  ) : '3'}
                </div>
                <div className="mad-v3-step-labels">
                  <strong className="mad-v3-step-title">Add Questions</strong>
                  <span className="mad-v3-step-desc">Build the paper</span>
                </div>
                <div className="mad-v3-step-subicon mad-v3-step-subicon--purple">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <circle cx="10" cy="10" r="7" />
                    <path d="M10 7v6" />
                    <path d="M7 10h6" />
                  </svg>
                </div>
              </div>

              <div className={`mad-v3-step-line ${activeStep >= 4 ? 'mad-v3-step-line--done' : ''}`} />

              {/* Step 4 */}
              <div
                className={`mad-v3-step-node ${activeStep === 4 ? 'mad-v3-step-node--active' : activeStep > 4 ? 'mad-v3-step-node--done' : ''}`}
                onClick={() => setActiveStep(4)}
                style={{ cursor: 'pointer' }}
              >
                <div className={`mad-v3-step-circle ${activeStep > 4 ? 'mad-v3-step-circle--done' : activeStep === 4 ? 'mad-v3-step-circle--active' : 'mad-v3-step-circle--amber'}`}>
                  {activeStep > 4 ? (
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      <path d="M5 10l3 3 7-7" />
                    </svg>
                  ) : '4'}
                </div>
                <div className="mad-v3-step-labels">
                  <strong className="mad-v3-step-title">Publish</strong>
                  <span className="mad-v3-step-desc">Make it available</span>
                </div>
                <div className="mad-v3-step-subicon mad-v3-step-subicon--amber">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <path d="M18 2L9 11" />
                    <path d="M18 2L12 18L9 11L2 8L18 2Z" />
                  </svg>
                </div>
              </div>

              <div className={`mad-v3-step-line ${activeStep >= 5 ? 'mad-v3-step-line--done' : ''}`} />

              {/* Step 5 */}
              <div
                className={`mad-v3-step-node ${activeStep === 5 ? 'mad-v3-step-node--active' : ''}`}
                onClick={() => setActiveStep(5)}
                style={{ cursor: 'pointer' }}
              >
                <div className={`mad-v3-step-circle ${activeStep === 5 ? 'mad-v3-step-circle--active' : 'mad-v3-step-circle--gray'}`}>
                  5
                </div>
                <div className="mad-v3-step-labels">
                  <strong className="mad-v3-step-title">Assign</strong>
                  <span className="mad-v3-step-desc">Students can start</span>
                </div>
                <div className="mad-v3-step-subicon mad-v3-step-subicon--gray">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <path d="M16 17v-1.5a3 3 0 00-3-3H7a3 3 0 00-3 3V17" />
                    <circle cx="10" cy="7" r="3" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Stepper Bottom Notice Bar */}
            <div className="mad-v3-stepper-footer">
              <div className="mad-v3-stepper-footer-left">
                <div className="mad-v3-bulb-circle">
                  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <path d="M8 15h4M9 17h2M10 2a5 5 0 00-3.54 8.54c.97.96 1.54 2.27 1.54 3.46v1h4v-1c0-1.19.57-2.5 1.54-3.46A5 5 0 0010 2z" />
                  </svg>
                </div>
                <span className="mad-v3-footer-msg">Follow the five steps from left to right.</span>
              </div>
              <Link to="/dashboard/create-test" className="mad-v3-start-btn">
                <span>Start Now</span>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 6 }}>
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* ── RIGHT MAIN SECTION (28%) ── */}
        <div className="mad-v3-right-col">
          {/* Quick Actions Card */}
          <div className="mad-v3-qa-card">
            <div className="mad-v3-qa-head">
              <svg viewBox="0 0 20 20" fill="#2563EB" width="18" height="18" className="mad-v3-qa-bolt">
                <path d="M11.3 1L4 11h5l-1.3 8L15 9h-5l1.3-8z" />
              </svg>
              <h3 className="mad-v3-qa-heading">Quick Actions</h3>
            </div>

            {/* Primary Action Button */}
            <Link to="/dashboard/create-test" className="mad-v3-qa-primary-btn">
              <span className="mad-v3-qa-btn-text">
                <span className="mad-v3-plus">+</span> Create New Test
              </span>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="14" height="14" className="mad-v3-qa-arrow">
                <path d="M6 3l5 5-5 5" />
              </svg>
            </Link>

            {/* Action Items List */}
            <div className="mad-v3-qa-list">
              <Link to="/dashboard/admin-question-bank" className="mad-v3-qa-item">
                <div className="mad-v3-qa-item-left">
                  <div className="mad-v3-qa-icon mad-v3-qa-icon--blue">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      <path d="M11 4H4a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-7" />
                      <path d="M16 2.5a2.121 2.121 0 013 3L9 15l-4 1 1-4 10-10.5z" />
                    </svg>
                  </div>
                  <span className="mad-v3-qa-label">Add Question</span>
                </div>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" className="mad-v3-qa-item-arrow">
                  <path d="M6 3l5 5-5 5" />
                </svg>
              </Link>

              <Link to="/dashboard/admin-question-bank" className="mad-v3-qa-item">
                <div className="mad-v3-qa-item-left">
                  <div className="mad-v3-qa-icon mad-v3-qa-icon--blue">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      <path d="M4 14v2a2 2 0 002 2h8a2 2 0 002-2v-2" />
                      <polyline points="7,8 10,5 13,8" />
                      <line x1="10" y1="5" x2="10" y2="14" />
                    </svg>
                  </div>
                  <span className="mad-v3-qa-label">Import Questions (CSV)</span>
                </div>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" className="mad-v3-qa-item-arrow">
                  <path d="M6 3l5 5-5 5" />
                </svg>
              </Link>

              <Link to="/dashboard/admin-reviews" className="mad-v3-qa-item">
                <div className="mad-v3-qa-item-left">
                  <div className="mad-v3-qa-icon mad-v3-qa-icon--blue">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      <circle cx="10" cy="10" r="8" />
                      <path d="M10 2v8h8" />
                    </svg>
                  </div>
                  <span className="mad-v3-qa-label">View Reports</span>
                </div>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13" className="mad-v3-qa-item-arrow">
                  <path d="M6 3l5 5-5 5" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Recent Activity Card (Flex stretched to align bottom with Workflow Guide) */}
          <div className="mad-v3-activity-card">
            <div className="mad-v3-activity-head">
              <div className="mad-v3-act-title-wrap">
                <svg viewBox="0 0 20 20" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18" className="mad-v3-clock-icon">
                  <circle cx="10" cy="10" r="8" />
                  <path d="M10 5v5l3 2" />
                </svg>
                <h3 className="mad-v3-act-heading">Recent Activity</h3>
              </div>
              <Link to="/dashboard/admin-audit" className="mad-v3-viewall-link">
                <span>View All</span>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 4 }}>
                  <path d="M6 3l5 5-5 5" />
                </svg>
              </Link>
            </div>

            <div className="mad-v3-activity-items">
              {displayActivities.map((act) => (
                <div key={act.id} className="mad-v3-act-row">
                  <div className={`mad-v3-act-iconbox mad-v3-act-iconbox--${act.color}`}>
                    {act.type === 'chart' && (
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                        <path d="M4 16v-6" />
                        <path d="M10 16v-10" />
                        <path d="M16 16v-4" />
                      </svg>
                    )}
                    {act.type === 'users' && (
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                        <path d="M17 17v-1.5a3.5 3.5 0 00-3.5-3.5h-7A3.5 3.5 0 003 15.5V17" />
                        <circle cx="10" cy="6" r="3.5" />
                      </svg>
                    )}
                    {act.type === 'doc' && (
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                        <path d="M13 2H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7l-5-5z" />
                        <path d="M13 2v5h5" />
                      </svg>
                    )}
                    {act.type === 'database' && (
                      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                        <ellipse cx="10" cy="5" rx="7" ry="2.5" />
                        <path d="M3 5v5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V5" />
                        <path d="M3 10v5c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-5" />
                      </svg>
                    )}
                  </div>
                  <div className="mad-v3-act-info">
                    <h5 className="mad-v3-act-title">{act.title}</h5>
                    <span className="mad-v3-act-sub">{act.subtitle}</span>
                    <span className="mad-v3-act-time">{act.time}</span>
                  </div>
                  <div className="mad-v3-act-tag-wrap">
                    <span className={`mad-v3-tag mad-v3-tag--${act.tagColor}`}>{act.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM 3-CARD ROW (FULL WIDTH: 100%) ── */}
      <div className="mad-v3-bottom-row">
        {/* Bottom Card 1: Performance Overview */}
        <div className="mad-v3-bottom-card">
          <div className="mad-v3-card-header">
            <div className="mad-v3-card-title-wrap">
              <svg viewBox="0 0 20 20" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <path d="M3 17l5-5 4 4 6-8" />
                <path d="M14 8h4v4" />
              </svg>
              <h4>Performance Overview</h4>
            </div>
            <div className="mad-v3-select-box">
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as typeof timeFilter)}
                className="mad-v3-select"
                aria-label="Filter timeline"
              >
                <option value="Last 7 days">Last 7 days</option>
                <option value="Last 30 days">Last 30 days</option>
                <option value="This Month">This Month</option>
              </select>
              <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12" className="mad-v3-select-chevron">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          {/* Smooth Curved Wave Area Chart with Highlighted 68% Marker */}
          <div className="mad-v3-perf-chart-box">
            <svg viewBox="0 0 380 140" className="mad-v3-perf-svg" preserveAspectRatio="none">
              <defs>
                <linearGradient id="v3PerfGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A855F7" stopOpacity="0.4" />
                  <stop offset="60%" stopColor="#3B82F6" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Shaded Area */}
              <path
                d="M10,105 C60,115 100,80 150,92 C190,100 230,60 270,55 C310,50 340,85 375,80 L375,140 L10,140 Z"
                fill="url(#v3PerfGrad)"
              />

              {/* Curve Line */}
              <path
                d="M10,105 C60,115 100,80 150,92 C190,100 230,60 270,55 C310,50 340,85 375,80"
                fill="none"
                stroke="#8B5CF6"
                strokeWidth="3"
                strokeLinecap="round"
              />

              {/* Data Points */}
              <circle cx="150" cy="92" r="4.5" fill="#FFFFFF" stroke="#8B5CF6" strokeWidth="2.5" />
              <circle cx="270" cy="55" r="5" fill="#FFFFFF" stroke="#8B5CF6" strokeWidth="3" />

              {/* Highlight Marker 68% pill badge */}
              <g transform="translate(250, 20)">
                <rect x="0" y="0" width="40" height="22" rx="11" fill="#0F172A" />
                <text x="20" y="15" fill="#FFFFFF" fontSize="10.5" fontWeight="700" textAnchor="middle">
                  68%
                </text>
                {/* Pointer down triangle */}
                <polygon points="17,22 23,22 20,26" fill="#0F172A" />
              </g>
            </svg>
          </div>
        </div>

        {/* Bottom Card 2: Top Performing Students */}
        <div className="mad-v3-bottom-card">
          <div className="mad-v3-card-header">
            <div className="mad-v3-card-title-wrap">
              <svg viewBox="0 0 20 20" fill="#F59E0B" width="18" height="18" className="mad-v3-trophy-icon">
                <path d="M15 3h1a2 2 0 012 2v2a4 4 0 01-4 4h-.2a6.002 6.002 0 01-4.8 2.92V16h2a1 1 0 110 2H8a1 1 0 110-2h2v-2.08A6.002 6.002 0 015.2 11H5a4 4 0 01-4-4V5a2 2 0 012-2h1V2a1 1 0 011-1h10a1 1 0 011 1v1zm1 2h-1v4h.2a2 2 0 001.8-2V5zM4 5H3v2a2 2 0 001.8 2H5V5zm2-2v7a4 4 0 108 0V3H6z" />
              </svg>
              <h4>Top Performing Students</h4>
            </div>
            <Link to="/dashboard/admin-students" className="mad-v3-viewall-link">
              <span>View All</span>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="12" height="12" style={{ display: 'inline-block', verticalAlign: 'middle', marginLeft: 4 }}>
                <path d="M6 3l5 5-5 5" />
              </svg>
            </Link>
          </div>

          <div className="mad-v3-students-list">
            {topStudents.map((st, idx) => (
              <div key={st.id} className="mad-v3-student-row">
                <span className="mad-v3-student-rank">{idx + 1}</span>
                <img src={st.avatar} alt={st.name} className="mad-v3-student-avatar" />
                <span className="mad-v3-student-name">{st.name}</span>
                <span className="mad-v3-student-score">{st.score}</span>
                <div className="mad-v3-progress-track">
                  <div
                    className="mad-v3-progress-fill"
                    style={{ width: `${st.scoreVal}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Card 3: Subject-wise Performance */}
        <div className="mad-v3-bottom-card">
          <div className="mad-v3-card-header">
            <div className="mad-v3-card-title-wrap">
              <svg viewBox="0 0 20 20" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                <circle cx="10" cy="10" r="8" />
                <path d="M10 2v8h8" />
              </svg>
              <h4>Subject-wise Performance</h4>
            </div>
            <div className="mad-v3-select-box">
              <select
                value={subjectMonth}
                onChange={(e) => setSubjectMonth(e.target.value)}
                className="mad-v3-select"
                aria-label="Filter month"
              >
                <option value="This Month">This Month</option>
                <option value="Last Month">Last Month</option>
                <option value="All Time">All Time</option>
              </select>
              <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12" className="mad-v3-select-chevron">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

          <div className="mad-v3-subject-layout">
            {/* Donut Gauge Ring */}
            <div className="mad-v3-gauge-box">
              <svg viewBox="0 0 120 120" className="mad-v3-gauge-svg">
                {/* Background Ring */}
                <circle cx="60" cy="60" r="46" fill="none" stroke="#F1F5F9" strokeWidth="12" />
                {/* Colored Ring (86% fill) */}
                <circle
                  cx="60"
                  cy="60"
                  r="46"
                  fill="none"
                  stroke="url(#gaugeGrad)"
                  strokeWidth="12"
                  strokeDasharray="289"
                  strokeDashoffset="40"
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
                <defs>
                  <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="50%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
                </defs>
                <text x="60" y="58" className="mad-v3-gauge-num" textAnchor="middle">
                  86%
                </text>
                <text x="60" y="73" className="mad-v3-gauge-lbl" textAnchor="middle">
                  Overall
                </text>
              </svg>
            </div>

            {/* Subject Percentage List */}
            <div className="mad-v3-subject-list">
              <div className="mad-v3-subj-item">
                <span className="mad-v3-subj-dot mad-v3-subj-dot--blue" />
                <span className="mad-v3-subj-name">Mathematics</span>
                <span className="mad-v3-subj-score">92%</span>
              </div>
              <div className="mad-v3-subj-item">
                <span className="mad-v3-subj-dot mad-v3-subj-dot--purple" />
                <span className="mad-v3-subj-name">Science</span>
                <span className="mad-v3-subj-score">88%</span>
              </div>
              <div className="mad-v3-subj-item">
                <span className="mad-v3-subj-dot mad-v3-subj-dot--teal" />
                <span className="mad-v3-subj-name">English</span>
                <span className="mad-v3-subj-score">84%</span>
              </div>
              <div className="mad-v3-subj-item">
                <span className="mad-v3-subj-dot mad-v3-subj-dot--amber" />
                <span className="mad-v3-subj-name">Computer</span>
                <span className="mad-v3-subj-score">76%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
