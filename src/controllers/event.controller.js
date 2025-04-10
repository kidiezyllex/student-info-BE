import Event from '../models/event.model.js';
import Department from '../models/department.model.js';

/**
 * @desc    Lấy tất cả sự kiện
 * @route   GET /api/events
 * @access  Public
 */
export const getAllEvents = async (req, res) => {
  try {
    const { department } = req.query;
    const query = {};
    
    // Lọc sự kiện theo ngành nếu có
    if (department) {
      query.$or = [
        { department },
        { department: null } // Sự kiện chung
      ];
    }
    
    // Chỉ lấy sự kiện chưa diễn ra hoặc đang diễn ra
    const now = new Date();
    query.endDate = { $gt: now };
    
    const events = await Event.find(query)
      .populate('department', 'name code')
      .populate('createdBy', 'name role')
      .sort({ startDate: 1 });
    
    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách sự kiện:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @desc    Lấy tất cả sự kiện (bao gồm cả đã kết thúc)
 * @route   GET /api/events/all
 * @access  Admin, Coordinator
 */
export const getAllEventsAdmin = async (req, res) => {
  try {
    const { department } = req.query;
    const query = {};
    
    // Lọc sự kiện theo ngành nếu có
    if (department) {
      query.department = department;
    }
    
    // Nếu là coordinator, chỉ xem sự kiện của ngành mình
    if (req.user.role === 'coordinator') {
      query.department = req.user.department;
    }
    
    const events = await Event.find(query)
      .populate('department', 'name code')
      .populate('createdBy', 'name role')
      .sort({ startDate: -1 });
    
    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    console.error('Lỗi khi lấy tất cả sự kiện:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @desc    Lấy chi tiết sự kiện theo ID
 * @route   GET /api/events/:id
 * @access  Public
 */
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('department', 'name code')
      .populate('createdBy', 'name role');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sự kiện'
      });
    }
    
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết sự kiện:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @desc    Tạo sự kiện mới
 * @route   POST /api/events
 * @access  Admin, Coordinator
 */
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      location,
      department,
      organizer
    } = req.body;
    
    // Kiểm tra ngày bắt đầu và kết thúc
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Ngày kết thúc phải sau ngày bắt đầu'
      });
    }
    
    // Kiểm tra department nếu được cung cấp
    if (department) {
      const existingDepartment = await Department.findById(department);
      if (!existingDepartment) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy ngành'
        });
      }
      
      // Nếu là coordinator, kiểm tra quyền
      if (req.user.role === 'coordinator') {
        const userDepartment = req.user.department ? req.user.department.toString() : null;
        if (userDepartment !== department) {
          return res.status(403).json({
            success: false,
            message: 'Không có quyền tạo sự kiện cho ngành khác'
          });
        }
      }
    }
    
    // Tạo sự kiện mới
    const event = await Event.create({
      title,
      description,
      startDate,
      endDate,
      location,
      department: department || null,
      organizer,
      createdBy: req.user._id
    });
    
    res.status(201).json({
      success: true,
      message: 'Đã tạo sự kiện mới',
      data: event
    });
  } catch (error) {
    console.error('Lỗi khi tạo sự kiện:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @desc    Cập nhật sự kiện
 * @route   PUT /api/events/:id
 * @access  Admin, Coordinator
 */
export const updateEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      location,
      department,
      organizer
    } = req.body;
    
    // Tìm sự kiện
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sự kiện'
      });
    }
    
    // Kiểm tra quyền
    if (req.user.role === 'coordinator') {
      // Nếu sự kiện có department
      if (event.department) {
        const userDepartment = req.user.department ? req.user.department.toString() : null;
        const eventDepartment = event.department.toString();
        
        // Nếu không phải department của người dùng
        if (userDepartment !== eventDepartment) {
          return res.status(403).json({
            success: false,
            message: 'Không có quyền cập nhật sự kiện của ngành khác'
          });
        }
      }
      // Nếu là sự kiện chung, chỉ admin mới được cập nhật
      else if (!event.department) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền cập nhật sự kiện chung, chỉ Admin mới có quyền'
        });
      }
      
      // Không được thay đổi department
      if (department && event.department && department !== event.department.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền thay đổi ngành của sự kiện'
        });
      }
    }
    
    // Kiểm tra ngày bắt đầu và kết thúc
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'Ngày kết thúc phải sau ngày bắt đầu'
      });
    }
    
    // Cập nhật sự kiện
    event.title = title || event.title;
    event.description = description || event.description;
    if (startDate) event.startDate = startDate;
    if (endDate) event.endDate = endDate;
    event.location = location || event.location;
    event.organizer = organizer || event.organizer;
    
    // Chỉ admin mới có quyền thay đổi department
    if (req.user.role === 'admin' && department !== undefined) {
      event.department = department || null;
    }
    
    await event.save();
    
    res.status(200).json({
      success: true,
      message: 'Đã cập nhật sự kiện',
      data: event
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật sự kiện:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @desc    Xóa sự kiện
 * @route   DELETE /api/events/:id
 * @access  Admin, Coordinator
 */
export const deleteEvent = async (req, res) => {
  try {
    // Tìm sự kiện
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sự kiện'
      });
    }
    
    // Kiểm tra quyền
    if (req.user.role === 'coordinator') {
      // Coordinator chỉ được xóa sự kiện của ngành mình
      if (event.department) {
        const userDepartment = req.user.department ? req.user.department.toString() : null;
        const eventDepartment = event.department.toString();
        
        if (userDepartment !== eventDepartment) {
          return res.status(403).json({
            success: false,
            message: 'Không có quyền xóa sự kiện của ngành khác'
          });
        }
      }
      // Không được xóa sự kiện chung
      else if (!event.department) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền xóa sự kiện chung, chỉ Admin mới có quyền'
        });
      }
    }
    
    // Xóa sự kiện
    await event.remove();
    
    res.status(200).json({
      success: true,
      message: 'Đã xóa sự kiện'
    });
  } catch (error) {
    console.error('Lỗi khi xóa sự kiện:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
}; 