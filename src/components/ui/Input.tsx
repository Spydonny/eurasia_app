import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id || props.name;
  const classes = ['input', error ? 'input--error' : '', className].filter(Boolean).join(' ');

  return (
    <div className="input__wrapper">
      {label && (
        <label htmlFor={inputId} className="input__label">
          {label}
        </label>
      )}
      <input id={inputId} className={classes} {...props} />
      {error && <span className="input__error">{error}</span>}
    </div>
  );
}
