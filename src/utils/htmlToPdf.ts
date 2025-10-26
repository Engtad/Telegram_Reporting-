// src/utils/htmlToPdf.ts
import puppeteer from 'puppeteer';
import * as fs from 'fs';

export interface HtmlToPdfOptions {
  html: string;
  outputPath: string;
  title?: string;
}

export async function generatePdfFromHtml(options: HtmlToPdfOptions): Promise<void> {
  const { html, outputPath, title = 'Report' } = options;
  
  console.log('🌐 Launching Puppeteer...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set content with proper styling
  await page.setContent(html, {
    waitUntil: 'networkidle0'
  });
  
  console.log('📄 Converting HTML to PDF...');
  
  // Generate PDF
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20mm',
      right: '15mm',
      bottom: '20mm',
      left: '15mm'
    }
  });
  
  await browser.close();
  console.log(`✅ PDF saved: ${outputPath}`);
}

// Helper function to create HTML from notes and images
export function createReportHtml(
  title: string,
  notes: string[],
  imageBuffers: Buffer[],
  photoCaptions?: string[]  // ← NEW: Optional captions
): string {
  const imageElements = imageBuffers
    .map((buffer, index) => {
      const base64 = buffer.toString('base64');
      const caption = photoCaptions?.[index] || '';
      return `
        <div class="image-container">
          <img src="data:image/jpeg;base64,${base64}" alt="Photo ${index + 1}">
          ${caption ? `<p class="image-caption">${caption}</p>` : `<p class="image-caption">Photo ${index + 1}</p>`}
        </div>
      `;
    })
    .join('\n');
  
  const notesElements = notes
    .map((note, index) => `
      <div class="note">
        <h3>Note ${index + 1}</h3>
        <p>${note}</p>
      </div>
    `)
    .join('\n');
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #fff;
      padding: 20px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
    }
    
    .header h1 {
      color: #2563eb;
      font-size: 32px;
      margin-bottom: 10px;
    }
    
    .header .date {
      color: #666;
      font-size: 14px;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section h2 {
      color: #2563eb;
      font-size: 24px;
      margin-bottom: 15px;
      padding-bottom: 5px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .note {
      background: #f9fafb;
      padding: 15px;
      margin-bottom: 15px;
      border-radius: 8px;
      border-left: 4px solid #2563eb;
    }
    
    .note h3 {
      color: #1f2937;
      font-size: 16px;
      margin-bottom: 8px;
    }
    
    .note p {
      color: #4b5563;
      font-size: 14px;
      line-height: 1.8;
    }
    
    .image-container {
      margin: 20px 0;
      text-align: center;
      page-break-inside: avoid;
    }
    
    .image-container img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .image-caption {
      margin-top: 10px;
      color: #6b7280;
      font-size: 12px;
      font-style: italic;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
    }
    
    @media print {
      body {
        padding: 0;
      }
      
      .image-container {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${title}</h1>
    <div class="date">Generated on ${new Date().toLocaleString()}</div>
  </div>
  
  <div class="section">
    <h2>📝 Notes</h2>
    ${notesElements}
  </div>
  
  ${imageBuffers.length > 0 ? `
  <div class="section">
    <h2>📷 Photos</h2>
    ${imageElements}
  </div>
  ` : ''}
  
  <div class="footer">
    <p>Field Report Bot • Generated with AI-powered text cleaning</p>
  </div>
</body>
</html>
  `;
}
