import React, { useState } from "react";
import FormInput from "./formInput";
import { ArrowRight } from "lucide-react";
import { supabase } from '../../supabase/client'; // Import supabase

const RegisterForm = ({ onSwitchToLogin }) => {
  const [name, setName] = useState(""); // Change state back to name
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(''); // Add message state for feedback
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) { // Validate name field
      newErrors.name = "Full Name is required";
    }
    
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (password !== confirmPassword) {
      newErrors.password = "Passwords do not match";
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => { // Make handleSubmit async
    e.preventDefault();
    setMessage(''); // Clear previous messages
    if (validateForm()) {
      console.log("Registration submitted:", { name, email, password }); // Log name

      // Supabase signup call
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

      if (signUpError) {
        setMessage(signUpError.message); // Display Supabase auth error message
        console.error('Supabase signup error:', signUpError);
      } else if (data.user) {
        // Auth signup successful, now insert name into user_credits table
        const { error: insertError } = await supabase
          .from('user_credits')
          .insert([
            {
              user_id: data.user.id,
              name: name.trim(), // Use name here
              credits: 2, // Assuming initial credits
            },
          ]);

        if (insertError) {
          setMessage("Signup successful, but failed to save full name: " + insertError.message); // Indicate partial success/error
          console.error('Supabase insert error:', insertError);
        } else {
          setMessage("Signup successful! Check your email for confirmation."); // Full success
          console.log('User credits and full name inserted!');
          // Optionally switch to login form after successful signup and data insert
          // onSwitchToLogin();
        }
      } else {
          // This case might occur if signup is successful but no user data is returned (e.g., email confirmation required)
          setMessage("Signup initiated. Check your email for confirmation.");
          console.log('Supabase signup successful, awaiting email confirmation.', data);
      }
    }
  };
  
  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem', // Equivalent to space-y-4
  };
  
  const headerContainerStyle = {
    textAlign: 'center',
    marginBottom: '1.5rem', // Equivalent to space-y-6 and then mb-6 for the form
  };
  
  const headingStyle = {
    fontSize: '1.5rem', // Equivalent to text-2xl
    fontWeight: 'bold', // Equivalent to font-bold
    color: '#111827', // Equivalent to text-gray-900
    marginBottom: '0.5rem', // Equivalent to mt-2
  };
  
  const subheadingStyle = {
    fontSize: '0.875rem', // Equivalent to text-sm
    color: '#4b5563', // Equivalent to text-gray-600
  };
  
  const termsContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    marginTop: '1rem', // Add some space above terms
  };
  
  const termsInputStyle = {
    height: '1rem', // Equivalent to h-4
    width: '1rem', // Equivalent to w-4
    borderRadius: '0.25rem', // Equivalent to rounded
    border: '1px solid #d1d5db', // Equivalent to border-gray-300
    color: '#7c3aed', // Equivalent to text-purple-600
    // focus:ring-purple-500 styles might require a CSS file or a different approach for inline styles
  };
  
  const termsLabelStyle = {
    marginLeft: '0.5rem', // Equivalent to ml-2
    display: 'block',
    fontSize: '0.875rem', // Equivalent to text-sm
    color: '#374151', // Equivalent to text-gray-700
  };
  
  const termsButtonStyle = {
    fontWeight: '500', // Equivalent to font-medium
    color: '#7c3aed', // Equivalent to text-purple-600
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
    display: 'inline', // Ensure it flows with text
    margin: '0 0.25rem', // Add slight margin around the buttons
  };
  
  const signupButtonStyle = {
    width: '100%', // Equivalent to w-full
    backgroundColor: '#000', // Using black background like the Login button
    color: '#fff', // Equivalent to text-white
    paddingTop: '0.75rem', // Consistent padding with Login button
    paddingBottom: '0.75rem', // Consistent padding with Login button
    borderRadius: '0.375rem', // Equivalent to rounded-md
    fontWeight: '600', // Equivalent to font-semibold
    fontSize: '1.125rem', // Equivalent to text-lg
    transition: 'background-color 0.15s ease-in-out', // Equivalent to transition-colors
    cursor: 'pointer',
    border: 'none',
    marginTop: '1.5rem', // Space above the button
    display: 'flex', // To center content
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem', // Gap for icon
  };
  
  const signinPromptStyle = {
    textAlign: 'center',
    marginTop: '1.5rem', // Add space above the prompt
    fontSize: '0.875rem', // text-sm
    color: '#6b7280', // text-gray-500
  };
  
  const signinButtonStyle = {
    fontWeight: '500', // font-medium
    color: '#7c3aed', // text-purple-600
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
    marginLeft: '0.25rem', // ml-1
  };
  
  const messageStyle = {
    textAlign: 'center',
    marginTop: '1rem',
    fontSize: '0.875rem',
    color: errors ? '#ef4444' : '#10b981', // Red for errors, green for success
  };
  
  return (
    <div style={{ width: '100%' }}> {/* Equivalent to w-full */}
      <div style={headerContainerStyle}>
        <h2 style={headingStyle}>Create an account</h2>
        <p style={subheadingStyle}>Fill in the details below to get started</p>
      </div>
      
      <form onSubmit={handleSubmit} style={formStyle}>
        <FormInput
          label="Full Name"
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          required
        />
        
        <FormInput
          label="Email"
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
        
        <FormInput
          label="Confirm Password"
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          required
        />
        
        <div style={termsContainerStyle}>
          <input
            id="terms"
            name="terms"
            type="checkbox"
            style={termsInputStyle}
            required
          />
          <label htmlFor="terms" style={termsLabelStyle}>
            I agree to the{" "}
            <button type="button" style={termsButtonStyle}>
              Terms of Service
            </button>{" "}
            and{" "}
            <button type="button" style={termsButtonStyle}>
              Privacy Policy
            </button>
          </label>
        </div>
        
        <button type="submit" style={signupButtonStyle}>
          Sign up <ArrowRight size={16} />
        </button>
      </form>
      
      {message && <p style={messageStyle}>{message}</p>}
      
      <div style={signinPromptStyle}>
          Already have an account?{" "}
        <button type="button" onClick={onSwitchToLogin} style={signinButtonStyle}>
            Sign in
          </button>
      </div>
    </div>
  );
};

export default RegisterForm;