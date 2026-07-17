import {
  Children,
  forwardRef,
  isValidElement,
  useEffect,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react';

type OptionItem = {
  value: string;
  label: string;
  disabled?: boolean;
};

function parseOptions(children: ReactNode): OptionItem[] {
  const items: OptionItem[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type !== 'option') return;
    const props = child.props as {
      value?: string | number;
      children?: ReactNode;
      disabled?: boolean;
    };
    items.push({
      value: props.value == null ? '' : String(props.value),
      label: String(props.children ?? ''),
      disabled: Boolean(props.disabled),
    });
  });
  return items;
}

export interface EdtpSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children' | 'size'> {
  loading?: boolean;
  hasError?: boolean;
  children?: ReactNode;
}

/** Custom dropdown — closed + open menu fully styled (native select popup cannot be styled). */
export const EdtpSelect = forwardRef<HTMLButtonElement, EdtpSelectProps>(function EdtpSelect(
  {
    loading = false,
    hasError = false,
    className = '',
    disabled,
    children,
    value,
    defaultValue,
    onChange,
    onBlur,
    name,
    id,
    required,
  },
  ref,
) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const options = useMemo(() => parseOptions(children), [children]);

  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(() =>
    defaultValue == null ? '' : String(defaultValue),
  );

  const current = isControlled ? String(value ?? '') : internal;
  const selected = options.find((o) => o.value === current);
  const displayLabel = selected?.label || (loading ? 'Loading…' : 'Select…');
  const isDisabled = Boolean(disabled || loading);

  useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const emitChange = (next: string) => {
    if (!isControlled) setInternal(next);

    if (onChange) {
      const synthetic = {
        target: { value: next, name: name ?? '' },
        currentTarget: { value: next, name: name ?? '' },
      } as ChangeEvent<HTMLSelectElement>;
      onChange(synthetic);
    }
  };

  const handleBlur = (event: FocusEvent<HTMLButtonElement>) => {
    // Delay so option click can register before blur closes focus chain
    window.setTimeout(() => {
      if (rootRef.current?.contains(document.activeElement)) return;
      if (onBlur) {
        const synthetic = {
          ...event,
          target: { value: current, name: name ?? '' },
          currentTarget: { value: current, name: name ?? '' },
        } as unknown as FocusEvent<HTMLSelectElement>;
        onBlur(synthetic);
      }
    }, 0);
  };

  const pick = (next: string) => {
    emitChange(next);
    setOpen(false);
    triggerRef.current?.focus();
  };

  return (
    <div
      ref={rootRef}
      className={[
        'edtp-select',
        open ? 'is-open' : '',
        hasError ? 'has-error' : '',
        loading ? 'is-loading' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {name ? <input type="hidden" name={name} value={current} required={required} /> : null}
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className="edtp-select__trigger form-select"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        disabled={isDisabled}
        onClick={() => setOpen((prev) => !prev)}
        onBlur={handleBlur}
      >
        <span className="edtp-select__value">{displayLabel}</span>
        <i className={`icofont-simple-down edtp-select__chevron${open ? ' is-open' : ''}`} aria-hidden />
      </button>

      {open && (
        <ul id={listId} className="edtp-select__menu" role="listbox">
          {options.length === 0 ? (
            <li className="edtp-select__empty" role="presentation">
              No options
            </li>
          ) : (
            options.map((opt) => {
              const isSelected = opt.value === current;
              return (
                <li key={`${opt.value}::${opt.label}`} role="presentation">
                  <button
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={opt.disabled}
                    className={`edtp-select__option${isSelected ? ' is-selected' : ''}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(opt.value)}
                  >
                    {opt.label}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
});
