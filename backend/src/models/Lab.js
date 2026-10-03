import mongoose from 'mongoose';
import { MISSION_DIFFICULTIES } from '../utils/constants.js';

const labSchema = new mongoose.Schema(
  {
    labId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    caseId: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      default: 'cyan',
    },
    category: {
      type: String,
      required: true,
      default: 'AI Security',
    },
    difficulty: {
      type: String,
      enum: MISSION_DIFFICULTIES,
      default: 'Advanced',
    },
    xpReward: {
      type: Number,
      default: 1000,
    },
    estimatedTime: {
      type: String,
      default: '45 mins',
    },
    objectives: [String],
    debriefChain: [String],
    simulationType: {
      type: String,
      default: 'cyber_range',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Lab = mongoose.model('Lab', labSchema);
