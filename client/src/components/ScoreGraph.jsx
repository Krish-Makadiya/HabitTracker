import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const ScoreGraph = ({ scores, stats, onDateRangeChange }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState('week'); // 'week' or 'month'

  // Get date range based on view type
  const getDateRange = (date, type) => {
    const start = new Date(date);
    const end = new Date(date);

    if (type === 'week') {
      // Get start of week (Sunday)
      start.setDate(date.getDate() - date.getDay());
      end.setDate(start.getDate() + 6);
    } else {
      // Get start and end of month
      start.setDate(1);
      end.setMonth(date.getMonth() + 1, 0);
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  };

  const { start: startDate, end: endDate } = getDateRange(currentDate, viewType);

  // Navigation functions
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const goToNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const goToCurrent = () => {
    setCurrentDate(new Date());
  };

  // Notify parent of date range changes
  useEffect(() => {
    // Only call onDateRangeChange if both dates are valid
    if (startDate && endDate && onDateRangeChange) {
      onDateRangeChange(startDate, endDate);
    }
  }, [startDate, endDate, onDateRangeChange]);

  // Generate date labels for the graph
  const generateDateLabels = () => {
    const labels = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      labels.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return labels;
  };

  const dateLabels = generateDateLabels();

  // Get score for a specific date
  const getScoreForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return scores.find(score => 
      score.date.split('T')[0] === dateStr
    ) || { score: 0, percentage: 0, completedHabits: 0, totalHabits: 0 };
  };

  // Calculate max score for scaling
  const maxScore = scores.length > 0 ? Math.max(...scores.map(s => s.score), 100) : 100;
  const maxHeight = 200; // Max height in pixels

  // Get bar height based on score
  const getBarHeight = (score) => {
    return maxScore > 0 ? (score / maxScore) * maxHeight : 0;
  };

  // Get bar color based on percentage
  const getBarColor = (percentage) => {
    if (percentage === 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-green-400';
    if (percentage >= 50) return 'bg-yellow-400';
    if (percentage >= 25) return 'bg-orange-400';
    if (percentage > 0) return 'bg-red-400';
    return 'bg-gray-300';
  };

  const formatDateLabel = (date) => {
    if (viewType === 'week') {
      return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
    } else {
      return date.getDate().toString();
    }
  };

  const getTitle = () => {
    if (viewType === 'week') {
      const endOfWeek = new Date(startDate);
      endOfWeek.setDate(startDate.getDate() + 6);
      return `Week of ${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">Daily Scores</h3>
          <div className="flex bg-gray-100 rounded-md p-1">
            <button
              onClick={() => setViewType('week')}
              className={`px-3 py-1 text-sm rounded ${
                viewType === 'week'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewType('month')}
              className={`px-3 py-1 text-sm rounded ${
                viewType === 'month'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Month
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={goToPrevious}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={goToCurrent}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            Today
          </button>
          <button
            onClick={goToNext}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-4">
        <h4 className="text-md font-medium text-gray-700">{getTitle()}</h4>
      </div>

      {/* Graph */}
      <div className="relative">
        <div className="flex items-end justify-between space-x-1 mb-4" style={{ height: `${maxHeight + 20}px` }}>
          {dateLabels.map((date, index) => {
            const dayScore = getScoreForDate(date);
            const barHeight = getBarHeight(dayScore.score);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                {/* Bar */}
                <div className="relative flex items-end justify-center w-full">
                  <div
                    className={`w-full max-w-8 rounded-t transition-all duration-300 hover:opacity-80 ${getBarColor(dayScore.percentage)} ${
                      isToday ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                    }`}
                    style={{ height: `${barHeight}px`, minHeight: dayScore.score > 0 ? '4px' : '0px' }}
                    title={`${date.toLocaleDateString()}: ${dayScore.score} points (${dayScore.percentage.toFixed(1)}%)`}
                  >
                    {/* Score label on top of bar */}
                    {dayScore.score > 0 && (
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 font-medium">
                        {dayScore.score}
                      </div>
                    )}
                  </div>
                </div>

                {/* Date label */}
                <div className={`mt-2 text-xs text-center ${
                  isToday ? 'text-blue-600 font-bold' : 'text-gray-500'
                }`}>
                  {formatDateLabel(date)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-400 -ml-8">
          <span>{maxScore}</span>
          <span>{Math.round(maxScore * 0.75)}</span>
          <span>{Math.round(maxScore * 0.5)}</span>
          <span>{Math.round(maxScore * 0.25)}</span>
          <span>0</span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>100%</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded"></div>
          <span>75%+</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-yellow-400 rounded"></div>
          <span>50%+</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-orange-400 rounded"></div>
          <span>25%+</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-400 rounded"></div>
          <span>&lt;25%</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gray-300 rounded"></div>
          <span>0%</span>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalScore}</div>
            <div className="text-sm text-gray-600">Total Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.averageScore}</div>
            <div className="text-sm text-gray-600">Avg Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.currentStreak}</div>
            <div className="text-sm text-gray-600">Current Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.longestStreak}</div>
            <div className="text-sm text-gray-600">Best Streak</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreGraph;
