import { DEFAULT_EMOJIS, emojiForTone, nextRecent, recentItems, searchEmojis } from '../catalog';

describe('emoji catalog', () => {
  it('contains uniquely identified emoji across every visible category', () => {
    expect(DEFAULT_EMOJIS.length).toBeGreaterThan(1800);
    expect(new Set(DEFAULT_EMOJIS.map(item => item.id)).size).toBe(DEFAULT_EMOJIS.length);
    expect(new Set(DEFAULT_EMOJIS.map(item => item.category)).size).toBe(9);
  });

  it('searches names and keywords and applies skin tone variants', () => {
    expect(searchEmojis(DEFAULT_EMOJIS, 'grinning face').some(item => item.emoji === '😀')).toBe(true);
    expect(searchEmojis(DEFAULT_EMOJIS, 'ttyl').some(item => item.emoji === '👋')).toBe(true);
    const hand = DEFAULT_EMOJIS.find(item => item.emoji === '👋');
    expect(hand).toBeDefined();
    expect(emojiForTone(hand!, 2)).toBe('👋🏼');
  });

  it('keeps exact variants in recent selections and deduplicates newest first', () => {
    expect(recentItems(DEFAULT_EMOJIS, ['👋🏽'])[0].emoji).toBe('👋🏽');
    expect(nextRecent(['😀', '👋🏽', '🎉'], '👋🏽', 2)).toEqual(['👋🏽', '😀']);
  });
});
