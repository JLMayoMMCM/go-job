'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import './DashboardHeader.css';

export default function DashboardHeader({ user }) {
  const router = useRouter();
  const pathname = usePathname();
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

  const handleLogoClick = () => {
    // Navigate to appropriate dashboard based on user type
    if (currentUser?.userType === 'employee') {
      navigateTo('/employee/dashboard');
    } else if (currentUser?.userType === 'job-seeker') {
      navigateTo('/jobseeker/dashboard');
    } else {
      // Fallback to general dashboard
      navigateTo('/Dashboard');
    }
  };

  const handleProfileClick = () => {
    navigateTo('/profile');
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
          <div className="header-left">            <button className="menu-button" onClick={toggleSidebar}>
              ☰
            </button>
            <img src="/Assets/Title.png" alt="GO JOB" className="logo" onClick={handleLogoClick} />
          </div>
          
          <div className="header-right">
            <div className="user-info">
              <span>Welcome, {currentUser?.firstName || currentUser?.username || 'User'}!</span>              <div className="user-avatar" onClick={handleProfileClick}>
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
          <div className="sidebar-profile">            <div className="sidebar-avatar" onClick={handleProfileClick}>
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
            <ul className="sidebar-menu">
              {/* Job Seeker Sidebar Items */}
              {user?.isJobSeeker && (
                <>
                  <li>
                    <button
                      onClick={() => router.push('/jobseeker/dashboard')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        pathname === '/jobseeker/dashboard' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      🏠 Dashboard
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => router.push('/jobs')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        pathname === '/jobs' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      💼 Browse Jobs
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => router.push('/jobseeker/applications')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        pathname === '/jobseeker/applications' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      📋 My Applications
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => router.push('/jobseeker/saved-jobs')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        pathname === '/jobseeker/saved-jobs' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      💾 Saved Jobs
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => router.push('/jobseeker/notifications')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        pathname === '/jobseeker/notifications' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      🔔 Notifications
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => router.push('/profile')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        pathname === '/profile' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      👤 Profile
                    </button>
                  </li>
                </>
              )}

              {/* Employee Sidebar Items */}
              {user?.isEmployee && (
                <>
                  <li>
                    <button
                      onClick={() => router.push('/employee/dashboard')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        pathname === '/employee/dashboard' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      🏠 Dashboard
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => router.push('/employee/add-job')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        pathname === '/employee/add-job' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      ➕ Add Job
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => router.push('/employee/job-requests')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        pathname === '/employee/job-requests' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      📋 Job Requests
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => router.push('/employee/posting-history')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        pathname === '/employee/posting-history' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      📝 Posting History
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => router.push('/employee/notifications')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        pathname === '/employee/notifications' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      🔔 Notifications
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => router.push('/profile')}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        pathname === '/profile' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      👤 Profile
                    </button>
                  </li>
                </>
              )}

              <li>
                <button 
                  className="nav-link logout-link" 
                  onClick={handleLogout}
                >
                  🚪 Logout
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
