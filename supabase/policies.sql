-- Enable Row Level Security on all tables
alter table field_report_sessions enable row level security;
alter table field_inputs enable row level security;
alter table photos enable row level security;
alter table generated_reports enable row level security;
alter table user_memory enable row level security;

-- Allow service role to bypass RLS
do $$
begin
  if not exists (
    select 1 from pg_policy where polrelid = 'field_report_sessions'::regclass and polname = 'allow_service_role_all'
  ) then
    create policy allow_service_role_all on field_report_sessions
      for all to service_role using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policy where polrelid = 'field_inputs'::regclass and polname = 'allow_service_role_all'
  ) then
    create policy allow_service_role_all on field_inputs
      for all to service_role using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policy where polrelid = 'photos'::regclass and polname = 'allow_service_role_all'
  ) then
    create policy allow_service_role_all on photos
      for all to service_role using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policy where polrelid = 'generated_reports'::regclass and polname = 'allow_service_role_all'
  ) then
    create policy allow_service_role_all on generated_reports
      for all to service_role using (true) with check (true);
  end if;

  if not exists (
    select 1 from pg_policy where polrelid = 'user_memory'::regclass and polname = 'allow_service_role_all'
  ) then
    create policy allow_service_role_all on user_memory
      for all to service_role using (true) with check (true);
  end if;
end $$;
