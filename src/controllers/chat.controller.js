import { askAI } from '../services/ai.service.js';
import ChatSession from '../models/chatSession.model.js';

/**
 * @desc    Gửi câu hỏi đến AI và nhận câu trả lời
 * @route   POST /api/chat/ask
 * @access  Tất cả người dùng
 */
export const askQuestion = async (req, res) => {
  try {
    const { question, sessionId, category, departmentId } = req.body;
    
    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập câu hỏi'
      });
    }
    
    let chatSession;
    let chatHistory = [];
    
    // Nếu có sessionId, lấy session hiện có
    if (sessionId) {
      chatSession = await ChatSession.findById(sessionId);
      if (chatSession && chatSession.user.toString() === req.user._id.toString()) {
        // Lấy tối đa 5 tin nhắn gần nhất để làm context
        chatHistory = chatSession.messages.slice(-5);
      } else {
        // Nếu sessionId không hợp lệ, tạo session mới
        chatSession = new ChatSession({
          user: req.user._id,
          title: 'Cuộc trò chuyện mới'
        });
      }
    } else {
      // Tạo session mới nếu không có sessionId
      chatSession = new ChatSession({
        user: req.user._id,
        title: 'Cuộc trò chuyện mới'
      });
    }
    
    // Thêm câu hỏi của người dùng vào messages
    chatSession.messages.push({
      role: 'user',
      content: question
    });
    
    // Cập nhật lastActive
    chatSession.lastActive = Date.now();
    
    // Gọi AI để nhận câu trả lời
    const aiResponse = await askAI(question, chatHistory, category, departmentId);
    
    // Xử lý aiResponse để đảm bảo messages.content là string
    let responseContent = '';
    if (typeof aiResponse === 'string') {
      responseContent = aiResponse;
    } else if (aiResponse && typeof aiResponse.content === 'string') {
      responseContent = aiResponse.content;
    } else if (aiResponse && aiResponse.content && typeof aiResponse.content === 'object') {
      responseContent = JSON.stringify(aiResponse.content);
    } else {
      responseContent = 'Không có phản hồi từ AI.';
    }
    
    // Thêm câu trả lời của AI vào messages
    chatSession.messages.push({
      role: 'assistant',
      content: responseContent
    });
    
    // Nếu là tin nhắn đầu tiên, tạo tiêu đề từ câu hỏi
    if (chatSession.messages.length <= 2) {
      chatSession.title = question.substring(0, 50) + (question.length > 50 ? '...' : '');
    }
    
    // Lưu session
    await chatSession.save();
    
    res.status(200).json({
      success: true,
      data: {
        sessionId: chatSession._id,
        title: chatSession.title,
        question,
        answer: responseContent,
        message: aiResponse
      }
    });
  } catch (error) {
    console.error('Lỗi khi xử lý câu hỏi:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @desc    Lấy lịch sử chat của người dùng
 * @route   GET /api/chat/history
 * @access  Tất cả người dùng
 */
export const getChatHistory = async (req, res) => {
  try {
    const chatSessions = await ChatSession.find({ user: req.user._id })
      .select('title lastActive createdAt')
      .sort({ lastActive: -1 });
    
    res.status(200).json({
      success: true,
      count: chatSessions.length,
      data: chatSessions
    });
  } catch (error) {
    console.error('Lỗi khi lấy lịch sử chat:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @desc    Lấy chi tiết một phiên chat
 * @route   GET /api/chat/session/:id
 * @access  Tất cả người dùng
 */
export const getChatSession = async (req, res) => {
  try {
    const chatSession = await ChatSession.findById(req.params.id);
    
    if (!chatSession) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phiên chat'
      });
    }
    
    // Kiểm tra xem phiên chat có thuộc về người dùng không
    if (chatSession.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập phiên chat này'
      });
    }
    
    res.status(200).json({
      success: true,
      data: chatSession
    });
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết phiên chat:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @desc    Đánh giá câu trả lời của AI
 * @route   PUT /api/chat/rate
 * @access  Tất cả người dùng
 */
export const rateAnswer = async (req, res) => {
  try {
    const { sessionId, messageIndex, isAccurate } = req.body;
    
    if (!sessionId || messageIndex === undefined || isAccurate === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin đánh giá'
      });
    }
    
    const chatSession = await ChatSession.findById(sessionId);
    
    if (!chatSession) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phiên chat'
      });
    }
    
    // Kiểm tra xem phiên chat có thuộc về người dùng không
    if (chatSession.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền đánh giá phiên chat này'
      });
    }
    
    // Kiểm tra index hợp lệ và là tin nhắn của assistant
    if (messageIndex < 0 || messageIndex >= chatSession.messages.length || 
        chatSession.messages[messageIndex].role !== 'assistant') {
      return res.status(400).json({
        success: false,
        message: 'Index tin nhắn không hợp lệ'
      });
    }
    
    // Cập nhật đánh giá
    chatSession.messages[messageIndex].isAccurate = isAccurate;
    await chatSession.save();
    
    res.status(200).json({
      success: true,
      message: 'Đã cập nhật đánh giá'
    });
  } catch (error) {
    console.error('Lỗi khi đánh giá câu trả lời:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * @desc    Xóa một phiên chat
 * @route   DELETE /api/chat/session/:id
 * @access  Tất cả người dùng
 */
export const deleteChatSession = async (req, res) => {
  try {
    const chatSession = await ChatSession.findById(req.params.id);
    
    if (!chatSession) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phiên chat'
      });
    }
    
    // Kiểm tra xem phiên chat có thuộc về người dùng không
    if (chatSession.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa phiên chat này'
      });
    }
    
    await ChatSession.deleteOne({ _id: req.params.id });
    
    res.status(200).json({
      success: true,
      message: 'Đã xóa phiên chat'
    });
  } catch (error) {
    console.error('Lỗi khi xóa phiên chat:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
}; 