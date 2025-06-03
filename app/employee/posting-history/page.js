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

    if (filter !== 'all') {
      if (filter === 'active') {
        filtered = jobs.filter(job => job.job_is_active);
      } else if (filter === 'inactive') {
        filtered = jobs.filter(job => !job.job_is_active);
      } else if (filter === 'expired') {
        filtered = jobs.filter(job => job.job_closing_date && new Date(job.job_closing_date) < new Date());
      }
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
            <h2 className="text-2xl font-bold text-gray-800">Job Posting History</h2>
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

          {/* Filter */}
          <div className="bg-white p-4 rounded-lg shadow-md mb-6">
            <div className="flex gap-4">
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
              <button
                onClick={() => setFilter('expired')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filter === 'expired' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Expired ({jobs.filter(job => job.job_closing_date && new Date(job.job_closing_date) < new Date()).length})
              </button>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {filteredJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">No jobs found.</p>
            <button
              onClick={() => router.push('/employee/add-job')}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Create Your First Job
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Posted Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredJobs.map(job => (
                    <tr key={job.job_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{job.job_name}</div>
                          <div className="text-sm text-gray-500">{job.job_location}</div>
                          {job.job_salary && (
                            <div className="text-sm text-green-600">₱{parseFloat(job.job_salary).toLocaleString()}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {job.job_type_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          job.job_is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {job.job_is_active ? 'Active' : 'Inactive'}
                        </span>
                        {job.job_closing_date && new Date(job.job_closing_date) < new Date() && (
                          <span className="block mt-1 px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Expired
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {job.application_count || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(job.job_posted_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-y-1">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => router.push(`/jobs/${job.job_id}`)}
                            className="text-blue-600 hover:text-blue-900 text-xs"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => router.push(`/employee/job-requests?job=${job.job_id}`)}
                            className="text-green-600 hover:text-green-900 text-xs"
                          >
                            Applications ({job.application_count || 0})
                          </button>
                          <button
                            onClick={() => toggleJobStatus(job.job_id, job.job_is_active)}
                            className={`text-xs ${
                              job.job_is_active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                            }`}
                          >
                            {job.job_is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
