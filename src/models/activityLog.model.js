import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'DELETE'],
    required: true
  },
  resource: {
    type: String,
    required: true // e.g., 'Topic', 'User', 'Department'
  },
  resourceId: {
    type: String,
    required: false
  },
  details: {
    type: String, // Description of the change
    required: true
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ user: 1 });
activityLogSchema.index({ action: 1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

export default ActivityLog;
