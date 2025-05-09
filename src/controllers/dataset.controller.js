import Dataset from '../models/dataset.model.js';
import Department from '../models/department.model.js';

/**
 * @desc    Lấy tất cả dữ liệu trong dataset
 * @route   GET /api/dataset
 * @access  Admin, Coordinator
 */
export const getAllDataset = async (req, res) => {
  try {
    const { category, department } = req.query;
    const query = {};
    
    if (category) query.category = category;
    if (department) query.department = department;
    
    const datasets = await Dataset.find(query)
      .populate('department', 'name code')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: datasets.length,
      data: datasets
    });
  } catch (error) {
    console.error('Lỗi khi lấy dataset:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @desc    Lấy dữ liệu dataset theo ID
 * @route   GET /api/dataset/:id
 * @access  Admin, Coordinator
 */
export const getDatasetById = async (req, res) => {
  try {
    const dataset = await Dataset.findById(req.params.id)
      .populate('department', 'name code')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    
    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dữ liệu'
      });
    }
    
    res.status(200).json({
      success: true,
      data: dataset
    });
  } catch (error) {
    console.error('Lỗi khi lấy dataset theo ID:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @desc    Thêm dữ liệu mới vào dataset
 * @route   POST /api/dataset
 * @access  Admin, Coordinator
 */
export const createDataset = async (req, res) => {
  try {
    const { key, value, category, department } = req.body;
    
    // Kiểm tra key đã tồn tại chưa
    const existingData = await Dataset.findOne({ key });
    if (existingData) {
      return res.status(400).json({
        success: false,
        message: 'Key đã tồn tại trong dataset'
      });
    }
    
    // Kiểm tra department có tồn tại không
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
            message: 'Bạn không có quyền thêm dữ liệu cho ngành khác'
          });
        }
      }
    }
    
    const newData = await Dataset.create({
      key,
      value,
      category,
      department: department || null,
      createdBy: req.user._id,
      updatedBy: req.user._id
    });
    
    res.status(201).json({
      success: true,
      message: 'Đã thêm dữ liệu mới',
      data: newData
    });
  } catch (error) {
    console.error('Lỗi khi thêm dataset:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @desc    Cập nhật dữ liệu trong dataset
 * @route   PUT /api/dataset/:id
 * @access  Admin, Coordinator
 */
export const updateDataset = async (req, res) => {
  try {
    const { key, value, category, department } = req.body;
    
    // Tìm dataset cần cập nhật
    const dataset = await Dataset.findById(req.params.id);
    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dữ liệu'
      });
    }
    
    // Kiểm tra quyền cập nhật
    if (req.user.role === 'coordinator') {
      // Nếu là coordinator, chỉ được cập nhật dữ liệu của ngành mình
      const userDepartment = req.user.department ? req.user.department.toString() : null;
      const datasetDepartment = dataset.department ? dataset.department.toString() : null;
      
      if (datasetDepartment && userDepartment !== datasetDepartment) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền cập nhật dữ liệu của ngành khác'
        });
      }
      
      // Không được thay đổi department
      if (department && department !== datasetDepartment) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền thay đổi ngành của dữ liệu'
        });
      }
    }
    
    // Cập nhật dữ liệu
    dataset.key = key || dataset.key;
    dataset.value = value || dataset.value;
    dataset.category = category || dataset.category;
    dataset.updatedBy = req.user._id;
    
    // Chỉ admin mới có quyền thay đổi department
    if (req.user.role === 'admin' && department !== undefined) {
      dataset.department = department || null;
    }
    
    await dataset.save();
    
    res.status(200).json({
      success: true,
      message: 'Cập nhật dữ liệu thành công',
      data: dataset
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật dataset:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @desc    Xóa dữ liệu khỏi dataset
 * @route   DELETE /api/dataset/:id
 * @access  Admin, Coordinator
 */
export const deleteDataset = async (req, res) => {
  try {
    // Tìm dataset cần xóa
    const dataset = await Dataset.findById(req.params.id);
    if (!dataset) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy dữ liệu'
      });
    }
    
    // Kiểm tra quyền xóa
    if (req.user.role === 'coordinator') {
      // Nếu là coordinator, chỉ được xóa dữ liệu của ngành mình
      const userDepartment = req.user.department ? req.user.department.toString() : null;
      const datasetDepartment = dataset.department ? dataset.department.toString() : null;
      
      if (datasetDepartment && userDepartment !== datasetDepartment) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xóa dữ liệu của ngành khác'
        });
      }
    }
    
    await Dataset.deleteOne({ _id: req.params.id });
    
    res.status(200).json({
      success: true,
      message: 'Đã xóa dữ liệu thành công'
    });
  } catch (error) {
    console.error('Lỗi khi xóa dataset:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
}; 