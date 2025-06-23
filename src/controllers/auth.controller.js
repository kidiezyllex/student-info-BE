import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { jwtSecret, jwtExpiresIn } from '../config/database.js';

/**
 * Generate JWT token
 */
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

    // Check for user email
    const user = await User.findOne({ email }).populate('department', 'name code');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Return user with token
    res.json({
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
    res.status(500).json({ message: error.message });
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

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user with optional role parameter
    const userData = {
      name,
      email,
      password
    };

    // Add role to userData if it exists in request body
    if (role) {
      // Validate that role is one of the allowed values
      if (!['student', 'coordinator', 'admin'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role specified' });
      }
      userData.role = role;
    }

    // Create user
    const user = await User.create(userData);

    if (user) {
      // Populate department info
      await user.populate('department', 'name code');
      
      res.status(201).json({
        message: 'User registered successfully',
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
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