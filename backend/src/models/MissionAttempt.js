import mongoose from 'mongoose';

const missionAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    missionId: {
      type: String,
      required: true,
      index: true,
    },
    labId: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    score: {
      type: Number,
      default: 100,
    },
    xpAwarded: {
      type: Number,
      default: 0,
    },
    objectivesCompleted: [String],
  },
  {
    timestamps: true,
  }
);

// Enforce unique attempt per user + mission to guarantee idempotency and prevent duplicate XP
missionAttemptSchema.index({ userId: 1, missionId: 1 }, { unique: true });

export const MissionAttempt = mongoose.model('MissionAttempt', missionAttemptSchema);
