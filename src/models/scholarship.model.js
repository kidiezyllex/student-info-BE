import mongoose from 'mongoose';

const scholarshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  applicationDeadline: {
    type: Date,
    required: true
  },
  provider: {
    type: String,
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  eligibility: {
    type: String,
    required: true
  },
  applicationProcess: {
    type: String,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Tạo index cho tìm kiếm
scholarshipSchema.index({ title: 'text', description: 'text', requirements: 'text' });

const Scholarship = mongoose.model('Scholarship', scholarshipSchema);

export default Scholarship; 