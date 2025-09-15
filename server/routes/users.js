import express from 'express';
import User from '../models/User.js';
import Habit from '../models/Habit.js';
import HabitCompletion from '../models/HabitCompletion.js';
import DailyScore from '../models/DailyScore.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all users except current user (for buddy list)
router.get('/buddies', async (req, res) => {
  try {
    const users = await User.find({ 
      _id: { $ne: req.user._id } 
    }).select('username email createdAt').sort({ username: 1 });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user stats and progress
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user exists
    const user = await User.findById(userId).select('username email createdAt');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's habits
    const habits = await Habit.find({ 
      userId, 
      isActive: true 
    }).select('name color createdAt');

    // Get current month completions
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const completions = await HabitCompletion.find({
      userId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
      completed: true
    }).populate('habitId', 'name color');

    // Calculate stats
    const totalHabits = habits.length;
    const totalCompletions = completions.length;
    const daysInMonth = now.getDate();
    const maxPossibleCompletions = totalHabits * daysInMonth;
    const completionRate = maxPossibleCompletions > 0 ? 
      Math.round((totalCompletions / maxPossibleCompletions) * 100) : 0;

    // Calculate streak (consecutive days with all habits completed)
    let currentStreak = 0;
    for (let day = daysInMonth; day >= 1; day--) {
      const dayCompletions = completions.filter(c => {
        const completionDay = new Date(c.date).getDate();
        return completionDay === day;
      }).length;
      
      if (dayCompletions === totalHabits && totalHabits > 0) {
        currentStreak++;
      } else {
        break;
      }
    }

    res.json({
      user,
      habits,
      stats: {
        totalHabits,
        totalCompletions,
        completionRate,
        currentStreak,
        daysTracked: daysInMonth
      },
      completions
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's habit calendar data for a specific month
router.get('/:userId/calendar/:year/:month', async (req, res) => {
  try {
    const { userId, year, month } = req.params;
    
    // Verify user exists
    const user = await User.findById(userId).select('username');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get date range for the month
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0);
    endDate.setHours(23, 59, 59, 999);

    // Get user's habits
    const habits = await Habit.find({ 
      userId, 
      isActive: true 
    }).select('name color');

    // Get completions for the month
    const completions = await HabitCompletion.find({
      userId,
      date: { $gte: startDate, $lte: endDate }
    }).populate('habitId', 'name color');

    res.json({
      user,
      habits,
      completions,
      month: {
        year: parseInt(year),
        month: parseInt(month),
        daysInMonth: endDate.getDate()
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get leaderboard of all users ranked by monthly score
router.get('/leaderboard', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get all users with their monthly scores
    const leaderboard = await User.aggregate([
      {
        $lookup: {
          from: 'dailyscores',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$userId', '$$userId'] },
                    { $gte: ['$date', startOfMonth] },
                    { $lte: ['$date', endOfMonth] }
                  ]
                }
              }
            },
            {
              $group: {
                _id: null,
                totalScore: { $sum: '$score' }
              }
            }
          ],
          as: 'scores'
        }
      },
      {
        $project: {
          _id: 1,
          username: 1,
          email: 1,
          score: { $ifNull: [{ $arrayElemAt: ['$scores.totalScore', 0] }, 0] },
          createdAt: 1
        }
      },
      {
        $sort: { score: -1 }
      }
    ]);

    // Add ranking position
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      ...user,
      rank: index + 1
    }));

    res.json(rankedLeaderboard);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
