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

  // Generate PDF with ISO 5457 border frame support
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,      // ✓ Already correct
    preferCSSPageSize: true,    // ← ADD THIS (critical!)
    margin: {
      top: '0mm',     // ✓ Already correct
      right: '0mm',   // ✓ Already correct
      bottom: '0mm',  // ✓ Already correct
      left: '0mm'     // ✓ Already correct
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
  photoCaptions?: string[]
): string {
  const imageElements = imageBuffers
    .map((buffer, index) => {
      const base64 = buffer.toString('base64');
      const caption = photoCaptions?.[index] || '';
      return `
        <div style="margin: 20px 0; text-align: center;">
          <img src="data:image/jpeg;base64,${base64}" style="max-width: 500px; border: 1px solid #ccc;">
          <p style="font-style: italic; color: #666; margin-top: 8px;">
            ${caption ? caption : `Photo ${index + 1}`}
          </p>
        </div>
      `;
    })
    .join('\n');

  const notesElements = notes
    .map((note, index) => `
      <div style="margin-bottom: 15px;">
        <strong style="color: #003366;">Note ${index + 1}</strong>
        <p>${note}</p>
      </div>
    `)
    .join('\n');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Calibri', Arial, sans-serif;
          padding: 20px;
          line-height: 1.6;
        }
        h1 {
          color: #003366;
          border-bottom: 2px solid #4A90E2;
          padding-bottom: 10px;
        }
        h2 {
          color: #003366;
          margin-top: 30px;
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p style="color: #666; font-size: 11pt;">Generated on ${new Date().toLocaleString()}</p>
      
      <h2>📝 Notes</h2>
      ${notesElements}
      
      ${imageBuffers.length > 0 ? `
        <h2>📷 Photos</h2>
        ${imageElements}
      ` : ''}
      
      <p style="text-align: center; color: #999; font-size: 9pt; margin-top: 40px;">
        Field Report Bot • Generated with AI-powered text cleaning
      </p>
    </body>
    </html>
  `;
}
