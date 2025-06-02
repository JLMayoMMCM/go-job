'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './DashboardHeader.css';

export default function DashboardHeader({ user }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const menuItems = user?.isJobSeeker ? [
    { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { label: 'All Jobs', path: '/jobs/all', icon: '💼' },
    { label: 'Recommended', path: '/jobs/recommended', icon: '⭐' },
    { label: 'Bookmarks', path: '/bookmarks', icon: '📌' },
    { label: 'Notifications', path: '/notifications', icon: '🔔' },
  ] : [
    { label: 'Dashboard', path: '/dashboard', icon: '🏠' },
    { label: 'Job Requests', path: '/job-requests', icon: '📋' },
    { label: 'Posting History', path: '/posting-history', icon: '📊' },
    { label: 'Add Job', path: '/jobs/create', icon: '➕' },
    { label: 'Notifications', path: '/notifications', icon: '🔔' },
  ];

  return (
    <>
      <header className="dashboard-header">
        <div className="header-left">
          <button className="menu-btn" onClick={toggleSidebar}>
            ☰
          </button>
          <h1 className="logo">GO JOB</h1>
        </div>
        
        <div className="header-right">
          <button 
            className="profile-btn"
            onClick={() => router.push('/profile')}
          >
            View Profile
          </button>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}>
          <div className="sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-header">
              <h2>Menu</h2>
              <button className="close-btn" onClick={toggleSidebar}>×</button>
            </div>
            
            <div className="sidebar-content">
              <div className="user-info">
                <div className="user-avatar">
                  {user?.firstName?.charAt(0) || 'U'}
                </div>
                <div className="user-details">
                  <h3>{user?.firstName} {user?.lastName}</h3>
                  <p>{user?.isJobSeeker ? 'Job Seeker' : 'Employee'}</p>
                  {user?.companyName && <p>{user.companyName}</p>}
                </div>
              </div>

              <nav className="sidebar-nav">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    className="nav-item"
                    onClick={() => {
                      router.push(item.path);
                      setSidebarOpen(false);
                    }}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="sidebar-footer">
                <button className="logout-btn" onClick={handleLogout}>
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
