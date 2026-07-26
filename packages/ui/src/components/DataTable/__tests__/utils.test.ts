import {
  computeAggregate,
  filterData,
  formatValue,
  getColumnAlign,
  getColumnFilterType,
  getValue,
  isNumericType,
  sortData,
  toDayKey,
} from '../utils';
import type { DataTableColumn } from '../types';

interface Person {
  name: string;
  age: number;
  joined: string;
  active: boolean;
}

const people: Person[] = [
  { name: 'Ada', age: 36, joined: '2024-01-15', active: true },
  { name: 'Grace', age: 45, joined: '2023-06-01', active: false },
  { name: 'Linus', age: 28, joined: '2024-03-20', active: true },
];

const columns: DataTableColumn<Person>[] = [
  { key: 'name', title: 'Name', accessor: 'name' },
  { key: 'age', title: 'Age', accessor: 'age', dataType: 'number' },
  { key: 'joined', title: 'Joined', accessor: 'joined', dataType: 'date' },
  { key: 'active', title: 'Active', accessor: 'active', dataType: 'boolean' },
];

const names = (rows: Person[]) => rows.map((row) => row.name);

describe('DataTable utils', () => {
  describe('getValue', () => {
    it('reads a key accessor', () => {
      expect(getValue(people[0], 'name')).toBe('Ada');
    });

    it('calls a function accessor', () => {
      expect(getValue(people[0], (row) => `${row.name} (${row.age})`)).toBe('Ada (36)');
    });
  });

  describe('formatValue', () => {
    it('renders null and undefined as an empty string', () => {
      expect(formatValue(null)).toBe('');
      expect(formatValue(undefined)).toBe('');
    });

    it('formats by data type', () => {
      expect(formatValue(1234, 'number')).toBe((1234).toLocaleString());
      expect(formatValue(1234, 'currency')).toBe(`$${(1234).toLocaleString()}`);
      expect(formatValue(0.256, 'percentage')).toBe('25.6%');
      expect(formatValue(true, 'boolean')).toBe('Yes');
      expect(formatValue(false, 'boolean')).toBe('No');
    });

    it('falls back to String() for mismatched types', () => {
      expect(formatValue('n/a', 'number')).toBe('n/a');
      expect(formatValue('2024-01-15', 'date')).toBe('2024-01-15');
    });
  });

  describe('column helpers', () => {
    it('treats the numeric-ish data types as numeric', () => {
      expect(isNumericType('number')).toBe(true);
      expect(isNumericType('currency')).toBe(true);
      expect(isNumericType('percentage')).toBe(true);
      expect(isNumericType('text')).toBe(false);
      expect(isNumericType(undefined)).toBe(false);
    });

    it('right-aligns numeric columns unless overridden', () => {
      expect(getColumnAlign(columns[1])).toBe('right');
      expect(getColumnAlign(columns[0])).toBe('left');
      expect(getColumnAlign({ ...columns[1], align: 'center' })).toBe('center');
    });

    it('resolves the filter type by precedence', () => {
      expect(getColumnFilterType({ ...columns[0], filterType: 'number' })).toBe('number');
      expect(getColumnFilterType({ ...columns[0], filterOptions: [] as any })).toBe('select');
      expect(getColumnFilterType(columns[1])).toBe('number');
      expect(getColumnFilterType(columns[2])).toBe('date');
      expect(getColumnFilterType(columns[3])).toBe('boolean');
      expect(getColumnFilterType(columns[0])).toBe('text');
    });
  });

  describe('computeAggregate', () => {
    const ageColumn = columns[1];

    it('counts rows', () => {
      expect(computeAggregate('count', people, ageColumn)).toBe(3);
    });

    it('reduces numerically', () => {
      expect(computeAggregate('sum', people, ageColumn)).toBe(109);
      expect(computeAggregate('min', people, ageColumn)).toBe(28);
      expect(computeAggregate('max', people, ageColumn)).toBe(45);
      expect(computeAggregate('avg', people, ageColumn)).toBeCloseTo(109 / 3);
    });

    it('ignores empty values and returns a neutral result when nothing is numeric', () => {
      const sparse = [{ ...people[0], age: null as any }, { ...people[1], age: undefined as any }];
      expect(computeAggregate('sum', sparse, ageColumn)).toBe(0);
      expect(computeAggregate('max', sparse, ageColumn)).toBe('');
    });

    it('delegates to a function aggregate', () => {
      expect(computeAggregate((rows) => rows.length * 2, people, ageColumn)).toBe(6);
    });
  });

  describe('sortData', () => {
    it('returns the input untouched when nothing is sorted', () => {
      const result = sortData(people, [], columns);
      expect(result).toBe(people);
    });

    it('does not mutate the source array', () => {
      const before = [...people];
      sortData(people, [{ column: 'age', direction: 'desc' }], columns);
      expect(people).toEqual(before);
    });

    it('sorts numbers and strings, both directions', () => {
      expect(names(sortData(people, [{ column: 'age', direction: 'asc' }], columns)))
        .toEqual(['Linus', 'Ada', 'Grace']);
      expect(names(sortData(people, [{ column: 'name', direction: 'desc' }], columns)))
        .toEqual(['Linus', 'Grace', 'Ada']);
    });

    it('falls through to the next sort when the first ties', () => {
      const tied: Person[] = [
        { name: 'B', age: 30, joined: '2024-01-01', active: true },
        { name: 'A', age: 30, joined: '2024-01-01', active: true },
      ];
      const result = sortData(
        tied,
        [{ column: 'age', direction: 'asc' }, { column: 'name', direction: 'asc' }],
        columns,
      );
      expect(names(result)).toEqual(['A', 'B']);
    });

    it('pushes null and undefined to the end', () => {
      const sparse: Person[] = [
        { name: 'A', age: null as any, joined: '2024-01-01', active: true },
        { name: 'B', age: 10, joined: '2024-01-01', active: true },
      ];
      expect(names(sortData(sparse, [{ column: 'age', direction: 'asc' }], columns)))
        .toEqual(['B', 'A']);
    });

    it('uses a column comparator when provided, and survives one that throws', () => {
      const reversed: DataTableColumn<Person>[] = [
        { ...columns[1], compare: (a, b) => (b as number) - (a as number) },
      ];
      expect(names(sortData(people, [{ column: 'age', direction: 'asc' }], reversed)))
        .toEqual(['Grace', 'Ada', 'Linus']);

      const throwing: DataTableColumn<Person>[] = [
        { ...columns[1], compare: () => { throw new Error('boom'); } },
      ];
      expect(() => sortData(people, [{ column: 'age', direction: 'asc' }], throwing)).not.toThrow();
    });
  });

  describe('toDayKey', () => {
    it('parses date-only strings literally, with no timezone shift', () => {
      expect(toDayKey('2024-01-15')).toBe(20240115);
      expect(toDayKey('2024-01-15T23:30:00Z')).toBe(20240115);
    });

    it('accepts Date objects and timestamps', () => {
      expect(toDayKey(new Date(2024, 0, 15))).toBe(20240115);
      expect(toDayKey(new Date(2024, 0, 15).getTime())).toBe(20240115);
    });

    it('returns null for unparseable input', () => {
      expect(toDayKey('not a date')).toBeNull();
      expect(toDayKey(null)).toBeNull();
      expect(toDayKey({})).toBeNull();
    });
  });

  describe('filterData', () => {
    it('returns everything when there is nothing to apply', () => {
      expect(filterData(people, [], columns)).toEqual(people);
    });

    it('applies comparison operators', () => {
      expect(names(filterData(people, [{ column: 'age', operator: 'gt', value: 30 }], columns)))
        .toEqual(['Ada', 'Grace']);
      expect(names(filterData(people, [{ column: 'age', operator: 'eq', value: 28 }], columns)))
        .toEqual(['Linus']);
    });

    it('applies case-insensitive string operators', () => {
      expect(names(filterData(people, [{ column: 'name', operator: 'contains', value: 'A' }], columns)))
        .toEqual(['Ada', 'Grace']);
      expect(names(filterData(people, [{ column: 'name', operator: 'startsWith', value: 'gr' }], columns)))
        .toEqual(['Grace']);
      expect(names(filterData(people, [{ column: 'name', operator: 'endsWith', value: 'US' }], columns)))
        .toEqual(['Linus']);
    });

    it('ANDs multiple filters together', () => {
      const result = filterData(
        people,
        [
          { column: 'age', operator: 'gt', value: 30 },
          { column: 'name', operator: 'contains', value: 'ad' },
        ],
        columns,
      );
      expect(names(result)).toEqual(['Ada']);
    });

    it('compares date columns by calendar day', () => {
      expect(names(filterData(people, [{ column: 'joined', operator: 'eq', value: '2024-01-15' }], columns)))
        .toEqual(['Ada']);
      expect(names(filterData(people, [{ column: 'joined', operator: 'gte', value: '2024-01-01' }], columns)))
        .toEqual(['Ada', 'Linus']);
    });

    it('treats an unparseable date filter as a no-op', () => {
      expect(filterData(people, [{ column: 'joined', operator: 'eq', value: 'soon' }], columns))
        .toEqual(people);
    });

    it('ignores filters that name an unknown column', () => {
      expect(filterData(people, [{ column: 'nope', operator: 'eq', value: 1 }], columns))
        .toEqual(people);
    });

    it('searches across every column', () => {
      expect(names(filterData(people, [], columns, 'grace'))).toEqual(['Grace']);
      expect(names(filterData(people, [], columns, '2024'))).toEqual(['Ada', 'Linus']);
      expect(filterData(people, [], columns, '   ')).toEqual(people);
    });

    it('honors per-row filterable / searchable opt-outs', () => {
      const pinFirstRow = (_row: Person, index: number) =>
        index === 0 ? { filterable: false, searchable: false } : {};

      expect(names(filterData(people, [{ column: 'age', operator: 'lt', value: 30 }], columns, undefined, pinFirstRow)))
        .toEqual(['Ada', 'Linus']);
      expect(names(filterData(people, [], columns, 'grace', pinFirstRow)))
        .toEqual(['Ada', 'Grace']);
    });
  });
});
