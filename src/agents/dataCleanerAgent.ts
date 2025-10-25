import { generateText } from '../utils/groq';
import type { CleanTextResult } from '../types/index';

export async function cleanFieldText(raw: string): Promise<CleanTextResult> {
  const system = [
    'You are a senior field engineer editing site notes.',
    'Rewrite field notes into concise, professional engineering language.',
    'Preserve all facts and measurements. Do not invent data.',
    'Correct grammar and expand colloquialisms into formal terms.',
    'Return only the edited text.'
  ].join(' ');

  const user = raw;

  const cleaned = await generateText({ system, user, temperature: 0.2 });
  return { cleaned };
}
