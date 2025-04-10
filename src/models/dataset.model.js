import mongoose from 'mongoose';

const datasetSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  value: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['general', 'scholarship', 'event', 'department', 'faq']
  },
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
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Tạo index cho tìm kiếm
datasetSchema.index({ key: 'text', value: 'text', category: 1 });

const Dataset = mongoose.model('Dataset', datasetSchema);

export default Dataset; 