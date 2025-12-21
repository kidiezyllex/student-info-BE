import dotenv from 'dotenv';
import fetch from 'node-fetch';
import Topic from '../models/topic.model.js';
dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
// Sử dụng Llama 3.1 70B - model mạnh mẽ cho RAG
const GROQ_MODEL = 'llama-3.1-70b-versatile';

/**
 * Synonyms and keyword expansion for English
 */
const SYNONYMS = {
  'scholarship': ['scholarship', 'financial aid', 'grant', 'bursary', 'funding', 'tuition assistance'],
  'event': ['event', 'activity', 'program', 'workshop', 'seminar', 'conference'],
  'job': ['job', 'employment', 'position', 'career', 'work', 'opportunity'],
  'recruitment': ['recruitment', 'hiring', 'job opening', 'vacancy', 'position'],
  'internship': ['internship', 'intern', 'trainee', 'apprenticeship', 'placement'],
  'notification': ['notification', 'announcement', 'notice', 'update', 'news'],
  'volunteer': ['volunteer', 'volunteering', 'community service', 'service'],
  'extracurricular': ['extracurricular', 'activity', 'club', 'society', 'organization']
};

/**
 * Map keywords to topic type
 */
const KEYWORD_TO_TYPE = {
  'scholarship': 'scholarship',
  'financial aid': 'scholarship',
  'grant': 'scholarship',
  'bursary': 'scholarship',
  'event': 'event',
  'activity': 'event',
  'program': 'event',
  'workshop': 'event',
  'job': 'job',
  'employment': 'job',
  'position': 'job',
  'career': 'job',
  'recruitment': 'recruitment',
  'hiring': 'recruitment',
  'vacancy': 'recruitment',
  'internship': 'internship',
  'intern': 'internship',
  'trainee': 'internship',
  'notification': 'notification',
  'announcement': 'notification',
  'notice': 'notification',
  'volunteer': 'volunteer',
  'volunteering': 'volunteer',
  'extracurricular': 'extracurricular',
  'club': 'extracurricular',
  'advertisement': 'advertisement',
  'ad': 'advertisement'
};

/**
 * Analyze question with NLP to extract intent and entities
 */
async function analyzeQuestionWithNLP(userQuestion) {
  try {
    const analysisPrompt = {
      role: 'system',
      content: `You are an NLP system specialized in analyzing English questions. Your task is to analyze the question and return JSON with the following structure:

{
  "intent": "type of information user wants to find (scholarship/event/job/internship/notification/volunteer/extracurricular/advertisement/general)",
  "keywords": ["list of important keywords"],
  "entities": {
    "dates": ["dates mentioned"],
    "locations": ["locations mentioned"],
    "departments": ["department names mentioned"],
    "organizations": ["organization/company names"]
  },
  "queryType": "type of question (search/info/question/comparison)",
  "timeReference": "time reference (past/present/future/any)",
  "expandedKeywords": ["expanded keywords with synonyms"]
}

Return only JSON, no additional text.`
    };

    const messages = [
      analysisPrompt,
      { role: 'user', content: `Analyze the following question: "${userQuestion}"` }
    ];

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: messages,
        temperature: 0.3, // Lower for more consistent results
        max_tokens: 500,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      throw new Error(`NLP analysis failed: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data?.choices?.[0]?.message?.content;
    
    if (!analysisText) {
      return null;
    }

    // Parse JSON response - xử lý cả trường hợp có code block
    let cleanText = analysisText.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/```\n?/g, '').trim();
    }

    try {
      const analysis = JSON.parse(cleanText);
      return analysis;
    } catch (parseError) {
      console.error('Error parsing NLP analysis JSON:', parseError);
      console.error('Raw response:', cleanText);
      return null;
    }
  } catch (error) {
    console.error('Error in NLP analysis:', error);
    return null;
  }
}

/**
 * Mở rộng từ khóa với từ đồng nghĩa
 */
