import Department from '../models/department.model.js';
import User from '../models/user.model.js';

/**
 * @desc    Lấy tất cả ngành học
 * @route   GET /api/departments
 * @access  Public
 */
export const getAllDepartments = async (req, res) => {
  try {
    const departments = await Department.find()
      .populate('coordinator', 'name email')
      .sort({ name: 1 });
    
    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách ngành:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
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
        message: 'Không tìm thấy ngành'
      });
    }
    
    res.status(200).json({
      success: true,
      data: department
    });
  } catch (error) {
    console.error('Lỗi khi lấy ngành theo ID:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
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
        message: 'Tên ngành hoặc mã ngành đã tồn tại'
      });
    }
    
    // Kiểm tra coordinator tồn tại nếu được cung cấp
    if (coordinatorId) {
      const user = await User.findById(coordinatorId);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'Không tìm thấy người phụ trách'
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
      message: 'Đã tạo ngành mới',
      data: newDepartment
    });
  } catch (error) {
    console.error('Lỗi khi tạo ngành:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
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
        message: 'Không tìm thấy ngành'
      });
    }
    
    // Kiểm tra trùng lặp
    if (name && name !== department.name) {
      const existingDepartment = await Department.findOne({ name });
      if (existingDepartment) {
        return res.status(400).json({
          success: false,
          message: 'Tên ngành đã tồn tại'
        });
      }
    }
    
    if (code && code !== department.code) {
      const existingDepartment = await Department.findOne({ code });
      if (existingDepartment) {
        return res.status(400).json({
          success: false,
          message: 'Mã ngành đã tồn tại'
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
            message: 'Không tìm thấy người phụ trách'
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
      message: 'Cập nhật ngành thành công',
      data: department
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật ngành:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
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
        message: 'Không tìm thấy ngành'
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
      message: 'Đã xóa ngành'
    });
  } catch (error) {
    console.error('Lỗi khi xóa ngành:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
}; 