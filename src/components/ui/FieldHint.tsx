interface FieldHintProps {
  loading?: boolean;
  empty?: boolean;
  emptyText?: string;
  loadingText?: string;
}

/** Small status line under cascading selects (dept → subject → topic) */
export function FieldHint({
  loading,
  empty,
  emptyText = 'No options found.',
  loadingText = 'Loading…',
}: FieldHintProps) {
  if (loading) {
    return (
      <p className="edtp-field-hint edtp-field-hint--loading mb-0 mt-1">
        <span className="edtp-inline-spinner" aria-hidden />
        {loadingText}
      </p>
    );
  }
  if (empty) {
    return <p className="edtp-field-hint text-muted mb-0 mt-1">{emptyText}</p>;
  }
  return null;
}

interface SearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
}

export function SearchField({
  value,
  onChange,
  placeholder = 'Search…',
  label,
}: SearchFieldProps) {
  return (
    <div className="edtp-search-field">
      {label && <label className="form-label">{label}</label>}
      <div className="edtp-search-field__wrap">
        <span className="edtp-search-field__icon" aria-hidden>
          ⌕
        </span>
        <input
          type="search"
          className="register__input"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            className="edtp-search-field__clear"
            onClick={() => onChange('')}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
