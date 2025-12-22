import Topic from '../models/topic.model.js';
import Department from '../models/department.model.js';
import User from '../models/user.model.js';
import { connectDB, disconnectDB } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Convert Mongoose document to plain JSON object
 */
const toJSON = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject ? doc.toObject() : doc;
  
  // Convert ObjectId to string
  if (obj._id) {
    obj._id = obj._id.toString();
  }
  
  // Convert dates to ISO string
  const dateFields = ['createdAt', 'updatedAt', 'startDate', 'endDate', 'applicationDeadline'];
  dateFields.forEach(field => {
    if (obj[field]) {
      obj[field] = new Date(obj[field]).toISOString();
    }
  });
  
  // Handle populated fields
  if (obj.department && obj.department._id) {
    obj.department = {
      _id: obj.department._id.toString(),
      name: obj.department.name,
      code: obj.department.code
    };
  }
  
  if (obj.createdBy && obj.createdBy._id) {
    obj.createdBy = {
      _id: obj.createdBy._id.toString(),
      name: obj.createdBy.name,
      email: obj.createdBy.email,
      role: obj.createdBy.role
    };
  }
  
  return obj;
};

/**
 * Export all topics from MongoDB to a JSON file
 */
const exportTopicsToJson = async () => {
  try {
    // Connect to database
    console.log('Connecting to MongoDB...');
    await connectDB();

    // Fetch all topics with populated fields
    console.log('Fetching all topics from database...');
    const topics = await Topic.find({})
      .populate('department', 'name code')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    console.log(`Found ${topics.length} topics`);

    // Convert topics to JSON format
    const topicsData = topics.map(topic => toJSON(topic));

    // Calculate statistics
    const statsByType = {};
    topics.forEach(topic => {
      statsByType[topic.type] = (statsByType[topic.type] || 0) + 1;
    });

    // Create export object
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        exportDateFormatted: new Date().toLocaleString('vi-VN'),
        totalTopics: topics.length,
        statistics: {
          byType: statsByType
        }
      },
      topics: topicsData
    };

    // Create output directory if it doesn't exist
    const outputDir = path.join(__dirname, '../../exports');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `topics-export-${timestamp}.json`;
    const filepath = path.join(outputDir, filename);

    // Write to file with pretty formatting
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2), 'utf8');

    console.log(`\n✅ Export thành công!`);
    console.log(`📁 File được lưu tại: ${filepath}`);
    console.log(`📊 Tổng số topics: ${topics.length}`);

    console.log(`\n📈 Thống kê theo loại:`);
    Object.entries(statsByType).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count}`);
    });

  } catch (error) {
    console.error('❌ Lỗi khi export topics:', error);
    throw error;
  } finally {
    // Disconnect from database
    await disconnectDB();
    console.log('\nĐã đóng kết nối database.');
  }
};

// Run the export function
exportTopicsToJson()
  .then(() => {
    console.log('\n✨ Hoàn thành!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Có lỗi xảy ra:', error);
    process.exit(1);
  });

