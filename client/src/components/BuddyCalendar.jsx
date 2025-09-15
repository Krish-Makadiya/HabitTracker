import React, { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const BuddyCalendar = ({ habits, completions, userName, year, month }) => {
  // Get first day of month and number of days
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const daysInMonth = lastDay.getDate();
  const monthName = firstDay.toLocaleString('default', { month: 'long' });
  
  // Get completion status for a habit on a specific date
  const getCompletionStatus = (habitId, day) => {
    const dateStr = new Date(year, month - 1, day).toISOString().split('T')[0];
    return completions.find(c => 
      c.habitId._id === habitId && 
      c.date.split('T')[0] === dateStr &&
      c.completed
    );
  };
  
  // Get completion intensity (for green shading)
  const getCompletionIntensity = (day) => {
    const dateCompletions = completions.filter(c => {
      const dateStr = new Date(year, month - 1, day).toISOString().split('T')[0];
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
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month - 1;
  const todayDate = today.getDate();
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {userName}'s Habits - {monthName} {year}
          </h3>
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
                      className={`w-8 h-8 p-0 border border-gray-200 ${
                        isToday ? 'ring-1 ring-blue-300' : ''
                      }`}
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

export default BuddyCalendar;
