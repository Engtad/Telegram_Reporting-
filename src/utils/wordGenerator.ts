// src/utils/wordGenerator.ts
import { Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel, AlignmentType } from 'docx';
import * as fs from 'fs';

interface WordDocOptions {
  title: string;
  notes: string[];
  imagePaths?: string[];
  imageCaptions?: string[];  // ← NEW: Optional captions
  outputPath: string;
}

/**
 * Detect image MIME type from file extension
 */
function getImageType(imagePath: string): 'jpg' | 'png' | 'gif' | 'bmp' {
  const ext = imagePath.toLowerCase().split('.').pop();
  if (ext === 'jpg' || ext === 'jpeg') return 'jpg';
  if (ext === 'png') return 'png';
  if (ext === 'gif') return 'gif';
  if (ext === 'bmp') return 'bmp';
  return 'png'; // default fallback
}

/**
 * Generate a Word document with notes and optional images
 */
export async function generateWordDoc(options: WordDocOptions): Promise<void> {
  const { title, notes, imagePaths = [], imageCaptions = [], outputPath } = options;

  const sections: Paragraph[] = [];

  // Add title
  sections.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 300 }
    })
  );

  // Add notes
  for (const note of notes) {
    sections.push(
      new Paragraph({
        children: [new TextRun(note)],
        spacing: { after: 200 }
      })
    );
  }

  // Add images section if images exist
  if (imagePaths && imagePaths.length > 0) {
      sections.push(
        new Paragraph({
        text: 'Photos',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 }
      })
      );

    // Add images with optional captions
    for (let i = 0; i < imagePaths.length; i++) {
      const imagePath = imagePaths[i];
      const caption = imageCaptions[i] || '';

      if (fs.existsSync(imagePath)) {
        const imageBuffer = fs.readFileSync(imagePath);

        // Add image
        sections.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: imageBuffer,
                type: getImageType(imagePath),
                transformation: {
                  width: 500,
                  height: 375
    }
              })
            ],
            spacing: { before: 200, after: 100 }
          })
        );

        // Add caption if it exists
        if (caption) {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: caption,
                  italics: true
                })
              ],
              alignment: AlignmentType.CENTER,
              spacing: { after: 200 }
            })
          );
        }
      }
    }
  }

  // Create document
  const doc = new Document({
    sections: [{
      properties: {},
      children: sections
    }]
  });

  // Generate and save
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  
  console.log(`✅ Word document saved: ${outputPath}`);
}

