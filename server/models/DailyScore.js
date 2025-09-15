import mongoose from 'mongoose';

const dailyScoreSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  totalHabits: {
    type: Number,
    required: true,
    default: 0
  },
  completedHabits: {
    type: Number,
    required: true,
    default: 0
  },
  score: {
    type: Number,
    required: true,
    default: 0
  },
  percentage: {
    type: Number,
    required: true,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index to ensure one score per user per day
dailyScoreSchema.index({ userId: 1, date: 1 }, { unique: true });

// Static method to calculate and update daily score
dailyScoreSchema.statics.calculateDailyScore = async function(userId, date) {
  const HabitCompletion = mongoose.model('HabitCompletion');
  const Habit = mongoose.model('Habit');
  
  // Set date to start of day
  const scoreDate = new Date(date);
  scoreDate.setHours(0, 0, 0, 0);
  
  // Get all active habits for the user
  const totalHabits = await Habit.countDocuments({ 
    userId, 
    isActive: true 
  });
  
  // Get completed habits for the date
  const completedHabits = await HabitCompletion.countDocuments({
    userId,
    date: scoreDate,
    completed: true
  });
  
  // Calculate score (100 points per completed habit)
  const score = completedHabits * 100;
  
  // Calculate percentage
  const percentage = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;
  
  // Update or create daily score
  const dailyScore = await this.findOneAndUpdate(
    { userId, date: scoreDate },
    {
      totalHabits,
      completedHabits,
      score,
      percentage,
      updatedAt: new Date()
    },
    { 
      upsert: true, 
      new: true,
      setDefaultsOnInsert: true
    }
  );
  
  return dailyScore;
};

// Static method to get score statistics
dailyScoreSchema.statics.getScoreStats = async function(userId, startDate, endDate) {
  const scores = await this.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  }).sort({ date: 1 });
  
  if (scores.length === 0) {
    return {
      totalScore: 0,
      averageScore: 0,
      averagePercentage: 0,
      bestDay: null,
      currentStreak: 0,
      longestStreak: 0,
      scores: []
    };
  }
  
  const totalScore = scores.reduce((sum, score) => sum + score.score, 0);
  const averageScore = totalScore / scores.length;
  const averagePercentage = scores.reduce((sum, score) => sum + score.percentage, 0) / scores.length;
  
  // Find best day
  const bestDay = scores.reduce((best, current) => 
    current.score > best.score ? current : best
  );
  
  // Calculate streaks (days with 100% completion)
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  
  // Calculate current streak from the end
  for (let i = scores.length - 1; i >= 0; i--) {
    if (scores[i].percentage === 100) {
      currentStreak++;
    } else {
      break;
    }
  }
  
  // Calculate longest streak
  for (const score of scores) {
    if (score.percentage === 100) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }
  
  return {
    totalScore,
    averageScore: Math.round(averageScore),
    averagePercentage: Math.round(averagePercentage),
    bestDay,
    currentStreak,
    longestStreak,
    scores
  };
};

export default mongoose.model('DailyScore', dailyScoreSchema);
