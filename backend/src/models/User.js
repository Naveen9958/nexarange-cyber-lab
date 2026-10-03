import mongoose from 'mongoose';
import { THEMES, DEFAULT_THEME, USER_ROLES } from '../utils/constants.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Operator name is required'],
      trim: true,
      maxlength: 60,
    },
    email: {
      type: String,
      required: [true, 'Operator email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email address'],
    },
    callsign: {
      type: String,
      trim: true,
      default: function () {
        return `0x${this.name.toUpperCase().replace(/\s+/g, '')}`;
      },
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // Never return in default queries
    },
    avatar: {
      type: String,
      default: function () {
        return this.name ? this.name.charAt(0).toUpperCase() : 'O';
      },
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'user',
    },
    level: {
      type: Number,
      default: 3,
    },
    xp: {
      type: Number,
      default: 0,
      min: 0,
    },
    themePreference: {
      type: String,
      enum: THEMES,
      default: DEFAULT_THEME,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// email index already created via unique: true
userSchema.index({ callsign: 1 });

export const User = mongoose.model('User', userSchema);
