import Message from '../models/message.model.js';
import User from '../models/user.model.js';

/**
 * @desc    Gửi tin nhắn cho người dùng khác
 * @route   POST /api/messages
 * @access  Đã đăng nhập
 */
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    
    if (!receiverId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide receiver and message content'
      });
    }
    
    // Kiểm tra người nhận có tồn tại
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        message: 'Receiver not found'
      });
    }
    
    // Tạo tin nhắn mới
    const message = new Message({
      sender: req.user._id,
      receiver: receiverId,
      content
    });
    
    await message.save();
    
    // Trả về tin nhắn đã tạo với thông tin người gửi
    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');
    
    res.status(201).json({
      success: true,
      data: populatedMessage
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Lấy lịch sử tin nhắn với một người dùng khác
 * @route   GET /api/messages/:userId
 * @access  Đã đăng nhập
 */
export const getMessageHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Kiểm tra người dùng có tồn tại
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Tìm tất cả tin nhắn giữa người dùng hiện tại và người dùng được chỉ định
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    })
    .populate('sender', 'name avatar')
    .populate('receiver', 'name avatar')
    .sort({ createdAt: 1 });
    
    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Error getting message history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Lấy danh sách các cuộc trò chuyện của người dùng
 * @route   GET /api/messages
 * @access  Đã đăng nhập
 */
export const getConversations = async (req, res) => {
  try {
    // Tìm tất cả tin nhắn có liên quan đến người dùng hiện tại
    const messages = await Message.find({
      $or: [
        { sender: req.user._id },
        { receiver: req.user._id }
      ]
    })
    .populate('sender', 'name avatar')
    .populate('receiver', 'name avatar')
    .sort({ createdAt: -1 });
    
    // Tạo map để theo dõi tin nhắn mới nhất cho mỗi cuộc trò chuyện
    const conversations = new Map();
    
    messages.forEach(message => {
      // Xác định id của người dùng khác trong cuộc trò chuyện
      const otherUserId = message.sender._id.toString() === req.user._id.toString()
        ? message.receiver._id.toString()
        : message.sender._id.toString();
      
      // Nếu chưa có tin nhắn trong cuộc trò chuyện này, thêm vào
      if (!conversations.has(otherUserId)) {
        const otherUser = message.sender._id.toString() === req.user._id.toString()
          ? message.receiver
          : message.sender;
        
        conversations.set(otherUserId, {
          _id: otherUserId,
          user: otherUser,
          lastMessage: message,
          unreadCount: message.sender._id.toString() !== req.user._id.toString() && !message.read ? 1 : 0
        });
      } else {
        // Nếu tin nhắn này chưa đọc và không phải từ người dùng hiện tại, tăng số tin nhắn chưa đọc
        if (message.sender._id.toString() !== req.user._id.toString() && !message.read) {
          conversations.get(otherUserId).unreadCount += 1;
        }
      }
    });
    
    // Chuyển map thành mảng và sắp xếp theo thời gian tin nhắn mới nhất
    const conversationArray = Array.from(conversations.values()).sort((a, b) => 
      b.lastMessage.createdAt - a.lastMessage.createdAt
    );
    
    res.status(200).json({
      success: true,
      count: conversationArray.length,
      data: conversationArray
    });
  } catch (error) {
    console.error('Error getting conversations list:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Đánh dấu tin nhắn là đã đọc
 * @route   PUT /api/messages/:messageId/read
 * @access  Đã đăng nhập
 */
export const markMessageAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    
    // Tìm tin nhắn
    const message = await Message.findById(messageId);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // Kiểm tra xem người dùng hiện tại có phải là người nhận không
    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to mark this message as read'
      });
    }
    
    // Đánh dấu tin nhắn là đã đọc
    message.read = true;
    await message.save();
    
    res.status(200).json({
      success: true,
      message: 'Message marked as read',
      data: message
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Đánh dấu tất cả tin nhắn từ một người dùng là đã đọc
 * @route   PUT /api/messages/:userId/read-all
 * @access  Đã đăng nhập
 */
export const markAllMessagesAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Kiểm tra người dùng có tồn tại
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Đánh dấu tất cả tin nhắn từ người dùng được chỉ định là đã đọc
    const result = await Message.updateMany(
      { sender: userId, receiver: req.user._id, read: false },
      { read: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'All messages marked as read',
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 