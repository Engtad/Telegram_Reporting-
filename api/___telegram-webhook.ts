import 'dotenv/config';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
if (!BOT_TOKEN) throw new Error('Missing TELEGRAM_BOT_TOKEN');

const bot = new Telegraf(BOT_TOKEN);

interface UserSession {
  notes: string[];
  photoCount: number;
}

const sessions = new Map<number, UserSession>();

// START COMMAND
bot.start((ctx) => {
  console.log(`✅ User started: ${ctx.from.first_name}`);
  ctx.reply(
    '🌾 Welcome to Field Report Bot!\n\n' +
    'Send me:\n' +
    '📝 Text notes about your field\n' +
    '📷 Photos to organize\n\n' +
    '/report - Generate your report\n' +
    '/help - Show commands'
  );
});

// HELP COMMAND
bot.help((ctx) => {
  console.log(`📖 Help requested by ${ctx.from.first_name}`);
  ctx.reply(
    '📖 Commands:\n' +
    '/start - Start bot\n' +
    '/report - Generate report\n' +
    '/help - Show this message'
  );
});

// REPORT COMMAND - MUST BE BEFORE TEXT HANDLER
bot.command('report', async (ctx) => {
  try {
    const userId = ctx.from.id;
    const session = sessions.get(userId);

    console.log(`📊 Report requested by ${ctx.from.first_name}`);

    if (!session || (session.notes.length === 0 && session.photoCount === 0)) {
      console.log('❌ No data found');
      await ctx.reply('❌ No data collected. Send notes/photos first.');
      return;
    }

    console.log(`✅ Generating report: ${session.notes.length} notes, ${session.photoCount} photos`);

    const notesList = session.notes.length > 0 
      ? session.notes.map((note, i) => `${i + 1}. ${note}`).join('\n')
      : 'No notes recorded';

    const report = `📊 FIELD REPORT SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━
👤 User: ${ctx.from.first_name}
⏰ Generated: ${new Date().toLocaleString()}

📝 NOTES (${session.notes.length} total):
${notesList}

📷 PHOTOS: ${session.photoCount} attached

📊 STATISTICS:
   • Total Notes: ${session.notes.length}
   • Total Photos: ${session.photoCount}
   • Items: ${session.notes.length + session.photoCount}
━━━━━━━━━━━━━━━━━━━━━━━`;

    console.log('📤 Sending report to Telegram...');
    await ctx.reply(report);
    console.log(`✅ Report sent successfully`);
  } catch (error) {
    console.error('❌ Report error:', error);
    await ctx.reply('❌ Error generating report');
  }
});

// TEXT HANDLER - AFTER COMMANDS
bot.on(message('text'), async (ctx) => {
  try {
    const userId = ctx.from.id;
    const text = ctx.message.text;

    console.log(`📝 Text from ${ctx.from.first_name}: ${text}`);

    if (!sessions.has(userId)) {
      sessions.set(userId, { notes: [], photoCount: 0 });
    }

    const session = sessions.get(userId)!;
    session.notes.push(text);

    await ctx.reply(`✅ Saved note: "${text.substring(0, 30)}..."`);
  } catch (error) {
    console.error('❌ Text error:', error);
    await ctx.reply('❌ Error processing text');
  }
});

// PHOTO HANDLER - AFTER COMMANDS
bot.on(message('photo'), async (ctx) => {
  try {
    const userId = ctx.from.id;

    console.log(`📷 Photo from ${ctx.from.first_name}`);

    if (!sessions.has(userId)) {
      sessions.set(userId, { notes: [], photoCount: 0 });
    }

    const session = sessions.get(userId)!;
    session.photoCount += 1;

    await ctx.reply(`📷 Photo ${session.photoCount} saved!`);
  } catch (error) {
    console.error('❌ Photo error:', error);
    await ctx.reply('❌ Error processing photo');
  }
});

// START BOT
bot.launch();
console.log('✅ Bot is running with polling mode!');
console.log('📡 Listening for messages...');

// GRACEFUL SHUTDOWN
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
