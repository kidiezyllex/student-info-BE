import dotenv from 'dotenv';
import fetch from 'node-fetch';
import Topic from '../models/topic.model.js';
dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

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
 * Map keywords to topic type - Enhanced with Vietnamese and more English synonyms
 */
const KEYWORD_TO_TYPE = {
  // Scholarship keywords
  'scholarship': 'scholarship',
  'scholarships': 'scholarship',
  'học bổng': 'scholarship',
  'hoc bong': 'scholarship',
  'financial aid': 'scholarship',
  'grant': 'scholarship',
  'grants': 'scholarship',
  'bursary': 'scholarship',
  'funding': 'scholarship',
  'tuition': 'scholarship',

  // Event keywords
  'event': 'event',
  'events': 'event',
  'sự kiện': 'event',
  'su kien': 'event',
  'activity': 'event',
  'activities': 'event',
  'hoạt động': 'event',
  'hoat dong': 'event',
  'program': 'event',
  'programme': 'event',
  'workshop': 'event',
  'seminar': 'event',
  'conference': 'event',
  'hội thảo': 'event',
  'hoi thao': 'event',

  // Job keywords
  'job': 'job',
  'jobs': 'job',
  'việc làm': 'job',
  'viec lam': 'job',
  'công việc': 'job',
  'cong viec': 'job',
  'employment': 'job',
  'position': 'job',
  'positions': 'job',
  'vị trí': 'job',
  'vi tri': 'job',
  'career': 'job',
  'careers': 'job',
  'work': 'job',
  'working': 'job',
  'làm việc': 'job',
  'lam viec': 'job',
  'tuyển dụng': 'job',
  'tuyen dung': 'job',

  // Recruitment keywords
  'recruitment': 'recruitment',
  'recruiting': 'recruitment',
  'hiring': 'recruitment',
  'hire': 'recruitment',
  'vacancy': 'recruitment',
  'vacancies': 'recruitment',
  'tuyển': 'recruitment',
  'tuyen': 'recruitment',

  // Internship keywords
  'internship': 'internship',
  'internships': 'internship',
  'thực tập': 'internship',
  'thuc tap': 'internship',
  'intern': 'internship',
  'interns': 'internship',
  'trainee': 'internship',
  'trainees': 'internship',
  'apprentice': 'internship',
  'apprenticeship': 'internship',

  // Notification keywords
  'notification': 'notification',
  'notifications': 'notification',
  'thông báo': 'notification',
  'thong bao': 'notification',
  'announcement': 'notification',
  'announcements': 'notification',
  'notice': 'notification',
  'notices': 'notification',
  'update': 'notification',
  'updates': 'notification',
  'news': 'notification',

  // Volunteer keywords
  'volunteer': 'volunteer',
  'volunteers': 'volunteer',
  'volunteering': 'volunteer',
  'tình nguyện': 'volunteer',
  'tinh nguyen': 'volunteer',
  'tình nguyện viên': 'volunteer',
  'tinh nguyen vien': 'volunteer',
  'community service': 'volunteer',

  // Extracurricular keywords
  'extracurricular': 'extracurricular',
  'ngoại khóa': 'extracurricular',
  'ngoai khoa': 'extracurricular',
  'club': 'extracurricular',
  'clubs': 'extracurricular',
  'câu lạc bộ': 'extracurricular',
  'cau lac bo': 'extracurricular',
  'society': 'extracurricular',
  'societies': 'extracurricular',
  'organization': 'extracurricular',
  'organizations': 'extracurricular',

  // Advertisement keywords
  'advertisement': 'advertisement',
  'advertisements': 'advertisement',
  'quảng cáo': 'advertisement',
  'quang cao': 'advertisement',
  'ad': 'advertisement',
  'ads': 'advertisement'
};

