'use client';
import { useRouter } from 'next/navigation';
import './landing.css';

export default function Home() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/Login');
  };

  const handleGuestEntry = () => {
    // Navigate to guest view or main content
    console.log('Entering as guest');
    // You can replace this with the appropriate route
    router.push('/guest');
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
            Enter as Guest
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
