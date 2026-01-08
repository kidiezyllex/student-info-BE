import Department from '../models/department.model.js';
import User from '../models/user.model.js';
import Topic from '../models/topic.model.js';
import SupportTicket from '../models/supportTicket.model.js';

/**
 * @desc    Lấy tất cả ngành học
 * @route   GET /api/departments
 * @access  Public
 */
export const getAllDepartments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { hasCoordinator } = req.query;

    const filter = {};
    if (hasCoordinator !== undefined) {
      const hasCoordinatorBool = hasCoordinator === 'true';
      if (hasCoordinatorBool) {
        filter.coordinator = { $exists: true, $ne: null };
      } else {
        filter.$or = [
          { coordinator: { $exists: false } },
          { coordinator: null }
        ];
      }
    }

    const total = await Department.countDocuments(filter);
    const departments = await Department.find(filter)
      .populate('coordinator', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalPages = Math.ceil(total / limit);
    
    res.status(200).json({
      success: true,
      data: departments,
      total,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    console.error('Error getting departments list:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Lấy ngành học theo ID
 * @route   GET /api/departments/:id
 * @access  Public
 */
export const getDepartmentById = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('coordinator', 'name email');
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: department
    });
  } catch (error) {
    console.error('Error getting department by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Tạo ngành học mới
 * @route   POST /api/departments
 * @access  Admin
 */
export const createDepartment = async (req, res) => {
  try {
    const { name, code, description, coordinatorId } = req.body;
    
    // Kiểm tra trùng lặp
    const existingDepartment = await Department.findOne({ 
      $or: [{ name }, { code }] 
    });
    
    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message: 'Department name or code already exists'
      });
    }
    
    // Kiểm tra coordinator tồn tại nếu được cung cấp
    if (coordinatorId) {
      const user = await User.findById(coordinatorId);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Coordinator not found'
        });
      }
      
      // Cập nhật vai trò của người dùng thành coordinator nếu chưa phải
      if (user.role !== 'coordinator') {
        user.role = 'coordinator';
        user.department = null; // Xóa department hiện tại nếu có
        await user.save();
      }
    }
    
    const newDepartment = await Department.create({
      name,
      code,
      description,
      coordinator: coordinatorId || null
    });
    
    // Nếu có coordinator, cập nhật department cho coordinator
    if (coordinatorId) {
      await User.findByIdAndUpdate(coordinatorId, {
        department: newDepartment._id
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'New department created',
      data: newDepartment
    });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Cập nhật thông tin ngành học
 * @route   PUT /api/departments/:id
 * @access  Admin
 */
export const updateDepartment = async (req, res) => {
  try {
    const { name, code, description, coordinatorId } = req.body;
    
    // Tìm ngành cần cập nhật
    const department = await Department.findById(req.params.id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    // Kiểm tra trùng lặp
    if (name && name !== department.name) {
      const existingDepartment = await Department.findOne({ name });
      if (existingDepartment) {
        return res.status(400).json({
          success: false,
          message: 'Department name already exists'
        });
      }
    }
    
    if (code && code !== department.code) {
      const existingDepartment = await Department.findOne({ code });
      if (existingDepartment) {
        return res.status(400).json({
          success: false,
          message: 'Department code already exists'
        });
      }
    }
    
    // Kiểm tra coordinator mới nếu có thay đổi
    let oldCoordinatorId = department.coordinator ? department.coordinator.toString() : null;
    
    if (coordinatorId !== undefined && coordinatorId !== oldCoordinatorId) {
      // Nếu có coordinator mới
      if (coordinatorId) {
        const user = await User.findById(coordinatorId);
        if (!user) {
          return res.status(400).json({
            success: false,
            message: 'Coordinator not found'
          });
        }
        
        // Cập nhật vai trò người dùng mới thành coordinator
        if (user.role !== 'coordinator') {
          user.role = 'coordinator';
        }
        user.department = department._id;
        await user.save();
      }
      
      // Cập nhật người phụ trách cũ (nếu có)
      if (oldCoordinatorId) {
        const oldCoordinator = await User.findById(oldCoordinatorId);
        if (oldCoordinator) {
          oldCoordinator.department = null;
          await oldCoordinator.save();
        }
      }
    }
    
    // Cập nhật thông tin ngành
    department.name = name || department.name;
    department.code = code || department.code;
    department.description = description || department.description;
    
    // Chỉ cập nhật coordinator nếu được cung cấp
    if (coordinatorId !== undefined) {
      department.coordinator = coordinatorId || null;
    }
    
    await department.save();
    
    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department
    });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Xóa ngành học
 * @route   DELETE /api/departments/:id
 * @access  Admin
 */
export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);
    
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }
    
    // Xóa tham chiếu đến ngành này từ coordinator (nếu có)
    if (department.coordinator) {
      await User.findByIdAndUpdate(department.coordinator, {
        department: null
      });
    }
    
    // Xóa tham chiếu đến ngành từ tất cả sinh viên
    await User.updateMany(
      { department: department._id },
      { department: null }
    );
    
    await Department.deleteOne({ _id: req.params.id });
    
    res.status(200).json({
      success: true,
      message: 'Department deleted'
    });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get coordinator dashboard statistics
 * @route   GET /api/departments/:id/stats
 * @access  Private (Coordinator/Admin)
 */
