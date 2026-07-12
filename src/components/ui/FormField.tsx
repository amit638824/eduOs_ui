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
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ hasError, inputClass = '', className, ...props }, ref) {
    const [visible, setVisible] = useState(false);
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
          className="password-input-toggle"
          onClick={() => setVisible((show) => !show)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          <i className={visible ? 'icofont-eye-blocked' : 'icofont-eye'} aria-hidden="true" />
        </button>
      </div>
    );
  },
);
