// src/agents/professionalReportGenerator.ts
import { createProfessionalReportHTML } from '../templates/professionalReport.js';
import { createProfessionalWordReport } from '../templates/professionalWordReport.js';
import { Packer } from 'docx';
import { generatePdfFromHtml } from '../utils/htmlToPdf.js';
import supabase, { BUCKET_REPORTS } from '../utils/supabase.js';
import type { FieldReportSession, FieldInput, Photo } from '../types/index.js';

export interface ProfessionalReportData {
  client: string;
  site: string;
  technician: string;
  notes: string[];
  photoUrls: string[];
  photoCaptions: string[];
  photoBuffers: Buffer[];
}

export async function generateProfessionalPDF({
  session,
  inputs,
  photos
}: {
  session: FieldReportSession;
  inputs: FieldInput[];
  photos: Photo[];
}): Promise<{ buffer: Buffer; filename: string }> {
  // Prepare data for professional template
  const reportData = prepareReportData(session, inputs, photos);
  
  // Generate HTML using professional template
  const html = createProfessionalReportHTML(reportData);
  
  // Convert HTML to PDF
  const filename = `professional_report_${session.id}_${Date.now()}.pdf`;
  const tempPath = `/tmp/${filename}`;
  
  await generatePdfFromHtml({
    html,
    outputPath: tempPath,
    title: 'Professional Engineering Field Report'
  });
  
  // Read the generated PDF buffer
  const fs = await import('fs');
  const buffer = fs.readFileSync(tempPath);
  
  // Cleanup temp file
  fs.unlinkSync(tempPath);
  
  return { buffer, filename };
}

export async function generateProfessionalWord({
  session,
  inputs,
  photos
}: {
  session: FieldReportSession;
  inputs: FieldInput[];
  photos: Photo[];
}): Promise<{ buffer: Buffer; filename: string }> {
  // Prepare data for professional template
  const reportData = prepareReportData(session, inputs, photos);
  
  // Generate Word document using professional template
  const doc = createProfessionalWordReport(reportData);
  const buffer = await Packer.toBuffer(doc);
  
  const filename = `professional_report_${session.id}_${Date.now()}.docx`;
  
  return { buffer, filename };
}

function prepareReportData(
  session: FieldReportSession, 
  inputs: FieldInput[], 
  photos: Photo[]
): ProfessionalReportData {
  const notes = inputs
    .map(input => input.cleaned_content || input.raw_content || '')
    .filter(Boolean);
    
  const photoUrls = photos
    .map(photo => photo.storage_url || '')
    .filter(Boolean);
    
  const photoCaptions = photos
    .map(photo => photo.caption || '');
    
  // Note: photoBuffers would need to be fetched from storage
  // For now, we'll use empty buffers - this would need enhancement
  const photoBuffers: Buffer[] = [];
  
  return {
    client: session.client_name || 'Client Name',
    site: session.site_name || 'Site Location',
    technician: `@${session.telegram_username || session.telegram_user_id}`,
    notes,
    photoUrls,
    photoCaptions,
    photoBuffers
  };
}

export async function storeProfessionalReport(buffer: Buffer, filename: string): Promise<string | null> {
  const uploadPath = `professional-reports/${filename}`;
  const { error } = await supabase.storage.from(BUCKET_REPORTS).upload(uploadPath, buffer, {
    contentType: filename.endsWith('.pdf') ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    upsert: true
  });
  
  if (error) {
    console.error('storeProfessionalReport upload error', error);
    return null;
  }
  
  const { data } = supabase.storage.from(BUCKET_REPORTS).getPublicUrl(uploadPath);
  return data.publicUrl;
}