function expandKeywords(keywords) {
  const expanded = new Set(keywords);
  
  keywords.forEach(keyword => {
    const lowerKeyword = keyword.toLowerCase();
    
    // Tìm từ đồng nghĩa
    for (const [key, synonyms] of Object.entries(SYNONYMS)) {
      if (lowerKeyword.includes(key) || synonyms.some(s => lowerKeyword.includes(s))) {
        synonyms.forEach(syn => expanded.add(syn));
        expanded.add(key);
      }
    }
  });
  
  return Array.from(expanded);
}

/**
 * Tìm kiếm topics liên quan đến câu hỏi của người dùng
 * Sử dụng MongoDB text search và semantic matching với NLP enhancement
 */
async function searchRelevantTopics(userQuestion, options = {}) {
  try {
    const { 
      type = null, 
      departmentId = null, 
      limit = 10,
      includeExpired = false,
      nlpAnalysis = null
    } = options;

    // Bước 1: Phân tích NLP nếu chưa có
    let analysis = nlpAnalysis;
    if (!analysis) {
      analysis = await analyzeQuestionWithNLP(userQuestion);
    }

    // Bước 2: Xác định type từ NLP analysis hoặc options
    let detectedType = type;
    if (!detectedType && analysis?.intent) {
      detectedType = KEYWORD_TO_TYPE[analysis.intent] || null;
    }

    // Bước 3: Mở rộng từ khóa tìm kiếm
    let searchQuery = userQuestion;
    if (analysis?.expandedKeywords && analysis.expandedKeywords.length > 0) {
      const expanded = expandKeywords(analysis.expandedKeywords);
      searchQuery = expanded.join(' ');
    } else if (analysis?.keywords && analysis.keywords.length > 0) {
      const expanded = expandKeywords(analysis.keywords);
      searchQuery = expanded.join(' ');
    }

    // Bước 4: Xây dựng query tìm kiếm
    const query = {
      $text: { $search: searchQuery }
    };

    // Lọc theo type nếu có (ưu tiên detected type từ NLP)
    if (detectedType) {
      query.type = detectedType;
    }

    // Xây dựng điều kiện $and để kết hợp department và date filters
    const andConditions = [];

    // Lọc theo department nếu có
    if (departmentId) {
      andConditions.push({
        $or: [
          { department: departmentId },
          { department: null } // Topics chung
        ]
      });
    }

    // Lọc theo thời gian nếu không muốn lấy expired
    if (!includeExpired) {
      const now = new Date();
      andConditions.push({
        $or: [
          { endDate: { $gte: now } },
          { endDate: null },
          { applicationDeadline: { $gte: now } },
          { applicationDeadline: null }
        ]
      });
    }

    // Thêm $and nếu có điều kiện
    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    // Tìm kiếm với text index
    const topics = await Topic.find(query)
      .populate('department', 'name code')
      .populate('createdBy', 'name email')
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit);

    // Nếu không tìm thấy với text search, thử tìm kiếm mở rộng
    if (topics.length === 0) {
      const fallbackQuery = {};
      const fallbackAndConditions = [];

      if (type) fallbackQuery.type = type;

      // Department filter
      if (departmentId) {
        fallbackAndConditions.push({
          $or: [
            { department: departmentId },
            { department: null }
          ]
        });
      }

      // Date filter
      if (!includeExpired) {
        const now = new Date();
        fallbackAndConditions.push({
          $or: [
            { endDate: { $gte: now } },
            { endDate: null },
            { applicationDeadline: { $gte: now } },
            { applicationDeadline: null }
          ]
        });
      }

      // Tìm kiếm trong title và description
      const keywords = userQuestion.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      if (keywords.length > 0) {
        fallbackAndConditions.push({
          $or: [
            { title: { $regex: keywords.join('|'), $options: 'i' } },
            { description: { $regex: keywords.join('|'), $options: 'i' } }
          ]
        });
      }

      if (fallbackAndConditions.length > 0) {
        fallbackQuery.$and = fallbackAndConditions;
      }

      const fallbackTopics = await Topic.find(fallbackQuery)
        .populate('department', 'name code')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit);

      return fallbackTopics;
    }

    return topics;
  } catch (error) {
    console.error('Error searching topics:', error);
    return [];
  }
}

