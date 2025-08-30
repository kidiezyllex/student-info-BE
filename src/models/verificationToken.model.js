import mongoose from 'mongoose';

const verificationTokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 } // MongoDB will automatically delete expired documents
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for efficient queries
verificationTokenSchema.index({ email: 1, token: 1 });

const VerificationToken = mongoose.model('VerificationToken', verificationTokenSchema);

export default VerificationToken;
