import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useOrganization } from '@/hooks/useOrganization';
import type { OrgAnalytics } from '@/types/examination';
import AdminExamGuide from '@/components/dashboard/AdminExamGuide';

interface ModernAdminDashboardProps {
  examStats: OrgAnalytics | null;
  error?: string | null;
}

export default function ModernAdminDashboard({ examStats, error }: ModernAdminDashboardProps) {
  const { user } = useAuth();
  const { organization } = useOrganization();
  const [timeFilter, setTimeFilter] = useState('Last 7 Days');

  const displayName = user?.firstName
    ? `${user.firstName} ${user.lastName || ''}`.trim()
    : 'Rakhi Bajpai';

  // Metrics with fallback matching mock
  const totalTests = examStats?.tests ? String(examStats.tests) : '12';
  const totalStudents = examStats?.students ? String(examStats.students) : '245';
  const totalAttempts = examStats?.attempts ? Number(examStats.attempts).toLocaleString() : '1,248';
  const avgScore = '86%';

  const recentTestsList = [
    {
      id: '1',
      title: 'Mathematics Mock Test',
      meta: '12 Questions • 30 mins',
      status: 'Active',
      statusClass: 'status-active',
      href: '/dashboard/admin-course',
    },
    {
      id: '2',
      title: 'Science Assessment',
      meta: '15 Questions • 45 mins',
      status: 'Scheduled',
      statusClass: 'status-scheduled',
      href: '/dashboard/admin-course',
    },
    {
      id: '3',
      title: 'English Proficiency Test',
      meta: '10 Questions • 30 mins',
      status: 'Draft',
      statusClass: 'status-draft',
      href: '/dashboard/admin-course',
    },
    {
      id: '4',
      title: 'General Knowledge Test',
      meta: '20 Questions • 60 mins',
      status: 'Draft',
      statusClass: 'status-draft',
      href: '/dashboard/admin-course',
    },
  ];

  const recentActivities = [
    {
      id: 'a1',
      type: 'test',
      iconClass: 'act-icon-blue',
      icon: 'icofont-file-document',
      title: 'New test created',
      subtitle: 'Mathematics Mock Test',
      time: '2 hours ago',
    },
    {
      id: 'a2',
      type: 'completed',
      iconClass: 'act-icon-amber',
      icon: 'icofont-check-circled',
      title: 'Student completed test',
      subtitle: 'Rohit Sharma',
      time: '3 hours ago',
    },
    {
      id: 'a3',
      type: 'question',
      iconClass: 'act-icon-green',
      icon: 'icofont-question-circle',
      title: 'Question added',
      subtitle: 'Science - Biology',
      time: '5 hours ago',
    },
    {
      id: 'a4',
      type: 'report',
      iconClass: 'act-icon-purple',
      icon: 'icofont-chart-bar-graph',
      title: 'Report generated',
      subtitle: 'Monthly Performance Report',
      time: '6 hours ago',
    },
    {
      id: 'a5',
      type: 'user',
      iconClass: 'act-icon-teal',
      icon: 'icofont-users-alt-2',
      title: 'New student registered',
      subtitle: 'Priya Singh',
      time: '8 hours ago',
    },
  ];

  return (
    <div className="mindsprint-admin-dashboard">
      {error && (
        <div className="mad-alert-error">
          <i className="icofont-warning" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Left Column (Welcome, Stats, Chart, Tests) + Right Column (Quick Actions, Activity) */}
      <div className="mad-layout-grid">
          {/* Hero Welcome Banner */}
          <div className="mad-welcome-card">
            <div className="mad-welcome-content">
              <span className="mad-welcome-sub">Welcome back,</span>
              <h2 className="mad-welcome-title">
                {displayName} <span className="mad-wave">👋</span>
              </h2>
              <p className="mad-welcome-desc">
                {organization?.name
                  ? `Manage exams, track student performance, and administer ${organization.name} — all in one place.`
                  : 'Manage your tests, track performance and help students achieve their best — all in one place.'}
              </p>

              <div className="mad-hero-pills">
                <Link to="/dashboard/create-test" className="mad-hero-pill">
                  <div className="mad-pill-icon mad-pill-icon--blue">
                    <i className="icofont-edit" />
                  </div>
                  <div className="mad-pill-text">
                    <strong>Create Tests</strong>
                    <small>Build custom assessments</small>
                  </div>
                </Link>

                <Link to="/dashboard/admin-students" className="mad-hero-pill">
                  <div className="mad-pill-icon mad-pill-icon--green">
                    <i className="icofont-users-social" />
                  </div>
                  <div className="mad-pill-text">
                    <strong>Manage Students</strong>
                    <small>Track progress &amp; performance</small>
                  </div>
                </Link>

                <Link to="/dashboard/admin-reviews" className="mad-hero-pill">
                  <div className="mad-pill-icon mad-pill-icon--purple">
                    <i className="icofont-chart-pie" />
                  </div>
                  <div className="mad-pill-text">
                    <strong>View Reports</strong>
                    <small>Get detailed insights</small>
                  </div>
                </Link>

                <Link to="/dashboard/admin-question-bank" className="mad-hero-pill">
                  <div className="mad-pill-icon mad-pill-icon--cyan">
                    <i className="icofont-folder" />
                  </div>
                  <div className="mad-pill-text">
                    <strong>Question Bank</strong>
                    <small>Organize &amp; reuse questions</small>
                  </div>
                </Link>
              </div>
            </div>

            {/* Modern Vector Illustration matching the mock image */}
            <div className="mad-welcome-illustration">
              <svg viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="mad-svg-hero">
                <defs>
                  <linearGradient id="heroBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#eff6ff" />
                    <stop offset="100%" stopColor="#dbeafe" />
                  </linearGradient>
                  <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                  <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#f8fafc" />
                  </linearGradient>
                  <filter id="shadowLight" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#1e3a8a" floodOpacity="0.1" />
                  </filter>
                </defs>

                {/* Soft background shape */}
                <circle cx="160" cy="110" r="95" fill="url(#heroBgGrad)" />

                {/* Background Dashboard Card floating */}
                <g filter="url(#shadowLight)">
                  <rect x="180" y="24" width="105" height="75" rx="8" fill="url(#cardGrad)" stroke="#e2e8f0" strokeWidth="1" />
                  <rect x="190" y="34" width="40" height="6" rx="3" fill="#cbd5e1" />
                  <rect x="190" y="46" width="70" height="4" rx="2" fill="#e2e8f0" />
                  <rect x="190" y="54" width="55" height="4" rx="2" fill="#e2e8f0" />
                  {/* Floating Graduation Cap */}
                  <path d="M255 35L270 28L285 35L270 42L255 35Z" fill="#2563eb" />
                  <path d="M260 40V48C260 52 280 52 280 48V40" fill="#1d4ed8" />
                  <line x1="285" y1="35" x2="285" y2="47" stroke="#f59e0b" strokeWidth="1.5" />
                  <circle cx="285" cy="48" r="1.5" fill="#f59e0b" />
                  {/* Mini Bar Chart */}
                  <rect x="235" y="70" width="8" height="20" rx="2" fill="#93c5fd" />
                  <rect x="247" y="62" width="8" height="28" rx="2" fill="#3b82f6" />
                  <rect x="259" y="55" width="8" height="35" rx="2" fill="#1d4ed8" />
                </g>

                {/* Desk Base */}
                <ellipse cx="160" cy="190" rx="100" ry="8" fill="#cbd5e1" opacity="0.6" />
                <rect x="80" y="155" width="160" height="8" rx="4" fill="#94a3b8" />
                <rect x="95" y="163" width="8" height="27" fill="#64748b" />
                <rect x="217" y="163" width="8" height="27" fill="#64748b" />

                {/* Person Illustration */}
                {/* Body / Blue Shirt */}
                <path d="M120 155C120 125 145 120 150 120C155 120 180 125 180 155H120Z" fill="#3b82f6" />
                {/* Collar */}
                <path d="M144 121L150 130L156 121" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
                {/* Neck */}
                <rect x="146" y="112" width="8" height="10" fill="#fcd34d" rx="2" />
                {/* Head */}
                <circle cx="150" cy="102" r="13" fill="#fcd34d" />
                {/* Hair */}
                <path d="M138 100C138 90 148 88 156 89C162 90 164 96 162 101C158 97 154 97 146 98C140 99 138 101 138 100Z" fill="#1e293b" />
                {/* Arms on Desk */}
                <path d="M125 145C135 145 145 152 152 154" stroke="#fcd34d" strokeWidth="5" strokeLinecap="round" />
                <path d="M175 145C168 145 160 152 155 154" stroke="#fcd34d" strokeWidth="5" strokeLinecap="round" />

                {/* Laptop */}
                <polygon points="135,155 168,155 163,136 140,136" fill="#0f172a" />
                <polygon points="137,153 166,153 162,138 142,138" fill="url(#screenGrad)" />
                <rect x="130" y="155" width="43" height="3" rx="1.5" fill="#64748b" />

                {/* Plant on Desk */}
                <path d="M210 155L213 145H221L224 155H210Z" fill="#f97316" />
                <ellipse cx="217" cy="138" rx="5" ry="8" fill="#10b981" />
                <ellipse cx="213" cy="141" rx="4" ry="6" fill="#34d399" transform="rotate(-20 213 141)" />
                <ellipse cx="221" cy="141" rx="4" ry="6" fill="#059669" transform="rotate(20 221 141)" />

                {/* Floating Checkmark Pill */}
                <g filter="url(#shadowLight)">
                  <rect x="70" y="70" width="75" height="26" rx="13" fill="#ffffff" />
                  <circle cx="83" cy="83" r="8" fill="#22c55e" />
                  <path d="M80 83L82 85L87 80" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="96" y="80" width="40" height="5" rx="2.5" fill="#64748b" />
                </g>
              </svg>
            </div>
          </div>

          {/* 4 Stat Metric Cards in a row */}
          <div className="mad-stats-row">
            {/* Card 1: Total Tests */}
            <div className="mad-stat-card">
              <div className="mad-stat-icon-wrap mad-stat-icon--blue">
                <i className="icofont-copy-invert" />
              </div>
              <div className="mad-stat-body">
                <div className="mad-stat-value">{totalTests}</div>
                <div className="mad-stat-label">Total Tests</div>
                <div className="mad-stat-trend">
                  <span className="trend-arrow">↑</span> 20% <span className="trend-period">from last month</span>
                </div>
              </div>
            </div>

            {/* Card 2: Total Students */}
            <div className="mad-stat-card">
              <div className="mad-stat-icon-wrap mad-stat-icon--green">
                <i className="icofont-users-alt-5" />
              </div>
              <div className="mad-stat-body">
                <div className="mad-stat-value">{totalStudents}</div>
                <div className="mad-stat-label">Total Students</div>
                <div className="mad-stat-trend">
                  <span className="trend-arrow">↑</span> 12% <span className="trend-period">from last month</span>
                </div>
              </div>
            </div>

            {/* Card 3: Total Attempts */}
            <div className="mad-stat-card">
              <div className="mad-stat-icon-wrap mad-stat-icon--purple">
                <i className="icofont-checked" />
              </div>
              <div className="mad-stat-body">
                <div className="mad-stat-value">{totalAttempts}</div>
                <div className="mad-stat-label">Total Attempts</div>
                <div className="mad-stat-trend">
                  <span className="trend-arrow">↑</span> 18% <span className="trend-period">from last month</span>
                </div>
              </div>
            </div>

            {/* Card 4: Average Score */}
            <div className="mad-stat-card">
              <div className="mad-stat-icon-wrap mad-stat-icon--orange">
                <i className="icofont-chart-histogram" />
              </div>
              <div className="mad-stat-body">
                <div className="mad-stat-value">{avgScore}</div>
                <div className="mad-stat-label">Average Score</div>
                <div className="mad-stat-trend">
                  <span className="trend-arrow">↑</span> 6% <span className="trend-period">from last month</span>
                </div>
              </div>
            </div>
          </div>

          <section className="mad-stepper-container" aria-label="Exam Workflow Stepper">
            <div className="mad-stepper-header">
              <div className="mad-stepper-title-wrap">
                <span className="mad-stepper-badge">Workflow Guide</span>
                <h3 className="mad-stepper-heading">Exam Creation &amp; Delivery Stepper</h3>
              </div>
              <span className="mad-stepper-hint">Step-by-step progress from question bank to student assignment</span>
            </div>
            <div className="mad-stepper-card">
              <AdminExamGuide compact={false} />
            </div>
          </section>

          {/* Quick Actions Card */}
          <div className="mad-quick-actions-card">
            <div className="mad-qa-header">
              <i className="icofont-flash" />
              <h3>Quick Actions</h3>
            </div>

            <Link to="/dashboard/create-test" className="mad-qa-primary-btn">
              <span className="qa-btn-content">
                <span className="qa-plus">+</span> Create New Test
              </span>
              <span className="qa-arrow">›</span>
            </Link>

            <div className="mad-qa-list">
              <Link to="/dashboard/admin-question-bank" className="mad-qa-item">
                <div className="qa-item-left">
                  <span className="qa-item-icon">
                    <i className="icofont-edit" />
                  </span>
                  <span className="qa-item-text">Add Question</span>
                </div>
                <span className="qa-item-chevron">›</span>
              </Link>

              <Link to="/dashboard/admin-question-bank" className="mad-qa-item">
                <div className="qa-item-left">
                  <span className="qa-item-icon">
                    <i className="icofont-upload-alt" />
                  </span>
                  <span className="qa-item-text">Import Questions (CSV)</span>
                </div>
                <span className="qa-item-chevron">›</span>
              </Link>

              <Link to="/dashboard/admin-reviews" className="mad-qa-item">
                <div className="qa-item-left">
                  <span className="qa-item-icon">
                    <i className="icofont-chart-pie" />
                  </span>
                  <span className="qa-item-text">View Reports</span>
                </div>
                <span className="qa-item-chevron">›</span>
              </Link>
            </div>
          </div>

          <div className="mad-activity-slot">
          <div className="mad-activity-card">
            <div className="mad-card-header">
              <div className="mad-card-title">
                <i className="icofont-history" />
                <h3>Recent Activity</h3>
              </div>
              <Link to="/dashboard/admin-audit" className="mad-link-viewall">
                View All
              </Link>
            </div>

            <div className="mad-activity-list">
              {recentActivities.map((act) => (
                <div key={act.id} className="mad-act-row">
                  <div className={`mad-act-icon-box ${act.iconClass}`}>
                    <i className={act.icon} />
                  </div>
                  <div className="mad-act-info">
                    <h5 className="mad-act-action">{act.title}</h5>
                    <span className="mad-act-sub">{act.subtitle}</span>
                    <span className="mad-act-time">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>
      </div>

      <div className="mad-insight-row">
          <div className="mad-chart-card">
            <div className="mad-chart-header">
              <div className="mad-chart-title-area">
                <div className="mad-chart-title">
                  <i className="icofont-chart-growth" />
                  <h3>Performance Overview</h3>
                </div>
                <div className="mad-chart-legend">
                  <span className="legend-item legend-attempts">
                    <span className="legend-dot" /> Attempts
                  </span>
                  <span className="legend-item legend-score">
                    <span className="legend-dot" /> Average Score
                  </span>
                </div>
              </div>

              <div className="mad-chart-filter-wrap">
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="mad-chart-select"
                  aria-label="Filter timeline"
                >
                  <option value="Last 7 Days">Last 7 Days</option>
                  <option value="Last 30 Days">Last 30 Days</option>
                  <option value="This Quarter">This Quarter</option>
                  <option value="This Year">This Year</option>
                </select>
              </div>
            </div>

            {/* High fidelity SVG curved wave graph */}
            <div className="mad-chart-body">
              <svg viewBox="0 0 680 220" className="mad-chart-svg" preserveAspectRatio="none">
                <defs>
                  {/* Wave Gradient: Attempts Area (cyan-blue) */}
                  <linearGradient id="attemptsArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                    <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.12" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Score Area Gradient (soft green) */}
                  <linearGradient id="scoreArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>

                  <filter id="glowBlue" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#0284c7" floodOpacity="0.4" />
                  </filter>
                  <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#059669" floodOpacity="0.4" />
                  </filter>
                </defs>

                {/* Grid Lines */}
                <line x1="45" y1="30" x2="660" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="45" y1="70" x2="660" y2="70" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="45" y1="110" x2="660" y2="110" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="45" y1="150" x2="660" y2="150" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="45" y1="190" x2="660" y2="190" stroke="#e2e8f0" strokeWidth="1" />

                {/* Y Axis Numbers */}
                <text x="35" y="34" className="chart-axis-label" textAnchor="end">200</text>
                <text x="35" y="74" className="chart-axis-label" textAnchor="end">150</text>
                <text x="35" y="114" className="chart-axis-label" textAnchor="end">100</text>
                <text x="35" y="154" className="chart-axis-label" textAnchor="end">50</text>
                <text x="35" y="194" className="chart-axis-label" textAnchor="end">0</text>

                {/* Blue Wave (Attempts) */}
                <path
                  d="M50 145 C120 120, 160 160, 220 110 C280 60, 330 140, 420 120 C500 100, 560 140, 650 95 L650 190 L50 190 Z"
                  fill="url(#attemptsArea)"
                />
                <path
                  d="M50 145 C120 120, 160 160, 220 110 C280 60, 330 140, 420 120 C500 100, 560 140, 650 95"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  filter="url(#glowBlue)"
                />

                {/* Green Wave (Average Score) */}
                <path
                  d="M50 165 C130 180, 180 155, 250 135 C320 115, 370 165, 450 140 C520 115, 580 120, 650 90 L650 190 L50 190 Z"
                  fill="url(#scoreArea)"
                />
                <path
                  d="M50 165 C130 180, 180 155, 250 135 C320 115, 370 165, 450 140 C520 115, 580 120, 650 90"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  filter="url(#glowGreen)"
                />

                {/* Hover / Point Dots */}
                <circle cx="220" cy="110" r="5" fill="#ffffff" stroke="#0284c7" strokeWidth="3" />
                <circle cx="420" cy="120" r="5" fill="#ffffff" stroke="#0284c7" strokeWidth="3" />
                <circle cx="250" cy="135" r="5" fill="#ffffff" stroke="#10b981" strokeWidth="3" />
                <circle cx="450" cy="140" r="5" fill="#ffffff" stroke="#10b981" strokeWidth="3" />

                {/* X Axis Dates */}
                <text x="60" y="210" className="chart-axis-label" textAnchor="middle">Apr 21</text>
                <text x="155" y="210" className="chart-axis-label" textAnchor="middle">Apr 22</text>
                <text x="250" y="210" className="chart-axis-label" textAnchor="middle">Apr 23</text>
                <text x="350" y="210" className="chart-axis-label" textAnchor="middle">Apr 24</text>
                <text x="450" y="210" className="chart-axis-label" textAnchor="middle">Apr 25</text>
                <text x="550" y="210" className="chart-axis-label" textAnchor="middle">Apr 26</text>
                <text x="640" y="210" className="chart-axis-label" textAnchor="middle">Apr 27</text>
              </svg>
            </div>
          </div>

          {/* Recent Tests Card */}
          <div className="mad-tests-card">
            <div className="mad-card-header">
              <div className="mad-card-title">
                <i className="icofont-file-document" />
                <h3>Recent Tests</h3>
              </div>
              <Link to="/dashboard/admin-course" className="mad-link-viewall">
                View All
              </Link>
            </div>

            <div className="mad-tests-list">
              {recentTestsList.map((test) => (
                <div key={test.id} className="mad-test-row">
                  <div className="mad-test-icon-badge">
                    <i className="icofont-edit" />
                  </div>
                  <div className="mad-test-details">
                    <Link to={test.href} className="mad-test-name">
                      {test.title}
                    </Link>
                    <span className="mad-test-meta">{test.meta}</span>
                  </div>
                  <div className="mad-test-status-area">
                    <span className={`mad-status-pill ${test.statusClass}`}>
                      {test.status}
                    </span>
                    <button type="button" className="mad-btn-kebab" aria-label="More options">
                      <i className="icofont-navigation-menu" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
      </div>

      {/* Bottom Promotional / Feature Banner */}
      <div className="mad-bottom-banner">
        <div className="mad-bottom-banner-left">
          <div className="mad-banner-icon-glow">
            <i className="icofont-graduate-alt" />
          </div>
          <div className="mad-banner-text">
            <h4>Empower Learning with Mindsprint</h4>
            <p>Create, manage and analyze your assessments with ease.</p>
          </div>
        </div>
        <div className="mad-bottom-banner-right">
          <Link to="/dashboard/create-test" className="mad-banner-cta-btn">
            Explore Features <span className="btn-arrow">›</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