export const getCoordinatorStats = async (req, res) => {
  try {
    const departmentId = req.params.id;
    
    // Verify department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        status: false,
        message: 'Department not found'
      });
    }

    // Check authorization - only coordinator of this department or admin
    const isCoordinatorOfDept = req.user.role === 'coordinator' && 
                                 req.user.department?.toString() === departmentId;
    const isAdmin = req.user.role === 'admin';

    if (!isCoordinatorOfDept && !isAdmin) {
      return res.status(403).json({
        status: false,
        message: 'Not authorized to view this department statistics'
      });
    }

    // 1. Count active topics in this department
    const activeTopicsCount = await Topic.countDocuments({
      department: departmentId,
      status: 'active'
    });

    // 2. Count students in this department
    const studentsCount = await User.countDocuments({
      department: departmentId,
      role: 'student',
      active: true
    });

    // 3. Count pending tickets (open + in_progress)
    const pendingTicketsCount = await SupportTicket.countDocuments({
      department: departmentId,
      status: { $in: ['open', 'in_progress'] }
    });

    // 4. Count resolved tickets
    const resolvedTicketsCount = await SupportTicket.countDocuments({
      department: departmentId,
      status: 'resolved'
    });

    // 5. Get total tickets count
    const totalTicketsCount = await SupportTicket.countDocuments({
      department: departmentId
    });

    // 6. Get recent tickets (last 5)
    const recentTickets = await SupportTicket.find({
      department: departmentId
    })
      .populate('student', 'name email studentId')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('subject status priority category createdAt');

    // 7. Get tickets by priority
    const ticketsByPriority = await SupportTicket.aggregate([
      { $match: { department: department._id } },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // 8. Get tickets by category
    const ticketsByCategory = await SupportTicket.aggregate([
      { $match: { department: department._id } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      status: true,
      message: 'Department statistics retrieved successfully',
      data: {
        department: {
          _id: department._id,
          name: department.name,
          code: department.code
        },
        activeTopics: activeTopicsCount,
        studentsCount: studentsCount,
        tickets: {
          total: totalTicketsCount,
          pending: pendingTicketsCount,
          resolved: resolvedTicketsCount,
          closed: totalTicketsCount - pendingTicketsCount - resolvedTicketsCount,
          byPriority: ticketsByPriority,
          byCategory: ticketsByCategory,
          recent: recentTickets
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error getting coordinator stats:', error);
    res.status(500).json({
      status: false,
      message: 'Server error',
      error: error.message
    });
  }
};
 