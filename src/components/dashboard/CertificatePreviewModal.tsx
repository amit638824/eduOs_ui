import { useState } from 'react';
import { FiAward, FiCheck, FiX } from 'react-icons/fi';
import '@/styles/organizations.css';

export type CertificateTemplate = 'classic' | 'modern' | 'minimal';

interface CertificatePreviewModalProps {
  open: boolean;
  studentName: string;
  examTitle: string;
  percentage: number;
  onClose: () => void;
  onConfirm: (template: CertificateTemplate) => void;
  busy?: boolean;
}

const templates: { id: CertificateTemplate; label: string; description: string }[] = [
  {
    id: 'classic',
    label: 'Classic',
    description: 'Traditional formal borders.',
  },
  {
    id: 'modern',
    label: 'Modern',
    description: 'Contemporary sleek design.',
  },
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Clean & minimalist aesthetic.',
  },
];

export function CertificatePreviewModal({
  open,
  studentName,
  examTitle,
  percentage,
  onClose,
  onConfirm,
  busy = false,
}: CertificatePreviewModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate>('modern');

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className={`org-drawer-overlay ${open ? 'is-open' : ''}`}
        onClick={onClose}
        aria-hidden={!open}
      />

      {/* Side Drawer Container */}
      <aside
        className={`org-drawer ${open ? 'is-open' : ''}`}
        aria-label="Certificate preview drawer"
        aria-hidden={!open}
        style={{ width: '560px', maxWidth: '95vw' }}
      >
        {/* Drawer Header */}
        <div className="org-drawer-header">
          <div className="org-drawer-title-wrap">
            <div className="org-drawer-badge-icon">
              <FiAward />
            </div>
            <div>
              <h3 className="org-drawer-title">Certificate Preview</h3>
              <p className="org-drawer-desc">
                Select a template style before downloading or issuing
              </p>
            </div>
          </div>
          <button
            type="button"
            className="org-drawer-close-btn"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <FiX />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="org-drawer-body">
          {/* Template Selection Pills */}
          <div className="org-form-field">
            <label className="org-form-label">
              Select Design Template <span className="org-required-star">*</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {templates.map((template) => {
                const isSelected = selectedTemplate === template.id;
                return (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setSelectedTemplate(template.id)}
                    aria-pressed={isSelected}
                    style={{
                      padding: '12px 10px',
                      borderRadius: 10,
                      border: isSelected ? '2px solid #225ce5' : '1px solid #cbd5e1',
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 2px 8px rgba(34, 92, 229, 0.15)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <strong style={{ fontSize: '0.85rem', color: isSelected ? '#1e40af' : '#0f172a' }}>
                        {template.label}
                      </strong>
                      {isSelected && (
                        <FiCheck style={{ color: '#225ce5', fontSize: 14 }} />
                      )}
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', lineHeight: 1.3 }}>
                      {template.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="org-form-field" style={{ marginTop: 8 }}>
            <label className="org-form-label">Live Certificate Preview</label>
            <div
              style={{
                borderRadius: 12,
                border:
                  selectedTemplate === 'minimal'
                    ? '1px solid #94a3b8'
                    : selectedTemplate === 'modern'
                    ? '4px solid #172554'
                    : '6px double #b08d46',
                padding: '24px 20px',
                minHeight: 280,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                gap: 10,
                background: '#ffffff',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                position: 'relative',
              }}
            >
              <div style={{ fontSize: '0.72rem', letterSpacing: '0.15em', fontWeight: 700, color: '#64748b' }}>
                CERTIFICATE OF ACHIEVEMENT
              </div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                {selectedTemplate === 'classic'
                  ? 'Certificate of Excellence'
                  : selectedTemplate === 'modern'
                  ? 'Congratulations!'
                  : 'Certificate'}
              </h3>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>This certificate is proudly presented to</div>
              <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#172554', fontWeight: 800 }}>
                {studentName || 'Student Name'}
              </h2>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>for successfully completing</div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#1e293b' }}>
                {examTitle || 'Examination'}
              </h4>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 14px',
                  borderRadius: 20,
                  background: '#eff6ff',
                  color: '#225ce5',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  border: '1px solid #dbeafe',
                }}
              >
                Score: {percentage}%
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>
                Preview only — verified credential will be generated
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="org-drawer-footer">
          <button
            type="button"
            className="org-drawer-cancel"
            onClick={onClose}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="org-drawer-submit"
            onClick={() => {
              if (selectedTemplate) onConfirm(selectedTemplate);
            }}
            disabled={!selectedTemplate || busy}
          >
            {busy ? 'Processing…' : 'Confirm and issue'}
          </button>
        </div>
      </aside>
    </>
  );
}
