// src/templates/professionalWordReport.ts

import {
  Document,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType
} from 'docx';

export interface ReportData {
  client: string;
  site: string;
  technician: string;
  notes: string[];
  photoBuffers: Buffer[];
  photoCaptions: string[];
}

export function createProfessionalWordReport(data: ReportData): Document {
  const reportDate = new Date().toLocaleDateString();
  const reportTime = new Date().toLocaleTimeString();
  const paragraphs: Paragraph[] = [];

  // COVER PAGE
  paragraphs.push(
    new Paragraph({
      text: 'Engineering Field Report',
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { before: 2000, after: 800 }
    })
  );

  // Metadata Table
  const metadataTable = new Table({
    width: { size: 80, type: WidthType.PERCENTAGE },
    rows: [
      createMetadataRow('Client:', data.client),
      createMetadataRow('Site:', data.site),
      createMetadataRow('Technician:', data.technician),
      createMetadataRow('Date:', reportDate),
      createMetadataRow('Time:', reportTime),
      createMetadataRow('Units:', 'Metric & Imperial')
    ]
  });

  // Spacer after cover
  paragraphs.push(
    new Paragraph({ spacing: { before: 400, after: 800 } })
  );

  // Executive Summary
  paragraphs.push(
    new Paragraph({
      text: 'Executive Summary',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 600, after: 200 }
    }),
    new Paragraph({
      text: data.notes[0] || 'Site visit completed successfully.',
      spacing: { after: 400 }
    })
  );

  // Scope
  paragraphs.push(
    new Paragraph({
      text: 'Scope',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 }
    }),
    new Paragraph({
      text: 'This report documents site conditions, work performed, and final recommendations following engineering best practices (DIN 5008; IEEE/IEC 82079-1:2019; NASA SP-7084).',
      spacing: { after: 400 }
    })
  );

  // Site Conditions
  paragraphs.push(
    new Paragraph({
      text: 'Site Conditions',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 }
    }),
    new Paragraph({
      text: 'Environmental and operational conditions observed during the site visit are summarized below.',
      spacing: { after: 200 }
    }),
    new Paragraph({
      children: [
        new TextRun({ text: 'Notes: ', bold: true }),
        new TextRun(data.notes[0] || 'Site visit completed')
      ],
      spacing: { after: 400 }
    })
  );

  // Work Performed
  paragraphs.push(
    new Paragraph({
      text: 'Work Performed',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 }
    })
  );

  data.notes.forEach(note => {
    paragraphs.push(
      new Paragraph({
        text: note,
        bullet: { level: 0 },
        spacing: { after: 120 }
      })
    );
  });

  // Results
  paragraphs.push(
    new Paragraph({
      text: 'Results',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 }
    }),
    new Paragraph({
      text: 'Results summarized based on test data and visual inspection.',
      spacing: { after: 400 }
    })
  );

  // Photo Documentation - FIXED IMAGE HANDLING
  if (data.photoBuffers.length > 0) {
    paragraphs.push(
      new Paragraph({
        text: 'Photo Documentation',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 600, after: 200 }
      })
    );

    data.photoBuffers.forEach((buffer, index) => {
      // Photo heading
      paragraphs.push(
        new Paragraph({
          text: `Photo ${index + 1}`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 400, after: 200 }
        })
      );

      // FIXED: Image with proper type specification
      try {
        paragraphs.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: buffer,
                transformation: {
                  width: 450,
                  height: 338
                },
                type: 'jpg' // Explicitly specify image type
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          })
        );
      } catch (error) {
        console.error(`Error adding image ${index + 1}:`, error);
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `[Image ${index + 1} could not be embedded]`,
                italics: true
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          })
        );
      }

      // Caption - FIXED: italics on TextRun, not Paragraph
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: data.photoCaptions[index] || 'Field documentation',
              italics: true
            })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        })
      );
    });
  }

  // Final Inspection
  paragraphs.push(
    new Paragraph({
      text: 'Final Inspection',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 }
    }),
    new Paragraph({
      text: 'Final inspection confirms equipment status and compliance with work scope.',
      spacing: { after: 400 }
    })
  );

  // Recommendations
  paragraphs.push(
    new Paragraph({
      text: 'Recommendations',
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 }
    }),
    new Paragraph({
      text: 'Monitor vibration and temperature trends over next 7 days.',
      bullet: { level: 0 },
      spacing: { after: 120 }
    }),
    new Paragraph({
      text: 'Schedule preventive maintenance based on manufacturer guidance.',
      bullet: { level: 0 },
      spacing: { after: 120 }
    }),
    new Paragraph({
      text: 'Review parts inventory for critical spares.',
      bullet: { level: 0 },
      spacing: { after: 120 }
    })
  );

  // Footer - FIXED: italics on TextRun, not Paragraph
  paragraphs.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Report generated by Field Report Bot • ${reportDate} ${reportTime}`
        })
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 800 },
      border: {
        top: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' }
      }
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Confidential - For authorized personnel only',
          italics: true
        })
      ],
      alignment: AlignmentType.CENTER
    })
  );

  // Create document with metadata table in children
  return new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1440,
            right: 1440,
            bottom: 1440,
            left: 1440
          }
        }
      },
      children: [
        paragraphs[0], // Title
        paragraphs[1], // Spacer
        metadataTable,  // Table directly
        ...paragraphs.slice(2)  // Rest of content
      ]
    }]
  });
}

// Helper function
function createMetadataRow(label: string, value: string): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 30, type: WidthType.PERCENTAGE },
        shading: { fill: 'ECF0F1', type: ShadingType.CLEAR },
        children: [
          new Paragraph({
            children: [
              new TextRun({ text: label, bold: true })
            ]
          })
        ]
      }),
      new TableCell({
        width: { size: 70, type: WidthType.PERCENTAGE },
        children: [
          new Paragraph({ 
            children: [
              new TextRun({ text: value })
            ]
          })
        ]
      })
    ]
  });
}
