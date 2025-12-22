import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Topic from './src/models/topic.model.js';

dotenv.config();

// Helper function to get random date in the future
function getRandomFutureDate(minDaysFromNow, maxDaysFromNow) {
    const now = new Date();
    const daysToAdd = Math.floor(Math.random() * (maxDaysFromNow - minDaysFromNow + 1)) + minDaysFromNow;
    const futureDate = new Date(now);
    futureDate.setDate(futureDate.getDate() + daysToAdd);
    return futureDate;
}

// Helper function to add hours to a date
function addHours(date, hours) {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + hours);
    return newDate;
}

async function updateDates() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        const now = new Date();
        let updatedCount = 0;

        // Get all topics
        const topics = await Topic.find({});
        console.log(`📊 Total topics: ${topics.length}\n`);

        for (const topic of topics) {
            let needsUpdate = false;
            const updates = {};

            // Update based on type
            switch (topic.type) {
                case 'event':
                case 'extracurricular':
                    // Events: 1-90 days in future, duration 2-8 hours
                    if (!topic.startDate || new Date(topic.startDate) < now ||
                        !topic.endDate || new Date(topic.endDate) < now) {
                        const startDate = getRandomFutureDate(1, 90);
                        const duration = Math.floor(Math.random() * 7) + 2; // 2-8 hours
                        updates.startDate = startDate;
                        updates.endDate = addHours(startDate, duration);
                        needsUpdate = true;
                    }
                    break;

                case 'volunteer':
                    // Volunteer: 5-120 days in future, duration 1-3 months
                    if (!topic.startDate || new Date(topic.startDate) < now ||
                        !topic.endDate || new Date(topic.endDate) < now) {
                        const startDate = getRandomFutureDate(5, 120);
                        const durationDays = Math.floor(Math.random() * 60) + 30; // 30-90 days
                        const endDate = new Date(startDate);
                        endDate.setDate(endDate.getDate() + durationDays);
                        updates.startDate = startDate;
                        updates.endDate = endDate;
                        needsUpdate = true;
                    }
                    break;

                case 'advertisement':
                case 'notification':
                    // Ads/Notifications: 1-60 days in future, duration 7-45 days
                    if (!topic.startDate || new Date(topic.startDate) < now ||
                        !topic.endDate || new Date(topic.endDate) < now) {
                        const startDate = getRandomFutureDate(1, 60);
                        const durationDays = Math.floor(Math.random() * 39) + 7; // 7-45 days
                        const endDate = new Date(startDate);
                        endDate.setDate(endDate.getDate() + durationDays);
                        updates.startDate = startDate;
                        updates.endDate = endDate;
                        needsUpdate = true;
                    }
                    break;

                case 'internship':
                    // Internships: 10-90 days in future, duration 2-4 months
                    if (!topic.startDate || new Date(topic.startDate) < now ||
                        !topic.endDate || new Date(topic.endDate) < now) {
                        const startDate = getRandomFutureDate(10, 90);
                        const durationDays = Math.floor(Math.random() * 60) + 60; // 60-120 days (2-4 months)
                        const endDate = new Date(startDate);
                        endDate.setDate(endDate.getDate() + durationDays);
                        updates.startDate = startDate;
                        updates.endDate = endDate;
                        needsUpdate = true;
                    }
                    // Application deadline: 1-2 weeks before start
                    if (!topic.applicationDeadline || new Date(topic.applicationDeadline) < now) {
                        const appDeadline = new Date(updates.startDate || topic.startDate);
                        appDeadline.setDate(appDeadline.getDate() - Math.floor(Math.random() * 8) - 7); // 7-14 days before
                        updates.applicationDeadline = appDeadline;
                        needsUpdate = true;
                    }
                    break;

                case 'job':
                case 'recruitment':
                    // Jobs/Recruitment: only applicationDeadline, 7-120 days in future
                    if (!topic.applicationDeadline || new Date(topic.applicationDeadline) < now) {
                        updates.applicationDeadline = getRandomFutureDate(7, 120);
                        needsUpdate = true;
                    }
                    break;

                case 'scholarship':
                    // Scholarships: only applicationDeadline, 14-150 days in future
                    if (!topic.applicationDeadline || new Date(topic.applicationDeadline) < now) {
                        updates.applicationDeadline = getRandomFutureDate(14, 150);
                        needsUpdate = true;
                    }
                    break;
            }

            // Update if needed
            if (needsUpdate) {
                await Topic.findByIdAndUpdate(topic._id, updates);
                updatedCount++;

                console.log(`✅ Updated: ${topic.title.substring(0, 50)}...`);
                console.log(`   Type: ${topic.type}`);
                if (updates.startDate) console.log(`   Start: ${updates.startDate.toLocaleDateString('vi-VN')}`);
                if (updates.endDate) console.log(`   End: ${updates.endDate.toLocaleDateString('vi-VN')}`);
                if (updates.applicationDeadline) console.log(`   Deadline: ${updates.applicationDeadline.toLocaleDateString('vi-VN')}`);
                console.log('');
            }
        }

        console.log(`\n✅ Update complete!`);
        console.log(`📊 Updated ${updatedCount} out of ${topics.length} topics`);

        // Verify results
        const expiredCount = await Topic.countDocuments({
            $or: [
                { endDate: { $lt: now } },
                { applicationDeadline: { $lt: now } }
            ]
        });

        const activeCount = await Topic.countDocuments({
            $or: [
                { endDate: { $gte: now } },
                { applicationDeadline: { $gte: now } },
                { $and: [{ endDate: null }, { applicationDeadline: null }] }
            ]
        });

        console.log(`\n📈 After update:`);
        console.log(`   Active topics: ${activeCount}`);
        console.log(`   Expired topics: ${expiredCount}`);

        await mongoose.connection.close();
        console.log('\n✅ Done!');
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

updateDates();
