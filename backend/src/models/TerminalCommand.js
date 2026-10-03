import mongoose from 'mongoose';

const terminalCommandSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    command: {
      type: String,
      required: true,
      maxlength: 200,
    },
    allowed: {
      type: Boolean,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

terminalCommandSchema.index({ sessionId: 1, timestamp: -1 });

export const TerminalCommand = mongoose.model('TerminalCommand', terminalCommandSchema);
