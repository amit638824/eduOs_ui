import { useEffect, useState } from 'react';
import { organizationService } from '@/services';
import { parseApiError } from '@/lib/errors';
import { useOrgScope } from '@/context/OrgScopeContext';
import { useDashboardLoader, useDashboardLoadingEffect } from '@/context/DashboardLoadingContext';
import { setSelectedOrganizationId } from '@/lib/orgScope';
import type { Organization } from '@/types/api';

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function statusLabel(org: Organization) {
  if (org.isActive) return 'Approved';
  const v = org.settings?.verificationStatus;
  return typeof v === 'string' ? v : 'Pending';
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
  const [slug, setSlug] = useState('');
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
    setSlug('');
    setActivateNow(false);
  };

  const startEdit = (org: Organization) => {
    setEditingId(org.id);
    setName(org.name);
    setSlug(org.slug);
    setActivateNow(org.isActive);
    setMessage('');
    setError('');
  };

  const save = async () => {
    if (!name.trim() || !slug.trim()) {
      setError('Name and slug are required.');
      return;
    }
    setError('');
    setMessage('');
    await withLoader(async () => {
      try {
        if (editingId) {
          await organizationService.updateOrganization(editingId, {
            name: name.trim(),
            slug: slug.trim(),
            isActive: activateNow,
          });
          setMessage('Organization updated.');
        } else {
          await organizationService.createOrganization({
            name: name.trim(),
            slug: slug.trim(),
            isActive: activateNow,
          });
          setMessage(
            activateNow
              ? 'Organization created and approved.'
              : 'Organization created — pending approval.',
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
    setError('');
    setMessage('');
    await withLoader(async () => {
      try {
        await organizationService.verifyOrganization(org.id);
        setMessage(`${org.name} approved. Pending users are now active.`);
        await load();
        await refreshOrganizations();
      } catch (err) {
        setError(parseApiError(err));
      }
    });
  };

  const remove = async (org: Organization) => {
    if (!window.confirm(`Delete organization “${org.name}”? This soft-deletes the vendor.`)) {
      return;
    }
    setError('');
    await withLoader(async () => {
      try {
        await organizationService.deleteOrganization(org.id);
        setMessage('Organization deleted.');
        if (editingId === org.id) resetForm();
        await load();
        await refreshOrganizations();
      } catch (err) {
        setError(parseApiError(err));
      }
    });
  };

  const manageData = (org: Organization) => {
    setSelectedOrganizationId(org.id);
    setSelectedOrgId(org.id);
    setMessage(`Now managing data for ${org.name}. Use Users, Tests, Results from the sidebar.`);
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
      {error && <p className="login__error sp_bottom_15">{error}</p>}
      {message && <p className="form-success sp_bottom_15">{message}</p>}

      <div className="row g-3">
        <div className="col-lg-4">
          <div className="edtp-panel-block">
            <h5>{editingId ? 'Edit organization' : 'Add organization'}</h5>
            <label htmlFor="orgName">Name</label>
            <input
              id="orgName"
              className="register__input"
              value={name}
              onChange={(e) => {
                const v = e.target.value;
                setName(v);
                if (!editingId) setSlug(slugify(v));
              }}
              placeholder="e.g. Sunrise Academy"
            />
            <label htmlFor="orgSlug">Slug</label>
            <input
              id="orgSlug"
              className="register__input"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              placeholder="sunrise-academy"
            />
            <label className="edtp-check-row">
              <input
                type="checkbox"
                checked={activateNow}
                onChange={(e) => setActivateNow(e.target.checked)}
              />
              <span>Approve immediately (active)</span>
            </label>
            <div className="edtp-inline-field mt-2">
              <button type="button" className="default__button" onClick={() => void save()}>
                {editingId ? 'Update' : 'Create'}
              </button>
              {editingId && (
                <button type="button" className="dashboard__small__btn__2" onClick={resetForm}>
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="edtp-panel-block">
            <h5>All organizations</h5>
            <div className="dashboard__table table-responsive">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Users</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orgs.map((org) => (
                    <tr key={org.id}>
                      <td>{org.name}</td>
                      <td>
                        <code>{org.slug}</code>
                      </td>
                      <td>{org.usersCount ?? '—'}</td>
                      <td>
                        <span
                          className={`edtp-badge ${
                            org.isActive ? 'edtp-badge--active' : 'edtp-badge--inactive'
                          }`}
                        >
                          {statusLabel(org)}
                        </span>
                      </td>
                      <td>
                        <span className="d-flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="dashboard__small__btn__2"
                            onClick={() => manageData(org)}
                          >
                            Manage
                          </button>
                          {!org.isActive && (
                            <button
                              type="button"
                              className="default__button small-btn"
                              onClick={() => void approve(org)}
                            >
                              Approve
                            </button>
                          )}
                          <button
                            type="button"
                            className="dashboard__small__btn__2"
                            onClick={() => startEdit(org)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="dashboard__small__btn__2"
                            onClick={() => void remove(org)}
                          >
                            Delete
                          </button>
                        </span>
                      </td>
                    </tr>
                  ))}
                  {orgs.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className="text-muted">
                        No organizations yet. Create the first vendor on the left.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
