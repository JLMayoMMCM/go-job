'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './dashboard.css';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/Login');
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        } else {
          router.push('/Login');
        }
      } catch (error) {
        router.push('/Login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/');
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="logo">GO JOB</h1>
        <nav className="dashboard-nav">
          <button className="nav-btn">Jobs</button>
          <button className="nav-btn">Profile</button>
          <button className="nav-btn">Messages</button>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </nav>
      </header>

      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Welcome back, {user?.firstName || 'User'}!</h2>
          <p>Ready to find your next opportunity?</p>
        </div>

        <div className="dashboard-content">
          <div className="stats-cards">
            <div className="stat-card">
              <h3>Applications</h3>
              <p className="stat-number">12</p>
              <span className="stat-label">Pending</span>
            </div>
            <div className="stat-card">
              <h3>Messages</h3>
              <p className="stat-number">5</p>
              <span className="stat-label">Unread</span>
            </div>
            <div className="stat-card">
              <h3>Profile Views</h3>
              <p className="stat-number">47</p>
              <span className="stat-label">This month</span>
            </div>
          </div>

          <div className="recent-jobs">
            <h3>Recent Job Matches</h3>
            <div className="job-list">
              <div className="job-item">
                <h4>Software Engineer</h4>
                <p>Alpha Solutions</p>
                <span className="job-salary">$60,000</span>
              </div>
              <div className="job-item">
                <h4>Business Analyst</h4>
                <p>Beta Innovations</p>
                <span className="job-salary">$55,000</span>
              </div>
              <div className="job-item">
                <h4>QA Tester</h4>
                <p>Gamma Enterprises</p>
                <span className="job-salary">$45,000</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
