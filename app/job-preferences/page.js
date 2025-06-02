'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './preferences.css';

export default function JobPreferencesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/job-categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      setError('Failed to load job categories');
    }
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSavePreferences = async () => {
    if (selectedCategories.length === 0) {
      setError('Please select at least one job category');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/job-preferences', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ categoryIds: selectedCategories })
      });

      if (response.ok) {
        router.push('/dashboard');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to save preferences');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="preferences-container">
      <div className="preferences-card">
        <h1 className="logo">GO JOB</h1>
        <h2 className="preferences-title">Select Your Job Preferences</h2>
        <p className="preferences-description">
          Choose the job categories you're interested in to get better job recommendations.
        </p>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="categories-grid">
          {categories.map(category => (
            <button
              key={category.job_category_id}
              className={`category-btn ${selectedCategories.includes(category.job_category_id) ? 'selected' : ''}`}
              onClick={() => handleCategoryToggle(category.job_category_id)}
            >
              {category.job_category_name}
            </button>
          ))}
        </div>

        <button 
          className="save-btn" 
          onClick={handleSavePreferences}
          disabled={isLoading || selectedCategories.length === 0}
        >
          {isLoading ? 'Saving...' : 'Save Preferences & Continue'}
        </button>
      </div>
    </div>
  );
}
