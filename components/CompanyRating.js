'use client';
import { useState, useEffect } from 'react';

export default function CompanyRating({ companyId, companyName, onRatingSubmitted }) {
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [hasRated, setHasRated] = useState(false);

  useEffect(() => {
    loadUserRating();
  }, [companyId]);

  const loadUserRating = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/company/${companyId}/rating`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.hasRated) {
          setUserRating(data);
          setHasRated(true);
          setRating(data.rating);
          setReviewText(data.review_text || '');
        }
      }
    } catch (error) {
      console.error('Error loading user rating:', error);
    }
  };

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/company/${companyId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating, reviewText })
      });

      if (response.ok) {
        const data = await response.json();
        setHasRated(true);
        setShowModal(false);
        if (onRatingSubmitted) {
          onRatingSubmitted(data.averageRating);
        }
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarIcon = ({ filled, onClick, onHover, onLeave }) => (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`text-2xl ${filled ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
    >
      ★
    </button>
  );

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`px-4 py-2 rounded-lg transition-colors ${
          hasRated 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {hasRated ? 'Update Rating' : 'Rate Company'}
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Rate {companyName}
              </h3>

              {hasRated && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <p className="text-blue-800 text-sm">
                    You previously rated this company. Update your rating below.
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Rating
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      filled={star <= (hoverRating || rating)}
                      onClick={() => setRating(star)}
                      onHover={() => setHoverRating(star)}
                      onLeave={() => setHoverRating(0)}
                    />
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {rating > 0 && `${rating} out of 5 stars`}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review (Optional)
                </label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Share your experience with this company..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={rating === 0 || isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : (hasRated ? 'Update Rating' : 'Submit Rating')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
