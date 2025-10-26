import { generateWordDoc } from './word-generator.js';

async function test() {
  console.log('Creating Word document...');
  
  await generateWordDoc({
    notes: [
      'This is the first note with some test content',
      'This is the second note with more detailed information',
      'Here is a third note to test formatting'
    ],
    imagePaths: [], // Add image paths if you have test images
    outputPath: 'test-report.docx',
    title: 'Test Report'
  });
  
  console.log('');
  console.log('✅ Done! Open test-report.docx in Microsoft Word to verify');
}

test().catch(console.error);
