import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./exports/topics-export-2025-12-22T17-01-31.json', 'utf8'));

// Current date: 23/12/2025 00:05
const now = new Date('2025-12-23T00:05:00+07:00');
console.log('📅 Current date:', now.toLocaleString('vi-VN'));
console.log('📅 ISO:', now.toISOString());
console.log('='.repeat(80));

// Topics with expired endDate
const expiredEndDate = data.topics.filter(t => {
    if (!t.endDate) return false;
    return new Date(t.endDate) < now;
});

// Topics with expired applicationDeadline
const expiredAppDeadline = data.topics.filter(t => {
    if (!t.applicationDeadline) return false;
    return new Date(t.applicationDeadline) < now;
});

// Topics with EITHER endDate OR applicationDeadline expired
const expiredEither = data.topics.filter(t => {
    const hasExpiredEndDate = t.endDate && new Date(t.endDate) < now;
    const hasExpiredAppDeadline = t.applicationDeadline && new Date(t.applicationDeadline) < now;
    return hasExpiredEndDate || hasExpiredAppDeadline;
});

// Topics with BOTH dates expired (if both exist)
const expiredBoth = data.topics.filter(t => {
    const hasEndDate = !!t.endDate;
    const hasAppDeadline = !!t.applicationDeadline;

    if (hasEndDate && hasAppDeadline) {
        return new Date(t.endDate) < now && new Date(t.applicationDeadline) < now;
    } else if (hasEndDate && !hasAppDeadline) {
        return new Date(t.endDate) < now;
    } else if (!hasEndDate && hasAppDeadline) {
        return new Date(t.applicationDeadline) < now;
    }
    return false;
});

console.log('\n📊 EXPIRED TOPICS ANALYSIS:\n');
console.log(`Topics with expired endDate: ${expiredEndDate.length}`);
console.log(`Topics with expired applicationDeadline: ${expiredAppDeadline.length}`);
console.log(`Topics with EITHER date expired: ${expiredEither.length}`);
console.log(`Topics with ALL their dates expired: ${expiredBoth.length}`);
console.log(`\nTotal topics: ${data.topics.length}`);
console.log(`Percentage expired: ${((expiredBoth.length / data.topics.length) * 100).toFixed(2)}%`);

// Breakdown by type
console.log('\n📈 Expired topics by type:');
const byType = {};
expiredBoth.forEach(t => {
    byType[t.type] = (byType[t.type] || 0) + 1;
});
Object.entries(byType).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
});

// Active topics (not expired)
const activeTopics = data.topics.filter(t => {
    const hasEndDate = !!t.endDate;
    const hasAppDeadline = !!t.applicationDeadline;

    if (!hasEndDate && !hasAppDeadline) {
        return true; // No dates = always active
    }

    if (hasEndDate && hasAppDeadline) {
        return new Date(t.endDate) >= now || new Date(t.applicationDeadline) >= now;
    } else if (hasEndDate) {
        return new Date(t.endDate) >= now;
    } else if (hasAppDeadline) {
        return new Date(t.applicationDeadline) >= now;
    }
    return false;
});

console.log('\n✅ ACTIVE TOPICS (not expired):');
console.log(`Total active: ${activeTopics.length}`);
console.log(`Percentage active: ${((activeTopics.length / data.topics.length) * 100).toFixed(2)}%`);

const activeByType = {};
activeTopics.forEach(t => {
    activeByType[t.type] = (activeByType[t.type] || 0) + 1;
});
console.log('\nActive topics by type:');
Object.entries(activeByType).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
});

// Show some examples of expired topics
console.log('\n📝 Examples of EXPIRED topics (first 10):');
expiredBoth.slice(0, 10).forEach((t, i) => {
    console.log(`\n[${i + 1}] ${t.title}`);
    console.log(`  Type: ${t.type}`);
    if (t.endDate) {
        const endDate = new Date(t.endDate);
        console.log(`  End Date: ${endDate.toLocaleDateString('vi-VN')} (${endDate < now ? '❌ EXPIRED' : '✅ ACTIVE'})`);
    }
    if (t.applicationDeadline) {
        const appDeadline = new Date(t.applicationDeadline);
        console.log(`  App Deadline: ${appDeadline.toLocaleDateString('vi-VN')} (${appDeadline < now ? '❌ EXPIRED' : '✅ ACTIVE'})`);
    }
});

// Show some examples of active topics
console.log('\n\n📝 Examples of ACTIVE topics (first 10):');
activeTopics.slice(0, 10).forEach((t, i) => {
    console.log(`\n[${i + 1}] ${t.title}`);
    console.log(`  Type: ${t.type}`);
    if (t.endDate) {
        const endDate = new Date(t.endDate);
        console.log(`  End Date: ${endDate.toLocaleDateString('vi-VN')} (${endDate < now ? '❌ EXPIRED' : '✅ ACTIVE'})`);
    }
    if (t.applicationDeadline) {
        const appDeadline = new Date(t.applicationDeadline);
        console.log(`  App Deadline: ${appDeadline.toLocaleDateString('vi-VN')} (${appDeadline < now ? '❌ EXPIRED' : '✅ ACTIVE'})`);
    }
});
