
import { useState } from 'react';

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
        description: 'Traditional certificate with formal borders.',
    },
    {
        id: 'modern',
        label: 'Modern',
        description: 'Your existing modern certificate style.',
    },
    {
        id: 'minimal',
        label: 'Minimal',
        description: 'A clean, simple certificate design.',
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
    const [selectedTemplate, setSelectedTemplate] =
        useState<CertificateTemplate | null>(null);

    if (!open) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="certificate-preview-title"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1000,
                background: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 20,
                overflowY: 'auto',
            }}
        >
            <div
                style={{
                    background: '#fff',
                    color: '#1f2937',
                    width: 'min(900px, 100%)',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    borderRadius: 12,
                    padding: 24,
                }}
            >
                <h2 id="certificate-preview-title">Certificate preview</h2>
                <p>Select a template to preview the certificate before issuing it.</p>

                <div
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 10,
                        margin: '20px 0',
                    }}
                >
                    {templates.map((template) => (
                        <button
                            key={template.id}
                            type="button"
                            onClick={() => setSelectedTemplate(template.id)}
                            aria-pressed={selectedTemplate === template.id}
                            style={{
                                flex: '1 1 180px',
                                padding: 12,
                                borderRadius: 8,
                                border:
                                    selectedTemplate === template.id
                                        ? '2px solid #1d4ed8'
                                        : '1px solid #d1d5db',
                                background:
                                    selectedTemplate === template.id ? '#eff6ff' : '#fff',
                                color: '#1f2937',
                                cursor: 'pointer',
                                textAlign: 'left',
                            }}
                        >
                            <strong>{template.label}</strong>
                            <div style={{ fontSize: 13, marginTop: 5 }}>
                                {template.description}
                            </div>
                        </button>
                    ))}
                </div>

                {selectedTemplate ? (
                    <div
                        style={{
                            border:
                                selectedTemplate === 'minimal'
                                    ? '1px solid #9ca3af'
                                    : selectedTemplate === 'modern'
                                        ? '5px solid #172554'
                                        : '8px double #b08d46',
                            padding: 24,
                            minHeight: 280,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center',
                            gap: 12,
                            background: '#fff',
                            color: '#1f2937',
                        }}
                    >
                        <div style={{ fontSize: 13, letterSpacing: 2 }}>
                            CERTIFICATE OF ACHIEVEMENT
                        </div>
                        <h2 style={{ margin: 0 }}>
                            {selectedTemplate === 'classic'
                                ? 'Certificate of Excellence'
                                : selectedTemplate === 'modern'
                                    ? 'Congratulations!'
                                    : 'Certificate'}
                        </h2>
                        <div>This certificate is presented to</div>
                        <h1 style={{ margin: 0, color: '#172554' }}>
                            {studentName || 'Student Name'}
                        </h1>
                        <div>for successfully completing</div>
                        <h3 style={{ margin: 0 }}>{examTitle || 'Examination'}</h3>
                        <div>Score: {percentage}%</div>
                        <div style={{ fontSize: 12, marginTop: 10 }}>
                            Preview only — not yet issued
                        </div>
                    </div>
                ) : (
                    <div
                        style={{
                            border: '1px dashed #9ca3af',
                            borderRadius: 8,
                            padding: 36,
                            textAlign: 'center',
                            color: '#6b7280',
                        }}
                    >
                        Select Classic, Modern, or Minimal to see the preview.
                    </div>
                )}

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 10,
                        marginTop: 20,
                    }}
                >
                    <button type="button" onClick={onClose} disabled={busy}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            if (selectedTemplate) onConfirm(selectedTemplate);
                        }}
                        disabled={!selectedTemplate || busy}
                    >
                        {busy ? 'Issuing…' : 'Confirm and issue'}
                    </button>
                </div>
            </div>
        </div>
    );
}
