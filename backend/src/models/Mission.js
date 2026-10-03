import mongoose from 'mongoose';
import { MISSION_DIFFICULTIES } from '../utils/constants.js';

const missionSchema = new mongoose.Schema(
  {
    missionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    labId: {
      type: Number,
      required: true,
      index: true,
    },
    num: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    category: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: MISSION_DIFFICULTIES,
      default: 'Intermediate',
    },
    xpReward: {
      type: Number,
      required: true,
      default: 100,
    },
    duration: {
      type: String,
      default: '15 mins',
    },
    status: {
      type: String,
      default: 'available',
    },
    badge: {
      emoji: String,
      name: String,
    },
    partner: {
      name: String,
      role: String,
      initial: String,
    },
    dialogue: String,
    evidence: [
      {
        key: String,
        value: String,
      },
    ],
    tasks: [String],
    question: String,
    answer: String,
    evidence_out: {
      key: String,
      value: String,
    },
    hints: [
      {
        text: String,
        penalty: Number,
      },
    ],
    type: String,
    objectives: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

missionSchema.index({ labId: 1, num: 1 });

export const Mission = mongoose.model('Mission', missionSchema);
