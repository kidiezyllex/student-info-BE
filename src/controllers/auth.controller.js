import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import VerificationToken from '../models/verificationToken.model.js';
import { jwtSecret, jwtExpiresIn } from '../config/database.js';
import VerificationCode from '../models/verificationCode.model.js';
import { sendVerificationCode } from '../services/email.service.js';

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateToken = (id) => {
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: jwtExpiresIn
  });
};

/**
 * @desc    Login user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).populate('department', 'name code');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.active) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        fullName: user.fullName,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists' 
      });
    }

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    if (role && !['student', 'coordinator', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    const userData = {
      name,
      email,
      password,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      role: role || 'student'
    };

    const user = await User.create(userData);

    if (user) {
      await user.populate('department', 'name code');
      
      res.status(200).json({
        success: true,
        message: 'Registration successful',
        data: {
          _id: user._id,
          name: user.name,
          fullName: user.fullName,
          email: user.email,
          studentId: user.studentId,
          role: user.role,
          department: user.department,
          avatar: user.avatar,
          emailVerified: user.emailVerified,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data'
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to process registration request' 
    });
  }
};

/**
 * @desc    Complete registration with verification token
 * @route   POST /api/auth/complete-registration
 * @access  Public
 */
export const completeRegistration = async (req, res) => {
  try {
    const { name, email, password, verificationToken, role } = req.body;

    // Validate input
    if (!name || !email || !password || !verificationToken) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and verification token are required'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Find and validate verification token
    const tokenRecord = await VerificationToken.findOne({ 
      token: verificationToken,
      email: email.toLowerCase()
    });

    if (!tokenRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token'
      });
    }

    // Check if token is expired
    if (new Date() > tokenRecord.expiresAt) {
      await VerificationToken.deleteOne({ _id: tokenRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Verification token has expired'
      });
    }

    // Validate role if provided
    if (role && !['student', 'coordinator', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    // Create user with email verified
    const userData = {
      name,
      email,
      password,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      role: role || 'student'
    };

    const user = await User.create(userData);

    if (user) {
      // Delete the verification token as it's no longer needed
      await VerificationToken.deleteOne({ _id: tokenRecord._id });

      // Populate department info
      await user.populate('department', 'name code');
      
      res.status(200).json({
        success: true,
        message: 'Registration completed successfully',
        data: {
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            emailVerified: user.emailVerified
          }
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid user data'
      });
    }
  } catch (error) {
    console.error('Complete registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete registration'
    });
  }
};

/**
 * @desc    Get user profile
 * @route   GET /api/auth/profile
 * @access  Private
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('department', 'name code description')
      .populate('savedNotifications')
      .select('-password');

    if (user) {
      res.json({
        message: 'User profile retrieved successfully',
        data: user
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 