import React, { useState, useEffect } from 'react';
import { UserIcon, TrophyIcon, CalendarIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import ApiService from '../services/api';
import BuddyCalendar from '../components/BuddyCalendar';
import toast from 'react-hot-toast';

const Buddy = () => {
    const [buddies, setBuddies] = useState([]);
    const [selectedBuddy, setSelectedBuddy] = useState(null);
    const [buddyStats, setBuddyStats] = useState(null);
    const [buddyCalendar, setBuddyCalendar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [calendarLoading, setCalendarLoading] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    useEffect(() => {
        loadBuddies();
    }, []);

    useEffect(() => {
        if (selectedBuddy) {
            loadBuddyData();
        }
    }, [selectedBuddy, currentMonth, currentYear]);

    const loadBuddies = async () => {
        try {
            const data = await ApiService.getBuddies();
            setBuddies(data);
        } catch (error) {
            console.error('Error loading buddies:', error);
            toast.error('Failed to load buddies');
        } finally {
            setLoading(false);
        }
    };

    const loadBuddyData = async () => {
        if (!selectedBuddy) return;

        setCalendarLoading(true);
        try {
            const [statsData, calendarData] = await Promise.all([
                ApiService.getUserStats(selectedBuddy._id),
                ApiService.getUserCalendar(selectedBuddy._id, currentYear, currentMonth)
            ]);

            setBuddyStats(statsData);
            setBuddyCalendar(calendarData);
        } catch (error) {
            console.error('Error loading buddy data:', error);
            toast.error('Failed to load buddy data');
        } finally {
            setCalendarLoading(false);
        }
    };

    const handleMonthChange = (direction) => {
        if (direction === 'prev') {
            if (currentMonth === 1) {
                setCurrentMonth(12);
                setCurrentYear(currentYear - 1);
            } else {
                setCurrentMonth(currentMonth - 1);
            }
        } else {
            if (currentMonth === 12) {
                setCurrentMonth(1);
                setCurrentYear(currentYear + 1);
            } else {
                setCurrentMonth(currentMonth + 1);
            }
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading buddies...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Buddy Progress</h1>
                    <p className="mt-2 text-gray-600">
                        View and compare habit progress with your buddies
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Buddy List */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <UserIcon className="h-5 w-5 mr-2" />
                                Your Buddies
                            </h2>

                            {buddies.length === 0 ? (
                                <div className="text-center py-8">
                                    <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-500">No buddies found</p>
                                    <p className="text-sm text-gray-400 mt-2">
                                        Other users will appear here once they join
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {buddies.map((buddy) => (
                                        <button
                                            key={buddy._id}
                                            onClick={() => setSelectedBuddy(buddy)}
                                            style={{
                                                padding: '10px'
                                            }}
                                            className={`w-full text-left p-3 rounded-lg border transition-colors ${selectedBuddy?._id === buddy._id
                                                    ? 'bg-blue-50 border-blue-200 text-blue-900'
                                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                    <span className="text-black text-sm font-medium">
                                                        {buddy.username.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="font-medium">{buddy.username}</p>
                                                    <p className="text-xs text-gray-500">
                                                        Joined {formatDate(buddy.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Buddy Details */}
                    <div style={{marginTop: '50px'}} className="lg:col-span-3 mt-5">
                        {!selectedBuddy ? (
                            <div style={{padding: '50px'}} className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Select a Buddy
                                </h3>
                                <p className="text-gray-500">
                                    Choose a buddy from the list to view their habit progress and stats
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Buddy Header */}
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                                <span className="text-white text-lg font-medium">
                                                    {selectedBuddy.username.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900">
                                                    {selectedBuddy.username}
                                                </h2>
                                                <p className="text-gray-500">
                                                    Member since {formatDate(selectedBuddy.createdAt)}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Month Navigation */}
                                        <div className="flex items-center space-x-4">
                                            <button
                                                onClick={() => handleMonthChange('prev')}
                                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                            <span className="font-medium text-gray-900">
                                                {new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                            <button
                                                onClick={() => handleMonthChange('next')}
                                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Cards */}
                                {buddyStats && (
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <CalendarIcon className="h-6 w-6 text-blue-600" />
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm font-medium text-gray-500">Total Habits</p>
                                                    <p className="text-2xl font-bold text-gray-900">
                                                        {buddyStats.stats.totalHabits}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <ChartBarIcon className="h-6 w-6 text-green-600" />
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm font-medium text-gray-500">Completion Rate</p>
                                                    <p className="text-2xl font-bold text-gray-900">
                                                        {buddyStats.stats.completionRate}%
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-orange-100 rounded-lg">
                                                    <TrophyIcon className="h-6 w-6 text-orange-600" />
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm font-medium text-gray-500">Current Streak</p>
                                                    <p className="text-2xl font-bold text-gray-900">
                                                        {buddyStats.stats.currentStreak}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                            <div className="flex items-center">
                                                <div className="p-2 bg-purple-100 rounded-lg">
                                                    <CalendarIcon className="h-6 w-6 text-purple-600" />
                                                </div>
                                                <div className="ml-4">
                                                    <p className="text-sm font-medium text-gray-500">Days Tracked</p>
                                                    <p className="text-2xl font-bold text-gray-900">
                                                        {buddyStats.stats.daysTracked}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Calendar */}
                                {calendarLoading ? (
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                        <p className="mt-4 text-gray-600">Loading calendar...</p>
                                    </div>
                                ) : buddyCalendar ? (
                                    <BuddyCalendar
                                        habits={buddyCalendar.habits}
                                        completions={buddyCalendar.completions}
                                        userName={selectedBuddy.username}
                                        year={currentYear}
                                        month={currentMonth}
                                    />
                                ) : null}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Buddy;
