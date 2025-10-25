import PDFDocument from 'pdfkit';
import sharp from 'sharp';
import supabase, { BUCKET_REPORTS } from '../utils/supabase.js';
import type { FieldInput, Photo, FieldReportSession } from '../types/index';



async function streamToBuffer(doc: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err) => reject(err));
  });
}

async function fetchImageBuffer(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (e) {
    console.error('fetchImageBuffer error', e);
    return null;
  }
}

function sectionTitle(doc: any, title: string) {
  doc.moveDown(0.5);
  doc.font('Helvetica-Bold').fontSize(16).text(title);
  doc.moveDown(0.25);
  doc.strokeColor('#CCCCCC').moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(0.5);
  doc.font('Helvetica').fontSize(11);
}

export async function generateReportPDF({
  session,
  inputs,
  photos,
  units = 'both'
}: {
  session: FieldReportSession;
  inputs: FieldInput[];
  photos: Photo[];
  units?: 'imperial' | 'metric' | 'both';
}): Promise<{ buffer: Buffer; filename: string }> {
  const doc = new PDFDocument({ size: 'A4', margin: 50, info: { Title: 'Field Report', Author: 'AI Field Report Assistant' } });

  sectionTitle(doc, 'Cover');
  doc.fontSize(20).text('Engineering Field Report', { align: 'left' });
  doc.moveDown();
  doc.fontSize(12).text(`Client: ${session.client_name || 'N/A'}`);
  doc.text(`Site: ${session.site_name || 'N/A'}`);
  doc.text(`Technician: @${session.telegram_username || session.telegram_user_id}`);
  doc.text(`Units: ${units === 'both' ? 'Metric & Imperial' : units === 'metric' ? 'Metric' : 'Imperial'}`);
  doc.moveDown();

  // Executive Summary
  sectionTitle(doc, 'Executive Summary');
  const summaryText =
    inputs
      .slice(-5)
      .map((i) => i.cleaned_content || i.raw_content || '')
      .filter(Boolean)
      .join(' ')
      .slice(0, 800) || 'Summary based on latest site notes and observations.';
  doc.text(summaryText, { align: 'left' });

  // Scope
  sectionTitle(doc, 'Scope');
  doc.text('This report documents site conditions, work performed, and final recommendations following engineering best practices (DIN 5008; IEEE/IEC 82079-1:2019; NASA SP-7084).');

  // Site Conditions
  sectionTitle(doc, 'Site Conditions');
  doc.text('Environmental and operational conditions observed during the site visit are summarized below.');
  const conditions = inputs.find((i) => (i.raw_content || '').toLowerCase().includes('site'));
  if (conditions) {
    doc.moveDown(0.5).text(`Notes: ${conditions.cleaned_content || conditions.raw_content}`, { align: 'left' });
  }

  // Work Performed
  sectionTitle(doc, 'Work Performed');
  const work = inputs
    .map((i) => i.cleaned_content || i.raw_content || '')
    .filter(Boolean)
    .map((t) => `- ${t}`);
  if (work.length > 0) {
    doc.text(work.join('\n'));
  } else {
    doc.text('- Inspected equipment and documented observations.');
  }

  // Results
  sectionTitle(doc, 'Results');
  doc.text('Results summarized based on test data and visual inspection.');

  // Photo Embedding by categories
  const categories: { title: string; key: Photo['category'] }[] = [
    { title: 'Cover Photo', key: 'cover' },
    { title: 'Before', key: 'before' },
    { title: 'During', key: 'during' },
    { title: 'After', key: 'after' },
    { title: 'Final', key: 'final' }
  ];

  for (const c of categories) {
    const list = photos.filter((p) => p.category === c.key);
    if (list.length === 0) continue;
    sectionTitle(doc, c.title);
    for (const p of list) {
      if (!p.storage_url) continue;
      const imgBuf = await fetchImageBuffer(p.storage_url);
      if (!imgBuf) continue;

      try {
        // Resize to fit page width
        const resized = await sharp(imgBuf).resize({ width: 500, withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer();
        doc.image(resized, { fit: [500, 300], align: 'center' });
        if (p.caption) {
          doc.moveDown(0.2);
          doc.font('Helvetica-Oblique').fontSize(10).text(p.caption);
          doc.font('Helvetica').fontSize(11);
        }
        doc.moveDown(0.5);
      } catch (e) {
        console.error('PDF image embed error', e);
      }
    }
  }

  // Final Inspection and Recommendations
  sectionTitle(doc, 'Final Inspection');
  doc.text('Final inspection confirms equipment status and compliance with work scope.');

  sectionTitle(doc, 'Recommendations');
  doc.text('- Monitor vibration and temperature trends over next 7 days.');
  doc.text('- Schedule preventive maintenance based on manufacturer guidance.');
  doc.text('- Review parts inventory for critical spares.');

  doc.end();
  const buffer = await streamToBuffer(doc);
  const filename = `report_${session.id}_${Date.now()}.pdf`;
  return { buffer, filename };
}

export async function storeReport(buffer: Buffer, filename: string): Promise<string | null> {
  const uploadPath = `reports/${filename}`;
  const { error } = await supabase.storage.from(BUCKET_REPORTS).upload(uploadPath, buffer, {
    contentType: 'application/pdf',
    upsert: true
  });
  if (error) {
    console.error('storeReport upload error', error);
    return null;
  }
  const { data } = supabase.storage.from(BUCKET_REPORTS).getPublicUrl(uploadPath);
  return data.publicUrl;
}