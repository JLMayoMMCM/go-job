'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import './landing.css';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Ensure router is available before using it
    if (!router) {
      console.error('Router not available');
      return;
    }
  }, [router]);

  const handleLogin = () => {
    try {
      if (router && router.push) {
        router.push('/Login');
      } else {
        console.error('Router push method not available');
      }
    } catch (error) {
      console.error('Error navigating to login:', error);
    }
  };

  const handleGuestEntry = () => {
    try {
      console.log('Entering as guest');
      if (router && router.push) {
        router.push('/guest');
      } else {
        console.error('Router push method not available');
      }
    } catch (error) {
      console.error('Error navigating to guest:', error);
    }
  };

  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1 className="landing-title">GO JOB</h1>
        <p className="landing-subtitle">Find Your Perfect Career Match</p>
        
        <div className="landing-buttons">
          <button 
            className="guest-button"
            onClick={handleGuestEntry}
          >
            Continue as Guest
          </button>
          
          <button 
            className="login-button"
            onClick={handleLogin}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
