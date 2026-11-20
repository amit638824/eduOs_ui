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

export function PasswordRequirementsChecklist(
  _props?: PasswordRequirementsChecklistProps
) {
  return null;
}

export default PasswordRequirementsChecklist;
