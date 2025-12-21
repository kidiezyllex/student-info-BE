/**
 * @desc    Kiểm tra trạng thái và thông tin AI (RAG-based)
 * @route   POST /api/ai
 * @access  Admin, Coordinator, Student
 */
export const checkAIStatus = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'AI status information',
      data: {
        status: 'active',
        method: 'RAG (Retrieval Augmented Generation)',
        description: 'AI sử dụng RAG để tra cứu thông tin từ database Topics trong thời gian thực',
        model: 'Groq Llama 3.1 70B Versatile',
        capabilities: [
          'topic_search',
          'scholarship_info',
          'event_info',
          'job_opportunities',
          'internship_info',
          'notification_info',
          'department_specific_queries',
          'real_time_data_retrieval'
        ],
        features: [
          'Không cần training - dữ liệu được lấy trực tiếp từ database',
          'Tìm kiếm thông minh với MongoDB text search',
          'Hỗ trợ filter theo type, department, date',
          'Trả lời chính xác dựa trên dữ liệu thực tế'
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
  checkAIStatus
}; 