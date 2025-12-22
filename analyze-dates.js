import fs from 'fs';

const data = JSON.parse(fs.readFileSync('./exports/topics-export-2025-12-22T17-01-31.json', 'utf8'));

// Topics without BOTH startDate and endDate
const noStartEnd = data.topics.filter(t => !t.startDate && !t.endDate);

console.log('📊 Topics without startDate AND endDate:', noStartEnd.length);
console.log('📊 Total topics:', data.topics.length);
console.log('📊 Percentage:', ((noStartEnd.length / data.topics.length) * 100).toFixed(2) + '%');

// Breakdown by type
const byType = {};
noStartEnd.forEach(t => {
    byType[t.type] = (byType[t.type] || 0) + 1;
});

console.log('\n📈 Breakdown by type:');
Object.entries(byType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
});

// Show examples
if (noStartEnd.length > 0) {
    console.log('\n📝 First 10 examples:');
    noStartEnd.slice(0, 10).forEach((t, i) => {
        console.log(`\n[${i + 1}] ${t.title}`);
        console.log(`  Type: ${t.type}`);
        console.log(`  Has applicationDeadline: ${!!t.applicationDeadline ? 'YES' : 'NO'}`);
        if (t.applicationDeadline) {
            console.log(`  Application Deadline: ${new Date(t.applicationDeadline).toLocaleDateString('vi-VN')}`);
        }
    });
}

// Also check topics with only one date field
const onlyStartDate = data.topics.filter(t => t.startDate && !t.endDate);
const onlyEndDate = data.topics.filter(t => !t.startDate && t.endDate);

console.log('\n\n📊 Additional stats:');
console.log(`Topics with ONLY startDate (no endDate): ${onlyStartDate.length}`);
console.log(`Topics with ONLY endDate (no startDate): ${onlyEndDate.length}`);
console.log(`Topics with BOTH dates: ${data.topics.filter(t => t.startDate && t.endDate).length}`);
