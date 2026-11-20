import { useEffect, useState } from 'react';
import { Pagination } from '@/components/ui/Pagination';
import { useServerList } from '@/hooks/useServerList';
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
import { FormError } from '@/components/ui/FormField';
import { TableEmptyState } from '@/components/ui/TableEmptyState';
import { validateName } from '@/validators/schemas';
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

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  const {
    items: orgs,
    pagination,
    page,
    limit,
    searchQuery,
    loading,
    initialLoading,
    error,
    setError,
    setSearchQuery,
    clearSearch,
    onPageChange,
    onLimitChange,
    refresh,
  } = useServerList<Organization>({
    fetcher: ({ page: p, limit: l, search }) =>
      organizationService.listOrganizations(
        p,
        l,
        search || undefined,
        statusFilter === 'all' ? undefined : statusFilter === 'active',
      ),
    deps: [statusFilter],
    defaultLimit: 10,
  });

  // Side Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerError, setDrawerError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [activateNow, setActivateNow] = useState(true);

  useDashboardLoadingEffect(initialLoading);

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
    setEmailError('');
    setAdminFirstName('');
    setAdminLastName('');
    setFirstNameError('');
    setLastNameError('');
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
    setEmailError('');
    setActivateNow(org.isActive);
    setFirstNameError('');
    setLastNameError('');
    setDrawerError('');
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setEmailError('');
    setFirstNameError('');
    setLastNameError('');
    setDrawerError('');
  };

  const save = async () => {
    setEmailError('');
    setFirstNameError('');
    setLastNameError('');
    setDrawerError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setDrawerError('Organization name is required.');
      return;
    }
    if (trimmedName.length < 2) {
      setDrawerError('Organization name must be at least 2 characters.');
      return;
    }
    if (trimmedName.length > 20) {
      setDrawerError('Organization name cannot exceed 20 characters.');
      return;
    }
    if (!/^[A-Za-z\s]+$/.test(trimmedName)) {
      setDrawerError('Organization name cannot exceed 20 characters and can only contain letters.');
      return;
    }

    const nextSlug = slugify(trimmedName);
    if (!nextSlug) {
      setDrawerError('Organization name is required.');
      return;
    }
    const trimmedContact = contactEmail.trim();
    if (!editingId && !trimmedContact) {
      setEmailError('Please enter valid email address.');
      return;
    }
    if (trimmedContact && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedContact)) {
      setEmailError('Please enter valid email address.');
      return;
    }
    if (!editingId) {
      const fnErr = validateName(adminFirstName, 'First name', 15);
      if (fnErr) {
        setFirstNameError(fnErr);
        return;
      }
      if (adminLastName.trim()) {
        const lnErr = validateName(adminLastName, 'Last name', 15);
        if (lnErr) {
          setLastNameError(lnErr);
          return;
        }
      }
    }
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
            adminFirstName: adminFirstName.trim(),
            adminLastName: adminLastName.trim() || '.',
            isActive: activateNow,
          });
          const emailedTo =
            (created as { adminEmail?: string | null }).adminEmail ?? contact;
          showSuccess(
            'Created!',
            `Organization created. An email to set password has been sent to the organization (${emailedTo}).`,
            { position: 'top-right' },
          );
        }
        closeDrawer();
        await refresh();
        await refreshOrganizations();
      } catch (err) {
        setDrawerError(parseApiError(err));
      }
    });
  };

  const approve = async (org: Organization) => {
    const ok = await confirmAction({
      title: 'Activate organization?',
      text: `${org.name} and its suspended teachers and students will become active again.`,
      icon: 'question',
      confirmText: 'Yes, activate!',
      confirmColor: '#16a34a',
    });
    if (!ok) return;
    setError('');
    try {
      await withLoader(async () => {
        await organizationService.updateOrganization(org.id, { isActive: true });
        await organizationService.verifyOrganization(org.id).catch(() => undefined);
        await refresh();
        await refreshOrganizations();
      });
      showSuccess('Activated!', `${org.name} has been activated. All its teachers and students are now active.`);
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
        await refresh();
        await refreshOrganizations();
      });
      showSuccess('Suspended', `${org.name} has been suspended.`);
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const remove = async (org: Organization) => {
    const ok = await confirmDelete({
      title: 'Delete Organization?',
      text: `Are you sure you want to delete ${org.name}? This action will permanently remove the organization and restrict access for all associated users.`,
      confirmText: 'Yes, Delete It!',
    });
    if (!ok) return;
    setError('');
    try {
      await withLoader(async () => {
        await organizationService.deleteOrganization(org.id);
        await refresh();
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

  const filteredOrgs = orgs;

  return (
    <div className="org-panel-root">
      {/* ── Top Bar: Page Title + Theme Gradient "+ Add Organization" Button ── */}
      <div className="org-top-bar">
        <div className="org-top-text">
          <h1 className="org-page-title">Organizations</h1>
          <p className="org-page-desc">
            Multi-vendor management — add organizations, review and approve access requests, and switch between organizations using the top navigation bar to manage their students, teachers, examinations, and results.
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
                {pagination.total} {pagination.total === 1 ? 'Organization' : 'Organizations'}
              </span>
            </div>
            <p className="org-card-subtitle">Manage, monitor, and oversee all registered organizations on the platform.</p>
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
                  onClick={clearSearch}
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
                All{statusFilter === 'all' ? ` (${pagination.total})` : ''}
              </button>
              <button
                type="button"
                className={`org-pill ${statusFilter === 'active' ? 'is-active' : ''}`}
                onClick={() => setStatusFilter('active')}
              >
                Active
              </button>
              <button
                type="button"
                className={`org-pill ${statusFilter === 'suspended' ? 'is-active' : ''}`}
                onClick={() => setStatusFilter('suspended')}
              >
                Suspended
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        {filteredOrgs.length === 0 && !loading ? (
          <TableEmptyState
            icon={HiOfficeBuilding}
            title={searchQuery || statusFilter !== 'all' ? 'No matching organizations' : 'No organizations found'}
            description={
              searchQuery || statusFilter !== 'all'
                ? 'No organizations match your current search or status filter.'
                : 'No organizations found. Click "+ Add Organization" to onboard your first vendor.'
            }
          />
        ) : (
          <div className="org-table-wrap">
            <table className="org-table">
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Total users</th>
                  <th>Created date</th>
                  <th>Status</th>
                  <th className="edtp-th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrgs.map((org) => (
                  <tr key={org.id}>
                    {/* Organization Cell */}
                    <td>
                      <div className="org-cell-flex" style={{ whiteSpace: 'nowrap' }}>
                        <div className="org-avatar-badge">
                          {org.logoUrl ? (
                            <img src={org.logoUrl} alt={org.name} />
                          ) : (
                            getInitials(org.name)
                          )}
                        </div>
                        <div className="org-name-meta" style={{ whiteSpace: 'nowrap' }}>
                          <span className="org-name-text" style={{ whiteSpace: 'nowrap' }}>{org.name}</span>
                          {typeof org.settings?.contactEmail === 'string' && org.settings.contactEmail ? (
                            <span
                              className="org-sub-meta"
                              title={org.settings.contactEmail}
                              style={{ color: '#64748b', fontSize: '0.8rem' }}
                            >
                              {org.settings.contactEmail}
                            </span>
                          ) : null}
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
                    <td className="org-td-actions">
                      <div className="org-actions-cell">
                        {/* 1. Switch to Account Icon (Blue) */}
                        <button
                          type="button"
                          className="org-action-btn org-action-btn--switch"
                          title={`Switch to ${org.name}`}
                          aria-label={`Switch to ${org.name}`}
                          onClick={() => manageData(org)}
                        >
                          <FiLogIn />
                        </button>

                        {/* 2. Edit Organization Icon (Green) */}
                        <button
                          type="button"
                          className="org-action-btn org-action-btn--edit"
                          title="Edit organization"
                          aria-label="Edit organization"
                          onClick={() => openEditDrawer(org)}
                        >
                          <FiEdit3 />
                        </button>

                        {/* 3. Delete Organization Icon (Red) */}
                        <button
                          type="button"
                          className="org-action-btn org-action-btn--danger"
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
                {editingId ? 'Update Organization' : 'Create Organization'}
              </h3>
              <p className="org-drawer-desc">
                {editingId
                  ? 'Modify the organization details and save your changes.'
                  : 'Register a new organization on the platform.'}
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
              maxLength={20}
              onKeyDown={(e) => {
                if (['Backspace', 'Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End'].includes(e.key) || e.ctrlKey || e.metaKey) return;
                if (!/^[a-zA-Z\s]$/.test(e.key)) e.preventDefault();
              }}
              onChange={(e) => {
                setName(e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 20));
                if (drawerError) setDrawerError('');
              }}
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
              type="text"
              className="org-form-input"
              value={contactEmail}
              onChange={(e) => {
                setContactEmail(e.target.value);
                if (emailError) {
                  const val = e.target.value.trim();
                  if (!val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                    setEmailError('');
                  }
                }
              }}
              onBlur={(e) => {
                const val = e.target.value.trim();
                if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                  setEmailError('Please enter valid email address.');
                } else if (!val && !editingId) {
                  setEmailError('Please enter valid email address.');
                } else {
                  setEmailError('');
                }
              }}
              placeholder="admin@organization.com"
            />
            <FormError message={emailError} />
            <span className="org-form-hint">
              {editingId
                ? 'Used for communication and notifications from the Super Administrator.'
                : 'The organization administrator will use this email address to access the platform and receive the password setup link.'}
            </span>
          </div>

          {/* Fields for New Org Only: Admin First & Last Name + Password */}
          {!editingId && (
            <>
              <div className="org-grid-2">
                <div className="org-form-field">
                  <label className="org-form-label" htmlFor="drawerAdminFirst">
                    First Name <span className="org-required-star">*</span>
                  </label>
                  <input
                    id="drawerAdminFirst"
                    className="org-form-input"
                    value={adminFirstName}
                    maxLength={15}
                    onKeyDown={(e) => {
                      if (['Backspace', 'Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End'].includes(e.key) || e.ctrlKey || e.metaKey) return;
                      if (!/^[a-zA-Z\s]$/.test(e.key)) e.preventDefault();
                    }}
                    onChange={(e) => {
                      setAdminFirstName(e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 15));
                      if (firstNameError) setFirstNameError('');
                    }}
                    placeholder="e.g. John"
                  />
                  <FormError message={firstNameError} />
                </div>
                <div className="org-form-field">
                  <label className="org-form-label" htmlFor="drawerAdminLast">
                    Last Name
                  </label>
                  <input
                    id="drawerAdminLast"
                    className="org-form-input"
                    value={adminLastName}
                    maxLength={15}
                    onKeyDown={(e) => {
                      if (['Backspace', 'Tab', 'Enter', 'Escape', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End'].includes(e.key) || e.ctrlKey || e.metaKey) return;
                      if (!/^[a-zA-Z\s]$/.test(e.key)) e.preventDefault();
                    }}
                    onChange={(e) => {
                      setAdminLastName(e.target.value.replace(/[^a-zA-Z\s]/g, '').slice(0, 15));
                      if (lastNameError) setLastNameError('');
                    }}
                    placeholder="e.g. Doe"
                  />
                  <FormError message={lastNameError} />
                </div>
              </div>


            </>
          )}

          {/* Field: Active Status Toggle Card */}
          <div className="org-toggle-card">
            <div className="org-toggle-info">
              <span className="org-toggle-title">
                Activate Organization
              </span>
              <span className="org-toggle-desc">
                {editingId
                  ? 'Allow the organization to access the platform immediately.'
                  : 'Enable immediate platform access for the organization.'}
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
            {editingId ? 'Update Organization' : 'Create Organization'}
          </button>
        </div>
      </aside>
    </div>
  );
}

export default OrganizationsPanel;
