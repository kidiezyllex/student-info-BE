import mongoose from 'mongoose';

const aiTrainingSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  datasetCount: {
    type: Number,
    required: true
  },
  categories: [{
    type: String,
    enum: ['general', 'scholarship', 'event', 'department', 'faq']
  }],
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  error: {
    type: String,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const AITraining = mongoose.model('AITraining', aiTrainingSchema);

export default AITraining; 