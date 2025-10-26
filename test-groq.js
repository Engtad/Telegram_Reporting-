import dotenv from 'dotenv';
import { cleanTextWithAI } from './groq-cleaner.js';

dotenv.config();

async function test() {
  const dirtyText = 'this is a tst with   bad speling and   lots of   spaces';
  console.log('Original:', dirtyText);
  console.log('');
  
  const clean = await cleanTextWithAI(dirtyText);
  console.log('');
  console.log('Cleaned:', clean);
}

test().catch(console.error);
