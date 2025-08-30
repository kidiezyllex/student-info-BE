import mongoose from 'mongoose';

const verificationCodeSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  code: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // MongoDB will automatically delete expired documents
  },
  attempts: {
    type: Number,
    default: 0,
    max: 3
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for efficient queries
verificationCodeSchema.index({ email: 1, expiresAt: 1 });

const VerificationCode = mongoose.model('VerificationCode', verificationCodeSchema);

export default VerificationCode;
