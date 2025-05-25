import React, { useState } from "react";
import FormInput from "./formInput";

const LoginForm = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // In a real app, this would be an API call to authenticate the user
      console.log("Login submitted:", { email, password });
      // For now just show an alert
      alert(`Login attempted with email: ${email}`);
    }
  };
  
  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem', // Equivalent to space-y-4
  };

  const rememberForgotStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const rememberMeStyle = {
    display: 'flex',
    alignItems: 'center',
  };

  const rememberMeInputStyle = {
    height: '1rem', // Equivalent to h-4
    width: '1rem', // Equivalent to w-4
    borderRadius: '0.25rem', // Equivalent to rounded
    border: '1px solid #d1d5db', // Equivalent to border-gray-300
    color: '#7c3aed', // Equivalent to text-purple-600
    // focus:ring-purple-500 styles might require a CSS file or a different approach for inline styles
  };

  const rememberMeLabelStyle = {
    marginLeft: '0.5rem', // Equivalent to ml-2
    display: 'block',
    fontSize: '0.875rem', // Equivalent to text-sm
    color: '#374151', // Equivalent to text-gray-700
  };

  const forgotPasswordButtonStyle = {
    fontSize: '0.875rem', // Equivalent to text-sm
    fontWeight: '500', // Equivalent to font-medium
    color: '#7c3aed', // Equivalent to text-purple-600
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
  };

  const loginButtonStyle = {
    width: '100%', // Equivalent to w-full
    backgroundColor: '#000', // Equivalent to bg-black
    color: '#fff', // Equivalent to text-white
    paddingTop: '0.75rem', // Increased padding top
    paddingBottom: '0.75rem', // Increased padding bottom
    borderRadius: '0.375rem', // Equivalent to rounded-md
    fontWeight: '600', // Equivalent to font-semibold
    fontSize: '1.125rem', // Equivalent to text-lg
    transition: 'background-color 0.15s ease-in-out', // Equivalent to transition-colors
    cursor: 'pointer',
    border: 'none',
    marginTop: '1.5rem', // Add margin top to separate from elements above
  };

  const orDividerStyle = {
    display: 'flex',
    alignItems: 'center',
  };

  const dividerLineStyle = {
    flexGrow: 1,
    borderTop: '1px solid #d1d5db', // Equivalent to border-t border-gray-300
  };

  const orTextStyle = {
    margin: '0 1rem', // Equivalent to mx-4
    color: '#9ca3af', // Equivalent to text-gray-400
  };

  const googleButtonStyle = {
    width: '100%', // Equivalent to w-full
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem', // Equivalent to gap-2
    border: '1px solid #d1d5db', // Equivalent to border border-gray-300
    backgroundColor: '#fff', // Equivalent to bg-white
    color: '#374151', // Equivalent to text-gray-700
    paddingTop: '0.75rem', // Increased padding top
    paddingBottom: '0.75rem', // Increased padding bottom
    borderRadius: '0.375rem', // Equivalent to rounded-md
    fontWeight: '600', // Equivalent to font-semibold
    fontSize: '1.125rem', // Equivalent to text-lg
    transition: 'background-color 0.15s ease-in-out', // Equivalent to transition-colors
    cursor: 'pointer',
    // marginTop: '1rem', // Added margin top to separate from the 'or' divider
  };
  
  const signupPromptStyle = {
    textAlign: 'center',
    marginTop: '1.5rem', // Add space above the prompt
    fontSize: '0.875rem', // text-sm
    color: '#6b7280', // text-gray-500
  };
  
  const signupButtonStyle = {
    fontWeight: '500', // font-medium
    color: '#7c3aed', // text-purple-600
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
    marginLeft: '0.25rem', // ml-1
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
      <div className="w-full max-w-md p-8 rounded-xl shadow-lg bg-white/60 border border-gray-200 backdrop-blur-md">
        <div className="flex flex-col items-center mb-6">
        </div>
        <form onSubmit={handleSubmit} style={formStyle}>
          <FormInput
            label="Email Address"
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            required
          />
          <FormInput
            label="Password"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
          />
          <div style={rememberForgotStyle}>
            <div style={rememberMeStyle}>
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                style={rememberMeInputStyle}
              />
              <label htmlFor="remember-me" style={rememberMeLabelStyle}>
                Remember me
              </label>
            </div>
            <button type="button" style={forgotPasswordButtonStyle}>
              Forgot password?
            </button>
          </div>
          <button type="submit" style={loginButtonStyle}>
            Login
          </button>
          <div style={orDividerStyle}>
            <div style={dividerLineStyle} />
            <span style={orTextStyle}>or</span>
            <div style={dividerLineStyle} />
          </div>
          <button type="button" style={googleButtonStyle}>
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '1.25rem', height: '1.25rem' }} /> {/* Equivalent to w-5 h-5 */}
            Continue with Google
          </button>
        </form>
        <div style={signupPromptStyle}>
          Don't have an account?{" "}
          <button type="button" onClick={onSwitchToRegister} style={signupButtonStyle}>
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;