import { FiCheck } from 'react-icons/fi';

export interface PasswordRule {
  id: string;
  label: string;
  met: boolean;
}

export function getPasswordValidationRules(password: string): PasswordRule[] {
  const p = password || '';
  return [
    {
      id: 'length',
      label: 'At least 8 characters',
      met: p.length >= 8 && p.length <= 128,
    },
    {
      id: 'uppercase',
      label: 'At least one uppercase letter (A-Z)',
      met: /[A-Z]/.test(p),
    },
    {
      id: 'lowercase',
      label: 'At least one lowercase letter (a-z)',
      met: /[a-z]/.test(p),
    },
    {
      id: 'number',
      label: 'At least one number (0-9)',
      met: /[0-9]/.test(p),
    },
    {
      id: 'special',
      label: 'At least one special character (!@#$%^&*)',
      met: /[^A-Za-z0-9]/.test(p),
    },
  ];
}

interface PasswordRequirementsChecklistProps {
  password?: string;
  className?: string;
}

export function PasswordRequirementsChecklist({
  password = '',
  className = '',
}: PasswordRequirementsChecklistProps) {
  const rules = getPasswordValidationRules(password);
  const allMet = rules.every((r) => r.met);
  const metCount = rules.filter((r) => r.met).length;

  return (
    <div
      className={`password-requirements-box ${className}`}
      style={{
        marginTop: '6px',
        marginBottom: '6px',
        padding: '7px 11px',
        background: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '4px',
        }}
      >
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            color: '#475569',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
          }}
        >
          Password Requirements
        </span>
        {password && (
          <span
            style={{
              fontSize: '10px',
              fontWeight: 700,
              color: allMet ? '#16a34a' : '#64748b',
            }}
          >
            {metCount} of {rules.length} fulfilled
          </span>
        )}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '3px 8px',
        }}
      >
        {rules.map((rule) => (
          <div
            key={rule.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontWeight: rule.met ? 600 : 500,
              color: rule.met ? '#16a34a' : '#64748b',
              transition: 'all 0.15s ease',
              lineHeight: 1.2,
            }}
          >
            <span
              style={{
                width: 13,
                height: 13,
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: rule.met ? '#dcfce7' : '#f1f5f9',
                color: rule.met ? '#16a34a' : '#94a3b8',
                border: rule.met ? '1.5px solid #22c55e' : '1.5px solid #cbd5e1',
                fontSize: 9,
                flexShrink: 0,
                transition: 'all 0.15s ease',
              }}
            >
              {rule.met ? <FiCheck style={{ strokeWidth: 3 }} /> : null}
            </span>
            <span>{rule.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PasswordRequirementsChecklist;
