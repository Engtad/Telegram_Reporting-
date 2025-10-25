-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Sessions table with memory and rate limiting
create table if not exists field_report_sessions (
  id uuid primary key default uuid_generate_v4(),
  telegram_user_id bigint not null,
  telegram_username text,
  status text default 'active',
  site_name text,
  client_name text,
  daily_report_count integer default 0,
  last_report_date date,
  memory_summary text,
  total_reports_generated integer default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Field inputs table
create table if not exists field_inputs (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references field_report_sessions(id) on delete cascade,
  input_type text,
  raw_content text,
  cleaned_content text,
  telegram_message_id bigint,
  created_at timestamp with time zone default now()
);

-- Photos table with auto-categorization
create table if not exists photos (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references field_report_sessions(id) on delete cascade,
  telegram_file_id text,
  storage_url text,
  caption text,
  category text,
  order_index int,
  created_at timestamp with time zone default now()
);

-- Reports table
create table if not exists generated_reports (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references field_report_sessions(id) on delete cascade,
  report_pdf_url text,
  version int default 1,
  status text,
  standard_units text,
  created_at timestamp with time zone default now()
);

-- Memory table for learning user preferences
create table if not exists user_memory (
  id uuid primary key default uuid_generate_v4(),
  telegram_user_id bigint not null,
  memory_type text,
  key_info text,
  value_info text,
  confidence_score decimal default 1.0,
  last_accessed timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Performance indexes
create index if not exists idx_sessions_user_id on field_report_sessions(telegram_user_id);
create index if not exists idx_sessions_date on field_report_sessions(last_report_date);
create index if not exists idx_memory_user on user_memory(telegram_user_id);
create index if not exists idx_memory_type on user_memory(memory_type);
