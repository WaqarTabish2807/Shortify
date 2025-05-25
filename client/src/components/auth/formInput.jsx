import React from "react";
import { Eye, EyeOff } from "lucide-react";

const FormInput = ({
  label,
  type,
  id,
  value,
  onChange,
  placeholder,
  error,
  required = false,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const inputType = type === "password" ? (showPassword ? "text" : "password") : type;

  const inputStyle = {
    width: '93%',
    padding: '0.75rem 1rem',
    borderRadius: '0.5rem',
    border: '1px solid #d1d5db',
    fontSize: '1rem',
    outline: 'none',
    '::placeholder': {
        color: '#9ca3af',
        opacity: 1,
    },
  };

  const passwordIconContainerStyle = {
    position: 'absolute',
    right: '0.75rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6b7280',
    cursor: 'pointer',
    borderRadius: '50%',
    zIndex: 10,
    border: 'none',
    display: 'flex',
  };

  const errorTextStyle = {
    fontSize: '0.75rem',
    color: '#ef4444',
    marginTop: '0.25rem',
  };

  return (
    <div style={{ width: '100%' }}>
      <label htmlFor={id} style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          style={inputStyle}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={passwordIconContainerStyle}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <p style={errorTextStyle}>{error}</p>}
    </div>
  );
};

export default FormInput;