/**
 * Format topic data into context string for RAG
 */
function formatTopicContext(topics) {
  if (!topics || topics.length === 0) {
    return 'No relevant information found in the system.';
  }

  return topics.map((topic, index) => {
    const deptName = topic.department ? topic.department.name : 'General';
    const typeLabels = {
      'event': 'Event',
      'scholarship': 'Scholarship',
      'notification': 'Notification',
      'job': 'Job',
      'advertisement': 'Advertisement',
      'internship': 'Internship Opportunity',
      'recruitment': 'Recruitment',
      'volunteer': 'Volunteer',
      'extracurricular': 'Extracurricular Activity'
    };

    let context = `[${index + 1}] ${typeLabels[topic.type] || topic.type}: ${topic.title}\n`;
    context += `Description: ${topic.description}\n`;
    context += `Department: ${deptName}\n`;

    // Add information based on topic type
    if (topic.startDate) {
      context += `Start Date: ${new Date(topic.startDate).toLocaleDateString('en-US')}\n`;
    }
    if (topic.endDate) {
      context += `End Date: ${new Date(topic.endDate).toLocaleDateString('en-US')}\n`;
    }
    if (topic.applicationDeadline) {
      context += `Application Deadline: ${new Date(topic.applicationDeadline).toLocaleDateString('en-US')}\n`;
    }
    if (topic.location) {
      context += `Location: ${topic.location}\n`;
    }
    if (topic.organizer) {
      context += `Organizer: ${topic.organizer}\n`;
    }
    if (topic.requirements) {
      context += `Requirements: ${topic.requirements}\n`;
    }
    if (topic.value) {
      context += `Value: ${topic.value}\n`;
    }
    if (topic.provider) {
      context += `Provider: ${topic.provider}\n`;
    }
    if (topic.eligibility) {
      context += `Eligibility: ${topic.eligibility}\n`;
    }
    if (topic.applicationProcess) {
      context += `Application Process: ${topic.applicationProcess}\n`;
    }
    if (topic.company) {
      context += `Company: ${topic.company}\n`;
    }
    if (topic.position) {
      context += `Position: ${topic.position}\n`;
    }
    if (topic.salary) {
      context += `Salary: ${topic.salary}\n`;
    }
    if (topic.contactInfo) {
      context += `Contact Info: ${topic.contactInfo}\n`;
    }
    if (topic.isImportant) {
      context += `[IMPORTANT]\n`;
    }

    context += `Created: ${new Date(topic.createdAt).toLocaleDateString('en-US')}\n`;
    context += `---\n`;

    return context;
  }).join('\n');
}

/**
 * Gọi Groq API với RAG context
 */
