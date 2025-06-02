'use client';
import { useRouter } from 'next/navigation';
import './JobCard.css';

export default function JobCard({ job, isEmployer = false }) {
  const router = useRouter();

  const handleJobClick = () => {
    router.push(`/jobs/${job.job_id}`);
  };

  const formatSalary = (salary) => {
    if (!salary) return 'Salary not specified';
    return `₱${Number(salary).toLocaleString()}`;
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="job-card" onClick={handleJobClick}>
      <div className="job-header">
        <h4 className="job-title">{job.job_name}</h4>
        <div className="company-info">
          <span className="company-name">{job.company_name}</span>
          {job.company_rating && (
            <span className="company-rating">⭐ {job.company_rating}/5</span>
          )}
        </div>
      </div>

      <div className="job-details">
        {job.job_location && (
          <p className="job-location">📍 {job.job_location}</p>
        )}
        <p className="job-salary">{formatSalary(job.job_salary)}</p>
        <p className="job-type">{job.job_type_name}</p>
      </div>

      <div className="job-description">
        <p>{job.job_description?.substring(0, 100)}...</p>
      </div>

      <div className="job-footer">
        <span className="job-date">Posted: {formatDate(job.job_posted_date)}</span>
        {job.job_rating && (
          <span className="job-rating">Rating: ⭐ {job.job_rating}/5</span>
        )}
      </div>

      {isEmployer && (
        <div className="employer-actions">
          <span className="applications-count">
            {job.applications_count || 0} applications
          </span>
          <button 
            className="manage-btn"
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/jobs/manage/${job.job_id}`);
            }}
          >
            Manage
          </button>
        </div>
      )}
    </div>
  );
}
