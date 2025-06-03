'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';

export default function CompaniesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [error, setError] = useState('');
  const companiesPerPage = 12;

  useEffect(() => {
    loadUserData();
    loadCompanies();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [companies, searchTerm, ratingFilter, sortBy]);

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const response = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadCompanies = async () => {
    setIsLoading(true);
    setError(''); // Clear previous errors
    
    try {
      const token = localStorage.getItem('authToken');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      console.log('Loading companies with headers:', headers); // Debug log
      
      const response = await fetch('/api/companies', { headers });
      
      console.log('Response status:', response.status); // Debug log
      console.log('Response ok:', response.ok); // Debug log
      
      if (response.ok) {
        const data = await response.json();
        console.log('Companies data received:', data); // Debug log
        console.log('Number of companies:', data.length); // Debug log
        
        if (Array.isArray(data)) {
          setCompanies(data);
          setTotalCompanies(data.length);
        } else {
          console.error('Invalid data format received:', data);
          setError('Invalid data format received from server');
        }
      } else {
        console.error('Failed to load companies:', response.status, response.statusText);
        let errorMessage = `Failed to load companies (${response.status})`;
        
        try {
          const errorData = await response.json();
          console.error('Error details:', errorData);
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
          errorMessage = `${errorMessage}: ${response.statusText}`;
        }
        
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Network or other error loading companies:', error);
      setError(`Network error: ${error.message || 'Please check your connection and try again.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...companies];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(company => 
        company.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (company.company_description && company.company_description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply rating filter
    if (ratingFilter) {
      const minRating = parseFloat(ratingFilter);
      filtered = filtered.filter(company => 
        company.company_rating && parseFloat(company.company_rating) >= minRating
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (parseFloat(b.company_rating) || 0) - (parseFloat(a.company_rating) || 0);
        case 'jobs':
          return (b.active_jobs_count || 0) - (a.active_jobs_count || 0);
        case 'newest':
          return new Date(b.company_created_date || 0) - new Date(a.company_created_date || 0);
        default: // name
          return a.company_name.localeCompare(b.company_name);
      }
    });

    setFilteredCompanies(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRatingFilter('');
    setSortBy('name');
  };

  // Pagination
  const indexOfLastCompany = currentPage * companiesPerPage;
  const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;
  const currentCompanies = filteredCompanies.slice(indexOfFirstCompany, indexOfLastCompany);
  const totalPages = Math.ceil(filteredCompanies.length / companiesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={user} />
      
      <main className="p-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Browse Companies</h1>
              <p className="text-gray-600 mt-2">
                {isLoading ? 'Loading companies...' : `Discover ${totalCompanies} companies hiring for various positions`}
              </p>
            </div>
            <button
              onClick={loadCompanies}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex justify-between items-start">
              <div>
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
              <button
                onClick={() => setError('')}
                className="text-red-700 hover:text-red-900 font-bold text-lg"
              >
                ×
              </button>
            </div>
            <button
              onClick={loadCompanies}
              disabled={isLoading}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Retrying...' : 'Retry'}
            </button>
          </div>
        )}

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Ratings</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="1">1+ Stars</option>
              </select>
            </div>

            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Sort by Name</option>
                <option value="rating">Sort by Rating</option>
                <option value="jobs">Sort by Active Jobs</option>
                <option value="newest">Sort by Newest</option>
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-4">
            <button
              onClick={clearFilters}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Clear Filters
            </button>
            <p className="text-gray-600">
              Showing {filteredCompanies.length} of {totalCompanies} companies
            </p>
          </div>
        </div>

        {/* Companies Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-lg text-gray-600">Loading companies...</span>
          </div>
        ) : companies.length === 0 && !error ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No companies found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || ratingFilter ? 
                'Try adjusting your search criteria or clearing the filters.' : 
                'No companies are currently available in the system.'
              }
            </p>
            <div className="space-x-4">
              <button
                onClick={clearFilters}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {searchTerm || ratingFilter ? 'Clear All Filters' : 'Clear Filters'}
              </button>
              <button
                onClick={loadCompanies}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Reload Companies
              </button>
            </div>
          </div>
        ) : filteredCompanies.length === 0 && companies.length > 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No companies match your filters</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or clearing the filters.
            </p>
            <button
              onClick={clearFilters}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {currentCompanies.map(company => (
                <div 
                  key={company.company_id} 
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-6"
                  onClick={() => router.push(`/companies/${company.company_id}`)}
                >
                  <div className="flex items-start mb-4">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      {company.company_logo ? (
                        <img 
                          src={`data:image/jpeg;base64,${company.company_logo}`} 
                          alt={`${company.company_name} logo`}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            console.log('Image load error for company:', company.company_name);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`text-2xl font-bold text-gray-500 ${company.company_logo ? 'hidden' : 'flex'} items-center justify-center w-full h-full`}>
                        {company.company_name?.charAt(0).toUpperCase() || 'C'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
                        {company.company_name}
                      </h3>
                      {parseFloat(company.company_rating) > 0 && (
                        <div className="flex items-center mb-2">
                          <span className="text-yellow-500">⭐</span>
                          <span className="text-sm text-gray-600 ml-1">
                            {parseFloat(company.company_rating).toFixed(1)}
                          </span>
                          {company.total_ratings > 0 && (
                            <span className="text-xs text-gray-500 ml-1">
                              ({company.total_ratings})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {company.company_description || 'No description available'}
                  </p>

                  <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
                    <span>{company.active_jobs_count || 0} active jobs</span>
                    {company.is_followed && (
                      <span className="text-blue-600 font-medium">Following</span>
                    )}
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/companies/${company.company_id}`);
                      }}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Company
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <div className="flex space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === i + 1
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
