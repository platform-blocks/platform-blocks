import { moveItem } from '../moveItem';

describe('moveItem', () => {
  it('returns an ordered copy and the move indices', () => {
    const items = ['a', 'b', 'c'];
    expect(moveItem(items, 0, 2)).toEqual({ data: ['b', 'c', 'a'], from: 0, to: 2 });
    expect(items).toEqual(['a', 'b', 'c']);
  });

  it('ignores invalid and unchanged moves', () => {
    expect(moveItem(['a'], 0, 0)).toBeNull();
    expect(moveItem(['a'], -1, 0)).toBeNull();
    expect(moveItem(['a'], 0, 1)).toBeNull();
  });
});
