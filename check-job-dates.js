import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Topic from './src/models/topic.model.js';

dotenv.config();

async function checkJobDates() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const now = new Date();
        console.log('📅 Current date:', now.toISOString());
        console.log('📅 Current date (local):', now.toLocaleString('vi-VN'), '\n');

        // Get all jobs
        const allJobs = await Topic.find({ type: 'job' }).limit(5);

        console.log(`📊 Total jobs in database: ${allJobs.length}\n`);

        allJobs.forEach((job, index) => {
            console.log(`[${index + 1}] ${job.title}`);
            console.log(`  End Date: ${job.endDate ? job.endDate.toISOString() : 'NULL'}`);
            console.log(`  Application Deadline: ${job.applicationDeadline ? job.applicationDeadline.toISOString() : 'NULL'}`);

            const isExpired = (job.endDate && job.endDate < now) ||
                (job.applicationDeadline && job.applicationDeadline < now);
            const hasNoDate = !job.endDate && !job.applicationDeadline;

            console.log(`  Status: ${isExpired ? '❌ EXPIRED' : (hasNoDate ? '✅ NO DATE (should show)' : '✅ ACTIVE')}`);
            console.log('');
        });

        // Count jobs that should be visible
        const visibleJobs = await Topic.find({
            type: 'job',
            $or: [
                { endDate: { $gte: now } },
                { endDate: null },
                { applicationDeadline: { $gte: now } },
                { applicationDeadline: null }
            ]
        });

        console.log(`\n✅ Jobs that should be visible: ${visibleJobs.length}`);

        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkJobDates();
