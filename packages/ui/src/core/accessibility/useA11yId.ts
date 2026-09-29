import React, { useId } from 'react';

/**
 * Turns a React `useId()` value (`:r0:`, `«r0»`, `_r_0_` depending on the React
 * version) into something valid as a DOM id, a CSS selector and a native
 * `nativeID`: only `[A-Za-z0-9_-]`, prefixed so it never starts with a digit.
 */
export function sanitizeId(raw: string, prefix: string = 'pb'): string {
  const cleaned = raw.replace(/[^A-Za-z0-9_-]/g, '');
  return `${prefix}-${cleaned}`;
}

/**
 * A stable, SSR-safe element id. Returns `explicitId` when given, otherwise a
 * sanitized `useId()`.
 *
 * @example
 * const id = useA11yId(props.id); // 'pb-r0' or props.id
 */
export function useA11yId(explicitId?: string, prefix: string = 'pb'): string {
  const generated = useId();
  return explicitId || sanitizeId(generated, prefix);
}

/**
 * Plain text of a React node, for composing native accessibility labels from
 * `ReactNode` labels/descriptions. Elements contribute their children's text;
 * booleans and null contribute nothing.
 */
export function getNodeText(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number' || typeof node === 'bigint') return String(node);
  if (Array.isArray(node)) {
    return node.map(getNodeText).filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  }
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return getNodeText(node.props.children);
  }
  return '';
}
