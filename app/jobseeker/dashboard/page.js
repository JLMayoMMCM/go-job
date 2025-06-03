'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';
import JobCard from '@/components/JobCard';

export default function JobSeekerDashboard() {
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
      const recommendedResponse = await fetch('/api/jobs/recommended?limit=8', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (recommendedResponse.ok) {
        const recommendedData = await recommendedResponse.json();
        setRecommendedJobs(recommendedData);
      }

      const allJobsResponse = await fetch('/api/jobs/all?limit=8', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (allJobsResponse.ok) {
        const allJobsData = await allJobsResponse.json();
        setAllJobs(allJobsData.jobs || allJobsData);
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
          <p className="text-gray-600 text-xl">Ready to find your next opportunity?</p>
        </div>

        <div className="flex flex-col gap-12">
          {/* Recommended Jobs Section */}
          <div className="bg-white p-8 rounded-2xl shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-gray-800 m-0 text-2xl font-semibold">Recommended Jobs</h3>
              <button
                className="bg-blue-600 text-white border-none py-3 px-6 rounded-lg cursor-pointer font-medium transition-all duration-300 hover:bg-blue-700"
                onClick={() => router.push('/jobseeker/jobs/recommended')}
              >
                View All Recommended
              </button>
            </div>
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-6 py-2">
                {recommendedJobs.map(job => (
                  <JobCard key={job.job_id} job={job} />
                ))}
              </div>
            </div>
          </div>

          {/* All Jobs Section */}
          <div className="bg-white p-8 rounded-2xl shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-gray-800 m-0 text-2xl font-semibold">Available Jobs</h3>
              <button
                className="bg-blue-600 text-white border-none py-3 px-6 rounded-lg cursor-pointer font-medium transition-all duration-300 hover:bg-blue-700"
                onClick={() => router.push('/jobseeker/jobs/all')}
              >
                View All Jobs
              </button>
            </div>
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-6 py-2">
                {allJobs.map(job => (
                  <JobCard key={job.job_id} job={job} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
