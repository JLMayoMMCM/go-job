'use client';
import { useState, useEffect } from 'react';
import ResumeViewer from './ResumeViewer';

export default function ApplicantProfileModal({ applicantId, onClose }) {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showResumeViewer, setShowResumeViewer] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');

  useEffect(() => {
    if (applicantId) {
      loadApplicantProfile();
    }
  }, [applicantId]);

  const loadApplicantProfile = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/employee/applicant/${applicantId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to load applicant profile');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewResume = () => {
    if (profile?.hasResume) {
      const url = `/api/profile/resume/${applicantId}`;
      setResumeUrl(url);
      setShowResumeViewer(true);
    }
  };

  const handleCloseResumeViewer = () => {
    setShowResumeViewer(false);
    setResumeUrl('');
  };

  if (showResumeViewer) {
    return (
      <ResumeViewer 
        resumeUrl={resumeUrl} 
        onClose={handleCloseResumeViewer} 
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-800">Applicant Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading profile...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={onClose}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          ) : profile ? (
            <div className="p-6">
              {/* Profile Header */}
              <div className="flex items-start gap-6 mb-8 pb-6 border-b">
                <div className="flex-shrink-0">
                  {profile.profilePhoto ? (
                    <img 
                      src={profile.profilePhoto} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                      <span className="text-3xl">👤</span>
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {profile.firstName} {profile.middleName} {profile.lastName}
                  </h3>
                  <p className="text-gray-600 mb-2">{profile.email}</p>
                  <p className="text-gray-600 mb-2">{profile.phone || 'No phone number provided'}</p>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      profile.isVerified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {profile.isVerified ? '✓ Verified' : '✗ Not Verified'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div>
                        <span className="font-medium text-gray-700">Full Name:</span>
                        <p className="text-gray-900">{profile.firstName} {profile.middleName} {profile.lastName}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Nationality:</span>
                        <p className="text-gray-900">{profile.nationality || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Username:</span>
                        <p className="text-gray-900">{profile.username}</p>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Address</h4>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div>
                        <span className="font-medium text-gray-700">House/Building:</span>
                        <p className="text-gray-900">{profile.premiseName || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Street:</span>
                        <p className="text-gray-900">{profile.streetName || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Barangay:</span>
                        <p className="text-gray-900">{profile.barangayName || 'Not provided'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">City:</span>
                        <p className="text-gray-900">{profile.cityName || 'Not provided'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Resume Section */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Resume</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {profile.hasResume ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="text-2xl mr-3">📄</div>
                            <div>
                              <p className="font-medium text-gray-900">Resume Available</p>
                              <p className="text-sm text-gray-600">PDF format</p>
                            </div>
                          </div>
                          <button
                            onClick={handleViewResume}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                          >
                            View Resume
                          </button>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <div className="text-gray-400 text-4xl mb-2">📄</div>
                          <p className="text-gray-600">No resume uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Job Preferences and Statistics */}
                <div className="space-y-6">
                  {/* Job Preferences */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Job Preferences</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {profile.preferences && profile.preferences.length > 0 ? (
                        <div className="space-y-3">
                          {Object.entries(
                            profile.preferences.reduce((acc, pref) => {
                              const fieldName = pref.category_field_name;
                              if (!acc[fieldName]) acc[fieldName] = [];
                              acc[fieldName].push(pref.job_category_name);
                              return acc;
                            }, {})
                          ).map(([fieldName, categories]) => (
                            <div key={fieldName}>
                              <h5 className="font-medium text-gray-700 mb-2">{fieldName}</h5>
                              <div className="flex flex-wrap gap-2">
                                {categories.map((category, index) => (
                                  <span
                                    key={index}
                                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
                                  >
                                    {category}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-gray-600">No job preferences set</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Application Statistics */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Application Statistics</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="bg-white p-3 rounded">
                          <div className="text-2xl font-bold text-blue-600">{profile.stats.totalApplications}</div>
                          <div className="text-sm text-gray-600">Total Applications</div>
                        </div>
                        <div className="bg-white p-3 rounded">
                          <div className="text-2xl font-bold text-green-600">{profile.stats.acceptedApplications}</div>
                          <div className="text-sm text-gray-600">Accepted</div>
                        </div>
                        <div className="bg-white p-3 rounded">
                          <div className="text-2xl font-bold text-yellow-600">{profile.stats.pendingApplications}</div>
                          <div className="text-sm text-gray-600">Pending</div>
                        </div>
                        <div className="bg-white p-3 rounded">
                          <div className="text-2xl font-bold text-red-600">{profile.stats.rejectedApplications}</div>
                          <div className="text-sm text-gray-600">Rejected</div>
                        </div>
                      </div>
                      {profile.stats.firstApplicationDate && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm text-gray-600 text-center">
                            First application: {new Date(profile.stats.firstApplicationDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          {profile?.hasResume && (
            <button
              onClick={handleViewResume}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              View Resume
            </button>
          )}
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
