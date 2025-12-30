import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config();

// Models
import User from '../models/user.model.js';
import Topic from '../models/topic.model.js';
import Department from '../models/department.model.js';
import ChatSession from '../models/chatSession.model.js';
import Message from '../models/message.model.js';
import ActivityLog from '../models/activityLog.model.js';
import VerificationToken from '../models/verificationToken.model.js';
import VerificationCode from '../models/verificationCode.model.js';
import AiTraining from '../models/aiTraining.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BACKUP_DIR = path.join(process.cwd(), 'backups');

const exportData = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create backup directory with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, timestamp);

    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR);
    }
    fs.mkdirSync(backupPath);

    console.log(`Exporting data to: ${backupPath}`);

    // Define models to export
    const models = {
      users: User,
      topics: Topic,
      departments: Department,
      chat_sessions: ChatSession,
      messages: Message,
      activity_logs: ActivityLog,
      verification_tokens: VerificationToken,
      verification_codes: VerificationCode,
      ai_trainings: AiTraining
    };

    // Export each collection
    for (const [name, model] of Object.entries(models)) {
      console.log(`Exporting ${name}...`);
      const data = await model.find({});
      const filePath = path.join(backupPath, `${name}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`  Saved ${data.length} records to ${name}.json`);
    }

    console.log('Export completed successfully!');
  } catch (error) {
    console.error('Export failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit();
  }
};

exportData();
