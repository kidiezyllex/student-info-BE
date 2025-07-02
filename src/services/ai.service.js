import dotenv from 'dotenv';
import fetch from 'node-fetch';
import Dataset from '../models/dataset.model.js';
import AITraining from '../models/aiTraining.model.js';
dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL
const SITE_URL = process.env.SITE_URL || 'https://your-website.com';
const SITE_NAME = process.env.SITE_NAME || 'Student Information System';

async function getDatasetContext(category = null, departmentId = null, userQuestion = null) {
  try {
    const query = {};
    if (category) query.category = category;
    if (departmentId) query.department = departmentId;

    const datasets = await Dataset.find(query);
    console.log('📊 All datasets found:', datasets.length);
    console.log('📋 Dataset list:', datasets.map(item => ({ key: item.key, value: item.value, category: item.category })));
    
    if (!datasets || datasets.length === 0) {
      return "No data in dataset.";
    }

    if (userQuestion) {
      console.log('❓ User question:', userQuestion);
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

      console.log('🔍 Datasets found from user keywords:', topResults.length);
      console.log('📝 Filtered datasets:', topResults.map(item => ({ 
        key: item.key, 
        value: item.value, 
        category: item.category,
        score: scoredDatasets.find(scored => scored.item._id.toString() === item._id.toString())?.score || 0
      })));

      if (topResults.length > 0) {
        return topResults.map(item => `${item.key}: ${item.value}`).join('\n');
      }
    }

    const maxDatasetItems = 20;
    const limitedDatasets = datasets.slice(0, maxDatasetItems);
    console.log('📊 Using limited datasets (no keyword filtering):', limitedDatasets.length);
    return limitedDatasets.map(item => `${item.key}: ${item.value}`).join('\n');
  } catch (error) {
    console.error('❌ Error in getDatasetContext:', error);
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
    const message = data?.choices?.[0]?.message || { content: 'No response from AI.' };

    if (!message.content || typeof message.content !== 'string') {
      message.content = message.content ? JSON.stringify(message.content) : 'No response from AI.';
    }

    return message;
  } catch (error) {
    throw new Error('Cannot connect to OpenRouter API. Please check the configuration.');
  }
}

export async function askAI(userQuestion, chatHistory = [], category = null, departmentId = null) {
  try {
    const datasetContext = await getDatasetContext(category, departmentId, userQuestion);
    
    const systemPrompt = {
      role: 'system',
      content: `You are a smart assistant helping students at the school. Answer questions based on the following information:
      
${datasetContext}
If you do not find the information link in the data, please state that you do not have the information and suggest contacting the appropriate department staff. Answer in English, short and useful. Do not create false information.`
    };

    const messages = [
      systemPrompt,
      ...chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: userQuestion }
    ];

    console.log('💬 Messages to send to AI:', messages.length);
    console.log('🤖 System prompt content length:', systemPrompt.content.length);

    try {
      console.log('🔄 Calling OpenRouter AI...');
      const aiResponse = await queryOpenRouterAI(messages);
      console.log('✅ AI Response received:', aiResponse);
      return aiResponse;
    } catch (error) {
      console.error('❌ Error calling OpenRouter AI:', error);
      return { content: 'Sorry, the system is currently experiencing an issue. Please try again later or contact the appropriate department for support.' };
    }
  } catch (error) {
    console.error('❌ Error in askAI function:', error);
    return { content: 'Sorry, an error occurred while processing your question. Please try again later or contact the appropriate department for support.' };
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