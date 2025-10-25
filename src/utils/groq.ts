import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY as string;

if (!apiKey) {
  console.error('Missing GROQ_API_KEY');
}

export const groq = new Groq({ apiKey });

export async function generateText({
  system,
  user,
  temperature = 0.2
}: {
  system: string;
  user: string;
  temperature?: number;
}): Promise<string> {
  const model = 'llama-3.1-70b-versatile';

  const completion = await groq.chat.completions.create({
    model,
    temperature,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ]
  });

  const content = completion.choices?.[0]?.message?.content || '';
  return content.trim();
}
