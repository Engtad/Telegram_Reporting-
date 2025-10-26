import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testUpload() {
  console.log('Testing Supabase upload...');
  
  const testData = Buffer.from('Test file content - ' + new Date().toISOString());
  const fileName = `test-${Date.now()}.txt`;
  
  const { data, error } = await supabase.storage
    .from('reports')
    .upload(fileName, testData, {
      contentType: 'text/plain',
      upsert: false
    });
  
  if (error) {
    console.error('❌ Upload failed:', error.message);
    console.error('Error code:', error.statusCode);
    console.error('Full error:', error);
  } else {
    console.log('✅ Upload successful!');
    console.log('File path:', data.path);
    console.log('Full URL:', `${process.env.SUPABASE_URL}/storage/v1/object/public/reports/${data.path}`);
  }
}

testUpload();
