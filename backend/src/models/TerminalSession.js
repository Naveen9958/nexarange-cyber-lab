import mongoose from 'mongoose';

const terminalSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    labId: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['active', 'closed'],
      default: 'active',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    closedAt: {
      type: Date,
      default: null,
    },
    commandCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

terminalSessionSchema.index({ userId: 1, status: 1 });

export const TerminalSession = mongoose.model('TerminalSession', terminalSessionSchema);
