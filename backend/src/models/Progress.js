import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    missionsCompleted: {
      type: Map,
      of: Boolean,
      default: {},
    },
    labsCompleted: {
      type: [Number],
      default: [],
    },
    totalXp: {
      type: Number,
      default: 0,
      min: 0,
    },
    sessionXp: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentLevel: {
      type: Number,
      default: 3,
    },
    badges: [
      {
        emoji: String,
        name: String,
        unlockedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    skillMatrix: {
      'AI Security': { type: Number, default: 0, min: 0, max: 100 },
      'Cloud Infra': { type: Number, default: 0, min: 0, max: 100 },
      'Forensics': { type: Number, default: 0, min: 0, max: 100 },
      'Cryptography': { type: Number, default: 0, min: 0, max: 100 },
      'Networking': { type: Number, default: 0, min: 0, max: 100 },
      'Kubernetes': { type: Number, default: 0, min: 0, max: 100 },
    },
    xpHistory: [
      {
        source: {
          type: String,
          enum: ['mission', 'lab'],
          default: 'mission',
        },
        sourceId: {
          type: String,
          required: true,
        },
        xp: {
          type: Number,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Progress = mongoose.model('Progress', progressSchema);
