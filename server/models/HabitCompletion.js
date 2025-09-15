import mongoose from 'mongoose';

const habitCompletionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  completed: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 200
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index to ensure one completion per habit per day per user
habitCompletionSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });

// Static method to get completion rate for a habit in a date range
habitCompletionSchema.statics.getCompletionRate = async function(userId, habitId, startDate, endDate) {
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
  const completedDays = await this.countDocuments({
    userId,
    habitId,
    date: { $gte: startDate, $lte: endDate },
    completed: true
  });
  
  return {
    completedDays,
    totalDays,
    rate: totalDays > 0 ? (completedDays / totalDays) * 100 : 0
  };
};

export default mongoose.model('HabitCompletion', habitCompletionSchema);
