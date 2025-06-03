'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';
import JobCard from '@/components/JobCard';
import CompanyRating from '@/components/CompanyRating';

export default function CompanyDetailsPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [user, setUser] = useState(null);
  const [company, setCompany] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadCompanyDetails();
  }, [resolvedParams.id]);

  const loadCompanyDetails = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('authToken');
      
      // Load user data if logged in
      if (token) {
        try {
          const userResponse = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUser(userData);
          }
        } catch (error) {
          console.log('User not logged in or token invalid');
        }
      }

      // Load company details
      console.log('Loading company details for ID:', resolvedParams.id);
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const companyResponse = await fetch(`/api/companies/${resolvedParams.id}`, { headers });

      console.log('Company response status:', companyResponse.status);
      console.log('Company response ok:', companyResponse.ok);

      if (companyResponse.ok) {
        const companyData = await companyResponse.json();
        console.log('Company data received:', companyData);
        
        if (companyData && companyData.company_id) {
          setCompany(companyData);
          setJobs(companyData.jobs || []);
          setIsFollowing(companyData.is_following || false);
        } else {
          console.error('Invalid company data received:', companyData);
          setError('Invalid company data received');
        }
      } else {
        let errorMessage = 'Failed to load company';
        try {
          const errorData = await companyResponse.json();
          console.error('Error response:', errorData);
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
          errorMessage = `HTTP ${companyResponse.status}: ${companyResponse.statusText}`;
        }
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Network error loading company details:', error);
      setError(`Network error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowCompany = async () => {
    if (!user) {
      router.push('/Login');
      return;
    }

    if (!user.isJobSeeker) {
      setError('Only job seekers can follow companies');
      return;
    }

    setIsFollowLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/companies/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ companyId: company.company_id })
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
        setSuccess(isFollowing ? 'Company unfollowed successfully' : 'Company followed successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to follow/unfollow company');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleRatingSubmitted = (newAverageRating) => {
    setCompany(prev => ({
      ...prev,
      company_rating: newAverageRating
    }));
    setSuccess('Rating submitted successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader user={user} />
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-lg text-gray-600">Loading company details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader user={user} />
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Company</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="space-x-4">
              <button
                onClick={loadCompanyDetails}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/companies')}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
              >
                Browse Companies
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader user={user} />
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">🏢</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Company Not Found</h2>
            <p className="text-gray-600 mb-4">The requested company could not be found.</p>
            <button
              onClick={() => router.push('/companies')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Browse Companies
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} />
      
      <main className="p-8 max-w-7xl mx-auto">
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

        {/* Company Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
              {company.company_logo ? (
                <img 
                  src={`data:image/jpeg;base64,${company.company_logo}`} 
                  alt="Company Logo" 
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    console.log('Company logo load error');
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`text-3xl font-bold text-gray-500 ${company.company_logo ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                {company.company_name?.charAt(0) || 'C'}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.company_name || 'Company Name'}</h1>
                  {parseFloat(company.company_rating || 0) > 0 && (
                    <div className="flex items-center mb-2">
                      <span className="text-yellow-500 text-xl">⭐</span>
                      <span className="text-lg font-medium text-gray-700 ml-2">
                        {parseFloat(company.company_rating).toFixed(1)} / 5.0
                      </span>
                      <span className="text-gray-500 ml-2">
                        ({company.total_ratings || 0} reviews)
                      </span>
                    </div>
                  )}
                  <p className="text-gray-600 mb-4">{company.company_description || 'No description available'}</p>
                </div>

                {user?.isJobSeeker && (
                  <button
                    onClick={handleFollowCompany}
                    disabled={isFollowLoading}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      isFollowing 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } disabled:opacity-50`}
                  >
                    {isFollowLoading ? 'Loading...' : (isFollowing ? 'Unfollow' : 'Follow')}
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Email</span>
                  <p className="text-gray-900">{company.company_email || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Phone</span>
                  <p className="text-gray-900">{company.company_phone || 'Not provided'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Website</span>
                  <p className="text-gray-900">
                    {company.company_website ? (
                      <a 
                        href={company.company_website.startsWith('http') ? company.company_website : `https://${company.company_website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Visit Website
                      </a>
                    ) : (
                      'Not provided'
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Active Jobs</span>
                  <p className="text-gray-900">{jobs.filter(job => job.job_is_active).length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Address */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Location</h2>
          <div className="text-gray-700">
            {company.premise_name && <p>{company.premise_name}</p>}
            {company.street_name && <p>{company.street_name}</p>}
            <p>
              {[company.barangay_name, company.city_name].filter(Boolean).join(', ')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Company Jobs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Open Positions ({jobs.filter(job => job.job_is_active).length})
                </h2>
                <button
                  onClick={() => router.push(`/jobs?company=${company.company_id}`)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  View All Jobs
                </button>
              </div>

              {jobs.filter(job => job.job_is_active).length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">💼</div>
                  <p className="text-gray-600">No open positions at the moment.</p>
                  <p className="text-gray-500 text-sm mt-2">
                    {isFollowing ? 'You\'ll be notified when new jobs are posted!' : 'Follow this company to get notified about new openings.'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {jobs.filter(job => job.job_is_active).slice(0, 6).map(job => (
                    <JobCard key={job.job_id} job={job} compact={true} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Company Rating Section */}
          <div className="lg:col-span-1">
            {user?.isJobSeeker && (
              <CompanyRating 
                companyId={company.company_id}
                currentRating={company.company_rating}
                onRatingSubmitted={handleRatingSubmitted}
              />
            )}

            {!user && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Follow This Company</h3>
                <p className="text-gray-600 mb-4">Sign in to follow companies and get notified about new job openings</p>
                <button
                  onClick={() => router.push('/Login')}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
