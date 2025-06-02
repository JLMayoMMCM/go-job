'use client';
import { useState } from 'react';
import './login.css';

export default function LoginPage() {
  const [userType, setUserType] = useState('employee');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log('Login attempt:', { userType, username, password });
  };

  const handleGoogleLogin = () => {
    // Handle Google login logic here
    console.log('Google login attempt');
  };

  const handleForgotPassword = () => {
    // Handle forgot password logic here
    console.log('Forgot password');
  };

  const handleSignup = () => {
    // Handle signup navigation here
    console.log('Navigate to signup');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="logo">GO JOB</h1>
        
        <h2 className="login-title">LOGIN</h2>
        
        <div className="user-type-toggle">
          <button 
            className={`toggle-btn ${userType === 'employee' ? 'active' : ''}`}
            onClick={() => setUserType('employee')}
          >
            Employee
          </button>
          <button 
            className={`toggle-btn ${userType === 'employer' ? 'active' : ''}`}
            onClick={() => setUserType('employer')}
          >
            Employer
          </button>
        </div>

        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label htmlFor="username">USERNAME</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">PASSWORD</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="action-buttons">
            <button 
              type="button" 
              className="forgot-password-btn"
              onClick={handleForgotPassword}
            >
              FORGOT PASSWORD ?
            </button>
            <button type="submit" className="login-btn">
              LOGIN
            </button>
          </div>
        </form>

        <button 
          type="button" 
          className="google-login-btn"
          onClick={handleGoogleLogin}
        >
          Login with Google
        </button>

        <div className="signup-section">
          <span>New to Go-Job ?</span>
          <button 
            type="button" 
            className="signup-btn"
            onClick={handleSignup}
          >
            Sign-up
          </button>
        </div>
      </div>

      <div className="support-section">
        <button className="support-btn">SUPPORT</button>
      </div>
    </div>
  );
}