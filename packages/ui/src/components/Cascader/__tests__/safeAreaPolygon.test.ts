import { isInSafeArea } from '../safeAreaPolygon';

it('protects a diagonal path into a child column while allowing a vertical move to switch rows', () => {
  const column = { left: 100, right: 200, top: 0, bottom: 100 };
  expect(isInSafeArea({ x: 125, y: 70 }, { x: 50, y: 50 }, column, false, 5)).toBe(true);
  expect(isInSafeArea({ x: 55, y: 90 }, { x: 50, y: 50 }, column, false, 5)).toBe(false);
});

it('mirrors the corridor in RTL', () => {
  const column = { left: 0, right: 100, top: 0, bottom: 100 };
  expect(isInSafeArea({ x: 75, y: 70 }, { x: 150, y: 50 }, column, true, 5)).toBe(true);
});
