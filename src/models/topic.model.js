import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: [
      'event',           // Sự kiện
      'scholarship',     // Học bổng
      'notification',   // Thông báo
      'job',             // Việc làm
      'advertisement',   // Quảng cáo
      'internship',      // Cơ hội thực tập
      'recruitment',     // Các công ty liên kết tuyển dụng
      'volunteer',       // Tình nguyện viên
      'extracurricular'  // Các hoạt động ngoại khóa
    ],
    required: true
  },
  // Common fields
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Date fields (used differently by different types)
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  applicationDeadline: {
    type: Date
  },
  // Event-specific fields
  location: {
    type: String
  },
  organizer: {
    type: String
  },
  // Scholarship-specific fields
  requirements: {
    type: String
  },
  value: {
    type: String
  },
  provider: {
    type: String
  },
  eligibility: {
    type: String
  },
  applicationProcess: {
    type: String
  },
  // Notification-specific fields
  isImportant: {
    type: Boolean,
    default: false
  },
  // Job/Recruitment fields
  company: {
    type: String
  },
  salary: {
    type: String
  },
  position: {
    type: String
  },
  contactInfo: {
    type: String
  },
  // Additional metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Create indexes for search
topicSchema.index({ title: 'text', description: 'text' });
topicSchema.index({ type: 1 });
topicSchema.index({ department: 1 });
topicSchema.index({ startDate: 1 });
topicSchema.index({ endDate: 1 });
topicSchema.index({ applicationDeadline: 1 });
topicSchema.index({ createdAt: -1 });

const Topic = mongoose.model('Topic', topicSchema);

export default Topic;

