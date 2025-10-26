// test-groq-connection.js
// Simple GROQ API connection test
import 'dotenv/config';
import Groq from 'groq-sdk';

console.log('🔌 Testing GROQ API Connection...\n');

// Step 1: Check if API key is loaded
console.log('1️⃣ Checking API key...');
const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.error('❌ GROQ_API_KEY not found in environment variables');
  console.error('   Check your .env file');
  process.exit(1);
}

console.log(`✅ API key found: ${apiKey.substring(0, 10)}...${apiKey.slice(-4)}`);

// Step 2: Initialize Groq client
console.log('\n2️⃣ Initializing GROQ client...');
const groq = new Groq({
  apiKey: apiKey
});
console.log('✅ Client initialized');

// Step 3: Test API connection with simple request
console.log('\n3️⃣ Testing API connection...');
try {
  const startTime = Date.now();
  
  const response = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: 'Say "Connection successful!" in exactly 3 words.'
      }
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.1,
    max_tokens: 50
  });

  const duration = Date.now() - startTime;
  
  console.log('✅ API connection successful!\n');
  console.log('📊 Response Details:');
  console.log(`   Model: ${response.model}`);
  console.log(`   Response: "${response.choices[0].message.content}"`);
  console.log(`   Tokens used: ${response.usage.total_tokens}`);
  console.log(`   Response time: ${duration}ms`);
  
  console.log('\n✅ ALL TESTS PASSED - GROQ API is ready to use!');
  
} catch (error) {
  console.error('\n❌ API connection failed');
  console.error('   Error:', error.message);
  
  if (error.status === 401) {
    console.error('   → Invalid API key. Generate a new one at: https://console.groq.com/keys');
  } else if (error.status === 429) {
    console.error('   → Rate limit exceeded. Wait a moment and try again.');
  } else {
    console.error('   → Check your internet connection and try again.');
  }
  
  process.exit(1);
}
