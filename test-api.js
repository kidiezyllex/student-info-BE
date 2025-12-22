import fetch from 'node-fetch';

async function testAPI() {
    try {
        console.log('🧪 Testing API with question: "Có những cơ hội việc làm nào?"\n');

        const response = await fetch('http://localhost:5000/api/chat/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                question: 'Có những cơ hội việc làm nào?',
                sessionId: '6949746f4910f2aac57dcac3'
            })
        });

        const data = await response.json();

        console.log('✅ Response received!\n');
        console.log('Status:', response.status);
        console.log('\n📝 Answer:');
        console.log(data.answer || data.content || JSON.stringify(data, null, 2));

        if (data.relevantTopics) {
            console.log('\n📚 Relevant Topics Found:', data.relevantTopics.length);
            data.relevantTopics.forEach((topic, i) => {
                console.log(`  [${i + 1}] ${topic.title} (${topic.type})`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testAPI();
