import React from 'react';

const Friends = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Friends</h1>
          <p className="text-gray-600 mb-8">Connect with friends and share your habit journey.</p>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-gray-500">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Social Features</h3>
              <p className="text-gray-600">
                This feature will allow you to add friends, share progress, and motivate each other to maintain healthy habits.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Friends;
