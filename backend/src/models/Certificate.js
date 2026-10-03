import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    labId: {
      type: Number,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    certificateId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      default: 'Advanced',
    },
    status: {
      type: String,
      enum: ['locked', 'issued', 'revoked'],
      default: 'issued',
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

certificateSchema.index({ userId: 1, labId: 1 }, { unique: true });

export const Certificate = mongoose.model('Certificate', certificateSchema);
