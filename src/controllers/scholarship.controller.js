import Scholarship from '../models/scholarship.model.js';
import Department from '../models/department.model.js';

/**
 * @desc    Lấy tất cả học bổng
 * @route   GET /api/scholarships
 * @access  Public
 */
export const getAllScholarships = async (req, res) => {
  try {
    const { department } = req.query;
    const query = {};
    
    // Lọc học bổng theo ngành nếu có
    if (department) {
      query.$or = [
        { department },
        { department: null } // Học bổng chung
      ];
    }
    
    // Chỉ lấy học bổng chưa hết hạn đăng ký
    const now = new Date();
    query.applicationDeadline = { $gt: now };
    
    const scholarships = await Scholarship.find(query)
      .populate('department', 'name code')
      .populate('createdBy', 'name role')
      .sort({ applicationDeadline: 1 });
    
    res.status(200).json({
      success: true,
      count: scholarships.length,
      data: scholarships
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách học bổng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @desc    Lấy tất cả học bổng (bao gồm cả đã hết hạn)
 * @route   GET /api/scholarships/all
 * @access  Admin, Coordinator
 */
export const getAllScholarshipsAdmin = async (req, res) => {
  try {
    const { department } = req.query;
    const query = {};
    
    // Lọc học bổng theo ngành nếu có
    if (department) {
      query.department = department;
    }
    
    // Nếu là coordinator, chỉ xem học bổng của ngành mình
    if (req.user.role === 'coordinator') {
      query.department = req.user.department;
    }
    
    const scholarships = await Scholarship.find(query)
      .populate('department', 'name code')
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: scholarships.length,
      data: scholarships
    });
  } catch (error) {
    console.error('Lỗi khi lấy tất cả học bổng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @desc    Lấy chi tiết học bổng theo ID
 * @route   GET /api/scholarships/:id
 * @access  Public
 */
export const getScholarshipById = async (req, res) => {
  try {
    const scholarship = await Scholarship.findById(req.params.id)
      .populate('department', 'name code')
      .populate('createdBy', 'name role');
    
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy học bổng'
      });
    }
    
    res.status(200).json({
      success: true,
      data: scholarship
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết học bổng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @desc    Tạo học bổng mới
 * @route   POST /api/scholarships
 * @access  Admin, Coordinator
 */
export const createScholarship = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      value,
      applicationDeadline,
      provider,
      department,
      eligibility,
      applicationProcess
    } = req.body;
    
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
            message: 'Không có quyền tạo học bổng cho ngành khác'
          });
        }
      }
    }
    
    // Tạo học bổng mới
    const scholarship = await Scholarship.create({
      title,
      description,
      requirements,
      value,
      applicationDeadline,
      provider,
      department: department || null,
      eligibility,
      applicationProcess,
      createdBy: req.user._id
    });
    
    res.status(201).json({
      success: true,
      message: 'Đã tạo học bổng mới',
      data: scholarship
    });
  } catch (error) {
    console.error('Lỗi khi tạo học bổng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @desc    Cập nhật học bổng
 * @route   PUT /api/scholarships/:id
 * @access  Admin, Coordinator
 */
export const updateScholarship = async (req, res) => {
  try {
    const {
      title,
      description,
      requirements,
      value,
      applicationDeadline,
      provider,
      department,
      eligibility,
      applicationProcess
    } = req.body;
    
    // Tìm học bổng
    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy học bổng'
      });
    }
    
    // Kiểm tra quyền
    if (req.user.role === 'coordinator') {
      // Nếu học bổng có department
      if (scholarship.department) {
        const userDepartment = req.user.department ? req.user.department.toString() : null;
        const scholarshipDepartment = scholarship.department.toString();
        
        // Nếu không phải department của người dùng
        if (userDepartment !== scholarshipDepartment) {
          return res.status(403).json({
            success: false,
            message: 'Không có quyền cập nhật học bổng của ngành khác'
          });
        }
      }
      // Nếu là học bổng chung, chỉ admin mới được cập nhật
      else if (!scholarship.department) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền cập nhật học bổng chung, chỉ Admin mới có quyền'
        });
      }
      
      // Không được thay đổi department
      if (department && scholarship.department && department !== scholarship.department.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền thay đổi ngành của học bổng'
        });
      }
    }
    
    // Cập nhật học bổng
    scholarship.title = title || scholarship.title;
    scholarship.description = description || scholarship.description;
    scholarship.requirements = requirements || scholarship.requirements;
    scholarship.value = value || scholarship.value;
    if (applicationDeadline) scholarship.applicationDeadline = applicationDeadline;
    scholarship.provider = provider || scholarship.provider;
    scholarship.eligibility = eligibility || scholarship.eligibility;
    scholarship.applicationProcess = applicationProcess || scholarship.applicationProcess;
    
    // Chỉ admin mới có quyền thay đổi department
    if (req.user.role === 'admin' && department !== undefined) {
      scholarship.department = department || null;
    }
    
    await scholarship.save();
    
    res.status(200).json({
      success: true,
      message: 'Đã cập nhật học bổng',
      data: scholarship
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật học bổng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @desc    Xóa học bổng
 * @route   DELETE /api/scholarships/:id
 * @access  Admin, Coordinator
 */
export const deleteScholarship = async (req, res) => {
  try {
    // Tìm học bổng
    const scholarship = await Scholarship.findById(req.params.id);
    if (!scholarship) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy học bổng'
      });
    }
    
    // Kiểm tra quyền
    if (req.user.role === 'coordinator') {
      // Coordinator chỉ được xóa học bổng của ngành mình
      if (scholarship.department) {
        const userDepartment = req.user.department ? req.user.department.toString() : null;
        const scholarshipDepartment = scholarship.department.toString();
        
        if (userDepartment !== scholarshipDepartment) {
          return res.status(403).json({
            success: false,
            message: 'Không có quyền xóa học bổng của ngành khác'
          });
        }
      }
      // Không được xóa học bổng chung
      else if (!scholarship.department) {
        return res.status(403).json({
          success: false,
          message: 'Không có quyền xóa học bổng chung, chỉ Admin mới có quyền'
        });
      }
    }
    
    // Xóa học bổng
    await scholarship.remove();
    
    res.status(200).json({
      success: true,
      message: 'Đã xóa học bổng'
    });
  } catch (error) {
    console.error('Lỗi khi xóa học bổng:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
}; 