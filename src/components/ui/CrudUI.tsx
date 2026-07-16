import type { ButtonHTMLAttributes, ReactNode } from 'react';

type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type BtnSize = 'sm' | 'md';

interface EdtpBtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  size?: BtnSize;
  children: ReactNode;
}

/** Shared dashboard action button — use everywhere for Add / Edit / Delete / Cancel */
export function EdtpBtn({
  variant = 'secondary',
  size = 'sm',
  className = '',
  type = 'button',
  children,
  ...rest
}: EdtpBtnProps) {
  return (
    <button
      type={type}
      className={['edtp-btn', `edtp-btn--${variant}`, `edtp-btn--${size}`, className]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </button>
  );
}

export function EdtpRowActions({ children }: { children: ReactNode }) {
  return <div className="edtp-row-actions">{children}</div>;
}

export function EdtpFormActions({ children }: { children: ReactNode }) {
  return <div className="edtp-form-actions">{children}</div>;
}

export function EdtpField({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="edtp-field">
      <label className="edtp-field__label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint ? <span className="edtp-field__hint">{hint}</span> : null}
    </div>
  );
}

export function EdtpAlert({
  type,
  children,
}: {
  type: 'error' | 'success';
  children: ReactNode;
}) {
  return <p className={`edtp-alert edtp-alert--${type}`}>{children}</p>;
}

export function EdtpPanel({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="edtp-panel-block edtp-crud-panel">
      <div className="edtp-crud-panel__head">
        <div>
          <h5>{title}</h5>
          {subtitle ? <p className="edtp-crud-panel__sub">{subtitle}</p> : null}
        </div>
        {actions ? <div className="edtp-crud-panel__actions">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}

export function EdtpEmpty({ children }: { children: ReactNode }) {
  return <div className="edtp-empty">{children}</div>;
}
