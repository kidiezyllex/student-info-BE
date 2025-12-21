import dotenv from 'dotenv';
import fetch from 'node-fetch';
import Dataset from '../models/dataset.model.js';
import AITraining from '../models/aiTraining.model.js';
import Topic from '../models/topic.model.js';
dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_MODEL = "meta-llama/llama-4-maverick:free"
const SITE_URL = process.env.SITE_URL || 'https://your-website.com';
const SITE_NAME = process.env.SITE_NAME || 'Student Information System';

async function getScholarshipContext(departmentId = null, userQuestion = null) {
  try {
    const query = { type: 'scholarship' };
    if (departmentId) {
      query.$or = [
        { department: departmentId },
        { department: null } // General scholarships
      ];
    }

    // Only get scholarships that haven't expired
    const now = new Date();
    query.applicationDeadline = { $gt: now };

    const scholarships = await Topic.find(query)
      .populate('department', 'name code')
      .sort({ applicationDeadline: 1 });

    if (!scholarships || scholarships.length === 0) {
      return null;
    }

    if (userQuestion) {
      const questionLower = userQuestion.toLowerCase();
      const scoredScholarships = scholarships.map(scholarship => {
        let score = 0;
        const titleLower = scholarship.title.toLowerCase();
        const descriptionLower = scholarship.description.toLowerCase();
        const requirementsLower = scholarship.requirements.toLowerCase();
        const eligibilityLower = scholarship.eligibility.toLowerCase();

        const keywords = questionLower.split(/\s+/);
        for (const word of keywords) {
          if (word.length < 3) continue;

          if (titleLower.includes(word)) score += 5;
          if (descriptionLower.includes(word)) score += 3;
          if (requirementsLower.includes(word)) score += 4;
          if (eligibilityLower.includes(word)) score += 4;
        }

        // Exact phrase matching
        if (titleLower.includes(questionLower)) score += 10;
        if (descriptionLower.includes(questionLower)) score += 8;
        if (requirementsLower.includes(questionLower)) score += 8;
        if (eligibilityLower.includes(questionLower)) score += 8;

        return { scholarship, score };
      });

      scoredScholarships.sort((a, b) => b.score - a.score);
      const topResults = scoredScholarships
        .filter(item => item.score > 0)
        .slice(0, 5)
        .map(item => item.scholarship);

      if (topResults.length > 0) {
        return topResults.map(scholarship => {
          const deptName = scholarship.department ? scholarship.department.name : 'Chung';
          return `Học bổng: ${scholarship.title}
Mô tả: ${scholarship.description}
Yêu cầu: ${scholarship.requirements}
Giá trị: ${scholarship.value}
Điều kiện: ${scholarship.eligibility}
Nhà cung cấp: ${scholarship.provider}
Hạn nộp: ${scholarship.applicationDeadline.toLocaleDateString('vi-VN')}
Ngành: ${deptName}`;
        }).join('\n\n');
      }
    }

    // Nếu không có câu hỏi cụ thể, trả về tất cả học bổng
    const maxScholarships = 10;
    const limitedScholarships = scholarships.slice(0, maxScholarships);
    return limitedScholarships.map(scholarship => {
      const deptName = scholarship.department ? scholarship.department.name : 'Chung';
      return `Học bổng: ${scholarship.title}
Mô tả: ${scholarship.description}
Yêu cầu: ${scholarship.requirements}
Giá trị: ${scholarship.value}
Điều kiện: ${scholarship.eligibility}
Nhà cung cấp: ${scholarship.provider}
Hạn nộp: ${scholarship.applicationDeadline.toLocaleDateString('vi-VN')}
Ngành: ${deptName}`;
    }).join('\n\n');
  } catch (error) {
    console.error('Error getting scholarship context:', error);
    return null;
  }
}

