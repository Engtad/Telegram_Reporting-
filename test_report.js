// Test file to verify report generation
const sessions = new Map();

// Mock user data
const userId = 12345;
const userName = 'TestUser';

// Add test data
sessions.set(userId, {
  notes: [
    'check location of gearbox mount, it is rust',
    'her we need to change all elements'
  ],
  photoCount: 1
});

// Generate report
function generateReport(userId, userName) {
  const session = sessions.get(userId);

  if (!session || (session.notes.length === 0 && session.photoCount === 0)) {
    console.log('❌ No data collected');
    return null;
  }

  const notesList = session.notes.length > 0 
    ? session.notes.map((note, i) => `${i + 1}. ${note}`).join('\n')
    : 'No notes recorded';

  const report = `
📊 FIELD REPORT SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 User: ${userName}
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

  return report;
}

// Test the function
console.log('🧪 Testing Report Generation...\n');
const report = generateReport(userId, userName);

if (report) {
  console.log('✅ Report Generated Successfully:\n');
  console.log(report);
} else {
  console.log('❌ Report generation failed');
}
