import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import HabitCalendar from '../components/HabitCalendar';
import HabitManager from '../components/HabitManager';
import HabitCompletionRates from '../components/HabitCompletionRates';
import { PlusIcon } from '@heroicons/react/24/outline';
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">My Habits</h1>
          <button
            onClick={() => setShowManager(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Habit
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <HabitCalendar
              habits={habits}
              completions={completions}
              onToggleCompletion={handleToggleCompletion}
              onDeleteHabit={handleDeleteHabit}
              loading={loading}
            />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <HabitCompletionRates />
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="text-2xl font-bold text-indigo-600">
                  {habits.length}
                </div>
                <div className="text-sm text-gray-600">Active Habits</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg shadow">
                <div className="text-2xl font-bold text-green-600">
                  {completions.filter(c => c.completed).length}
                </div>
                <div className="text-sm text-gray-600">Completions</div>
              </div>
            </div>
          </div>
        </div>

        <HabitManager
          isOpen={showManager}
          onClose={() => setShowManager(false)}
          onSave={handleAddHabit}
          habits={habits}
          onUpdateHabit={handleUpdateHabit}
          onDeleteHabit={handleDeleteHabit}
        />
      </div>
    </div>
  );
};

export default Dashboard;