async function getDatasetContext(category = null, departmentId = null, userQuestion = null) {
  try {
    const query = {};
    if (category) query.category = category;
    if (departmentId) query.department = departmentId;

    const datasets = await Dataset.find(query);
    if (!datasets || datasets.length === 0) {
      return "No data in dataset.";
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
    return "Cannot access dataset data.";
  }
}

async function queryOpenRouterAI(messages) {
  try {
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

    if (!response.ok) {
      console.error(`❌ OpenRouter API Error: Status ${response.status}`);
      console.error('Response data:', data);
      throw new Error(`OpenRouter API responded with status ${response.status}: ${data.error ? data.error.message : JSON.stringify(data)}`);
    }

    const message = data?.choices?.[0]?.message;

    if (!message.content || typeof message.content !== 'string') {
      message.content = message.content ? JSON.stringify(message.content) : '';
    }

    return message;
  } catch (error) {
    throw new Error('Cannot connect to OpenRouter API. Please check the configuration.');
  }
}

export async function askAI(userQuestion, chatHistory = [], category = null, departmentId = null) {
  try {
    // Lấy thông tin từ dataset
    const datasetContext = await getDatasetContext(category, departmentId, userQuestion);

    // Lấy thông tin học bổng cụ thể
    const scholarshipContext = await getScholarshipContext(departmentId, userQuestion);

    // Kiểm tra xem câu hỏi có liên quan đến học bổng không
    const questionLower = userQuestion.toLowerCase();
    const isScholarshipQuestion = questionLower.includes('scholarship') ||
      questionLower.includes('học bổng') ||
      questionLower.includes('financial aid') ||
      questionLower.includes('funding') ||
      questionLower.includes('grant') ||
      questionLower.includes('bursary');

    let contextData = '';
    let priorityInstruction = '';

    if (isScholarshipQuestion && scholarshipContext) {
      contextData = `THÔNG TIN HỌC BỔNG CỤ THỂ:
${scholarshipContext}

THÔNG TIN BỔ SUNG TỪ DATASET:
${datasetContext}`;
      priorityInstruction = 'BẮT BUỘC: Sử dụng thông tin học bổng cụ thể ở trên để trả lời. Không được trả lời chung chung.';
    } else {
      contextData = `THÔNG TIN TỪ DATASET:
${datasetContext}`;
      priorityInstruction = 'Ưu tiên sử dụng thông tin từ dataset ở trên.';
    }

    const systemPrompt = {
      role: 'system',
      content: `Bạn là trợ lý thông minh cho sinh viên. ${priorityInstruction}

${contextData}

QUY TẮC TRẢ LỜI:
1. Nếu có thông tin cụ thể trong dữ liệu trên, BẮT BUỘC sử dụng thông tin đó
2. Trả lời bằng tiếng Việt, rõ ràng và chi tiết
3. Nếu thông tin không có trong dữ liệu trên, mới được sử dụng kiến thức chung
4. Luôn cung cấp thông tin cụ thể, không trả lời chung chung
5. Nếu là câu hỏi về học bổng, phải cung cấp đầy đủ thông tin: tên, mô tả, yêu cầu, giá trị, hạn nộp, v.v.`
    };

    const messages = [
      systemPrompt,
      ...chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: userQuestion }
    ];
    try {
      const aiResponse = await queryOpenRouterAI(messages);
      return aiResponse;
    } catch (error) {
      return { content: 'Xin lỗi, hệ thống đang gặp sự cố. Vui lòng thử lại sau hoặc liên hệ phòng ban phù hợp để được hỗ trợ.' };
    }
  } catch (error) {
    return { content: 'Xin lỗi, đã xảy ra lỗi khi xử lý câu hỏi của bạn. Vui lòng thử lại sau hoặc liên hệ phòng ban phù hợp để được hỗ trợ.' };
  }
}


export async function trainAI(categories = [], departmentId = null, userId = null) {
  try {
    const query = {};
    if (categories && categories.length > 0) {
      query.category = { $in: categories };
    }
    if (departmentId) {
      query.department = departmentId;
    }

    const datasets = await Dataset.find(query);
    if (!datasets || datasets.length === 0) {
      throw new Error('No data in dataset to train.');
    }

    const aiTraining = new AITraining({
      datasetCount: datasets.length,
      categories: categories,
      department: departmentId,
      createdBy: userId
    });

    await aiTraining.save();

    const trainingData = datasets.map(item => ({
      question: `${item.key}?`,
      answer: item.value,
      category: item.category
    }));

    try {
      aiTraining.status = 'completed';
      aiTraining.completedAt = new Date();
      await aiTraining.save();

      return {
        success: true,
        message: `Prepared ${trainingData.length} data samples for training.`,
        data: {
          trainingId: aiTraining._id,
          sampleCount: trainingData.length,
          categories: [...new Set(trainingData.map(item => item.category))],
          departmentId: departmentId,
          status: 'completed'
        }
      };
    } catch (error) {
      aiTraining.status = 'failed';
      aiTraining.error = error.message;
      await aiTraining.save();

      throw new Error(`Cannot train AI: ${error.message}`);
    }
  } catch (error) {
    throw error;
  }
}

export default {
  askAI,
  trainAI
};