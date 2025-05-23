// import React, { useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import LoginForm from "./loginForm";
// import RegisterForm from "./RegisterForm";


// const AuthForm = () => {
//   const [isLogin, setIsLogin] = useState(true);
  
//   return (
//     <div className="w-full max-w-md">
//       <div className="mb-6 flex rounded-md bg-gray-100 p-1">
//         <button
//           type="button"
//           onClick={() => setIsLogin(true)}
//         >
//           Sign in
//         </button>
//         <button
//           type="button"
//           onClick={() => setIsLogin(false)}
//         >
//           Sign up
//         </button>
//       </div>
      
//       <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
//         <AnimatePresence mode="wait">
//           {isLogin ? (
//             <motion.div
//               key="login"
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: 20 }}
//               transition={{ duration: 0.2 }}
//             >
//               <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
//             </motion.div>
//           ) : (
//             <motion.div
//               key="register"
//               initial={{ opacity: 0, x: 20 }}
//               animate={{ opacity: 1, x: 0 }}
//               exit={{ opacity: 0, x: -20 }}
//               transition={{ duration: 0.2 }}
//             >
//               <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   );
// };

// export default AuthForm;


// LoginSignup.js
// src/pages/LoginSignup.js
import { useState } from 'react';
import { supabase } from '../../supabase/client';
import { useNavigate } from 'react-router-dom';

const AuthForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSignup) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        // After successful signup
        const user = data.user;
        console.log(user);
        const { error: insertError } = await supabase
      .from('user_credits')
      .insert([
        {
          user_id: user.id,
          credits: 2,
        },
      ]);

    if (insertError) {
      console.error('Insert Error:', insertError.message);
    } else {
      console.log('Credits inserted for user!');
    }
        setMessage("Signup successful! Check your email for confirmation.");
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setMessage("Invalid credentials. Please try again.");
      } else {
        setMessage("Login successful!");
        navigate('/dashboard');  // Redirect to Dashboard
      }
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: 'auto' }}>
      <h2>{isSignup ? 'Sign Up' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        /><br />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        /><br />
        <button type="submit">{isSignup ? 'Sign Up' : 'Login'}</button>
      </form>
      <p style={{ color: 'red' }}>{message}</p>
      <button onClick={() => setIsSignup(!isSignup)}>
        {isSignup ? 'Already have an account? Login' : 'New user? Sign Up'}
      </button>
    </div>
  );
}

export default AuthForm;

