'use client';
import { useRouter } from 'next/navigation';

export default function JobCard({ job, showPreferenceMatch = false }) {
  const router = useRouter();

  const handleViewJob = () => {
    router.push(`/jobs/${job.job_id}`);
  };

  const getPreferenceMatchBadge = () => {
    if (!showPreferenceMatch || !job.preference_score) return null;
    
    if (job.preference_score === 100) {
      return (
        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium border border-green-300">
          ⭐ Perfect Match
        </span>
      );
    } else if (job.preference_score === 50) {
      return (
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium border border-blue-300">
          ✨ Similar Field
        </span>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer relative" onClick={handleViewJob}>
      {/* Preference match indicator */}
      {showPreferenceMatch && job.preference_score > 0 && (
        <div className="absolute top-3 right-3">
          {getPreferenceMatchBadge()}
        </div>
      )}
      
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-semibold text-gray-900 text-lg flex-1 mr-2 pr-20">{job.job_name}</h4>
      </div>
      
      <p className="text-gray-600 text-sm mb-3">{job.company_name}</p>
      
      <div className="flex items-center gap-4 mb-3 text-sm text-gray-500 flex-wrap">
        <span className="flex items-center">
          📍 {job.job_location}
        </span>
        <span className="flex items-center">
          💼 {job.job_type_name}
        </span>
        {job.job_time && (
          <span className="flex items-center">
            🕒 {job.job_time}
          </span>
        )}
      </div>

      {job.job_salary && (
        <div className="mb-3">
          <span className="text-green-600 font-medium">
            ₱{parseFloat(job.job_salary).toLocaleString()}
          </span>
        </div>
      )}

      <p className="text-gray-700 text-sm mb-4 line-clamp-2">
        {job.job_description?.substring(0, 120)}...
      </p>

      <div className="flex justify-between items-center">
        <div className="flex gap-2 flex-wrap">
          {job.category_fields && (
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
              {job.category_fields.split(', ')[0]}
            </span>
          )}
          {job.job_categories && (
            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
              {job.job_categories.split(', ')[0]}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {job.company_rating && parseFloat(job.company_rating) > 0 && (
            <div className="flex items-center text-xs text-gray-500">
              ⭐ {parseFloat(job.company_rating).toFixed(1)}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-400">
        Posted {new Date(job.job_posted_date).toLocaleDateString()}
      </div>
    </div>
  );
}
