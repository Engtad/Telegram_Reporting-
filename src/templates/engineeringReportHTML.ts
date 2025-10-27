// src/templates/engineeringReportHTML.ts

export interface UserSession {
  notes: string[];
  photoBuffers: Buffer[];
  photoCaptions: string[];
  photoUrls: string[];
  projectName?: string;
}

export interface AIAnalysis {
  summary?: string;
}

export function createEngineeringReportHTML(
  session: UserSession,
  analysis: AIAnalysis
): string {
  const projectName = session.projectName || 'Field Report - Tadrous';
  const reportDate = new Date().toLocaleDateString();
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${projectName}</title>
  <style>
    /* CRITICAL: Reset all default margins */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    /* ISO 5457 Page Setup - CRITICAL */
    @page {
      size: A4;
      margin: 0;  /* MUST BE ZERO for borders to work */
    }
    
    body {
      margin: 0;
      padding: 0;
      font-family: 'Calibri', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #212121;
      background: white;
    }
    
    /* Page Container - A4 exact dimensions */
    .page {
      position: relative;
      width: 210mm;
      height: 297mm;
      background: white;
      page-break-after: always;
    }
    
    /* ISO 5457 Border Frame - THE KEY ELEMENT */
    .iso-frame {
      position: absolute;
      top: 10mm;      /* 10mm top margin */
      left: 20mm;     /* 20mm filing margin (left) */
      right: 10mm;    /* 10mm right margin */
      bottom: 10mm;   /* 10mm bottom margin */
      border: 3px solid #000000;  /* Changed from 2px to 3px for better visibility */
      background: white;
    }
    
    /* Header Info Box (top-right corner) */
    .frame-header {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #f0f0f0;
      border: 3px solid #000;
      border-top: none;
      border-right: none;
      padding: 5mm 10mm;
      font-size: 9pt;
      font-weight: bold;
      color: #003366;
      z-index: 10;
    }
    
    /* Page Number Box (bottom-right corner) */
    .frame-footer {
      position: absolute;
      bottom: -2px;
      right: -2px;
      background: #f0f0f0;
      border: 3px solid #000;
      border-bottom: none;
      border-right: none;
      padding: 4mm 10mm;
      font-size: 9pt;
      font-weight: bold;
      z-index: 10;
    }
    
    /* Content Area Inside Frame */
    .content {
      position: absolute;
      top: 18mm;    /* 10mm frame + 8mm padding */
      left: 28mm;   /* 20mm frame + 8mm padding */
      right: 18mm;  /* 10mm frame + 8mm padding */
      bottom: 18mm; /* 10mm frame + 8mm padding */
      overflow: visible;
    }
    
    /* Typography */
    h1 {
      font-size: 18pt;
      color: #003366;
      margin-bottom: 12pt;
      border-bottom: 3pt solid #4A90E2;
      padding-bottom: 6pt;
    }
    
    h2 {
      font-size: 14pt;
      color: #003366;
      margin-top: 16pt;
      margin-bottom: 8pt;
      background: #f5f5f5;
      padding: 6pt 10pt;
      border-left: 4pt solid #4A90E2;
    }
    
    p {
      margin-bottom: 8pt;
      text-align: justify;
    }
    
    /* Notes List */
    .note {
      margin-bottom: 12pt;
      padding-left: 20pt;
      position: relative;
    }
    
    .note-number {
      position: absolute;
      left: 0;
      font-weight: bold;
      color: #003366;
    }
    
    /* Photos */
    .photo-container {
      margin: 16pt 0;
      border: 1px solid #ddd;
      padding: 10pt;
      background: #fafafa;
      break-inside: avoid;
    }
    
    .photo-image {
      width: 100%;
      max-width: 400px;
      height: auto;
      display: block;
      margin: 0 auto 8pt auto;
      border: 1px solid #ccc;
    }
    
    .photo-caption {
      font-style: italic;
      color: #666;
      text-align: center;
      font-size: 10pt;
    }
    
    /* Metadata */
    .timestamp {
      font-size: 9pt;
      color: #666;
      margin-bottom: 16pt;
    }
    
    .footer-text {
      font-size: 8pt;
      color: #999;
      text-align: center;
      margin-top: 16pt;
    }
  </style>
</head>
<body>
  
  <!-- PAGE 1: Report Content -->
  <div class="page">
    <div class="iso-frame">
      <div class="frame-header">
        ENGINEERING REPORT | ${reportDate}
      </div>
      <div class="content">
        <h1>${projectName}</h1>
        <p class="timestamp">Generated on ${new Date().toLocaleString()}</p>
        
        <h2>📝 Notes</h2>
        ${session.notes.map((note, index) => `
          <div class="note">
            <span class="note-number">Note ${index + 1}</span>
            ${note}
          </div>
        `).join('')}
        
        ${session.notes.length === 0 ? '<p>No notes recorded.</p>' : ''}
      </div>
      <div class="frame-footer">Page 1</div>
    </div>
  </div>
  
  <!-- PAGE 2: Photos (if any) -->
  ${session.photoBuffers.length > 0 ? `
  <div class="page">
    <div class="iso-frame">
      <div class="frame-header">
        ${projectName} | PHOTO DOCUMENTATION
      </div>
      <div class="content">
        <h2>📷 Photos</h2>
        
        ${session.photoUrls.map((url, index) => `
          <div class="photo-container">
            <img src="${url}" class="photo-image" alt="Photo ${index + 1}">
            <p class="photo-caption">
              ${session.photoCaptions[index] || 'No caption provided'}
            </p>
          </div>
        `).join('')}
        
        <p class="footer-text">
          Field Report Bot • Generated with AI-powered text cleaning
        </p>
      </div>
      <div class="frame-footer">Page 2</div>
    </div>
  </div>
  ` : ''}
  
</body>
</html>`;
}
