import 'dotenv/config';

interface UserSession {
  notes: string[];
  photoCount: number;
}

const sessions = new Map<number, UserSession>();

// Simulate user interaction
function simulateUserData() {
  const userId = 999;
  sessions.set(userId, {
    notes: [
      'check location of gearbox mount, it is rust',
      'her we need to change all elements'
    ],
    photoCount: 1
  });
  
  return userId;
}

// Test report generation
function testReportCommand(userId: number) {
  console.log('\n📊 Testing /report command...');
  
  const session = sessions.get(userId);

  if (!session || (session.notes.length === 0 && session.photoCount === 0)) {
    console.log('❌ No data collected');
    return false;
  }

  console.log(`✅ Found session data`);
  console.log(`   - Notes: ${session.notes.length}`);
  console.log(`   - Photos: ${session.photoCount}`);

  const notesList = session.notes.length > 0 
    ? session.notes.map((note, i) => `${i + 1}. ${note}`).join('\n')
    : 'No notes recorded';

  const report = `
📊 FIELD REPORT SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 User: TestUser
⏰ Generated: ${new Date().toLocaleString()}

📝 NOTES (${session.notes.length} total):
${notesList}

📷 PHOTOS: ${session.photoCount} attached

📊 STATISTICS:
   • Total Notes: ${session.notes.length}
   • Total Photos: ${session.photoCount}
   • Items: ${session.notes.length + session.photoCount}
━━━━━━━━━━━━━━━━━━━━━━━━━━
  `;

  console.log('\n📤 Would send this report:\n');
  console.log(report);
  return true;
}

// Run test
console.log('🧪 Testing Bot Report Function');
const userId = simulateUserData();
testReportCommand(userId);
