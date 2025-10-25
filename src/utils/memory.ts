import supabase from './supabase';
import type { UserMemory } from '../types/index';

const MAX_MEMORY_REPORTS = parseInt(process.env.MAX_MEMORY_REPORTS || '50', 10);

export const MEMORY_REGEX = {
  client: /client[:\s]+([^,.\n]+)/i,
  site: /site[:\s]+([^,.\n]+)/i,
  equipment: /equipment[:\s]+([^,.\n]+)/i
};

export function extractPatterns(text: string): { key: string; value: string }[] {
  const items: { key: string; value: string }[] = [];
  const t = text || '';
  
  const client = t.match(MEMORY_REGEX.client);
  if (client?.[1]) items.push({ key: 'client', value: client[1].trim() });
  
  const site = t.match(MEMORY_REGEX.site);
  if (site?.[1]) items.push({ key: 'site', value: site[1].trim() });
  
  const equipment = t.match(MEMORY_REGEX.equipment);
  if (equipment?.[1]) items.push({ key: 'equipment', value: equipment[1].trim() });
  
  return items;
}

export async function saveMemory(
  telegramUserId: number,
  item: { key: string; value: string },
  confidence = 0.95
) {
  try {
    await supabase.from('user_memory').insert({
      telegram_user_id: telegramUserId,
      memory_type: 'pattern',
      key_info: item.key,
      value_info: item.value,
      confidence_score: confidence
    });

    // Prune oldest beyond MAX_MEMORY_REPORTS
    const { data: list } = await supabase
      .from('user_memory')
      .select('id, created_at')
      .eq('telegram_user_id', telegramUserId)
      .order('created_at', { ascending: false });

    if (list && list.length > MAX_MEMORY_REPORTS) {
      const toDelete = list.slice(MAX_MEMORY_REPORTS).map((m) => m.id);
      if (toDelete.length > 0) {
        await supabase.from('user_memory').delete().in('id', toDelete);
      }
    }
  } catch (e) {
    console.error('saveMemory error', e);
  }
}

export async function getUserMemory(
  telegramUserId: number,
  limit = 10
): Promise<UserMemory[]> {
  const { data, error } = await supabase
    .from('user_memory')
    .select('*')
    .eq('telegram_user_id', telegramUserId)
    .order('confidence_score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('getUserMemory error', error);
    return [];
  }
  
  return data || [];
}
