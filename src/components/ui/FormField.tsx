import { forwardRef, useState, type InputHTMLAttributes } from 'react';

interface FormErrorProps {
  message?: string;
}

export function FormError({ message }: FormErrorProps) {
  if (!message) return null;
  return <p className="form-error">{message}</p>;
}

export function inputClassName(baseClass: string, hasError?: boolean) {
  return hasError ? `${baseClass} input-error` : baseClass;
}

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  hasError?: boolean;
  inputClass?: string;
  /** Show password as plain text on first render (dashboard create forms with a suggested default). */
  defaultVisible?: boolean;
}

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M3 3l18 18"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M10.6 10.7a2.5 2.5 0 003.5 3.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="M9.9 5.5A10.5 10.5 0 0112 5.25c4.76 0 8.73 3.05 10.25 7.25a11.4 11.4 0 01-4.1 5.1M6.1 6.1A11.4 11.4 0 001.75 12.5C3.27 16.7 7.24 19.75 12 19.75c1.2 0 2.35-.18 3.42-.52"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12.5S5.5 6.5 12 6.5s10 6 10 6-3.5 6-10 6S2 12.5 2 12.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12.5" r="2.75" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
    { hasError, inputClass = '', className, defaultVisible = false, ...props },
    ref,
  ) {
    const [visible, setVisible] = useState(defaultVisible);
    const fieldClass = inputClass || className || '';

    return (
      <div className="password-input-wrap">
        <input
          ref={ref}
          type={visible ? 'text' : 'password'}
          className={inputClassName(fieldClass, hasError)}
          {...props}
        />
        <button
          type="button"
          className={`password-input-toggle${visible ? ' is-visible' : ''}`}
          onClick={() => setVisible((show) => !show)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          <EyeIcon open={visible} />
        </button>
      </div>
    );
  },
);
