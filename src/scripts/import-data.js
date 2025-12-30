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

const importData = async () => {
  try {
    // Get backup folder from args
    const backupFolder = process.argv[2];
    if (!backupFolder) {
      console.error('Please provide backup folder name as argument');
      console.error('Example: npm run db:import 2025-12-31T00-33-00-000Z');
      
      // List available backups
      if (fs.existsSync(BACKUP_DIR)) {
        const backups = fs.readdirSync(BACKUP_DIR);
        console.log('\nAvailable backups:');
        backups.forEach(b => console.log(` - ${b}`));
      }
      process.exit(1);
    }

    const importPath = path.join(BACKUP_DIR, backupFolder);
    if (!fs.existsSync(importPath)) {
      console.error(`Backup folder not found: ${importPath}`);
      process.exit(1);
    }

    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log(`Importing data from: ${importPath}`);
    console.log('WARNING: This will overwrite/append to existing data. Duplicates may occur if _id exists.');
    
    // Define models to import
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

    for (const [name, model] of Object.entries(models)) {
      const filePath = path.join(importPath, `${name}.json`);
      if (fs.existsSync(filePath)) {
        console.log(`Importing ${name}...`);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(fileContent);

        if (data.length > 0) {
          try {
            // Option 1: InsertMany (might fail on duplicates)
            // await model.insertMany(data);
            
             // Option 2: Upsert (Update or Insert) based on _id
            for (const item of data) {
              await model.findByIdAndUpdate(item._id, item, { upsert: true });
            }
            console.log(`  Imported/Updated ${data.length} records to ${name}`);
          } catch (err) {
            console.error(`  Error importing ${name}:`, err.message);
          }
        } else {
             console.log(`  Skipping ${name} (empty)`);
        }
      }
    }

    console.log('Import completed successfully!');
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit();
  }
};

importData();
