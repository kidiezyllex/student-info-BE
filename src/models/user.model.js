import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  role: {
    type: String,
    enum: ['student', 'coordinator', 'admin'],
    default: 'student'
  },
  active: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerifiedAt: {
    type: Date,
    default: null
  },
  savedNotifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Notification'
  }],
  
  // Personal Information
  fullName: {
    type: String
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  avatar: {
    type: String // URL to avatar image
  },
  
  // Contact Information
  phoneNumber: {
    type: String
  },
  address: {
    street: String,
    ward: String,
    district: String,
    city: String,
    zipCode: String
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phoneNumber: String
  },
  
  // Student-specific fields
  studentInfo: {
    class: String, // Lớp học
    course: String, // Khóa học (K20, K21, etc.)
    academicYear: String, // Năm học
    semester: String, // Học kỳ hiện tại
    gpa: Number, // Điểm trung bình
    credits: Number, // Số tín chỉ đã hoàn thành
    admissionDate: Date, // Ngày nhập học
    expectedGraduationDate: Date, // Ngày dự kiến tốt nghiệp
    status: {
      type: String,
      enum: ['active', 'suspended', 'graduated', 'dropped_out'],
      default: 'active'
    },
    scholarships: [{
      name: String,
      amount: Number,
      year: String,
      semester: String
    }],
    achievements: [{
      title: String,
      description: String,
      date: Date,
      category: String // academic, extracurricular, competition, etc.
    }]
  },
  
  // Coordinator-specific fields
  coordinatorInfo: {
    position: String, // Chức vụ
    officeLocation: String, // Vị trí văn phòng
    officeHours: String, // Giờ làm việc
    specialization: [String], // Chuyên môn
    qualifications: [{
      degree: String, // Bằng cấp
      field: String, // Lĩnh vực
      institution: String, // Trường/Tổ chức
      year: Number
    }],
    experience: [{
      position: String,
      organization: String,
      startDate: Date,
      endDate: Date,
      description: String
    }],
    researchInterests: [String],
    publications: [{
      title: String,
      journal: String,
      year: Number,
      authors: [String]
    }]
  },
  
  // Profile settings
  profileSettings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    showEmail: {
      type: Boolean,
      default: false
    },
    showPhone: {
      type: Boolean,
      default: false
    },
    allowMessages: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: true
    }
  },
  
  // Social links
  socialLinks: {
    facebook: String,
    linkedin: String,
    github: String,
    website: String
  },
  
  // Last activity tracking
  lastLogin: Date,
  lastProfileUpdate: Date
}, {
  timestamps: true
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash the password if it's modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Update lastProfileUpdate when profile is modified
userSchema.pre('save', function (next) {
  if (this.isModified() && !this.isNew) {
    this.lastProfileUpdate = new Date();
  }
  next();
});

const User = mongoose.model('User', userSchema);

export default User; 