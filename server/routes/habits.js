import express from 'express';
import { body, validationResult } from 'express-validator';
import Habit from '../models/Habit.js';
import HabitCompletion from '../models/HabitCompletion.js';
import DailyScore from '../models/DailyScore.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all habits for the authenticated user
router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find({ 
      userId: req.user._id,
      isActive: true 
    }).sort({ createdAt: -1 });
    
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new habit
router.post('/', [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Habit name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { name, description, color } = req.body;
    
    const habit = new Habit({
      userId: req.user._id,
      name,
      description,
      color: color || '#10b981'
    });

    await habit.save();
    res.status(201).json(habit);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// Update a habit
router.put('/:id', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Habit name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const updates = req.body;

    const habit = await Habit.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updates,
      { new: true }
    );

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a habit (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const habit = await Habit.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { isActive: false },
      { new: true }
    );

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Toggle habit completion for a specific date
router.post('/:id/complete', [
  body('date')
    .isISO8601()
    .withMessage('Date must be in ISO 8601 format'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Notes must be less than 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { date, notes } = req.body;

    // Verify habit exists and belongs to user
    const habit = await Habit.findOne({ 
      _id: id, 
      userId: req.user._id, 
      isActive: true 
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    // Parse date to start of day
    const completionDate = new Date(date);
    completionDate.setHours(0, 0, 0, 0);

    // Check if completion already exists
    const existingCompletion = await HabitCompletion.findOne({
      userId: req.user._id,
      habitId: id,
      date: completionDate
    });

    if (existingCompletion) {
      // Toggle completion
      existingCompletion.completed = !existingCompletion.completed;
      if (notes !== undefined) {
        existingCompletion.notes = notes;
      }
      await existingCompletion.save();
      
      // Calculate and update daily score after completion change
      await DailyScore.calculateDailyScore(req.user._id, completionDate);
      
      res.json({
        completed: existingCompletion.completed,
        date: completionDate,
        notes: existingCompletion.notes
      });
    } else {
      // Create new completion
      const completion = new HabitCompletion({
        userId: req.user._id,
        habitId: id,
        date: completionDate,
        completed: true,
        notes: notes || ''
      });

      await completion.save();
      
      res.status(201).json({
        completed: true,
        date: completionDate,
        notes: completion.notes
      });
    }

    // Calculate and update daily score after completion change
    await DailyScore.calculateDailyScore(req.user._id, completionDate);
    
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get habit completions for a date range
router.get('/:id/completions', async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: 'startDate and endDate query parameters are required' 
      });
    }

    // Verify habit exists and belongs to user
    const habit = await Habit.findOne({ 
      _id: id, 
      userId: req.user._id, 
      isActive: true 
    });

    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const completions = await HabitCompletion.find({
      userId: req.user._id,
      habitId: id,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    res.json(completions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all completions for all habits in a date range (for calendar view)
router.get('/completions/range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: 'startDate and endDate query parameters are required' 
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const completions = await HabitCompletion.find({
      userId: req.user._id,
      date: { $gte: start, $lte: end }
    }).populate('habitId', 'name color').sort({ date: 1 });

    res.json(completions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get daily scores for a date range
router.get('/scores/range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: 'startDate and endDate query parameters are required' 
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const scores = await DailyScore.find({
      userId: req.user._id,
      date: { $gte: start, $lte: end }
    }).sort({ date: 1 });

    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get score statistics for a date range
// Get monthly completion rates for all habits
router.get('/completion-rates', async (req, res) => {
  try {
    const { year, month } = req.query;
    
    if (!year || !month) {
      return res.status(400).json({ message: 'Year and month are required' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const daysInMonth = endDate.getDate();

    // Get all active habits for the user
    const habits = await Habit.find({ 
      userId: req.user._id,
      isActive: true 
    });

    // Get completion data for all habits in the specified month
    const habitCompletions = await HabitCompletion.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            habitId: '$habitId',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }
          },
          completed: { $first: '$completed' }
        }
      },
      {
        $group: {
          _id: '$_id.habitId',
          completedDays: {
            $sum: { $cond: ['$completed', 1, 0] }
          },
          totalDays: { $sum: 1 }
        }
      },
      {
        $project: {
          habitId: '$_id',
          completionRate: {
            $multiply: [
              { $divide: ['$completedDays', '$totalDays'] },
              100
            ]
          },
          completedDays: 1,
          totalDays: 1
        }
      }
    ]);

    // Combine habit data with completion rates
    const habitsWithRates = habits.map(habit => {
      const completionData = habitCompletions.find(hc => 
        hc.habitId.toString() === habit._id.toString()
      ) || { completionRate: 0, completedDays: 0, totalDays: daysInMonth };

      return {
        _id: habit._id,
        name: habit.name,
        color: habit.color,
        completionRate: Math.round(completionData.completionRate) || 0,
        completedDays: completionData.completedDays || 0,
        totalDays: completionData.totalDays || daysInMonth,
        goal: habit.goal || 100 // Default goal is 100%
      };
    });

    res.json(habitsWithRates);
  } catch (error) {
    console.error('Error fetching habit completion rates:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/scores/stats', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: 'startDate and endDate query parameters are required' 
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const stats = await DailyScore.getScoreStats(req.user._id, start, end);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Recalculate scores for a date range (utility endpoint)
router.post('/scores/recalculate', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        message: 'startDate and endDate are required' 
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const scores = [];

    // Recalculate scores for each day in the range
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const score = await DailyScore.calculateDailyScore(req.user._id, new Date(d));
      scores.push(score);
    }

    res.json({ 
      message: 'Scores recalculated successfully',
      scores 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
