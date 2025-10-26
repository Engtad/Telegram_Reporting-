import dotenv from 'dotenv';
import 'dotenv/config';
import { Telegraf } from 'telegraf';
import { cleanMultipleTexts } from '../src/utils/groqCleaner.js';
import { generateWordDoc } from '../src/utils/wordGenerator.js';
import { createClient } from '@supabase/supabase-js';
import { generatePdfFromHtml, createReportHtml } from '../src/utils/htmlToPdf.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);



dotenv.config();

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
if (!BOT_TOKEN) throw new Error('Missing TELEGRAM_BOT_TOKEN');

const bot = new Telegraf(BOT_TOKEN);

interface UserSession {
  notes: string[];
  photoUrls: string[];
  photoBuffers: Buffer[];
}

const sessions = new Map<number, UserSession>();



// START COMMAND
bot.start((ctx) => {
  console.log(`✅ User started: ${ctx.from.first_name}`);
  ctx.reply(
    '👋 Welcome to Field Report Bot!\n\n' +
    'Send me:\n' +
    '📝 Text notes about your field work\n' +
    '📷 Photos to document your inspection\n\n' +
    '📄 Commands:\n' +
    '/report - Generate PDF report\n' +
    '/exportword - Generate Word doc (AI-cleaned) 🆕\n' +
    '/clear - Clear current session\n' +
    '/help - Show all commands\n\n' +
    '🤖 Powered by GROQ AI text cleaning'
  );
});


// HELP COMMAND
bot.help((ctx) => {
  console.log(`📋 Help requested by ${ctx.from.first_name}`);
  ctx.reply(
    '📋 Available Commands:\n\n' +
    '/start - Start bot\n' +
    '/report - Generate PDF report\n' +
    '/exportword - Generate Word document (AI-cleaned) 🆕\n' +
    '/clear - Clear session data\n' +
    '/help - Show this message\n\n' +
    '💡 Tip: Send multiple notes and photos before generating reports!\n' +
    '🤖 AI text cleaning powered by GROQ'
  );
});
// EXPORTWORD COMMAND - Generate Word + PDF with AI cleaning
bot.command('exportword', async (ctx) => {
  try {
    const userId = ctx.from.id;
    const session = sessions.get(userId);

    console.log(`📝 Word export requested by ${ctx.from.first_name}`);

    if (!session || (session.notes.length === 0 && session.photoBuffers.length === 0)) {
      await ctx.reply('❌ No data yet.\n\nSend notes and photos, then type /exportword');
      return;
    }

    await ctx.reply('📝 Generating Word + PDF with AI cleaning... (15-25 seconds)');

    // Clean with GROQ AI
    const cleanedNotes = await cleanMultipleTexts(session.notes);
    console.log(`✅ Cleaned ${cleanedNotes.length} notes`);

    // Save photos temporarily
    const tempPhotoPaths: string[] = [];
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    for (let i = 0; i < session.photoBuffers.length; i++) {
      const tempPath = path.join(tempDir, `photo-${userId}-${i}.jpg`);
      fs.writeFileSync(tempPath, session.photoBuffers[i]);
      tempPhotoPaths.push(tempPath);
    }

    // Generate Word document
    const wordFilename = `field-report-${userId}-${Date.now()}.docx`;
    const wordPath = path.join(tempDir, wordFilename);
    
    await generateWordDoc({
      title: `Field Report - ${ctx.from.first_name || 'User'}`,
      notes: cleanedNotes,
      imagePaths: tempPhotoPaths,
      outputPath: wordPath
    });

    // Generate PDF using Puppeteer (NO LibreOffice needed!)
    const pdfFilename = wordFilename.replace('.docx', '.pdf');
    const pdfPath = path.join(tempDir, pdfFilename);

    const html = createReportHtml(
      `Field Report - ${ctx.from.first_name || 'User'}`,
      cleanedNotes,
      session.photoBuffers
    );

    await generatePdfFromHtml({
      html,
      outputPath: pdfPath,
      title: `Field Report - ${ctx.from.first_name || 'User'}`
    });

    // Read files
    const wordBuffer = fs.readFileSync(wordPath);
    const pdfBuffer = fs.readFileSync(pdfPath);

    // Upload to Supabase
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
    await supabase.storage.from('reports').upload(`word-reports/${wordFilename}`, wordBuffer);
    await supabase.storage.from('reports').upload(`pdf-reports/${pdfFilename}`, pdfBuffer);

    // Send both files
    await ctx.replyWithDocument({ source: wordBuffer, filename: wordFilename });
    await ctx.replyWithDocument({ 
      source: pdfBuffer, 
      filename: pdfFilename 
    }, {
      caption: '✅ Report Generated\n\n📝 AI-cleaned with GROQ\n📷 Photos embedded\n\nType /exportword again or /clear to reset.'
    });

    // Cleanup
    tempPhotoPaths.forEach(p => {
      try {
        fs.unlinkSync(p);
      } catch(e) {}
    });
    fs.unlinkSync(wordPath);
    fs.unlinkSync(pdfPath);

  } catch (error) {
    console.error('❌ Export error:', error);
    await ctx.reply('❌ Error: ' + (error as Error).message);
  }
});

