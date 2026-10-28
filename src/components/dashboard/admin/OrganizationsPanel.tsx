import { useEffect, useState, useMemo } from 'react';
import {
  FiPlus,
  FiSearch,
  FiX,
  FiUsers,
  FiLogIn,
  FiEdit3,
  FiTrash2,
} from 'react-icons/fi';
import { HiOfficeBuilding } from 'react-icons/hi';
import { organizationService } from '@/services';
import { parseApiError } from '@/lib/errors';
import { useOrgScope } from '@/context/OrgScopeContext';
import { useDashboardLoader, useDashboardLoadingEffect } from '@/context/DashboardLoadingContext';
import { setSelectedOrganizationId } from '@/lib/orgScope';
import { confirmAction, confirmDelete, showSuccess } from '@/lib/swal';
import type { Organization } from '@/types/api';
import { FormError, PasswordInput } from '@/components/ui/FormField';
import { DEFAULT_SUGGESTED_PASSWORD } from '@/utils/defaultPassword';
import { formatDate } from '@/utils/dateFormat';
import '@/styles/organizations.css';

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}


function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/** Superadmin: Modern Full-Width Organizations Management with Side Drawer & Colorful Action Icons */
export function OrganizationsPanel() {
  const { refreshOrganizations, setSelectedOrgId } = useOrgScope();
  const withLoader = useDashboardLoader();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Side Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerError, setDrawerError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('Organization');
  const [adminLastName, setAdminLastName] = useState('Admin');
  const [adminPassword, setAdminPassword] = useState(DEFAULT_SUGGESTED_PASSWORD);
  const [passwordError, setPasswordError] = useState('');
  const [activateNow, setActivateNow] = useState(true);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const list = await organizationService.listOrganizations(1, 100);
      setOrgs(list.data);
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

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

  const openAddDrawer = () => {
    setEditingId(null);
    setName('');
    setContactEmail('');
    setAdminFirstName('Organization');
    setAdminLastName('Admin');
    setAdminPassword(DEFAULT_SUGGESTED_PASSWORD);
    setPasswordError('');
    setActivateNow(true);
    setDrawerError('');
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (org: Organization) => {
    setEditingId(org.id);
    setName(org.name);
    setContactEmail(
      typeof org.settings?.contactEmail === 'string' ? org.settings.contactEmail : '',
    );
    setActivateNow(org.isActive);
    setPasswordError('');
    setDrawerError('');
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setDrawerError('');
  };

  const save = async () => {
    const nextSlug = slugify(name);
    if (!name.trim() || !nextSlug) {
      setDrawerError('Organization name is required.');
      return;
    }
    if (!editingId && !contactEmail.trim()) {
      setDrawerError('Login email is required — org admin credentials will be emailed there.');
      return;
    }
    if (!editingId && adminPassword.trim().length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }
    setPasswordError('');
    setDrawerError('');
    await withLoader(async () => {
      try {
        const contact = contactEmail.trim();
        if (editingId) {
          await organizationService.updateOrganization(editingId, {
            name: name.trim(),
            slug: nextSlug,
            contactEmail: contact || undefined,
            isActive: activateNow,
          });
          showSuccess(
            'Updated!',
            activateNow
              ? `${name} updated and set to Activated.`
              : `${name} updated and set to Suspended.`,
          );
        } else {
          const created = await organizationService.createOrganization({
            name: name.trim(),
            slug: nextSlug,
            contactEmail: contact,
            adminFirstName: adminFirstName.trim() || 'Organization',
            adminLastName: adminLastName.trim() || 'Admin',
            adminPassword: adminPassword.trim() || DEFAULT_SUGGESTED_PASSWORD,
            isActive: activateNow,
          });
          const emailedTo =
            (created as { adminEmail?: string | null }).adminEmail ?? contact;
          showSuccess(
            'Created!',
            `Organization created. Login details sent to ${emailedTo}.`,
          );
        }
        closeDrawer();
        await load();
        await refreshOrganizations();
      } catch (err) {
        setDrawerError(parseApiError(err));
      }
    });
  };

  const approve = async (org: Organization) => {
    const ok = await confirmAction({
      title: 'Activate organization?',
      text: `${org.name} and its pending users will become active.`,
      icon: 'question',
      confirmText: 'Yes, activate!',
      confirmColor: '#16a34a',
    });
    if (!ok) return;
    setError('');
    try {
      await withLoader(async () => {
        await organizationService.verifyOrganization(org.id);
        await load();
        await refreshOrganizations();
      });
      showSuccess('Activated!', `${org.name} can now access the platform.`);
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const suspend = async (org: Organization) => {
    const ok = await confirmAction({
      title: 'Suspend organization?',
      text: `${org.name} will be deactivated. Org users will be suspended and cannot log in until you approve again.`,
      icon: 'warning',
      confirmText: 'Yes, suspend',
      confirmColor: '#dc2626',
    });
    if (!ok) return;
    setError('');
    try {
      await withLoader(async () => {
        await organizationService.updateOrganization(org.id, { isActive: false });
        await load();
        await refreshOrganizations();
      });
      showSuccess('Suspended', `${org.name} has been suspended.`);
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const remove = async (org: Organization) => {
    const ok = await confirmDelete({
      title: 'Delete organization?',
      text: `“${org.name}” will be soft-deleted. You won’t be able to revert this easily.`,
      confirmText: 'Yes, delete it!',
    });
    if (!ok) return;
    setError('');
    try {
      await withLoader(async () => {
        await organizationService.deleteOrganization(org.id);
        await load();
        await refreshOrganizations();
      });
      showSuccess('Deleted!', `${org.name} has been removed.`);
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const manageData = (org: Organization) => {
    setSelectedOrganizationId(org.id);
    setSelectedOrgId(org.id);
    showSuccess('Organization Switched', `Switched active organization to ${org.name}.`);
  };

  // Filtered organizations
  const filteredOrgs = useMemo(() => {
    return orgs.filter((org) => {
      if (statusFilter === 'active' && !org.isActive) return false;
      if (statusFilter === 'suspended' && org.isActive) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = org.name.toLowerCase().includes(q);
        const matchesSlug = org.slug.toLowerCase().includes(q);
        const matchesEmail =
          typeof org.settings?.contactEmail === 'string' &&
          org.settings.contactEmail.toLowerCase().includes(q);
        return matchesName || matchesSlug || matchesEmail;
      }

      return true;
    });
  }, [orgs, statusFilter, searchQuery]);

  const activeCount = useMemo(() => orgs.filter((o) => o.isActive).length, [orgs]);
  const suspendedCount = useMemo(() => orgs.filter((o) => !o.isActive).length, [orgs]);

  return (
    <div className="org-panel-root">
      {/* ── Top Bar: Page Title + Theme Gradient "+ Add Organization" Button ── */}
      <div className="org-top-bar">
        <div className="org-top-text">
          <h1 className="org-page-title">Organizations</h1>
          <p className="org-page-desc">
            Multi-vendor control — add vendors, approve access, then switch org in the top bar to manage
            their students, teachers, exams and results.
          </p>
        </div>

        <button
          type="button"
          className="org-add-btn"
          onClick={openAddDrawer}
          id="btnOpenAddOrg"
        >
          <FiPlus className="org-add-btn-icon" />
          <span>Add Organization</span>
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
              <h3 className="org-card-title">All Organizations</h3>
              <span className="org-count-badge">
                {filteredOrgs.length} {filteredOrgs.length === 1 ? 'Vendor' : 'Vendors'}
              </span>
            </div>
            <p className="org-card-subtitle">Manage and monitor platform vendor organizations</p>
          </div>

          <div className="org-controls-row">
            {/* Search Box */}
            <div className="org-search-box">
              <FiSearch className="org-search-icon" />
              <input
                type="text"
                className="org-search-input"
                placeholder="Search organizations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search organizations"
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
                className={`org-pill ${statusFilter === 'all' ? 'is-active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All ({orgs.length})
              </button>
              <button
                type="button"
                className={`org-pill ${statusFilter === 'active' ? 'is-active' : ''}`}
                onClick={() => setStatusFilter('active')}
              >
                Active ({activeCount})
              </button>
              <button
                type="button"
                className={`org-pill ${statusFilter === 'suspended' ? 'is-active' : ''}`}
                onClick={() => setStatusFilter('suspended')}
              >
                Suspended ({suspendedCount})
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        {filteredOrgs.length === 0 && !loading ? (
          <div className="org-empty-state">
            <HiOfficeBuilding className="org-empty-icon" />
            <p className="org-empty-text">
              {searchQuery || statusFilter !== 'all'
                ? 'No organizations match the current filter.'
                : 'No organizations found. Click "+ Add Organization" to onboard your first vendor.'}
            </p>
          </div>
        ) : (
          <div className="org-table-wrap">
            <table className="org-table">
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Users</th>
                  <th>Created Date</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right', paddingRight: '28px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrgs.map((org) => (
                  <tr key={org.id}>
                    {/* Organization Cell */}
                    <td>
                      <div className="org-cell-flex">
                        <div className="org-avatar-badge">
                          {org.logoUrl ? (
                            <img src={org.logoUrl} alt={org.name} />
                          ) : (
                            getInitials(org.name)
                          )}
                        </div>
                        <div className="org-name-meta">
                          <span className="org-name-text">{org.name}</span>
                          <span className="org-sub-meta">
                            <span className="org-slug-tag">@{org.slug}</span>
                            {typeof org.settings?.contactEmail === 'string' && org.settings.contactEmail ? (
                              <span>· {org.settings.contactEmail}</span>
                            ) : null}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Users Cell */}
                    <td>
                      <span className="org-users-count">
                        <FiUsers className="org-users-icon" />
                        <span>{org.usersCount ?? 0}</span>
                      </span>
                    </td>

                    {/* Created Date Cell */}
                    <td>
                      <span style={{ fontSize: '0.825rem', color: '#64748b' }}>
                        {formatDate(org.createdAt)}
                      </span>
                    </td>

                    {/* Status Toggle Switch Cell */}
                    <td>
                      <div className="org-status-cell">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={org.isActive}
                          aria-label={org.isActive ? 'Suspend organization' : 'Activate organization'}
                          className={`org-ios-switch${org.isActive ? ' is-active' : ''}`}
                          onClick={() => void (org.isActive ? suspend(org) : approve(org))}
                        >
                          <span className="org-ios-thumb" />
                        </button>
                      </div>
                    </td>

                    {/* Actions Cell (COLORFUL ICONS: Blue Switch, Green Edit, Red Delete) */}
                    <td>
                      <div
                        className="org-actions-cell"
                        style={{ justifyContent: 'flex-end', paddingRight: '8px' }}
                      >
                        {/* 1. Switch to Account Icon (Blue) */}
                        <button
                          type="button"
                          className="org-icon-btn org-icon-btn--switch"
                          title={`Switch to ${org.name}`}
                          aria-label={`Switch to ${org.name}`}
                          onClick={() => manageData(org)}
                        >
                          <FiLogIn />
                        </button>

                        {/* 2. Edit Organization Icon (Green) */}
                        <button
                          type="button"
                          className="org-icon-btn org-icon-btn--edit"
                          title="Edit organization"
                          aria-label="Edit organization"
                          onClick={() => openEditDrawer(org)}
                        >
                          <FiEdit3 />
                        </button>

                        {/* 3. Delete Organization Icon (Red) */}
                        <button
                          type="button"
                          className="org-icon-btn org-icon-btn--delete"
                          title="Delete organization"
                          aria-label="Delete organization"
                          onClick={() => void remove(org)}
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

      {/* ══════════════════════════════════════════════════════════════════
          Side-Drawer Form (UNDER TOPNAV: top: 72px)
          ══════════════════════════════════════════════════════════════════ */}
      {/* Backdrop Overlay */}
      <div
        className={`org-drawer-overlay ${isDrawerOpen ? 'is-open' : ''}`}
        onClick={closeDrawer}
        aria-hidden={!isDrawerOpen}
      />

      {/* Drawer Container */}
      <aside
        className={`org-drawer ${isDrawerOpen ? 'is-open' : ''}`}
        aria-label={editingId ? 'Edit organization drawer' : 'Add organization drawer'}
        aria-hidden={!isDrawerOpen}
      >
        {/* Drawer Header */}
        <div className="org-drawer-header">
          <div className="org-drawer-title-wrap">
            <div className="org-drawer-badge-icon">
              <HiOfficeBuilding />
            </div>
            <div>
              <h3 className="org-drawer-title">
                {editingId ? 'Edit Organization' : 'Create Organization'}
              </h3>
              <p className="org-drawer-desc">
                {editingId
                  ? 'Update details and save changes'
                  : 'Onboard a new vendor organization'}
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

        {/* Drawer Body (Scrollable Form) */}
        <div className="org-drawer-body">
          {drawerError && (
            <div className="mad-alert-error" role="alert">
              <span>{drawerError}</span>
            </div>
          )}

          {/* Field 1: Organization Name */}
          <div className="org-form-field">
            <label className="org-form-label" htmlFor="drawerOrgName">
              Organization Name <span className="org-required-star">*</span>
            </label>
            <input
              id="drawerOrgName"
              className="org-form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. TechWagger Solutions"
              autoFocus={isDrawerOpen}
            />
          </div>

          {/* Field 2: Login / Contact Email */}
          <div className="org-form-field">
            <label className="org-form-label" htmlFor="drawerOrgContact">
              {editingId ? 'Contact Email' : 'Login Email'} <span className="org-required-star">*</span>
            </label>
            <input
              id="drawerOrgContact"
              type="email"
              className="org-form-input"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="admin@organization.com"
              required={!editingId}
            />
            <span className="org-form-hint">
              {editingId
                ? 'Used for superadmin communication and notifications.'
                : 'Org admin will use this email to log in.'}
            </span>
          </div>

          {/* Fields for New Org Only: Admin First & Last Name + Password */}
          {!editingId && (
            <>
              <div className="org-grid-2">
                <div className="org-form-field">
                  <label className="org-form-label" htmlFor="drawerAdminFirst">
                    Admin First Name
                  </label>
                  <input
                    id="drawerAdminFirst"
                    className="org-form-input"
                    value={adminFirstName}
                    onChange={(e) => setAdminFirstName(e.target.value)}
                    placeholder="Organization"
                  />
                </div>
                <div className="org-form-field">
                  <label className="org-form-label" htmlFor="drawerAdminLast">
                    Admin Last Name
                  </label>
                  <input
                    id="drawerAdminLast"
                    className="org-form-input"
                    value={adminLastName}
                    onChange={(e) => setAdminLastName(e.target.value)}
                    placeholder="Admin"
                  />
                </div>
              </div>

              <div className="org-form-field">
                <label className="org-form-label" htmlFor="drawerAdminPassword">
                  Admin Password <span className="org-required-star">*</span>
                </label>
                <PasswordInput
                  id="drawerAdminPassword"
                  className="org-form-input"
                  value={adminPassword}
                  defaultVisible
                  onChange={(e) => {
                    setAdminPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  hasError={Boolean(passwordError)}
                  autoComplete="new-password"
                />
                <span className="org-form-hint">
                  Suggested: {DEFAULT_SUGGESTED_PASSWORD} — edit if needed.
                </span>
                <FormError message={passwordError} />
              </div>
            </>
          )}

          {/* Field: Active Status Toggle Card */}
          <div className="org-toggle-card">
            <div className="org-toggle-info">
              <span className="org-toggle-title">
                {activateNow ? 'Activated' : 'Suspended'}
              </span>
              <span className="org-toggle-desc">
                {activateNow
                  ? 'Organization can access platform immediately.'
                  : 'Organization stays inactive until activated.'}
              </span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={activateNow}
              className={`org-ios-switch${activateNow ? ' is-active' : ''}`}
              onClick={() => setActivateNow((prev) => !prev)}
            >
              <span className="org-ios-thumb" />
            </button>
          </div>
        </div>

        {/* Drawer Footer (Sticky Actions with Theme Gradient) */}
        <div className="org-drawer-footer">
          <button type="button" className="org-drawer-cancel" onClick={closeDrawer}>
            Cancel
          </button>
          <button
            type="button"
            className="org-drawer-submit"
            onClick={() => void save()}
            id="btnSubmitOrgDrawer"
          >
            {editingId ? 'Save Changes' : 'Create & Email Login'}
          </button>
        </div>
      </aside>
    </div>
  );
}

export default OrganizationsPanel;
