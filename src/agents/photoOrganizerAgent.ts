export type PhotoCategory = 'cover' | 'before' | 'during' | 'after' | 'final' | 'uncategorized';

const KEYWORDS: Record<PhotoCategory, string[]> = {
  cover: ['cover', 'title', 'overview', 'site overview', 'front', 'entrance'],
  before: ['before', 'pre-repair', 'pre repair', 'initial', 'as received'],
  during: ['during', 'in-progress', 'in progress', 'install', 'assembly', 'repairing'],
  after: ['after', 'post-repair', 'post repair', 'complete', 'completed'],
  final: ['final', 'inspection', 'handover', 'closeout', 'sign-off', 'sign off'],
  uncategorized: []
};

export function categorizePhoto(caption?: string | null): PhotoCategory {
  const text = (caption || '').toLowerCase();
  if (!text) return 'uncategorized';

  // Priority ordering: cover -> before -> during -> after -> final
  const order: PhotoCategory[] = ['cover', 'before', 'during', 'after', 'final'];
  for (const cat of order) {
    const words = KEYWORDS[cat];
    for (const w of words) {
      if (text.includes(w)) return cat;
    }
  }
  return 'uncategorized';
}
