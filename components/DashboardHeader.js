'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './DashboardHeader.css';

export default function DashboardHeader({ user }) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [unreadCount, setUnreadCount] = useState(0);

  // Update currentUser when user prop changes
  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  // Force refresh user data when component mounts or becomes visible
  useEffect(() => {
    const refreshUserData = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (response.ok) {
            const userData = await response.json();
            setCurrentUser(userData);
          }
        } catch (error) {
          console.error('Error refreshing user data:', error);
        }
      }
    };

    refreshUserData();

    // Listen for profile update events
    const handleProfileUpdate = () => {
      refreshUserData();
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  // Load unread notifications count for employees
  useEffect(() => {
    const loadUnreadCount = async () => {
      if (currentUser?.isEmployee) {
        const token = localStorage.getItem('authToken');
        if (token) {
          try {
            const response = await fetch('/api/employee/notifications', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
              const notifications = await response.json();
              const unread = notifications.filter(n => !n.is_read).length;
              setUnreadCount(unread);
            }
          } catch (error) {
            console.error('Error loading unread count:', error);
          }
        }
      }
    };

    loadUnreadCount();
    
    // Refresh unread count every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/');
    setIsSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navigateTo = (path) => {
    router.push(path);
    setIsSidebarOpen(false);
  };

  const getInitials = (user) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    return user?.username?.charAt(0)?.toUpperCase() || 'U';
  };

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSidebarOpen && !event.target.closest('.sidebar-content') && !event.target.closest('.menu-button')) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isSidebarOpen]);

  return (
    <>
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button className="menu-button" onClick={toggleSidebar}>
              ☰
            </button>
            <h1 className="logo" onClick={() => navigateTo('/')}>GO JOB</h1>
          </div>
          
          <div className="header-right">
            <div className="user-info">
              <span>Welcome, {currentUser?.firstName || currentUser?.username || 'User'}!</span>
              <div className="user-avatar">
                {currentUser?.profilePhoto ? (
                  <img 
                    src={currentUser.profilePhoto} 
                    alt="Profile" 
                    className="avatar-image"
                    key={`${currentUser.profilePhoto}-${Date.now()}`}
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {getInitials(currentUser)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
        <div className="sidebar-content">
          <div className="sidebar-profile">
            <div className="sidebar-avatar">
              {currentUser?.profilePhoto ? (
                <img 
                  src={currentUser.profilePhoto} 
                  alt="Profile" 
                  className="sidebar-profile-image"
                  key={`sidebar-${currentUser.profilePhoto}-${Date.now()}`}
                />
              ) : (
                <div className="sidebar-default-avatar">
                  {getInitials(currentUser)}
                </div>
              )}
            </div>
            <div className="sidebar-user-info">
              <h3>{currentUser?.firstName} {currentUser?.lastName}</h3>
              <p>{currentUser?.email}</p>
              {!currentUser?.isVerified && (
                <span className="unverified-badge">Unverified</span>
              )}
            </div>
          </div>

          <nav className="sidebar-nav">
            <button 
              className="nav-link" 
              onClick={() => navigateTo('/profile')}
            >
              👤 Profile
            </button>

            {/* Job Seeker Navigation Links */}
            {currentUser?.isJobSeeker && (
              <>
                <button 
                  className="nav-link" 
                  onClick={() => navigateTo('/jobseeker/dashboard')}
                >
                  🏠 Dashboard
                </button>
                <button 
                  className="nav-link" 
                  onClick={() => navigateTo('/jobs')}
                >
                  🔍 Job Search
                </button>
                <button 
                  className="nav-link" 
                  onClick={() => navigateTo('/jobseeker/applications')}
                >
                  📋 My Applications
                </button>
                <button 
                  className="nav-link" 
                  onClick={() => navigateTo('/jobseeker/saved-jobs')}
                >
                  ❤️ Saved Jobs
                </button>
              </>
            )}

            {/* Employee Navigation Links */}
            {currentUser?.isEmployee && (
              <>
                <button 
                  className="nav-link" 
                  onClick={() => navigateTo('/employee/dashboard')}
                >
                  🏠 Dashboard
                </button>
                <button 
                  className="nav-link" 
                  onClick={() => navigateTo('/employee/job-requests')}
                >
                  📋 Job Requests
                </button>
                <button 
                  className="nav-link" 
                  onClick={() => navigateTo('/employee/posting-history')}
                >
                  📝 My Jobs
                </button>
                <button 
                  className="nav-link" 
                  onClick={() => navigateTo('/employee/add-job')}
                >
                  ➕ Add Job
                </button>
                <button 
                  className="nav-link notification-link" 
                  onClick={() => navigateTo('/employee/notifications')}
                >
                  🔔 Notifications
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </button>
                <button 
                  className="nav-link" 
                  onClick={() => navigateTo('/employee/company')}
                >
                  🏢 Company
                </button>
              </>
            )}

            <button 
              className="nav-link" 
              onClick={() => navigateTo('/jobs')}
            >
              💼 Browse Jobs
            </button>
            <button 
              className="nav-link logout-link" 
              onClick={handleLogout}
            >
              🚪 Logout
            </button>
          </nav>
        </div>
      </div>
    </>
  );
}
