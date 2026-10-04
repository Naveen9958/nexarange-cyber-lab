import mongoose from 'mongoose';
import { THEMES, DEFAULT_THEME, USER_ROLES } from '../utils/constants.js';

export const generateAvatarInitials = (name) => {
  if (!name || typeof name !== 'string') return 'OP';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0]?.[0] || 'OP').toUpperCase();
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Operator name is required'],
      trim: true,
      maxlength: 60,
    },
    username: {
      type: String,
      required: [true, 'Operator username is required'],
      unique: true,
      lowercase: true,
      trim: true,
      default: function () {
        if (this.callsign) return this.callsign.replace(/^0x/i, '').toLowerCase();
        return this.name ? this.name.toLowerCase().replace(/\s+/g, '') : undefined;
      },
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
        if (this.username) return `0x${this.username.toUpperCase()}`;
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
        return generateAvatarInitials(this.name);
      },
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: 'Fresher / Trainee',
    },
    level: {
      type: Number,
      default: 1,
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

// email and username indexes already created via unique: true on the schema fields
userSchema.index({ callsign: 1 });

userSchema.virtual('fullName').get(function () {
  return this.name;
}).set(function (val) {
  this.name = val;
});

userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

export const User = mongoose.model('User', userSchema);

