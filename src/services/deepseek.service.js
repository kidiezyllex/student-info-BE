import dotenv from 'dotenv';
import fetch from 'node-fetch';
import Dataset from '../models/dataset.model.js';

dotenv.config();

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'sk-8fc4a56fe05f4d04b36dbe5a912329de';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

/**
 * Lấy dữ liệu từ dataset để tạo system prompt
 */
async function getDatasetContext(category = null, departmentId = null) {
  try {
    const query = {};
    if (category) query.category = category;
    if (departmentId) query.department = departmentId;

    const datasets = await Dataset.find(query);
    if (!datasets || datasets.length === 0) {
      return "Không có dữ liệu trong dataset.";
    }

    // Format dataset thành chuỗi văn bản
    return datasets.map(item => `${item.key}: ${item.value}`).join('\n');
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu dataset:', error);
    return "Không thể truy xuất dữ liệu dataset.";
  }
}

/**
 * Gọi API DeepSeek để tạo câu trả lời
 */
async function queryDeepseekAI(messages) {
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`DeepSeek API Error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Lỗi khi gọi DeepSeek API:', error);
    throw new Error('Không thể kết nối với DeepSeek AI. Vui lòng thử lại sau.');
  }
}

/**
 * Xử lý câu hỏi của người dùng và trả về câu trả lời từ AI
 */
export async function askAI(userQuestion, chatHistory = [], category = null, departmentId = null) {
  try {
    // Lấy dữ liệu từ dataset để tạo context
    const datasetContext = await getDatasetContext(category, departmentId);

    // Tạo system prompt
    const systemPrompt = {
      role: 'system',
      content: `Bạn là trợ lý thông minh hỗ trợ sinh viên tại trường. Trả lời câu hỏi dựa trên thông tin sau:
      
${datasetContext}

Nếu bạn không tìm thấy thông tin liên quan trong dữ liệu, hãy thông báo rằng bạn không có thông tin và đề xuất liên hệ với nhân viên phòng ban phù hợp.
Trả lời bằng tiếng Việt, ngắn gọn và hữu ích. Không tạo ra thông tin sai lệch.`
    };

    // Kết hợp lịch sử trò chuyện và câu hỏi mới
    const messages = [
      systemPrompt,
      ...chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: userQuestion }
    ];

    // Gọi DeepSeek API
    const aiResponse = await queryDeepseekAI(messages);
    return aiResponse;
  } catch (error) {
    console.error('Lỗi khi xử lý câu hỏi:', error);
    throw new Error('Đã xảy ra lỗi khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.');
  }
}

export default {
  askAI
}; 