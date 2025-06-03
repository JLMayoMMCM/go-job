'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';

export default function JobSeekerDashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [stats, setStats] = useState({});
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
          if (!userData.isJobSeeker) {
            router.push('/employee/dashboard');
            return;
          }
          setUser(userData);
          await loadJobSeekerData(token);
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

  const loadJobSeekerData = async (token) => {
    try {
      // Load applications
      const applicationsResponse = await fetch('/api/jobseeker/applications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (applicationsResponse.ok) {
        const applicationsData = await applicationsResponse.json();
        setApplications(applicationsData);
        
        // Calculate stats
        const pending = applicationsData.filter(app => app.request_status === 'pending').length;
        const accepted = applicationsData.filter(app => app.request_status === 'accepted').length;
        const rejected = applicationsData.filter(app => app.request_status === 'rejected').length;
        
        setStats({
          totalApplications: applicationsData.length,
          pendingApplications: pending,
          acceptedApplications: accepted,
          rejectedApplications: rejected
        });
      }

      // Load recent jobs
      const jobsResponse = await fetch('/api/jobs/search', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json();
        setRecentJobs(jobsData.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading job seeker data:', error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen text-lg">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} />

      <main className="p-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl text-gray-800 mb-2 font-bold">
            Welcome back, {user?.firstName || user?.username || 'User'}!
          </h2>
          <p className="text-gray-600 text-xl">Find your next career opportunity</p>
        </div>

        <div className="flex flex-col gap-12">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-2xl shadow-md text-center border-l-4 border-blue-600">
              <h3 className="text-gray-600 text-sm mb-4 uppercase tracking-wide font-medium">Total Applications</h3>
              <p className="text-4xl font-bold text-blue-600 my-4">{stats.totalApplications || 0}</p>
              <span className="text-gray-500 text-sm">Jobs applied to</span>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-md text-center border-l-4 border-yellow-600">
              <h3 className="text-gray-600 text-sm mb-4 uppercase tracking-wide font-medium">Pending</h3>
              <p className="text-4xl font-bold text-yellow-600 my-4">{stats.pendingApplications || 0}</p>
              <span className="text-gray-500 text-sm">Under review</span>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-md text-center border-l-4 border-green-600">
              <h3 className="text-gray-600 text-sm mb-4 uppercase tracking-wide font-medium">Accepted</h3>
              <p className="text-4xl font-bold text-green-600 my-4">{stats.acceptedApplications || 0}</p>
              <span className="text-gray-500 text-sm">Successful applications</span>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-md text-center border-l-4 border-red-600">
              <h3 className="text-gray-600 text-sm mb-4 uppercase tracking-wide font-medium">Profile Status</h3>
              <p className="text-2xl font-bold text-red-600 my-4">
                {user?.resumeUrl ? '✓ Complete' : '⚠ Incomplete'}
              </p>
              <span className="text-gray-500 text-sm">
                {user?.resumeUrl ? 'Resume uploaded' : 'Upload resume'}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-8 rounded-2xl shadow-md">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={() => router.push('/jobs')}
                className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-3xl mb-2">🔍</div>
                <div className="font-semibold">Search Jobs</div>
              </button>
              <button
                onClick={() => router.push('/jobseeker/applications')}
                className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-3xl mb-2">📋</div>
                <div className="font-semibold">My Applications</div>
                {stats.pendingApplications > 0 && (
                  <div className="bg-red-500 text-white text-xs px-2 py-1 rounded-full mt-2 inline-block">
                    {stats.pendingApplications}
                  </div>
                )}
              </button>
              <button
                onClick={() => router.push('/profile')}
                className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-lg transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-3xl mb-2">👤</div>
                <div className="font-semibold">Edit Profile</div>
              </button>
              <button
                onClick={() => router.push('/jobseeker/saved-jobs')}
                className="bg-red-600 hover:bg-red-700 text-white p-6 rounded-lg transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="text-3xl mb-2">❤️</div>
                <div className="font-semibold">Saved Jobs</div>
              </button>
            </div>
          </div>

          {/* Recent Applications */}
          <div className="bg-white p-8 rounded-2xl shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-800">Recent Applications</h3>
              <button
                onClick={() => router.push('/jobseeker/applications')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View All Applications
              </button>
            </div>
            
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-8">No applications yet. Start applying to jobs!</p>
                <button
                  onClick={() => router.push('/jobs')}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg cursor-pointer font-medium transition-all duration-300"
                >
                  Browse Jobs
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.slice(0, 3).map(application => (
                  <div key={application.request_id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{application.job_name}</h4>
                        <p className="text-sm text-gray-600">{application.company_name}</p>
                        <p className="text-sm text-gray-500">{application.job_location}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          application.request_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          application.request_status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {application.request_status.charAt(0).toUpperCase() + application.request_status.slice(1)}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(application.request_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Jobs */}
          <div className="bg-white p-8 rounded-2xl shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-semibold text-gray-800">Latest Job Opportunities</h3>
              <button
                onClick={() => router.push('/jobs')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Browse All Jobs
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentJobs.map(job => (
                <div key={job.job_id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-medium text-gray-900 mb-2">{job.job_name}</h4>
                  <p className="text-sm text-gray-600 mb-1">{job.company_name}</p>
                  <p className="text-sm text-gray-500 mb-2">{job.job_location}</p>
                  {job.job_salary && (
                    <p className="text-sm text-green-600 mb-3">₱{parseFloat(job.job_salary).toLocaleString()}</p>
                  )}
                  <button
                    onClick={() => router.push(`/jobs/${job.job_id}`)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm transition-colors"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
