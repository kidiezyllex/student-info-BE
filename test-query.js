import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Topic from './src/models/topic.model.js';

dotenv.config();

async function testQuery() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const now = new Date();

        // Test the NEW query logic
        console.log('🧪 Testing NEW query logic:\n');

        const newQuery = {
            type: 'job',
            $or: [
                { endDate: null, applicationDeadline: null },
                { endDate: { $gte: now } },
                { applicationDeadline: { $gte: now } }
            ]
        };

        console.log('Query:', JSON.stringify(newQuery, null, 2));

        const results = await Topic.find(newQuery);
        console.log(`\n✅ Found ${results.length} jobs\n`);

        if (results.length > 0) {
            results.slice(0, 3).forEach((job, i) => {
                console.log(`[${i + 1}] ${job.title}`);
                console.log(`  End Date: ${job.endDate || 'NULL'}`);
                console.log(`  Application Deadline: ${job.applicationDeadline || 'NULL'}`);
                console.log('');
            });
        }

        // Also test without date filter
        console.log('\n🧪 Testing WITHOUT date filter:\n');
        const allJobs = await Topic.find({ type: 'job' });
        console.log(`✅ Total jobs in DB: ${allJobs.length}\n`);

        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

testQuery();
