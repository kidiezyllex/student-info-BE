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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const query = {};
    
    if (category) query.category = category;
    if (department) query.department = department;
    
    const total = await Dataset.countDocuments(query);
    const datasets = await Dataset.find(query)
      .populate('department', 'name code')
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalPages = Math.ceil(total / limit);
    
    res.status(200).json({
      success: true,
      data: datasets,
      total,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    console.error('Error getting dataset:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
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
        message: 'Data not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: dataset
    });
  } catch (error) {
    console.error('Error getting dataset by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
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
        message: 'Key already exists in dataset'
      });
    }
    
    // Kiểm tra department có tồn tại không
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
            message: 'You do not have permission to add data for other departments'
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
      message: 'New data added',
      data: newData
    });
  } catch (error) {
    console.error('Error adding dataset:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
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
        message: 'Data not found'
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
          message: 'You do not have permission to update data from other departments'
        });
      }
      
      // Không được thay đổi department
      if (department && department !== datasetDepartment) {
        return res.status(403).json({
          success: false,
            message: 'You do not have permission to change the department of the data'
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
      message: 'Data updated successfully',
      data: dataset
    });
  } catch (error) {
    console.error('Error updating dataset:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
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
        message: 'Data not found'
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
          message: 'You do not have permission to delete data from other departments'
        });
      }
    }
    
    await Dataset.deleteOne({ _id: req.params.id });
    
    res.status(200).json({
      success: true,
      message: 'Data deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting dataset:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 