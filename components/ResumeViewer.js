'use client';
import { useState } from 'react';

export default function ResumeViewer({ resumeUrl, onClose }) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Resume Preview</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading resume...</p>
              </div>
            </div>
          )}

          {error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <p className="text-gray-600">Failed to load resume</p>
                <button
                  onClick={onClose}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <iframe
              src={resumeUrl}
              className="w-full h-full border rounded"
              onLoad={handleLoad}
              onError={handleError}
              title="Resume Preview"
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 p-4 border-t">
          <a
            href={resumeUrl}
            download="resume.pdf"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Download
          </a>
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