const CONTACT_DATA_HARDCODED = [
  { name: "Dr. Le Lam Son", title: "Academic Coordinator for the Computer Science program cum Lecturer in Software Engineering and Programming Languages", room: "384", email: "son.ll@vgu.edu.vn" },
  { name: "Assoc. Prof. Garcia Clavel Manuel", title: "Senior Lecturer in Programming Languages and Methods", room: "305", email: "manuel.clavel@vgu.edu.vn" },
  { name: "Dr. Tran Hong Ngoc", title: "Lecturer in Security, Privacy, and Data Science", room: "387", email: "ngoc.th@vgu.edu.vn" },
  { name: "Dr. Tran Thi Thu Huong", title: "Lecturer in Mathematical Foundations for Computer Science", room: "390", email: "huong.ttt@vgu.edu.vn" },
  { name: "Dr. Truong Dinh Huy", title: "Lecturer in Computer Networks and Internet of Things", room: "389", email: "huy.td@vgu.edu.vn" },
  { name: "Dr. Nguyen Tuan Cuong", title: "Lecturer in Information Systems and Data Science", room: "385", email: "cuong.nt2@vgu.edu.vn" },
  { name: "Dr. Tran Huu Tam", title: "Lecturer in Distributed Computing and Systems", room: "378", email: "tam.th@vgu.edu.vn" },
  { name: "M.Sc. Le Duy Hung", title: "Lab Engineer in Real-time Systems and IT Security", room: "383", email: "hung.ld2@vgu.edu.vn" },
  { name: "Mr. Le Thai Cuong", title: "Lab Engineer in Computer Networks", room: "386", email: "cuong.lt@vgu.edu.vn" },
  { name: "M.Fin. Le Thuy Doan Trang", title: "Faculty Assistant for Study program of CSE", room: "388", email: "cse@vgu.edu.vn" },
  { name: "Mr. Nguyễn Mai Linh", title: "Tuition fees and Scholarships Accountant", room: "351", email: "linh.nm@vgu.edu.vn" },
  { name: "Ms. Bùi Tố Nguyên", title: "Scholarship Officer / International Officer", room: "218", email: "scholarships@vgu.edu.vn / international@vgu.edu.vn" },
  { name: "Dormitory", title: "Dorm Management Board", room: "N/A", email: "dormitory@vgu.edu.vn" },
  { name: "ASA", title: "Department of Academic and Student Affairs", room: "218", email: "studentaffairs@vgu.edu.vn" },
  { name: "Research Management Department", title: "Research Management Department", room: "N/A", email: "rm@vgu.edu.vn" }
];

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
        temperature: 0.3,
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

function expandKeywords(keywords) {
  const expanded = new Set(keywords);

  keywords.forEach(keyword => {
    const lowerKeyword = keyword.toLowerCase();

    for (const [key, synonyms] of Object.entries(SYNONYMS)) {
      if (lowerKeyword.includes(key) || synonyms.some(s => lowerKeyword.includes(s))) {
        synonyms.forEach(syn => expanded.add(syn));
        expanded.add(key);
      }
    }
  });

  return Array.from(expanded);
}

