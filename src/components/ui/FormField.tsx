import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

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
  defaultVisible?: boolean;
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
          {visible ? (
            <FiEye size={18} strokeWidth={2} aria-hidden="true" />
          ) : (
            <FiEyeOff size={18} strokeWidth={2} aria-hidden="true" />
          )}
        </button>
      </div>
    );
  },
);
