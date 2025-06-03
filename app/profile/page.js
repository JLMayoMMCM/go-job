'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import DashboardHeader from '@/components/DashboardHeader';
import './profile.css';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState(null);
  const [resume, setResume] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const fileInputRef = useRef(null);

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
          setFormData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            middleName: userData.middleName || '',
            phone: userData.phone || '',
            premiseName: userData.address?.premise || '',
            streetName: userData.address?.street || '',
            barangayName: userData.address?.barangay || '',
            cityName: userData.address?.city || '',
            nationality: userData.nationality || 'Filipino'
          });
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

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('Profile photo must be less than 10MB');
        return;
      }
      setProfilePhoto(file);
      setPreviewPhotoUrl(URL.createObjectURL(file));
    }
  };

  const handlePhotoClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('Resume file must be less than 10MB');
        return;
      }
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file');
        return;
      }
      setResume(file);
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('authToken');
      const formDataToSend = new FormData();
      
      // Add text data
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      // Add files
      if (profilePhoto) {
        formDataToSend.append('profilePhoto', profilePhoto);
      }
      if (resume) {
        formDataToSend.append('resume', resume);
      }

      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend
      });

      if (response.ok) {
        setSuccess('Profile updated successfully');
        setIsEditing(false);
        setProfilePhoto(null);
        setPreviewPhotoUrl(null);
        setResume(null);
        
        // Refresh user data
        const updatedResponse = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (updatedResponse.ok) {
          const updatedUser = await updatedResponse.json();
          setUser(updatedUser);
        }
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update profile');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResendingVerification(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({ email: user.email })
      });

      if (response.ok) {
        setSuccess('Verification email sent successfully');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to send verification email');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsResendingVerification(false);
    }
  };

  const handleVerifyEmail = () => {
    router.push(`/Login/verify?email=${encodeURIComponent(user.email)}`);
  };

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="profile-container">
      <DashboardHeader user={user} />

      <main className="profile-main">
        <div className="profile-content">
          <div className="profile-header">
            <h2>Profile</h2>
            {!isEditing && (
              <button 
                className="edit-btn"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </button>
            )}
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {/* Email Verification Section */}
          {!user?.isVerified && (
            <div className="verification-banner">
              <div className="verification-content">
                <h3>⚠️ Email Not Verified</h3>
                <p>Your email address <strong>{user?.email}</strong> is not verified.</p>
                <div className="verification-actions">
                  <button 
                    className="verify-email-btn"
                    onClick={handleVerifyEmail}
                  >
                    Verify Email Now
                  </button>
                  <button 
                    className="resend-verification-btn"
                    onClick={handleResendVerification}
                    disabled={isResendingVerification}
                  >
                    {isResendingVerification ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="profile-sections">
            {/* Profile Photo Section */}
            <div className="profile-section">
              <h3>Profile Photo</h3>
              <div className="photo-upload-section">
                <div 
                  className="current-photo" 
                  onClick={handlePhotoClick}
                  style={{ cursor: isEditing ? 'pointer' : 'default' }}
                >
                  {previewPhotoUrl ? (
                    <img src={previewPhotoUrl} alt="Profile Preview" className="profile-photo" />
                  ) : user?.profilePhoto ? (
                    <img src={user.profilePhoto} alt="Profile" className="profile-photo" />
                  ) : (
                    <div className="default-avatar">
                      {user?.firstName?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                {isEditing && (
                  <div className="photo-upload">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="file-input"
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="profilePhoto" className="file-label" onClick={handlePhotoClick}>
                      Choose Photo
                    </label>
                    <div className="text-sm text-gray-600 mt-1">Maximum file size: 10MB</div>
                  </div>
                )}
              </div>
            </div>

            {/* Personal Information */}
            <div className="profile-section">
              <h3>Personal Information</h3>
              <div className="form-grid">
                <div className="input-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="input-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="input-group">
                  <label>Middle Name</label>
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="input-group">
                  <label>Nationality</label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="profile-section">
              <h3>Contact Information</h3>
              <div className="form-grid">
                <div className="input-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="input-group">
                  <label>Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="input-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="profile-section">
              <h3>Address</h3>
              <div className="form-grid">
                <div className="input-group">
                  <label>Building/Premise</label>
                  <input
                    type="text"
                    name="premiseName"
                    value={formData.premiseName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="input-group">
                  <label>Street</label>
                  <input
                    type="text"
                    name="streetName"
                    value={formData.streetName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="input-group">
                  <label>Barangay</label>
                  <input
                    type="text"
                    name="barangayName"
                    value={formData.barangayName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="input-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="cityName"
                    value={formData.cityName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            {/* Resume Section (Job Seekers Only) */}
            {user?.isJobSeeker && (
              <div className="profile-section">
                <h3>Resume</h3>
                <div className="resume-section">
                  {user?.resumeUrl ? (
                    <div className="current-resume">
                      <p>📄 Resume uploaded</p>
                      <a 
                        href={user.resumeUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="view-resume-btn"
                      >
                        View Resume
                      </a>
                    </div>
                  ) : (
                    <p>No resume uploaded</p>
                  )}
                  
                  {isEditing && (
                    <div className="resume-upload">
                      <input
                        type="file"
                        id="resume"
                        accept=".pdf"
                        onChange={handleResumeUpload}
                        className="file-input"
                      />
                      <label htmlFor="resume" className="file-label">
                        Upload Resume (PDF)
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {isEditing && (
              <div className="profile-actions">
                <button 
                  className="save-btn"
                  onClick={handleSaveProfile}
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  className="cancel-btn"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