async function searchRelevantTopics(userQuestion, options = {}) {
  try {
    const {
      type = null,
      departmentId = null,
      limit = 10,
      includeExpired = false,
      nlpAnalysis = null
    } = options;
    let analysis = nlpAnalysis;
    if (!analysis) {
      analysis = await analyzeQuestionWithNLP(userQuestion);
    }
    let detectedType = type;
    if (!detectedType && analysis?.intent) {
      detectedType = KEYWORD_TO_TYPE[analysis.intent] || null;
    }

    if (!detectedType) {
      const lowerQuestion = userQuestion.toLowerCase();
      for (const [keyword, topicType] of Object.entries(KEYWORD_TO_TYPE)) {
        if (lowerQuestion.includes(keyword)) {
          detectedType = topicType;
          break;
        }
      }
    }

    let searchQuery = userQuestion;
    if (analysis?.expandedKeywords && analysis.expandedKeywords.length > 0) {
      const expanded = expandKeywords(analysis.expandedKeywords);
      searchQuery = expanded.join(' ');
    } else if (analysis?.keywords && analysis.keywords.length > 0) {
      const expanded = expandKeywords(analysis.keywords);
      searchQuery = expanded.join(' ');
    }

    const query = {
      $text: { $search: searchQuery }
    };

    if (detectedType) {
      query.type = detectedType;
    }

    const andConditions = [];

    if (departmentId) {
      andConditions.push({
        $or: [
          { department: departmentId },
          { department: null }
        ]
      });
    }

    if (!includeExpired) {
      const now = new Date();
      andConditions.push({
        $or: [
          { endDate: null, applicationDeadline: null },
          { endDate: { $gte: now } },
          { applicationDeadline: { $gte: now } }
        ]
      });
    }

    if (andConditions.length > 0) {
      query.$and = andConditions;
    }

    const topics = await Topic.find(query)
      .populate('department', 'name code')
      .populate('createdBy', 'name email')
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit);

    if (topics.length === 0) {
      const fallbackQuery = {};
      const fallbackAndConditions = [];

      // Use detected type in fallback
      if (detectedType) {
        fallbackQuery.type = detectedType;
      } else if (type) {
        fallbackQuery.type = type;
      }

      if (departmentId) {
        fallbackAndConditions.push({
          $or: [
            { department: departmentId },
            { department: null }
          ]
        });
      }

      if (!includeExpired) {
        const now = new Date();
        fallbackAndConditions.push({
          $or: [
            { endDate: null, applicationDeadline: null },
            { endDate: { $gte: now } },
            { applicationDeadline: { $gte: now } }
          ]
        });
      }

      // Extract keywords from question for regex search
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


export async function askWithRAG(userQuestion, chatHistory = [], options = {}) {
  try {
    const {
      type = null,
      departmentId = null,
      limit = 10,
      includeExpired = false
    } = options;

    const nlpAnalysis = await analyzeQuestionWithNLP(userQuestion);

    const relevantTopics = await searchRelevantTopics(userQuestion, {
      type,
      departmentId,
      limit,
      includeExpired,
      nlpAnalysis
    });

    const topicContext = formatTopicContext(relevantTopics);

    // Check for contact related keywords
    const contactKeywords = ['contact', 'liên hệ', 'email', 'mail', 'phone', 'sdt', 'số điện thoại', 'address', 'địa chỉ', 'meet', 'gặp', 'room', 'phòng'];
    const lowerQuestion = userQuestion.toLowerCase();
    const isContactQuery = contactKeywords.some(keyword => lowerQuestion.includes(keyword));

    let contactContext = '';
    if (isContactQuery) {
      contactContext = `
CONTACT INFORMATION (Taken from official records):
${CONTACT_DATA_HARDCODED.map(c => `- ${c.name}: ${c.title}. Room: ${c.room}. Email: ${c.email}`).join('\n')}
`;
    }

    const systemPrompt = {
      role: 'system',
      content: `You are an intelligent assistant specialized in helping students search for information about events, scholarships, notifications, job opportunities, internships, and other activities at the school.

OFFICIAL CONTACT LIST (Use this for contact/room/email queries):
${contactContext}

SEARCH RESULTS (From Database):
${topicContext}

RESPONSE RULES:
1. MANDATORY: Check the OFFICIAL CONTACT LIST first if the user asks for contact info, rooms, or person names.
2. Prioritize using information from the context provided above.
3. Respond in English, clearly, detailed, and friendly.
4. If there are multiple relevant results, list them all with numbers [1], [2], [3]...
5. Only use general knowledge if NO information is found in the provided context.
6. Always provide specific information: name, description, time, location, requirements, deadline, etc.
7. If no information is found, clearly notify and suggest the user can contact the relevant department.
8. If there is information about application deadlines, emphasize it.
9. Always check and notify if events/scholarships have expired.

Answer the user's question in the most helpful and accurate way possible.`
    };

    const messages = [
      systemPrompt,
      ...chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: userQuestion }
    ];

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
      sortBy = 'relevance'
    } = filters;

    const searchQuery = {};

    if (query && query.trim()) {
      searchQuery.$text = { $search: query };
    }

    if (type) {
      searchQuery.type = type;
    }

    const andConditions = [];

    if (departmentId) {
      andConditions.push({
        $or: [
          { department: departmentId },
          { department: null }
        ]
      });
    }

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

