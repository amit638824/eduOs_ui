import { useEffect, useState } from 'react';
import { organizationService } from '@/services';
import { parseApiError } from '@/lib/errors';
import { useOrgScope } from '@/context/OrgScopeContext';
import { useDashboardLoader, useDashboardLoadingEffect } from '@/context/DashboardLoadingContext';
import { setSelectedOrganizationId } from '@/lib/orgScope';
import type { Organization } from '@/types/api';
import {
  EdtpAlert,
  EdtpBtn,
  EdtpEmpty,
  EdtpField,
  EdtpFormActions,
  EdtpPanel,
  EdtpRowActions,
} from '@/components/ui/CrudUI';

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      {error && <EdtpAlert type="error">{error}</EdtpAlert>}
      {message && <EdtpAlert type="success">{message}</EdtpAlert>}

      <div className="row g-3">
        <div className="col-lg-4">
          <EdtpPanel
            title={editingId ? 'Edit organization' : 'Add organization'}
            subtitle={editingId ? 'Update details, then save.' : 'New vendors start as pending unless approved.'}
          >
            <EdtpField label="Name" htmlFor="orgName">
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
            </EdtpField>
            <EdtpField label="Slug" htmlFor="orgSlug" hint="URL-safe id — lowercase letters, numbers, hyphens">
              <input
                id="orgSlug"
                className="register__input"
                value={slug}
                onChange={(e) => setSlug(slugify(e.target.value))}
                placeholder="sunrise-academy"
              />
            </EdtpField>
            <label className="edtp-check-row">
              <input
                type="checkbox"
                checked={activateNow}
                onChange={(e) => setActivateNow(e.target.checked)}
              />
              <span>Approve immediately (active)</span>
            </label>
            <EdtpFormActions>
              <EdtpBtn variant="primary" size="md" onClick={() => void save()}>
                {editingId ? 'Update' : 'Create'}
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
                      <th>Slug</th>
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
                        <td>
                          <span className="edtp-code">{org.slug}</span>
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
                          <EdtpRowActions>
                            <EdtpBtn variant="secondary" onClick={() => manageData(org)}>
                              Manage
                            </EdtpBtn>
                            {!org.isActive && (
                              <EdtpBtn variant="success" onClick={() => void approve(org)}>
                                Approve
                              </EdtpBtn>
                            )}
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
