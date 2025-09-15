import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { format } from 'date-fns';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const data = await api.getLeaderboard();
        setLeaderboard(data);
        setCurrentMonth(format(new Date(), 'MMMM yyyy'));
      } catch (err) {
        setError('Failed to load leaderboard. Please try again later.');
        console.error('Error fetching leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getMedalEmoji = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'bg-yellow-100 text-yellow-800';
      case 2: return 'bg-gray-100 text-gray-800';
      case 3: return 'bg-amber-100 text-amber-800';
      default: return 'bg-white';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 w-full max-w-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Leaderboard</h1>
          <p className="mt-2 text-lg text-gray-600">
            Top performers for {currentMonth}
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-1 text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</div>
              <div className="col-span-7 text-xs font-medium text-gray-500 uppercase tracking-wider">User</div>
              <div className="col-span-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Score</div>
              <div className="col-span-2 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Habits</div>
            </div>
          </div>
          <ul className="divide-y divide-gray-200">
            {leaderboard.map((entry, index) => (
              <li 
                key={entry._id} 
                className={`px-4 py-4 sm:px-6 ${entry._id === user?._id ? 'bg-blue-50' : ''} ${getRankColor(index + 1)}`}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-1 text-lg font-medium text-gray-900">
                    {getMedalEmoji(index + 1)}
                  </div>
                  <div className="col-span-7 flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-indigo-600 font-medium">
                        {entry.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {entry.username}
                        {entry._id === user?._id && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Joined {format(new Date(entry.createdAt), 'MMM yyyy')}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-2 text-right">
                    <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {(entry.score)/10} pts
                    </span>
                  </div>
                  <div className="col-span-2 text-right text-sm text-gray-500">
                    {entry.totalHabits || 0} habits
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">How it works</h3>
            <div className="mt-2 text-sm text-gray-500">
              <p className="mb-2">• Earn points by completing your daily habits</p>
              <p className="mb-2">• The more consistent you are, the higher you'll rank</p>
              <p>• Leaderboard resets at the beginning of each month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
