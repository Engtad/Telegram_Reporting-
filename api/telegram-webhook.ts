import 'dotenv/config';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { generateReportPDF, storeReport } from '../src/agents/reportGeneratorAgent.js';

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
    '🌾 Welcome to Field Report Bot!\n\n' +
    'Send me:\n' +
    '📝 Text notes about your field work\n' +
    '📷 Photos to document your inspection\n\n' +
    '/report - Generate PDF report\n' +
    '/clear - Clear current session\n' +
    '/help - Show commands'
  );
});

// HELP COMMAND
bot.help((ctx) => {
  console.log(`📖 Help requested by ${ctx.from.first_name}`);
  ctx.reply(
    '📖 Available Commands:\n\n' +
    '/start - Start bot\n' +
    '/report - Generate PDF report\n' +
    '/clear - Clear session data\n' +
    '/help - Show this message\n\n' +
    '💡 Tip: Send multiple notes and photos before generating your report!'
  );
});

// CLEAR COMMAND
bot.command('clear', (ctx) => {
  const userId = ctx.from.id;
  sessions.delete(userId);
  console.log(`🗑️ Session cleared for ${ctx.from.first_name}`);
  ctx.reply('✅ Session cleared! Start fresh by sending new notes and photos.');
});

// REPORT COMMAND - Generate PDF
bot.command('report', async (ctx) => {
  try {
    const userId = ctx.from.id;
    const session = sessions.get(userId);

    console.log(`📊 Report requested by ${ctx.from.first_name}`);

    // Check if data exists
    if (!session || (session.notes.length === 0 && session.photoBuffers.length === 0)) {
      console.log('❌ No data found');
      await ctx.reply('❌ No data collected yet.\n\nPlease send:\n• Text notes\n• Photos\n\nThen type /report again.');
      return;
    }

    await ctx.reply('🔄 Generating PDF report with photos... (15-20 seconds)');
    console.log(`✅ Generating PDF: ${session.notes.length} notes, ${session.photoBuffers.length} photos`);

    // Convert notes to FieldInput format
    const inputs = session.notes.map((note, idx) => ({
      id: idx + 1,
      session_id: userId,
      raw_content: note,
      cleaned_content: note,
      created_at: new Date().toISOString()
    }));

    // Convert photos to Photo format
    const photos = session.photoUrls.map((url, idx) => ({
      id: idx + 1,
      session_id: userId,
      storage_url: url,
      category: idx === 0 ? 'cover' : idx === session.photoUrls.length - 1 ? 'final' : 'during',
      caption: `Field photo ${idx + 1}`,
      telegram_file_id: '',
      created_at: new Date().toISOString()
    })) as any[];

    // Generate PDF
    const { buffer, filename } = await generateReportPDF({
      session: {
        id: userId,
        telegram_user_id: userId.toString(),
        telegram_username: ctx.from.username || ctx.from.first_name,
        client_name: 'Field Inspection',
        site_name: 'Site Location',
        created_at: new Date().toISOString()
      } as any,
      inputs: inputs as any,
      photos,
      units: 'both'
    });

    console.log(`📄 PDF generated: ${filename}`);

    // Upload to Supabase
    const publicUrl = await storeReport(buffer, filename);
    if (publicUrl) {
      console.log(`💾 PDF uploaded to Supabase: ${publicUrl}`);
    }

    // Send PDF to Telegram
    console.log('📤 Sending PDF to Telegram...');
    await ctx.replyWithDocument(
      { source: buffer, filename },
      { 
        caption: '✅ **Field Report Generated**\n\n' +
                 `📝 Notes: ${session.notes.length}\n` +
                 `📷 Photos: ${session.photoBuffers.length}\n` +
                 `📊 Pages: Professional multi-page report\n\n` +
                 `🔗 [View Online](${publicUrl || 'Processing...'})`,
        parse_mode: 'Markdown'
      }
    );

    console.log('✅ PDF sent successfully');
    
    // Clear session after successful report
    sessions.delete(userId);
    await ctx.reply('💡 Session cleared. Ready for your next report!');

  } catch (error) {
    console.error('❌ PDF generation error:', error);
    await ctx.reply('❌ Error generating PDF. Please try again or contact support.\n\nError: ' + (error as Error).message);
  }
});

// TEXT HANDLER - Store notes
bot.on(message('text'), async (ctx) => {
  try {
    const userId = ctx.from.id;
    const text = ctx.message.text;

    // Ignore commands
    if (text.startsWith('/')) return;

    console.log(`📝 Text from ${ctx.from.first_name}: ${text}`);

    if (!sessions.has(userId)) {
      sessions.set(userId, { notes: [], photoUrls: [], photoBuffers: [] });
    }

    const session = sessions.get(userId)!;
    session.notes.push(text);

    await ctx.reply(
      `✅ Note ${session.notes.length} saved!\n\n` +
      `"${text.substring(0, 60)}${text.length > 60 ? '...' : ''}"\n\n` +
      `📊 Current session:\n` +
      `• ${session.notes.length} note(s)\n` +
      `• ${session.photoBuffers.length} photo(s)\n\n` +
      `Type /report when ready to generate PDF.`
    );
  } catch (error) {
    console.error('❌ Text processing error:', error);
    await ctx.reply('❌ Error saving note. Please try again.');
  }
});

// PHOTO HANDLER - Download and store photos
bot.on(message('photo'), async (ctx) => {
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
