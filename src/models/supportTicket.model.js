import mongoose from 'mongoose';

const supportTicketSchema = new mongoose.Schema({
  // Student who created the ticket
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Department admin who will handle this ticket
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  
  // Assigned admin (coordinator of the department)
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Ticket information
  subject: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    required: true
  },
  
  // Original AI conversation context
  aiConversation: {
    userQuery: String,
    aiResponse: String,
    conversationId: String
  },
  
  // Ticket status
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Category
  category: {
    type: String,
    enum: ['academic', 'technical', 'administrative', 'other'],
    default: 'other'
  },
  
  // Student contact info
  contactInfo: {
    email: String,
    phoneNumber: String
  },
  
  // Admin notes and responses
  adminNotes: [{
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    note: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Resolution information
  resolution: {
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    resolutionNote: String
  },
  
  // Timestamps
  closedAt: Date
}, {
  timestamps: true
});

// Index for faster queries
supportTicketSchema.index({ student: 1, status: 1 });
supportTicketSchema.index({ department: 1, status: 1 });
supportTicketSchema.index({ assignedTo: 1, status: 1 });
supportTicketSchema.index({ createdAt: -1 });

// Virtual for ticket age
supportTicketSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)); // days
});

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

export default SupportTicket;
