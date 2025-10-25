import supabase from './supabase';
import type { FieldReportSession } from '../types/index';

const DAILY_LIMIT = parseInt(process.env.DAILY_REPORT_LIMIT || '2', 10);

export function isSameUtcDate(dateStr: string | null): boolean {
  if (!dateStr) return false;
  const now = new Date();
  const d = new Date(dateStr + 'T00:00:00.000Z');
  return (
    now.getUTCFullYear() === d.getUTCFullYear() &&
    now.getUTCMonth() === d.getUTCMonth() &&
    now.getUTCDate() === d.getUTCDate()
  );
}

export function nextUtcMidnightISO(): string {
  const now = new Date();
  const next = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0)
  );
  return next.toISOString();
}

export async function checkRateLimit(session: FieldReportSession) {
  let dailyCount = session.daily_report_count || 0;
  let isToday = isSameUtcDate(session.last_report_date);

  if (!isToday) {
    dailyCount = 0;
  }

  const remaining = Math.max(DAILY_LIMIT - dailyCount, 0);

  return {
    allowed: remaining > 0,
    remaining,
    limit: DAILY_LIMIT,
    resetAt: nextUtcMidnightISO()
  };
}

export async function incrementDailyReportCount(session: FieldReportSession) {
  const nowDate = new Date().toISOString().slice(0, 10);
  const isToday = isSameUtcDate(session.last_report_date);

  const dailyCount = isToday ? (session.daily_report_count || 0) + 1 : 1;
  const total = (session.total_reports_generated || 0) + 1;

  await supabase
    .from('field_report_sessions')
    .update({
      daily_report_count: dailyCount,
      last_report_date: nowDate,
      total_reports_generated: total,
      updated_at: new Date().toISOString()
    })
    .eq('id', session.id);
}
