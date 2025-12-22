import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Topic from './src/models/topic.model.js';

dotenv.config();

async function checkJobData() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Count all topics by type
        const typeCounts = await Topic.aggregate([
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);

        console.log('\n📊 Topics by type:');
        typeCounts.forEach(({ _id, count }) => {
            console.log(`  ${_id}: ${count}`);
        });

        // Get all job topics
        const jobs = await Topic.find({ type: 'job' })
            .populate('department', 'name code')
            .limit(5);

        console.log(`\n💼 Sample job topics (showing ${jobs.length}):`);
        jobs.forEach((job, index) => {
            console.log(`\n[${index + 1}] ${job.title}`);
            console.log(`  Description: ${job.description.substring(0, 100)}...`);
            console.log(`  Company: ${job.company || 'N/A'}`);
            console.log(`  Position: ${job.position || 'N/A'}`);
            console.log(`  Department: ${job.department?.name || 'General'}`);
            console.log(`  End Date: ${job.endDate || 'N/A'}`);
            console.log(`  Application Deadline: ${job.applicationDeadline || 'N/A'}`);
        });

        // Test text search
        console.log('\n🔍 Testing text search for "job"...');
        const searchResults = await Topic.find({
            $text: { $search: 'job employment work' },
            type: 'job'
        }).limit(3);
        console.log(`Found ${searchResults.length} results with text search`);

        await mongoose.connection.close();
        console.log('\n✅ Done');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkJobData();
