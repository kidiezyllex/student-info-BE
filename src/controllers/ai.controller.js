import { trainAI } from '../services/ai.service.js';
import AITraining from '../models/aiTraining.model.js';

/**
 * @desc    Training AI từ dataset
 * @route   POST /api/ai/train
 * @access  Admin, Coordinator
 */
export const trainingAI = async (req, res) => {
  try {
    const { categories, departmentId } = req.body;
    const userId = req.user._id;
    
    // Validate đầu vào
    if (categories && !Array.isArray(categories)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid categories list',
        errors: { categories: 'Must be an array' }
      });
    }
    
    // Kiểm tra quyền truy cập theo ngành
    if (req.user.role === 'coordinator') {
      const userDepartment = req.user.department ? req.user.department.toString() : null;
      
      // Nếu không có departmentId, sử dụng department của coordinator
      if (!departmentId) {
        // Sử dụng department của coordinator
        req.body.departmentId = userDepartment;
      } 
      // Nếu departmentId được chỉ định, kiểm tra quyền truy cập
      else if (departmentId !== userDepartment) {
        return res.status(403).json({
          success: false,
          message: 'No permission to train AI for other departments'
        });
      }
    }
    
    const result = await trainAI(categories, req.body.departmentId || departmentId, userId);
    
    res.status(200).json({
      success: true,
      message: 'AI training process completed',
      data: result.data
    });
  } catch (error) {
    console.error('Lỗi khi training AI:', error);
    res.status(500).json({
      success: false,
      message: 'Error during AI training',
      error: error.message
    });
  }
};

/**
 * @desc    Lấy danh sách các lần training
 * @route   GET /api/ai/training-history
 * @access  Admin, Coordinator
 */
export const getTrainingHistory = async (req, res) => {
  try {
    let query = {};
    
    // Nếu là coordinator, chỉ xem lịch sử training của ngành mình
    if (req.user.role === 'coordinator') {
      query.department = req.user.department;
    }
    
    const trainings = await AITraining.find(query)
      .populate('createdBy', 'name email')
      .populate('department', 'name code')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: trainings.length,
      data: trainings
    });
  } catch (error) {
    console.error('Error getting training history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Kiểm tra trạng thái và thông tin AI
 * @route   POST /api/ai
 * @access  Admin, Coordinator, Student
 */
export const checkAIStatus = async (req, res) => {
  try {
    // Lấy thông tin training gần nhất
    let query = {};
    if (req.user.role === 'coordinator') {
      query.department = req.user.department;
    }
    
    const latestTraining = await AITraining.findOne(query)
      .populate('createdBy', 'name')
      .populate('department', 'name code')
      .sort({ createdAt: -1 });
    
    const totalTrainings = await AITraining.countDocuments(query);
    
    res.status(200).json({
      success: true,
      message: 'AI status information',
      data: {
        status: 'active',
        totalTrainings,
        lastTraining: latestTraining ? {
          date: latestTraining.createdAt,
          categories: latestTraining.categories,
          department: latestTraining.department,
          trainedBy: latestTraining.createdBy,
          documentsCount: latestTraining.documentsCount,
          success: latestTraining.success
        } : null,
        capabilities: [
          'general_questions',
          'scholarship_info',
          'event_info',
          'department_info',
          'faq'
        ]
      }
    });
  } catch (error) {
    console.error('Error checking AI status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default {
  trainingAI,
  getTrainingHistory,
  checkAIStatus
}; 