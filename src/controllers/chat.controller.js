import { askWithRAG, searchTopicsAdvanced } from '../services/groqRAG.service.js';
import ChatSession from '../models/chatSession.model.js';

/**
 * @desc    Gửi câu hỏi đến AI và nhận câu trả lời (sử dụng Groq RAG)
 * @route   POST /api/chat/ask
 * @access  Tất cả người dùng
 */
export const askQuestion = async (req, res) => {
  try {
    const { question, sessionId, type, departmentId, includeExpired } = req.body;
    
    if (!question || !question.trim()) {
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
        // Lấy tối đa 10 tin nhắn gần nhất để làm context (tăng từ 5 lên 10 cho RAG tốt hơn)
        chatHistory = chatSession.messages.slice(-10);
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
      content: question.trim()
    });
    
    // Cập nhật lastActive
    chatSession.lastActive = Date.now();
    
    // Gọi Groq RAG để nhận câu trả lời
    const ragResponse = await askWithRAG(question.trim(), chatHistory, {
      type: type || null,
      departmentId: departmentId || null,
      limit: 10,
      includeExpired: includeExpired || false
    });
    
    // Xử lý response
    const responseContent = ragResponse.content || 'Xin lỗi, không thể tạo câu trả lời.';
    
    // Thêm câu trả lời của AI vào messages
    chatSession.messages.push({
      role: 'assistant',
      content: responseContent
    });
    
    // Nếu là tin nhắn đầu tiên, tạo tiêu đề từ câu hỏi
    if (chatSession.messages.length <= 2) {
      chatSession.title = question.trim().substring(0, 50) + (question.trim().length > 50 ? '...' : '');
    }
    
    // Lưu session
    await chatSession.save();
    
    res.status(200).json({
      success: true,
      data: {
        sessionId: chatSession._id,
        title: chatSession.title,
        question: question.trim(),
        answer: responseContent,
        relevantTopics: ragResponse.relevantTopics || [],
        usage: ragResponse.usage || null,
        model: ragResponse.model || null
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
 * @desc    Tạo phiên chat mới
 * @route   POST /api/chat
 * @access  Tất cả người dùng
 */
export const createChatSession = async (req, res) => {
  try {
    const { title } = req.body;
    
    const chatSession = new ChatSession({
      user: req.user._id,
      title: title || 'Cuộc trò chuyện mới',
      lastActive: Date.now()
    });
    
    await chatSession.save();
    
    res.status(201).json({
      success: true,
      message: 'New chat session created successfully',
      data: {
        sessionId: chatSession._id,
        title: chatSession.title,
        createdAt: chatSession.createdAt,
        lastActive: chatSession.lastActive
      }
    });
  } catch (error) {
    console.error('Error creating chat session:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const query = ChatSession.find({ user: req.user._id });
    const total = await ChatSession.countDocuments({ user: req.user._id });
    const chatSessions = await query
      .select('title lastActive createdAt')
      .sort({ lastActive: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalPages = Math.ceil(total / limit);
    
    res.status(200).json({
      success: true,
      data: chatSessions,
      total,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
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
        message: 'Chat session not found'
      });
    }
    
    // Kiểm tra xem phiên chat có thuộc về người dùng không
    if (chatSession.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this chat session'
      });
    }
    
    res.status(200).json({
      success: true,
      data: chatSession
    });
  } catch (error) {
    console.error('Error getting chat session details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
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
        message: 'Missing rating information'
      });
    }
    
    const chatSession = await ChatSession.findById(sessionId);
    
    if (!chatSession) {
      return res.status(404).json({
        success: false,
        message: 'Chat session not found'
      });
    }
    
    // Kiểm tra xem phiên chat có thuộc về người dùng không
    if (chatSession.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to rate this chat session'
      });
    }
    
    // Kiểm tra index hợp lệ và là tin nhắn của assistant
    if (messageIndex < 0 || messageIndex >= chatSession.messages.length || 
        chatSession.messages[messageIndex].role !== 'assistant') {
      return res.status(400).json({
        success: false,
        message: 'Invalid message index'
      });
    }
    
    // Cập nhật đánh giá
    chatSession.messages[messageIndex].isAccurate = isAccurate;
    await chatSession.save();
    
    res.status(200).json({
      success: true,
      message: 'Rating updated'
    });
  } catch (error) {
    console.error('Error rating answer:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
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
        message: 'Chat session not found'
      });
    }
    
    // Kiểm tra xem phiên chat có thuộc về người dùng không
    if (chatSession.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this chat session'
      });
    }
    
    await ChatSession.deleteOne({ _id: req.params.id });
    
    res.status(200).json({
      success: true,
      message: 'Chat session deleted'
    });
  } catch (error) {
    console.error('Error deleting chat session:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Tìm kiếm topics nâng cao (hỗ trợ RAG)
 * @route   GET /api/chat/search-topics
 * @access  Tất cả người dùng
 */
export const searchTopics = async (req, res) => {
  try {
    const { 
      q = '', 
      type = null, 
      departmentId = null, 
      limit = 20,
      includeExpired = false,
      sortBy = 'relevance'
    } = req.query;

    const topics = await searchTopicsAdvanced(q, {
      type,
      departmentId,
      limit: parseInt(limit),
      includeExpired: includeExpired === 'true',
      sortBy
    });

    res.status(200).json({
      success: true,
      data: topics,
      count: topics.length
    });
  } catch (error) {
    console.error('Error searching topics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 