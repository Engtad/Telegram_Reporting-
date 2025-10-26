import 'dotenv/config';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * Clean and format text using GROQ AI
 * @param {string} text - Raw user input text
 * @returns {Promise<string>} - Cleaned, formatted text
 */
export async function cleanTextWithAI(text) {
  if (!text || text.trim().length === 0) {
    return text;
  }

  try {
    console.log(`🤖 Cleaning text (${text.length} chars)...`);
    
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a text cleaning assistant. Your job:
1. Fix spelling mistakes
2. Fix grammar errors
3. Remove excessive whitespace
4. Keep the original meaning
5. Return ONLY the cleaned text, no explanations
6. If text is already clean, return it as-is`
        },
        {
          role: 'user',
          content: text
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 2048
    });

    const cleanedText = response.choices[0]?.message?.content || text;
    console.log('✅ Text cleaned successfully');
    return cleanedText.trim();
    
  } catch (error) {
    console.error('❌ AI cleaning failed:', error.message);
    // Return original text if AI fails
    return text;
  }
}

/**
 * Clean multiple text entries
 * @param {string[]} textArray - Array of text entries
 * @returns {Promise<string[]>} - Array of cleaned texts
 */
export async function cleanMultipleTexts(textArray) {
  const cleanedTexts = [];
  
  for (const text of textArray) {
    const cleaned = await cleanTextWithAI(text);
    cleanedTexts.push(cleaned);
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return cleanedTexts;
}
