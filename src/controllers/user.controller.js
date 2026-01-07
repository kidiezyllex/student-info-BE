import User from '../models/user.model.js';
import Department from '../models/department.model.js';

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { role, department } = req.query;

    const filter = {};
    if (role) {
      if (!['student', 'coordinator', 'admin'].includes(role)) {
        return res.status(400).json({
          message: 'Invalid role specified. Allowed values: student, coordinator, admin'
        });
      }
      filter.role = role;
    }
    if (department) {
      filter.department = department;
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .populate('department', 'name code')
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.json({
      message: 'Users retrieved successfully',
      data: users,
      total,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/**
 * @desc    Create new user
 * @route   POST /api/users
 * @access  Private/Admin
 */
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, studentId, fullName, department, phoneNumber, avatar } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user data
    const userData = {
      name,
      email,
      password,
      role: role || 'student'
    };

    // Add optional fields if provided
    if (studentId) userData.studentId = studentId;
    if (fullName) userData.fullName = fullName;
    if (department) userData.department = department;
    if (phoneNumber) userData.phoneNumber = phoneNumber;
    if (avatar) userData.avatar = avatar;

    // Create user
    const user = await User.create(userData);

    if (user) {
      // If user is a coordinator with a department, update department.coordinator
      if (user.role === 'coordinator' && user.department) {
        await Department.findByIdAndUpdate(
          user.department,
          { coordinator: user._id },
          { new: true }
        );
      }

      // Populate department info
      await user.populate('department', 'name code');

      res.status(201).json({
        message: 'User created successfully',
        data: {
          _id: user._id,
          name: user.name,
          fullName: user.fullName,
          email: user.email,
          studentId: user.studentId,
          role: user.role,
          department: user.department,
          avatar: user.avatar,
          phoneNumber: user.phoneNumber
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
 * @desc    Get user by ID
 * @route   GET /api/users/:id
 * @access  Private
 */
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('department', 'name code description')
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
 * @access  Private (Users can update their own profile, Admins can update any user)
 */
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Authorization check: Users can update their own profile, Admins can update any user
    const isOwnProfile = req.user._id.toString() === user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }

    // ===== Fields that any user can update for their own profile =====
    
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

    // ===== Admin-only fields =====
    // Store old values for department coordinator update
    const oldDepartment = user.department;
    const oldRole = user.role;

    // Only admins can change role, department, and active status
    if (isAdmin) {
      if (req.body.role !== undefined) user.role = req.body.role;
      if (req.body.department !== undefined) {
        user.department = req.body.department;
      }
      if (req.body.active !== undefined) user.active = req.body.active;
    }

    const updatedUser = await user.save();

    // Update department coordinator references
    const roleChanged = req.user.role === 'admin' && req.body.role !== undefined && req.body.role !== oldRole;
    const departmentChanged = req.user.role === 'admin' && req.body.department !== undefined && req.body.department?.toString() !== oldDepartment?.toString();

    // If user was coordinator and role changed to non-coordinator, remove from old department
    if (oldRole === 'coordinator' && roleChanged && updatedUser.role !== 'coordinator' && oldDepartment) {
      await Department.findByIdAndUpdate(
        oldDepartment,
        { $unset: { coordinator: '' } }
      );
    }

    // If department changed and user was coordinator, remove from old department
    if (oldRole === 'coordinator' && departmentChanged && oldDepartment) {
      await Department.findByIdAndUpdate(
        oldDepartment,
        { $unset: { coordinator: '' } }
      );
    }

    // If user is coordinator (either was already or just became one), sync with department
    if (updatedUser.role === 'coordinator' && updatedUser.department) {
      await Department.findByIdAndUpdate(
        updatedUser.department,
        { coordinator: updatedUser._id }
      );
    }

    // Populate department info for response
    await updatedUser.populate('department', 'name code');

    res.json({
      status: true,
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
        active: updatedUser.active,
        profileSettings: updatedUser.profileSettings,
        lastProfileUpdate: updatedUser.lastProfileUpdate
      },
      errors: {},
      timestamp: new Date().toISOString()
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

      // If user is a coordinator, remove coordinator reference from department
      if (user.role === 'coordinator' && user.department) {
        await Department.findByIdAndUpdate(
          user.department,
          { $unset: { coordinator: '' } }
        );
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    if (!['student', 'coordinator', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const query = User.find({ role });
    const total = await User.countDocuments({ role });
    const users = await query
      .populate('department', 'name code')
      .select('-password')
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.json({
      message: `${role.charAt(0).toUpperCase() + role.slice(1)}s retrieved successfully`,
      data: users,
      total,
      page,
      limit,
      totalPages
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = User.find({ department: departmentId });
    const total = await User.countDocuments({ department: departmentId });
    const users = await query
      .populate('department', 'name code')
      .select('-password')
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.json({
      message: 'Department users retrieved successfully',
      data: users,
      total,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 