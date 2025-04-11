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
        message: 'Danh sách danh mục không hợp lệ',
        errors: { categories: 'Phải là một mảng' }
      });
    }
    
    const result = await trainAI(categories, departmentId, userId);
    
    res.status(200).json({
      success: true,
      message: 'Đã hoàn thành quá trình training AI',
      data: result.data
    });
  } catch (error) {
    console.error('Lỗi khi training AI:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi training AI',
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
    const trainings = await AITraining.find()
      .populate('createdBy', 'name email')
      .populate('department', 'name code')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: trainings.length,
      data: trainings
    });
  } catch (error) {
    console.error('Lỗi khi lấy lịch sử training:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

export default {
  trainingAI,
  getTrainingHistory
}; 