async function queryGroqAPI(messages) {
  try {
    if (!GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not configured');
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 1,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`❌ Groq API Error: Status ${response.status}`);
      console.error('Response data:', errorData);
      throw new Error(`Groq API responded with status ${response.status}: ${errorData.error?.message || JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const message = data?.choices?.[0]?.message;

    if (!message || !message.content) {
      throw new Error('Invalid response from Groq API');
    }

    return {
      content: message.content,
      usage: data.usage,
      model: data.model
    };
  } catch (error) {
    console.error('Error querying Groq API:', error);
    throw error;
  }
}

/**
 * Hàm chính: Xử lý câu hỏi với RAG từ Topic data
 */
export async function askWithRAG(userQuestion, chatHistory = [], options = {}) {
  try {
    const {
      type = null,
      departmentId = null,
      limit = 10,
      includeExpired = false
    } = options;

    // Bước 1: Phân tích câu hỏi với NLP
    const nlpAnalysis = await analyzeQuestionWithNLP(userQuestion);
    
    // Bước 2: Tìm kiếm topics liên quan (với NLP enhancement)
    const relevantTopics = await searchRelevantTopics(userQuestion, {
      type,
      departmentId,
      limit,
      includeExpired,
      nlpAnalysis // Truyền analysis để tránh gọi lại
    });

    // Bước 2: Format context từ topics
    const topicContext = formatTopicContext(relevantTopics);

    // Step 3: Build system prompt with RAG context
    const systemPrompt = {
      role: 'system',
      content: `You are an intelligent assistant specialized in helping students search for information about events, scholarships, notifications, job opportunities, internships, and other activities at the school.

SYSTEM INFORMATION (RAG Context):
${topicContext}

RESPONSE RULES:
1. MANDATORY: Prioritize using information from the RAG context above. If relevant information exists, you must cite it specifically.
2. Respond in English, clearly, detailed, and friendly.
3. If there are multiple relevant results, list them all with numbers [1], [2], [3]...
4. Only use general knowledge if NO information is found in the RAG context.
5. Always provide specific information: name, description, time, location, requirements, deadline, etc.
6. If no information is found, clearly notify and suggest the user can contact the relevant department for more details.
7. If there is information about application deadlines, emphasize it so users don't miss it.
8. Always check and notify if events/scholarships have expired (if there is information about endDate or applicationDeadline).

Answer the user's question in the most helpful and accurate way possible.`
    };

    // Step 5: Build messages array
    const messages = [
      systemPrompt,
      ...chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: userQuestion }
    ];

    // Step 6: Call Groq API
    const aiResponse = await queryGroqAPI(messages);

    return {
      content: aiResponse.content,
      relevantTopics: relevantTopics.map(t => ({
        id: t._id,
        title: t.title,
        type: t.type,
        department: t.department?.name || 'General'
      })),
      nlpAnalysis: nlpAnalysis ? {
        intent: nlpAnalysis.intent,
        detectedType: nlpAnalysis.intent ? KEYWORD_TO_TYPE[nlpAnalysis.intent] : null,
        entities: nlpAnalysis.entities,
        queryType: nlpAnalysis.queryType
      } : null,
      usage: aiResponse.usage,
      model: aiResponse.model
    };
  } catch (error) {
    console.error('Error in askWithRAG:', error);
    return {
      content: 'Sorry, the system is experiencing an error processing your question. Please try again later or contact the relevant department for assistance.',
      relevantTopics: [],
      error: error.message
    };
  }
}

/**
 * Tìm kiếm topics nâng cao với nhiều filters
 */
export async function searchTopicsAdvanced(query, filters = {}) {
  try {
    const {
      type = null,
      departmentId = null,
      limit = 20,
      includeExpired = false,
      sortBy = 'relevance' // 'relevance', 'date', 'title'
    } = filters;

    const searchQuery = {};
    
    // Text search
    if (query && query.trim()) {
      searchQuery.$text = { $search: query };
    }

    // Type filter
    if (type) {
      searchQuery.type = type;
    }

    // Xây dựng điều kiện $and để kết hợp department và date filters
    const andConditions = [];

    // Department filter
    if (departmentId) {
      andConditions.push({
        $or: [
          { department: departmentId },
          { department: null }
        ]
      });
    }

    // Date filter
    if (!includeExpired) {
      const now = new Date();
      andConditions.push({
        $or: [
          { endDate: { $gte: now } },
          { endDate: null },
          { applicationDeadline: { $gte: now } },
          { applicationDeadline: null }
        ]
      });
    }

    // Thêm $and nếu có điều kiện
    if (andConditions.length > 0) {
      searchQuery.$and = andConditions;
    }

    let sortOptions = {};
    if (sortBy === 'relevance' && query) {
      sortOptions = { score: { $meta: 'textScore' } };
    } else if (sortBy === 'date') {
      sortOptions = { createdAt: -1 };
    } else if (sortBy === 'title') {
      sortOptions = { title: 1 };
    }

    const topics = await Topic.find(searchQuery)
      .populate('department', 'name code')
      .populate('createdBy', 'name email')
      .sort(sortOptions)
      .limit(limit);

    return topics;
  } catch (error) {
    console.error('Error in searchTopicsAdvanced:', error);
    return [];
  }
}

export default {
  askWithRAG,
  searchTopicsAdvanced,
  searchRelevantTopics,
  formatTopicContext
};

