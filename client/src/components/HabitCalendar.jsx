import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const HabitCalendar = ({ habits, completions, onToggleCompletion }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Get current month details
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }
  
  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };
  
  // Get completion status for a habit on a specific date
  const getCompletionStatus = (habitId, day) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    return completions.find(c => 
      c.habitId._id === habitId && 
      c.date.split('T')[0] === dateStr &&
      c.completed
    );
  };
  
  // Get completion intensity (for green shading)
  const getCompletionIntensity = (day) => {
    const dateCompletions = completions.filter(c => {
      const dateStr = new Date(year, month, day).toISOString().split('T')[0];
      return c.date.split('T')[0] === dateStr && c.completed;
    });
    
    if (habits.length === 0) return 0;
    return dateCompletions.length / habits.length;
  };
  
  // Get background color based on completion intensity
  const getBackgroundColor = (intensity) => {
    if (intensity === 0) return 'bg-gray-50';
    if (intensity <= 0.25) return 'bg-green-100';
    if (intensity <= 0.5) return 'bg-green-200';
    if (intensity <= 0.75) return 'bg-green-300';
    return 'bg-green-400';
  };
  
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = today.getDate();
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {monthName} {year}
          </h2>
          {!isCurrentMonth && (
            <button
              onClick={goToCurrentMonth}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              Today
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>
      
      {/* Calendar Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="w-32 p-2 text-left"></th>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const isToday = isCurrentMonth && day === todayDate;
                const intensity = getCompletionIntensity(day);
                
                return (
                  <th
                    key={day}
                    className={`w-8 h-8 p-1 text-center text-xs font-medium border border-gray-200 ${
                      getBackgroundColor(intensity)
                    } ${isToday ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className={`${isToday ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                      {day}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {habits.map(habit => (
              <tr key={habit._id} className="hover:bg-gray-50">
                <td className="p-2 border-r border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: habit.color }}
                    ></div>
                    <span className="text-sm font-medium text-gray-700 truncate">
                      {habit.name}
                    </span>
                  </div>
                </td>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                  const isCompleted = getCompletionStatus(habit._id, day);
                  const isToday = isCurrentMonth && day === todayDate;
                  
                  return (
                    <td
                      key={`${habit._id}-${day}`}
                      className={`w-8 h-8 p-0 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors ${
                        isToday ? 'ring-1 ring-blue-300' : ''
                      }`}
                      onClick={() => onToggleCompletion(habit._id, new Date(year, month, day))}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        {isCompleted && (
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Legend */}
      <div className="mt-6 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-50 border border-gray-200 rounded"></div>
            <span>No habits completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded"></div>
            <span>All habits completed</span>
          </div>
        </div>
        
        <div className="text-right">
          <p className="font-medium">
            {habits.length} habit{habits.length !== 1 ? 's' : ''} tracked
          </p>
        </div>
      </div>
    </div>
  );
};

export default HabitCalendar;
