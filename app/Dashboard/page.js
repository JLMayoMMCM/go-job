'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';
import JobCard from '@/components/JobCard';
import './dashboard.css';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
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
          
          // Load jobs based on user type
          if (userData.isJobSeeker) {
            await loadJobSeekerJobs(token);
          } else {
            await loadEmployeeJobs(token);
          }
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

  const loadJobSeekerJobs = async (token) => {
    try {
      // Load recommended jobs
      const recommendedResponse = await fetch('/api/jobs/recommended', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (recommendedResponse.ok) {
        const recommendedData = await recommendedResponse.json();
        setRecommendedJobs(recommendedData.slice(0, 8));
      }

      // Load all jobs
      const allJobsResponse = await fetch('/api/jobs/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (allJobsResponse.ok) {
        const allJobsData = await allJobsResponse.json();
        setAllJobs(allJobsData.slice(0, 8));
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const loadEmployeeJobs = async (token) => {
    try {
      // Load company jobs for employees
      const companyJobsResponse = await fetch('/api/jobs/company', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (companyJobsResponse.ok) {
        const companyJobsData = await companyJobsResponse.json();
        setAllJobs(companyJobsData.slice(0, 8));
      }
    } catch (error) {
      console.error('Error loading company jobs:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/');
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <DashboardHeader user={user} />

      <main className="dashboard-main">
        <div className="welcome-section">
          <h2>Welcome back, {user?.firstName || 'User'}!</h2>
          <p>{user?.isJobSeeker ? 'Ready to find your next opportunity?' : 'Manage your job postings and applications'}</p>
        </div>

        <div className="dashboard-content">
          {user?.isJobSeeker ? (
            <>
              {/* Recommended Jobs Section */}
              <div className="jobs-section">
                <div className="section-header">
                  <h3>Recommended Jobs</h3>
                  <button 
                    className="view-all-btn"
                    onClick={() => router.push('/jobs/recommended')}
                  >
                    View All Recommended
                  </button>
                </div>
                <div className="jobs-scroll-container">
                  <div className="jobs-list">
                    {recommendedJobs.map(job => (
                      <JobCard key={job.job_id} job={job} />
                    ))}
                  </div>
                </div>
              </div>

              {/* All Jobs Section */}
              <div className="jobs-section">
                <div className="section-header">
                  <h3>Available Jobs</h3>
                  <button 
                    className="view-all-btn"
                    onClick={() => router.push('/jobs/all')}
                  >
                    View All Jobs
                  </button>
                </div>
                <div className="jobs-scroll-container">
                  <div className="jobs-list">
                    {allJobs.map(job => (
                      <JobCard key={job.job_id} job={job} />
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Employee Dashboard */}
              <div className="stats-cards">
                <div className="stat-card">
                  <h3>Active Postings</h3>
                  <p className="stat-number">{allJobs.length}</p>
                  <span className="stat-label">Currently hiring</span>
                </div>
                <div className="stat-card">
                  <h3>Applications</h3>
                  <p className="stat-number">24</p>
                  <span className="stat-label">Pending review</span>
                </div>
                <div className="stat-card">
                  <h3>Positions Filled</h3>
                  <p className="stat-number">8</p>
                  <span className="stat-label">This month</span>
                </div>
              </div>

              <div className="jobs-section">
                <div className="section-header">
                  <h3>Your Job Postings</h3>
                  <button 
                    className="add-job-btn"
                    onClick={() => router.push('/jobs/create')}
                  >
                    Add New Job
                  </button>
                </div>
                <div className="jobs-scroll-container">
                  <div className="jobs-list">
                    {allJobs.map(job => (
                      <JobCard key={job.job_id} job={job} isEmployer={true} />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
