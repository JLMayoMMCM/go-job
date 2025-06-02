'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import './verify.css';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, [searchParams]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code })
      });

      const data = await response.json();
      
      if (response.ok) {
        // Store token and redirect to dashboard
        localStorage.setItem('authToken', data.token);
        router.push('/dashboard');
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    try {
      const response = await fetch('/api/auth/resend-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        alert('Verification code sent!');
      }
    } catch (error) {
      setError('Failed to resend code');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="verify-container">
      <div className="verify-card">
        <h1 className="logo">GO JOB</h1>
        <h2 className="verify-title">VERIFY EMAIL</h2>
        
        <p className="verify-description">
          We've sent a verification code to <strong>{email}</strong>
        </p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleVerify} className="verify-form">
          <div className="input-group">
            <label htmlFor="code">VERIFICATION CODE</label>
            <input
              type="text"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength="6"
              required
            />
          </div>

          <button type="submit" className="verify-btn" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'VERIFY'}
          </button>
        </form>

        <div className="resend-section">
          <span>Didn't receive the code?</span>
          <button 
            type="button" 
            className="resend-btn"
            onClick={handleResendCode}
            disabled={isResending}
          >
            {isResending ? 'Sending...' : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
}
