import { fit } from '../OverflowList';
it('reserves room for the overflow item', () => {
  expect(fit([50, 50, 50], 130, 25, 5, 1, Infinity, 'end')).toBe(1);
  expect(fit([50, 50, 50], 130, 25, 5, 2, Infinity, 'end')).toBe(3);
});
it('respects a visible count cap', () => {
  expect(fit([50, 50, 50], 400, 25, 5, 1, 2, 'start')).toBe(2);
});
