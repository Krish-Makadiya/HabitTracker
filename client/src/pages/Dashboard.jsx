import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import HabitCalendar from '../components/HabitCalendar';
import HabitManager from '../components/HabitManager';
import apiService from '../services/api';

const Dashboard = () => {
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showManager, setShowManager] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load habits
      const habitsData = await apiService.getHabits();
      setHabits(habitsData);

      // Load completions for current month
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const completionsData = await apiService.getAllCompletions(startOfMonth, endOfMonth);
      setCompletions(completionsData);
      
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load habits data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHabit = async (habitData) => {
    try {
      const newHabit = await apiService.createHabit(habitData);
      setHabits(prev => [newHabit, ...prev]);
      toast.success('Habit added successfully!');
    } catch (error) {
      console.error('Error adding habit:', error);
      toast.error('Failed to add habit');
      throw error;
    }
  };

  const handleUpdateHabit = async (habitId, habitData) => {
    try {
      const updatedHabit = await apiService.updateHabit(habitId, habitData);
      setHabits(prev => prev.map(h => h._id === habitId ? updatedHabit : h));
      toast.success('Habit updated successfully!');
    } catch (error) {
      console.error('Error updating habit:', error);
      toast.error('Failed to update habit');
      throw error;
    }
  };

  const handleDeleteHabit = async (habitId) => {
    try {
      await apiService.deleteHabit(habitId);
      setHabits(prev => prev.filter(h => h._id !== habitId));
      setCompletions(prev => prev.filter(c => c.habitId._id !== habitId));
      toast.success('Habit deleted successfully!');
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast.error('Failed to delete habit');
      throw error;
    }
  };

  const handleToggleCompletion = async (habitId, date) => {
    try {
      const result = await apiService.toggleHabitCompletion(habitId, date);
      
      // Update completions state
      const dateStr = date.toISOString().split('T')[0];
      const existingIndex = completions.findIndex(c => 
        c.habitId._id === habitId && c.date.split('T')[0] === dateStr
      );

      if (existingIndex >= 0) {
        // Update existing completion
        setCompletions(prev => prev.map((c, index) => 
          index === existingIndex 
            ? { ...c, completed: result.completed }
            : c
        ));
      } else {
        // Add new completion
        const habit = habits.find(h => h._id === habitId);
        setCompletions(prev => [...prev, {
          habitId: habit,
          date: result.date,
          completed: result.completed,
          notes: result.notes || ''
        }]);
      }

      toast.success(result.completed ? 'Habit completed!' : 'Habit uncompleted');
    } catch (error) {
      console.error('Error toggling completion:', error);
      toast.error('Failed to update habit completion');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Habit Tracker</h1>
              <p className="mt-2 text-gray-600">
                Track your daily habits and build consistent routines
              </p>
            </div>
            <button
              onClick={() => setShowManager(!showManager)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {showManager ? 'Hide Manager' : 'Manage Habits'}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Habit Manager */}
          {showManager && (
            <HabitManager
              habits={habits}
              onAddHabit={handleAddHabit}
              onUpdateHabit={handleUpdateHabit}
              onDeleteHabit={handleDeleteHabit}
            />
          )}

          {/* Habit Calendar */}
          <HabitCalendar
            habits={habits}
            completions={completions}
            onToggleCompletion={handleToggleCompletion}
          />

          {/* Stats Section */}
          {habits.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{habits.length}</div>
                  <div className="text-sm text-gray-600">Active Habits</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {completions.filter(c => c.completed).length}
                  </div>
                  <div className="text-sm text-gray-600">Completions This Month</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {habits.length > 0 
                      ? Math.round((completions.filter(c => c.completed).length / (habits.length * new Date().getDate())) * 100) || 0
                      : 0
                    }%
                  </div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
