import data from '../../data/emoji.json';
import type { EmojiPickerItem, EmojiSkinTone } from './types';

export const DEFAULT_EMOJIS: readonly EmojiPickerItem[] = data;

export const CATEGORY_LABELS: Record<string, string> = {
  smileys: 'Smileys',
  people: 'People',
  nature: 'Nature',
  food: 'Food & drink',
  travel: 'Travel',
  activities: 'Activities',
  objects: 'Objects',
  symbols: 'Symbols',
  flags: 'Flags',
};

export const TONE_LABELS = [
  'Default skin tone',
  'Light skin tone',
  'Medium-light skin tone',
  'Medium skin tone',
  'Medium-dark skin tone',
  'Dark skin tone',
] as const;

export const TONE_EMOJIS = ['👋', '👋🏻', '👋🏼', '👋🏽', '👋🏾', '👋🏿'] as const;

export function emojiForTone(item: EmojiPickerItem, tone: EmojiSkinTone): string {
  return (tone > 0 && item.skins?.[tone - 1]) || item.emoji;
}

export function searchEmojis(items: readonly EmojiPickerItem[], query: string): EmojiPickerItem[] {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [...items];
  return items.filter(item => {
    const words = `${item.name} ${item.category} ${item.emoji} ${(item.keywords ?? []).join(' ')}`.toLocaleLowerCase();
    return terms.every(term => words.includes(term));
  });
}

export function recentItems(items: readonly EmojiPickerItem[], recent: readonly string[]): EmojiPickerItem[] {
  if (!recent.length) return [];
  const byUnicode = new Map<string, EmojiPickerItem>();
  for (const item of items) {
    byUnicode.set(item.emoji, item);
    for (const skin of item.skins ?? []) if (skin) byUnicode.set(skin, item);
  }
  return recent.flatMap(emoji => {
    const item = byUnicode.get(emoji);
    return item ? [{ ...item, emoji }] : [];
  });
}

export function nextRecent(current: readonly string[], emoji: string, maxRecent: number): string[] {
  return [emoji, ...current.filter(value => value !== emoji)].slice(0, Math.max(0, maxRecent));
}
