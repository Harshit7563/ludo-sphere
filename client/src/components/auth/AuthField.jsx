export default function AuthField({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon,
  endAdornment,
  autoComplete,
  minLength,
  name,
  error,
}) {
  const inputId = name ? `auth-${name}` : undefined;

  return (
    <div className={`auth-field ${error ? 'auth-field--invalid' : ''}`}>
      <label className="auth-field-label" htmlFor={inputId}>
        {label}
      </label>
      <div className={`auth-field-row ${error ? 'is-invalid' : ''}`}>
        {icon && <span className="auth-field-icon" aria-hidden>{icon}</span>}
        <input
          id={inputId}
          name={name}
          className="auth-field-input"
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          minLength={minLength}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error && inputId ? `${inputId}-error` : undefined}
        />
        {endAdornment}
      </div>
      {error && (
        <p id={inputId ? `${inputId}-error` : undefined} className="auth-field-error" role="alert">
          <span className="auth-field-error-icon" aria-hidden>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 8v5m0 4h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </span>
          {error}
        </p>
      )}
    </div>
  );
}