bot.on('text', async (ctx) => {
  const text = ctx.message.text;
  
  // Ignore ALL commands (not just those starting with /)
  if (text.startsWith('/')) {
    return; // Let command handlers deal with it
  }
  
  const userId = ctx.from.id;
  console.log(`📝 Text from ${ctx.from.first_name}: ${text}`);
  
  if (!sessions.has(userId)) {
    sessions.set(userId, { notes: [], photoUrls: [], photoBuffers: [] });
  }
  
  const session = sessions.get(userId)!;
  session.notes.push(text);
  
  await ctx.reply(
    `✅ Note ${session.notes.length} saved!\n\n` +
    `📊 Current session:\n` +
    `• ${session.notes.length} note(s)\n` +
    `• ${session.photoBuffers.length} photo(s)\n\n` +
    `Type /exportword when ready to generate Word + PDF.`
  );
});
/// Handle regular text messages (field notes)
bot.on('text', async (ctx) => {
  const text = ctx.message.text;
  
  // Ignore ALL commands - let command handlers deal with them
  if (text.startsWith('/')) {
    return;
  }
  
  const userId = ctx.from.id;
  const userName = ctx.from.first_name || 'User';
  
  console.log(`📝 Text from ${userName}: ${text}`);
  
  // Initialize session if it doesn't exist
  if (!sessions.has(userId)) {
    sessions.set(userId, { 
      notes: [], 
      photoUrls: [], 
      photoBuffers: [] 
    });
    console.log(`🆕 New session created for ${userName}`);
  }
  
  // Get the user's session
  const session = sessions.get(userId)!;
  
  // Add the note to session
  session.notes.push(text);
  console.log(`✅ Note added. Total notes: ${session.notes.length}`);
  
  // Send confirmation with current count
  await ctx.reply(
    `✅ Note ${session.notes.length} saved!\n\n` +
    `📊 Current session:\n` +
    `• ${session.notes.length} note(s)\n` +
    `• ${session.photoBuffers.length} photo(s)\n\n` +
    `Type /exportword when ready to generate Word + PDF.`,
    { parse_mode: 'Markdown' }
  );
});


// PHOTO HANDLER - Download and store photos
bot.on('photo', async (ctx) => {
  try {
    const userId = ctx.from.id;
    console.log(`📷 Photo from ${ctx.from.first_name}`);
    
    if (!sessions.has(userId)) {
      sessions.set(userId, { notes: [], photoUrls: [], photoBuffers: [] });
    }
    
    const session = sessions.get(userId)!;
    
    // Get highest resolution photo
    const photo = ctx.message.photo[ctx.message.photo.length - 1];
    const fileId = photo.file_id;
    
    // Download photo from Telegram
    const fileLink = await ctx.telegram.getFileLink(fileId);
    const response = await fetch(fileLink.href);
    const photoBuffer = Buffer.from(await response.arrayBuffer());
    
    session.photoUrls.push(fileLink.href);
    session.photoBuffers.push(photoBuffer);
    
    console.log(`💾 Photo ${session.photoBuffers.length} saved (${(photoBuffer.length / 1024).toFixed(1)}KB)`);
    
    await ctx.reply(
      `📷 Photo ${session.photoBuffers.length} saved!\n\n` +
      `📊 Current session:\n` +
      `• ${session.notes.length} note(s)\n` +
      `• ${session.photoBuffers.length} photo(s)\n\n` +
      `Type /exportword when ready to generate Word + PDF.\n` +
      `Type /report when ready to generate PDF.`
    );
    
  } catch (error) {
    console.error('❌ Photo processing error:', error);
    await ctx.reply('❌ Error saving photo. Please try again.');
  }
});


// START BOT
bot.launch();
console.log('✅ Bot is running with polling mode!');
console.log('📡 Listening for messages...');
console.log('📄 PDF generation enabled!');

// GRACEFUL SHUTDOWN
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
