import dotenv from 'dotenv';
import fetch from 'node-fetch';
import Dataset from '../models/dataset.model.js';
import AITraining from '../models/aiTraining.model.js';
import OpenAI from 'openai';
dotenv.config();

// Cấu hình OpenRouter API
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL
const SITE_URL = process.env.SITE_URL || 'https://your-website.com';
const SITE_NAME = process.env.SITE_NAME || 'Student Information System';

// Khởi tạo OpenRouter client
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": SITE_URL,
    "X-Title": SITE_NAME,
  },
  dangerouslyAllowBrowser: true
});

/**
 * Lấy dữ liệu từ dataset để tạo system prompt
 * Cải tiến để tối ưu hóa việc chọn dữ liệu phù hợp
 */
async function getDatasetContext(category = null, departmentId = null, userQuestion = null) {
  try {
    const query = {};
    if (category) query.category = category;
    if (departmentId) query.department = departmentId;

    const datasets = await Dataset.find(query);
    if (!datasets || datasets.length === 0) {
      return "Không có dữ liệu trong dataset.";
    }

    if (userQuestion) {
      const questionLower = userQuestion.toLowerCase();
      const scoredDatasets = datasets.map(item => {
        let score = 0;
        const keyLower = item.key.toLowerCase();
        const valueLower = item.value.toLowerCase();
        const keywords = questionLower.split(/\s+/);
        for (const word of keywords) {
          if (word.length < 3) continue;
          
          if (keyLower.includes(word)) score += 2;
          if (valueLower.includes(word)) score += 1;
        }
        
        if (keyLower.includes(questionLower)) score += 5;
        if (valueLower.includes(questionLower)) score += 3;
        
        return { item, score };
      });
      
      scoredDatasets.sort((a, b) => b.score - a.score);
      const topResults = scoredDatasets
        .filter(item => item.score > 0)
        .slice(0, 10)
        .map(item => item.item);
      
      if (topResults.length > 0) {
        return topResults.map(item => `${item.key}: ${item.value}`).join('\n');
      }
    }

    const maxDatasetItems = 20;
    const limitedDatasets = datasets.slice(0, maxDatasetItems);
    return limitedDatasets.map(item => `${item.key}: ${item.value}`).join('\n');
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu dataset:', error);
    return "Không thể truy xuất dữ liệu dataset.";
  }
}

async function queryOpenRouterAI(messages) {
  try {
    const userMessage = messages.find(msg => msg.role === 'user');
    const userContent = userMessage ? userMessage.content : '';
    
    const response = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': SITE_URL,
          'X-Title': SITE_NAME,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: OPENROUTER_MODEL,
          messages: messages,
        }),
      }
    );
    
    const data = await response.json();
    const message = data?.choices?.[0]?.message || { content: 'Không có phản hồi từ AI.' };
    
    if (!message.content || typeof message.content !== 'string') {
      message.content = message.content ? JSON.stringify(message.content) : 'Không có phản hồi từ AI.';
    }
    
    return message;
  } catch (error) {
    console.error('Lỗi khi gọi OpenRouter API:', error);
    throw new Error('Không thể kết nối với OpenRouter API. Vui lòng kiểm tra cấu hình.');
  }
}

export async function askAI(userQuestion, chatHistory = [], category = null, departmentId = null) {
  try {
    const datasetContext = await getDatasetContext(category, departmentId, userQuestion);

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

    try {
      console.log('Sử dụng OpenRouter API...');
      const aiResponse = await queryOpenRouterAI(messages);
      return aiResponse;
    } catch (error) {
      return { content: 'Xin lỗi, hệ thống hiện đang gặp sự cố. Vui lòng thử lại sau hoặc liên hệ trực tiếp với phòng ban phù hợp để được hỗ trợ.' };
    }
  } catch (error) {
    console.error('Lỗi khi xử lý câu hỏi:', error);
    return { content: 'Xin lỗi, đã xảy ra lỗi khi xử lý câu hỏi của bạn. Vui lòng thử lại sau hoặc liên hệ trực tiếp với phòng ban phù hợp để được hỗ trợ.' };
  }
}

/**
 * Training AI từ dataset
 * Tạo và gửi tập dữ liệu từ dataset để training model
 */
export async function trainAI(categories = [], departmentId = null, userId = null) {
  try {
    console.log('Bắt đầu quá trình training AI...');
    
    // Lấy dataset làm dữ liệu training
    const query = {};
    if (categories && categories.length > 0) {
      query.category = { $in: categories };
    }
    if (departmentId) {
      query.department = departmentId;
    }

    const datasets = await Dataset.find(query);
    if (!datasets || datasets.length === 0) {
      throw new Error('Không có dữ liệu trong dataset để training.');
    }

    console.log(`Tìm thấy ${datasets.length} mục dữ liệu để training.`);

    // Tạo bản ghi training
    const aiTraining = new AITraining({
      datasetCount: datasets.length,
      categories: categories,
      department: departmentId,
      createdBy: userId
    });
    
    await aiTraining.save();

    // Chuẩn bị dữ liệu training
    const trainingData = datasets.map(item => ({
      question: `${item.key}?`,
      answer: item.value,
      category: item.category
    }));

    // Tạo system prompt mẫu từ dataset
    const sampleDataContext = datasets.map(item => `${item.key}: ${item.value}`).join('\n');
    const systemPrompt = `Bạn là trợ lý thông minh hỗ trợ sinh viên tại trường. Trả lời câu hỏi dựa trên thông tin sau:\n\n${sampleDataContext}\n\nNếu bạn không tìm thấy thông tin liên quan trong dữ liệu, hãy thông báo rằng bạn không có thông tin và đề xuất liên hệ với nhân viên phòng ban phù hợp. Trả lời bằng tiếng Việt, ngắn gọn và hữu ích. Không tạo ra thông tin sai lệch.`;

    // Tạo tập hợp các cặp câu hỏi - trả lời để fine-tune (nếu API hỗ trợ)
    const finetuneMessages = trainingData.flatMap(item => [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: item.question },
      { role: 'assistant', content: item.answer }
    ]);

    // Nếu dùng OpenRouter API, gửi yêu cầu fine-tune nếu API hỗ trợ
    // Hoặc thay thế bằng cách lưu mẫu training vào database để sử dụng trong context
    try {
      // Mẫu code gọi API fine-tune (tùy thuộc vào nhà cung cấp API)
      // Trong trường hợp API không hỗ trợ fine-tune, chúng ta lưu dataset làm context
      console.log('Đã chuẩn bị dữ liệu training:', trainingData.length, 'mẫu');
      
      // Cập nhật trạng thái training
      aiTraining.status = 'completed';
      aiTraining.completedAt = new Date();
      await aiTraining.save();
      
      // Trả về thông tin về dữ liệu đã chuẩn bị
      return {
        success: true,
        message: `Đã chuẩn bị ${trainingData.length} mẫu dữ liệu để training.`,
        data: {
          trainingId: aiTraining._id,
          sampleCount: trainingData.length,
          categories: [...new Set(trainingData.map(item => item.category))],
          departmentId: departmentId,
          status: 'completed'
        }
      };
    } catch (error) {
      console.error('Lỗi khi gọi API training:', error);
      
      // Cập nhật trạng thái lỗi
      aiTraining.status = 'failed';
      aiTraining.error = error.message;
      await aiTraining.save();
      
      throw new Error(`Không thể training AI: ${error.message}`);
    }
  } catch (error) {
    console.error('Lỗi khi training AI:', error);
    throw error;
  }
}

export default {
  askAI,
  trainAI
};