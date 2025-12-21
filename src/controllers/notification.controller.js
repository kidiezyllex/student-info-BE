import Notification from '../models/notification.model.js';
import Department from '../models/department.model.js';
import User from '../models/user.model.js';

/**
 * @desc    Lấy tất cả thông báo
 * @route   GET /api/notifications
 * @access  Public
 */
export const getAllNotifications = async (req, res) => {
  try {
    const { type, department } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const query = {};
    
    // Lọc thông báo theo type nếu có
    if (type) query.type = type;
    
    // Lọc thông báo theo ngành nếu có
    if (department) {
      query.$or = [
        { department },
        { department: null } // Thông báo chung
      ];
    }
    
    // Chỉ lấy thông báo chưa hết hạn
    const now = new Date();
    query.$or = query.$or || [];
    query.$or.push(
      { endDate: { $exists: false } },
      { endDate: null },
      { endDate: { $gt: now } }
    );
    
    const total = await Notification.countDocuments(query);
    const notifications = await Notification.find(query)
      .populate('department', 'name code')
      .populate('createdBy', 'name role')
      .sort({ isImportant: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalPages = Math.ceil(total / limit);
    
    res.status(200).json({
      success: true,
      data: notifications,
      total,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    console.error('Error getting notifications list:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Lấy thông báo theo ID
 * @route   GET /api/notifications/:id
 * @access  Public
 */
export const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('department', 'name code')
      .populate('createdBy', 'name role');
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error getting notification by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Tạo thông báo mới
 * @route   POST /api/notifications
 * @access  Admin, Coordinator
 */
export const createNotification = async (req, res) => {
  try {
    const { title, content, type, department, startDate, endDate, isImportant } = req.body;
    
    // Kiểm tra department nếu được cung cấp
    if (department) {
      const existingDepartment = await Department.findById(department);
      if (!existingDepartment) {
        return res.status(400).json({
          success: false,
          message: 'Department not found'
        });
      }
      
      // Nếu là coordinator, kiểm tra quyền
      if (req.user.role === 'coordinator') {
        const userDepartment = req.user.department ? req.user.department.toString() : null;
        if (userDepartment !== department) {
          return res.status(403).json({
            success: false,
            message: 'No permission to create notifications for other departments'
          });
        }
      }
    }
    
    // Tạo thông báo mới
    const notification = await Notification.create({
      title,
      content,
      type: type || 'general',
      department: department || null,
      startDate: startDate || new Date(),
      endDate: endDate || null,
      isImportant: isImportant || false,
      createdBy: req.user._id
    });
    
    res.status(201).json({
      success: true,
      message: 'New notification created',
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Cập nhật thông báo
 * @route   PUT /api/notifications/:id
 * @access  Admin, Coordinator
 */
export const updateNotification = async (req, res) => {
  try {
    const { title, content, type, department, startDate, endDate, isImportant } = req.body;
    
    // Tìm thông báo
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Kiểm tra quyền
    if (req.user.role === 'coordinator') {
      // Nếu thông báo có department
      if (notification.department) {
        const userDepartment = req.user.department ? req.user.department.toString() : null;
        const notificationDepartment = notification.department.toString();
        
        // Nếu không phải department của người dùng
        if (userDepartment !== notificationDepartment) {
          return res.status(403).json({
            success: false,
            message: 'No permission to update notifications from other departments'
          });
        }
      }
      // Nếu là thông báo chung, chỉ admin mới được cập nhật
      else if (!notification.department) {
        return res.status(403).json({
          success: false,
          message: 'No permission to update general notifications, only Admin has permission'
        });
      }
      
      // Không được thay đổi department
      if (department && notification.department && department !== notification.department.toString()) {
        return res.status(403).json({
          success: false,
            message: 'No permission to change the department of the notification'
        });
      }
    }
    
    // Cập nhật thông báo
    notification.title = title || notification.title;
    notification.content = content || notification.content;
    notification.type = type || notification.type;
    notification.startDate = startDate || notification.startDate;
    notification.endDate = endDate !== undefined ? endDate : notification.endDate;
    notification.isImportant = isImportant !== undefined ? isImportant : notification.isImportant;
    
    // Chỉ admin mới có quyền thay đổi department
    if (req.user.role === 'admin' && department !== undefined) {
      notification.department = department || null;
    }
    
    await notification.save();
    
    res.status(200).json({
      success: true,
      message: 'Notification updated',
      data: notification
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Xóa thông báo
 * @route   DELETE /api/notifications/:id
 * @access  Admin, Coordinator
 */
export const deleteNotification = async (req, res) => {
  try {
    // Tìm thông báo
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Kiểm tra quyền
    if (req.user.role === 'coordinator') {
      // Coordinator chỉ được xóa thông báo của ngành mình
      if (notification.department) {
        const userDepartment = req.user.department ? req.user.department.toString() : null;
        const notificationDepartment = notification.department.toString();
        
        if (userDepartment !== notificationDepartment) {
          return res.status(403).json({
            success: false,
            message: 'No permission to delete notifications from other departments'
          });
        }
      }
      // Không được xóa thông báo chung
      else if (!notification.department) {
        return res.status(403).json({
          success: false,
          message: 'No permission to delete general notifications, only Admin has permission'
        });
      }
    }
    
    await Notification.deleteOne({ _id: req.params.id });
    
    // Xóa thông báo khỏi danh sách đã lưu của người dùng
    await User.updateMany(
      { savedNotifications: notification._id },
      { $pull: { savedNotifications: notification._id } }
    );
    
    res.status(200).json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Lưu thông báo vào danh sách yêu thích
 * @route   PUT /api/notifications/:id/save
 * @access  Đã đăng nhập
 */
export const saveNotification = async (req, res) => {
  try {
    // Kiểm tra thông báo tồn tại
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Thêm vào danh sách đã lưu nếu chưa có
    const user = await User.findById(req.user._id);
    if (!user.savedNotifications.includes(notification._id)) {
      user.savedNotifications.push(notification._id);
      await user.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Notification saved to favorites'
    });
  } catch (error) {
    console.error('Error saving notification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Xóa thông báo khỏi danh sách yêu thích
 * @route   PUT /api/notifications/:id/unsave
 * @access  Đã đăng nhập
 */
export const unsaveNotification = async (req, res) => {
  try {
    // Kiểm tra thông báo tồn tại
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Xóa khỏi danh sách đã lưu
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { savedNotifications: notification._id }
    });
    
    res.status(200).json({
      success: true,
      message: 'Notification removed from favorites'
    });
  } catch (error) {
    console.error('Error removing notification from favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Lấy danh sách thông báo đã lưu
 * @route   GET /api/notifications/saved
 * @access  Đã đăng nhập
 */
export const getSavedNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user._id)
      .populate({
        path: 'savedNotifications',
        populate: [
          { path: 'department', select: 'name code' },
          { path: 'createdBy', select: 'name role' }
        ]
      });
    
    const total = user.savedNotifications.length;
    const savedNotifications = user.savedNotifications.slice(skip, skip + limit);
    const totalPages = Math.ceil(total / limit);
    
    res.status(200).json({
      success: true,
      data: savedNotifications,
      total,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    console.error('Error getting saved notifications list:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 