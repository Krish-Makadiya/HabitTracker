import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const HabitManager = ({ isOpen, onClose, habits = [], onSave, onUpdateHabit, onDeleteHabit }) => {
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#10b981' // Default to emerald
  });

  const colors = [
    '#10b981', // emerald
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#f59e0b', // amber
    '#ef4444', // red
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316', // orange
    '#6b7280'  // gray
  ];

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setEditingHabit(null);
      setFormData({ name: '', description: '', color: '#10b981' });
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      if (editingHabit) {
        await onUpdateHabit(editingHabit._id, formData);
      } else {
        await onSave(formData);
      }
      
      // Reset form and close modal
      setFormData({ name: '', description: '', color: '#10b981' });
      setEditingHabit(null);
      onClose();
    } catch (error) {
      console.error('Error saving habit:', error);
    }
  };

  const handleEdit = (habit) => {
    setEditingHabit(habit);
    setFormData({
      name: habit.name,
      description: habit.description || '',
      color: habit.color || '#10b981'
    });
    setIsAddingHabit(true);
  };

  const handleDelete = async (habitId) => {
    if (window.confirm('Are you sure you want to delete this habit?')) {
      try {
        await onDeleteHabit(habitId);
      } catch (error) {
        console.error('Error deleting habit:', error);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Manage Habits</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Add Habit Button */}
          <div className="mb-6">
            <button
              onClick={() => {
                setEditingHabit(null);
                setFormData({ name: '', description: '', color: '#10b981' });
                setIsAddingHabit(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Add Habit
            </button>
          </div>

          {/* Add/Edit Form */}
          {isAddingHabit && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Habit Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="e.g., Drink water, Read, Exercise"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Add some details about this habit..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`w-6 h-6 rounded-full ${formData.color === color ? 'ring-2 ring-offset-1 ring-indigo-500' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({ ...formData, color })}
                        aria-label={`Select ${color} color`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingHabit(null);
                      setIsAddingHabit(false);
                    }}
                    className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    {editingHabit ? 'Update Habit' : 'Add Habit'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Habits List */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Your Habits</h3>
            {habits.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No habits yet. Add your first habit to get started!</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {habits.map((habit) => (
                  <li key={habit._id} className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: habit.color }}
                        />
                        <div>
                          <h4 className="font-medium text-gray-900">{habit.name}</h4>
                          {habit.description && (
                            <p className="text-sm text-gray-600">{habit.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(habit)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit habit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(habit._id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete habit"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default HabitManager;
