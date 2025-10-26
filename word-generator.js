import { Document, Paragraph, TextRun, ImageRun, HeadingLevel, AlignmentType, Packer } from 'docx';
import fs from 'fs';

/**
 * Generate Word document with text and images
 * @param {Object} options - Configuration object
 * @param {string[]} options.notes - Array of text notes
 * @param {string[]} options.imagePaths - Array of image file paths
 * @param {string} options.outputPath - Where to save .docx file
 * @param {string} options.title - Document title
 * @returns {Promise<string>} - Path to generated file
 */
export async function generateWordDoc({ notes, imagePaths = [], outputPath, title = 'Report' }) {
  const sections = [];
  
  // Title
  sections.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 }
    })
  );
  
  // Date
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Generated: ${new Date().toLocaleString()}`,
          italics: true
        })
      ],
      spacing: { after: 400 }
    })
  );
  
  // Add notes
  if (notes && notes.length > 0) {
    sections.push(
      new Paragraph({
        text: 'Notes',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 }
      })
    );
    
    notes.forEach((note, index) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${index + 1}. `,
              bold: true
            }),
            new TextRun(note)
          ],
          spacing: { after: 200 }
        })
      );
    });
  }
  
  // Add images
  if (imagePaths && imagePaths.length > 0) {
    sections.push(
      new Paragraph({
        text: 'Photos',
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 }
      })
    );
    
    for (const imagePath of imagePaths) {
      try {
        if (!fs.existsSync(imagePath)) {
          console.log(`⚠️ Image not found: ${imagePath}`);
          continue;
        }
        
        const imageBuffer = fs.readFileSync(imagePath);
        
        sections.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: imageBuffer,
                transformation: {
                  width: 600,
                  height: 400
                }
              })
            ],
            spacing: { after: 300 }
          })
        );
      } catch (err) {
        console.error(`Failed to add image ${imagePath}:`, err.message);
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
  
  // Generate buffer
  const buffer = await Packer.toBuffer(doc);
  
  // Save to file
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Word document saved: ${outputPath}`);
  
  return outputPath;
}
