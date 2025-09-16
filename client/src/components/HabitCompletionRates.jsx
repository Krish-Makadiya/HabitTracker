import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

const HabitCompletionRates = () => {
  const [completionRates, setCompletionRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompletionRates = async () => {
      try {
        setLoading(true);
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
        
        const data = await api.getHabitCompletionRates(year, month);
        setCompletionRates(data);
      } catch (err) {
        console.error('Error fetching completion rates:', err);
        setError('Failed to load completion rates. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCompletionRates();
  }, [currentDate]);

  const navigateMonth = (direction) => {
    setCurrentDate(prevDate => 
      direction === 'next' ? addMonths(prevDate, 1) : subMonths(prevDate, 1)
    );
  };

  const getProgressBarColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
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
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-gray-900">Monthly Completion Rates</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
            aria-label="Previous month"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <span className="text-sm font-medium text-gray-700">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => navigateMonth('next')}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
            disabled={format(currentDate, 'yyyy-MM') >= format(new Date(), 'yyyy-MM')}
            aria-label="Next month"
          >
            <ChevronRightIcon 
              className={`h-5 w-5 ${format(currentDate, 'yyyy-MM') >= format(new Date(), 'yyyy-MM') ? 'text-gray-300' : ''}`} 
            />
          </button>
        </div>
      </div>

      {completionRates.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No habit data available for this month.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {completionRates.map((habit) => (
            <div key={habit._id} className="space-y-2">
              <div className="flex justify-between text-sm">
                <div className="flex items-center">
                  <div 
                    className="h-3 w-3 rounded-full mr-2" 
                    style={{ backgroundColor: habit.color || '#4F46E5' }}
                  />
                  <span className="font-medium text-gray-900">{habit.name}</span>
                </div>
                <span className="text-gray-600">
                  {habit.completedDays} of {habit.totalDays} days ({habit.completionRate}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${getProgressBarColor(habit.completionRate)}`}
                  style={{ width: `${Math.min(100, habit.completionRate)}%` }}
                  aria-valuenow={habit.completionRate}
                  aria-valuemin="0"
                  aria-valuemax="100"
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>Goal: {habit.goal}%</span>
                <span>100%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HabitCompletionRates;
