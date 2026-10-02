import type { ReorderResult } from './types';

export function moveItem<T>(data: T[], from: number, to: number): ReorderResult<T> | null {
  if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < 0 || from >= data.length || to >= data.length || from === to) return null;
  const next = [...data];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return { data: next, from, to };
}
