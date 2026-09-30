import { columnsForPath, findPath, flattenPaths } from '../cascaderUtils';
const data = [{ value: 'world', children: [{ value: 'eu', children: [{ value: 'fr' }, { value: 'de' }] }] }];
it('resolves and flattens complete paths', () => {
  expect(findPath(data, ['world', 'eu', 'fr']).map((item) => item.value)).toEqual(['world', 'eu', 'fr']);
  expect(flattenPaths(data).map((path) => path.at(-1)?.value)).toEqual(['fr', 'de']);
  expect(columnsForPath(data, ['world', 'eu']).map((column) => column.length)).toEqual([1, 1, 2]);
});
