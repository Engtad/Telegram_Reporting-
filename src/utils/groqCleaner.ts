// src/utils/groqCleaner.ts
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!
});

/**
 * Clean a single text string using GROQ AI
 */
export async function cleanTextWithAI(text: string): Promise<string> {
  if (!text || text.trim().length === 0) {
    return text;
  }

  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a text cleaning assistant. Fix spelling errors, remove extra spaces, and improve formatting. Return ONLY the cleaned text, no explanations.'
        },
        {
          role: 'user',
          content: text
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.1,
      max_tokens: 1000
    });

    return response.choices[0].message.content || text;
  } catch (error) {
    console.error('GROQ cleaning error:', error);
    return text; // Return original text if cleaning fails
  }
}

/**
 * Clean multiple text strings in parallel
 */
export async function cleanMultipleTexts(texts: string[]): Promise<string[]> {
  const cleanPromises = texts.map(text => cleanTextWithAI(text));
  return Promise.all(cleanPromises);
}
