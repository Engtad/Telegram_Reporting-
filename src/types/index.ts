export type UUID = string;

export interface FieldReportSession {
  id: UUID;
  telegram_user_id: number;
  telegram_username: string | null;
  status: string;
  site_name: string | null;
  client_name: string | null;
  daily_report_count: number;
  last_report_date: string | null;
  memory_summary: string | null;
  total_reports_generated: number;
  created_at: string;
  updated_at: string;
}

export interface FieldInput {
  id: UUID;
  session_id: UUID;
  input_type: 'text' | 'photo';
  raw_content: string | null;
  cleaned_content: string | null;
  telegram_message_id: number | null;
  created_at: string;
}

export interface Photo {
  id: UUID;
  session_id: UUID;
  telegram_file_id: string;
  storage_url: string | null;
  caption: string | null;
  category: 'cover' | 'before' | 'during' | 'after' | 'final' | 'uncategorized';
  order_index: number | null;
  created_at: string;
}

export interface GeneratedReport {
  id: UUID;
  session_id: UUID;
  report_pdf_url: string | null;
  version: number;
  status: 'draft' | 'approved' | 'sent';
  standard_units: 'imperial' | 'metric' | 'both';
  created_at: string;
}

export interface UserMemory {
  id: UUID;
  telegram_user_id: number;
  memory_type: 'preference' | 'fact' | 'pattern';
  key_info: string;
  value_info: string;
  confidence_score: number;
  last_accessed: string | null;
  created_at: string;
}

export interface CleanTextResult {
  cleaned: string;
}
