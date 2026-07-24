import { useEffect, useState } from 'react';
import { organizationService } from '@/services';
import { parseApiError } from '@/lib/errors';
import { useOrgScope } from '@/context/OrgScopeContext';
import { useDashboardLoader, useDashboardLoadingEffect } from '@/context/DashboardLoadingContext';
import { setSelectedOrganizationId } from '@/lib/orgScope';
import { confirmAction, confirmDelete, showSuccess } from '@/lib/swal';
import type { Organization } from '@/types/api';
import { FormError, PasswordInput } from '@/components/ui/FormField';
import {
  EdtpAlert,
  EdtpBtn,
  EdtpEmpty,
  EdtpField,
  EdtpFormActions,
  EdtpPanel,
  EdtpRowActions,
} from '@/components/ui/CrudUI';
import { DEFAULT_SUGGESTED_PASSWORD } from '@/utils/defaultPassword';

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function statusLabel(org: Organization) {
  return org.isActive ? 'Activated' : 'Suspended';
}

/** Superadmin: add / edit / approve / delete vendor organizations */
export function OrganizationsPanel() {
  const { refreshOrganizations, setSelectedOrgId } = useOrgScope();
  const withLoader = useDashboardLoader();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('Organization');
  const [adminLastName, setAdminLastName] = useState('Admin');
  const [adminPassword, setAdminPassword] = useState(DEFAULT_SUGGESTED_PASSWORD);
  const [passwordError, setPasswordError] = useState('');
  const [activateNow, setActivateNow] = useState(false);

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

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setContactEmail('');
    setAdminFirstName('Organization');
    setAdminLastName('Admin');
    setAdminPassword(DEFAULT_SUGGESTED_PASSWORD);
    setPasswordError('');
    setActivateNow(false);
  };

  const startEdit = (org: Organization) => {
    setEditingId(org.id);
    setName(org.name);
    setContactEmail(
      typeof org.settings?.contactEmail === 'string' ? org.settings.contactEmail : '',
    );
    setActivateNow(org.isActive);
    setMessage('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const save = async () => {
    const nextSlug = slugify(name);
    if (!name.trim() || !nextSlug) {
      setError('Name is required.');
      return;
    }
    if (!editingId && !contactEmail.trim()) {
      setError('Login email is required — org admin credentials will be emailed there.');
      return;
    }
    if (!editingId && adminPassword.trim().length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }
    setPasswordError('');
    setError('');
    setMessage('');
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
          setMessage(
            activateNow
              ? 'Organization updated and set to Activated.'
              : 'Organization updated and set to Suspended.',
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
          setMessage(
            `Organization created. Login email + temporary password sent to ${emailedTo}.`,
          );
        }
        resetForm();
        await load();
        await refreshOrganizations();
      } catch (err) {
        setError(parseApiError(err));
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
    setMessage('');
    try {
      await withLoader(async () => {
        await organizationService.verifyOrganization(org.id);
        if (editingId === org.id) setActivateNow(true);
        await load();
        await refreshOrganizations();
      });
      setMessage(`${org.name} is now Activated.`);
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
    setMessage('');
    try {
      await withLoader(async () => {
        await organizationService.updateOrganization(org.id, { isActive: false });
        if (editingId === org.id) setActivateNow(false);
        await load();
        await refreshOrganizations();
      });
      setMessage(`${org.name} suspended. Account access is blocked until re-approved.`);
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
        if (editingId === org.id) resetForm();
        await load();
        await refreshOrganizations();
      });
      setMessage('Organization deleted.');
      showSuccess('Deleted!', `${org.name} has been removed.`);
    } catch (err) {
      setError(parseApiError(err));
    }
  };

  const manageData = (org: Organization) => {
    setSelectedOrganizationId(org.id);
    setSelectedOrgId(org.id);
    setMessage(`Switched to ${org.name}. Use Users, Tests, Results from the sidebar.`);
  };

  return (
    <div className="dashboard__content__wraper">
      <div className="dashboard__section__title">
        <h4>Organizations</h4>
        <p className="text-muted mb-0">
          Multi-vendor control — add vendors, approve access, then switch org in the top bar to manage
          their students, teachers, exams and results.
        </p>
      </div>
      {error && <EdtpAlert type="error">{error}</EdtpAlert>}
      {message && <EdtpAlert type="success">{message}</EdtpAlert>}

      <div className="row g-3">
        <div className="col-lg-4">
          <EdtpPanel
            title={editingId ? 'Edit organization' : 'Add organization'}
            subtitle={
              editingId
                ? 'Update details, then save.'
                : 'Creates org admin account with the password below and emails login details.'
            }
          >
            <EdtpField label="Name" htmlFor="orgName">
              <input
                id="orgName"
                className="register__input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sunrise Academy"
              />
            </EdtpField>
            <EdtpField
              label={editingId ? 'Contact email' : 'Login email *'}
              htmlFor="orgContact"
              hint={
                editingId
                  ? 'Used for Super Admin notifications'
                  : 'Org admin will log in with this email'
              }
            >
              <input
                id="orgContact"
                type="email"
                className="register__input"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="admin@academy.com"
                required={!editingId}
              />
            </EdtpField>
            {!editingId && (
              <>
                <EdtpField label="Admin first name" htmlFor="orgAdminFirst">
                  <input
                    id="orgAdminFirst"
                    className="register__input"
                    value={adminFirstName}
                    onChange={(e) => setAdminFirstName(e.target.value)}
                    placeholder="Organization"
                  />
                </EdtpField>
                <EdtpField label="Admin last name" htmlFor="orgAdminLast">
                  <input
                    id="orgAdminLast"
                    className="register__input"
                    value={adminLastName}
                    onChange={(e) => setAdminLastName(e.target.value)}
                    placeholder="Admin"
                  />
                </EdtpField>
                <EdtpField
                  label="Admin password"
                  htmlFor="orgAdminPassword"
                  hint={`Suggested: ${DEFAULT_SUGGESTED_PASSWORD} — edit if needed`}
                >
                  <PasswordInput
                    id="orgAdminPassword"
                    className="register__input"
                    value={adminPassword}
                    defaultVisible
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      if (passwordError) setPasswordError('');
                    }}
                    hasError={Boolean(passwordError)}
                    autoComplete="new-password"
                  />
                  <FormError message={passwordError} />
                </EdtpField>
              </>
            )}
            <button
              type="button"
              id="orgApproveNow"
              role="switch"
              aria-checked={activateNow}
              className={`edtp-switch${activateNow ? ' is-on' : ''}`}
              onClick={() => setActivateNow((prev) => !prev)}
            >
              <span className="edtp-switch__track" aria-hidden>
                <span className="edtp-switch__thumb" />
              </span>
              <span className="edtp-switch__text">
                <strong>{activateNow ? 'Activated' : 'Suspended'}</strong>
                <small>
                  {activateNow
                    ? 'Organization can access the platform'
                    : 'Organization stays inactive until activated'}
                </small>
              </span>
            </button>
            <EdtpFormActions>
              <EdtpBtn variant="primary" size="md" onClick={() => void save()}>
                {editingId ? 'Update' : 'Create & email login'}
              </EdtpBtn>
              {editingId && (
                <EdtpBtn variant="ghost" size="md" onClick={resetForm}>
                  Cancel
                </EdtpBtn>
              )}
            </EdtpFormActions>
          </EdtpPanel>
        </div>

        <div className="col-lg-8">
          <EdtpPanel title="All organizations" subtitle={`${orgs.length} vendor${orgs.length === 1 ? '' : 's'}`}>
            {orgs.length === 0 && !loading ? (
              <EdtpEmpty>No organizations yet. Create the first vendor on the left.</EdtpEmpty>
            ) : (
              <div className="dashboard__table table-responsive">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Users</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orgs.map((org) => (
                      <tr key={org.id} className={editingId === org.id ? 'edtp-row--editing' : undefined}>
                        <td>
                          <strong>{org.name}</strong>
                        </td>
                        <td>{org.usersCount ?? '—'}</td>
                        <td>
                          <div className="edtp-status-switch">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={org.isActive}
                              aria-label={org.isActive ? 'Suspend organization' : 'Activate organization'}
                              className={`edtp-switch edtp-switch--compact${org.isActive ? ' is-on' : ''}`}
                              onClick={() => void (org.isActive ? suspend(org) : approve(org))}
                            >
                              <span className="edtp-switch__track" aria-hidden>
                                <span className="edtp-switch__thumb" />
                              </span>
                            </button>
                            <span
                              className={`edtp-badge ${
                                org.isActive ? 'edtp-badge--active' : 'edtp-badge--inactive'
                              }`}
                            >
                              {statusLabel(org)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <EdtpRowActions>
                            <EdtpBtn variant="secondary" onClick={() => manageData(org)}>
                              Switch to account
                            </EdtpBtn>
                            <EdtpBtn variant="secondary" onClick={() => startEdit(org)}>
                              Edit
                            </EdtpBtn>
                            <EdtpBtn variant="danger" onClick={() => void remove(org)}>
                              Delete
                            </EdtpBtn>
                          </EdtpRowActions>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </EdtpPanel>
        </div>
      </div>
    </div>
  );
}
