'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';

export default function PostingHistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, filter]);

  const checkAuthAndLoadData = async () => {
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
        if (!userData.isEmployee) {
          router.push('/jobseeker/dashboard');
          return;
        }
        setUser(userData);
        await loadJobs(token);
      } else {
        router.push('/Login');
      }
    } catch (error) {
      router.push('/Login');
    } finally {
      setIsLoading(false);
    }
  };

  const loadJobs = async (token) => {
    try {
      const response = await fetch('/api/employee/job-history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setJobs(data);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    if (filter === 'active') {
      filtered = jobs.filter(job => job.job_is_active);
    } else if (filter === 'inactive') {
      filtered = jobs.filter(job => !job.job_is_active);
    }

    setFilteredJobs(filtered);
  };

  const toggleJobStatus = async (jobId, currentStatus) => {
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/employee/toggle-job-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ jobId, isActive: !currentStatus })
      });

      if (response.ok) {
        setSuccess(`Job ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        await loadJobs(token);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update job status');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen text-lg">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} />
      
      <main className="p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Posting History</h2>
            <button
              onClick={() => router.push('/employee/add-job')}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Add New Job
            </button>
          </div>
          
          {error && (
            <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4 border border-red-200">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4 border border-green-200">
              {success}
            </div>
          )}

          {/* Filter Buttons */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Jobs ({jobs.length})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'active' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Active ({jobs.filter(job => job.job_is_active).length})
              </button>
              <button
                onClick={() => setFilter('inactive')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'inactive' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Inactive ({jobs.filter(job => !job.job_is_active).length})
              </button>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-gray-600 text-lg">No job postings found.</p>
            <p className="text-gray-500 mt-2">
              {filter === 'all' ? 'Create your first job posting!' : `No ${filter} jobs found.`}
            </p>
            <button
              onClick={() => router.push('/employee/add-job')}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Add New Job
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map(job => (
              <div key={job.job_id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{job.job_name}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          job.job_is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {job.job_is_active ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => toggleJobStatus(job.job_id, job.job_is_active)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            job.job_is_active 
                              ? 'bg-red-600 hover:bg-red-700 text-white' 
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {job.job_is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Location</span>
                        <p className="text-gray-900">{job.job_location}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Type</span>
                        <p className="text-gray-900">{job.job_type_name}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Applications</span>
                        <p className="text-gray-900">{job.application_count || 0} received</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Posted</span>
                        <p className="text-gray-900">{new Date(job.job_posted_date).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {job.job_salary && (
                      <div className="mb-4">
                        <span className="text-sm font-medium text-gray-500">Salary: </span>
                        <span className="text-green-600 font-medium">₱{parseFloat(job.job_salary).toLocaleString()}</span>
                      </div>
                    )}

                    <p className="text-gray-700 mb-4">{job.job_description?.substring(0, 200)}...</p>

                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/jobs/${job.job_id}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => router.push(`/employee/job-requests?job=${job.job_id}`)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition-colors"
                      >
                        View Applications ({job.application_count || 0})
                      </button>
                      {job.job_closing_date && (
                        <div className="ml-auto text-sm text-gray-500">
                          Closes: {new Date(job.job_closing_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
