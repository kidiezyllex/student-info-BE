import User from '../models/user.model.js';

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .populate('department', 'name code')
      .select('-password');
    
    res.json({
      message: 'Users retrieved successfully',
      data: users
    });
  } catch (error) {
    res.status(500).json({ 
      message: error.message 
    });
  }
};

/**
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('department', 'name code description')
      .populate('savedNotifications')
      .select('-password');

    if (user) {
      res.json({
        message: 'User retrieved successfully',
        data: user
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private
 */
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is updating their own profile or is admin
    if (req.user._id.toString() !== user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }

    // Basic fields
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.studentId = req.body.studentId || user.studentId;

    // If password is provided, it will be hashed in the pre-save hook
    if (req.body.password) {
      user.password = req.body.password;
    }

    // Personal Information
    if (req.body.fullName !== undefined) user.fullName = req.body.fullName;
    if (req.body.dateOfBirth !== undefined) user.dateOfBirth = req.body.dateOfBirth;
    if (req.body.gender !== undefined) user.gender = req.body.gender;
    if (req.body.avatar !== undefined) user.avatar = req.body.avatar;

    // Contact Information
    if (req.body.phoneNumber !== undefined) user.phoneNumber = req.body.phoneNumber;
    if (req.body.address !== undefined) {
      user.address = { ...user.address, ...req.body.address };
    }
    if (req.body.emergencyContact !== undefined) {
      user.emergencyContact = { ...user.emergencyContact, ...req.body.emergencyContact };
    }

    // Student-specific fields (only if user is a student)
    if (user.role === 'student' && req.body.studentInfo !== undefined) {
      user.studentInfo = { ...user.studentInfo, ...req.body.studentInfo };
    }

    // Coordinator-specific fields (only if user is a coordinator)
    if (user.role === 'coordinator' && req.body.coordinatorInfo !== undefined) {
      user.coordinatorInfo = { ...user.coordinatorInfo, ...req.body.coordinatorInfo };
    }

    // Profile settings
    if (req.body.profileSettings !== undefined) {
      user.profileSettings = { ...user.profileSettings, ...req.body.profileSettings };
    }

    // Social links
    if (req.body.socialLinks !== undefined) {
      user.socialLinks = { ...user.socialLinks, ...req.body.socialLinks };
    }

    // Only admin can change role and department
    if (req.user.role === 'admin') {
      if (req.body.role !== undefined) user.role = req.body.role;
      if (req.body.department !== undefined) user.department = req.body.department;
      if (req.body.active !== undefined) user.active = req.body.active;
    }

    const updatedUser = await user.save();
    
    // Populate department info for response
    await updatedUser.populate('department', 'name code');

    res.json({
      message: 'User updated successfully',
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        studentId: updatedUser.studentId,
        role: updatedUser.role,
        department: updatedUser.department,
        phoneNumber: updatedUser.phoneNumber,
        avatar: updatedUser.avatar,
        profileSettings: updatedUser.profileSettings,
        lastProfileUpdate: updatedUser.lastProfileUpdate
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Update user profile (comprehensive)
 * @route   PUT /api/users/:id/profile
 * @access  Private
 */
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is updating their own profile or is admin
    if (req.user._id.toString() !== user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this user profile' });
    }

    // Update all provided fields
    const allowedFields = [
      'fullName', 'dateOfBirth', 'gender', 'avatar', 'phoneNumber', 
      'address', 'emergencyContact', 'socialLinks', 'profileSettings'
    ];

    // Role-specific fields
    if (user.role === 'student') {
      allowedFields.push('studentInfo');
    }
    if (user.role === 'coordinator') {
      allowedFields.push('coordinatorInfo');
    }

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] === 'object' && req.body[field] !== null) {
          user[field] = { ...user[field], ...req.body[field] };
        } else {
          user[field] = req.body[field];
        }
      }
    });

    const updatedUser = await user.save();
    await updatedUser.populate('department', 'name code');

    res.json({
      message: 'User profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      // Prevent deletion of admin users
      if (user.role === 'admin') {
        return res.status(400).json({ message: 'Cannot delete admin user' });
      }

      await User.deleteOne({ _id: user._id });
      res.json({ message: 'User removed successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get users by role
 * @route   GET /api/users/role/:role
 * @access  Private/Admin
 */
export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    
    if (!['student', 'coordinator', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const users = await User.find({ role })
      .populate('department', 'name code')
      .select('-password');

    res.json({
      message: `${role.charAt(0).toUpperCase() + role.slice(1)}s retrieved successfully`,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc    Get users by department
 * @route   GET /api/users/department/:departmentId
 * @access  Private
 */
export const getUsersByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const users = await User.find({ department: departmentId })
      .populate('department', 'name code')
      .select('-password');

    res.json({
      message: 'Department users retrieved successfully',
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 