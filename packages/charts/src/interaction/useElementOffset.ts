// Cross-platform container-offset measurement. Replaces the web-only
// `getBoundingClientRect` + `_internalFiberInstanceHandleDEV` hack (and the
// hardcoded native `{left:0,top:0}`) that lived duplicated in ChartBase and
// ChartsProvider. The offset is the container's top-left in page/window space,
// used to convert web clientX/Y → container-local and to position the portal
// popover.

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, LayoutChangeEvent } from 'react-native';
import { isWeb } from '../utils/platform';

export interface ElementOffset {
  left: number;
  top: number;
}

export interface UseElementOffsetResult {
  offset: ElementOffset;
  /** Imperative re-measure (e.g. on first pointer-down). */
  measure: () => void;
  /** Attach to the measured View so layout changes trigger a re-measure. */
  onLayout?: (e: LayoutChangeEvent) => void;
  ref: React.RefObject<View | null>;
}

export function useElementOffset(): UseElementOffsetResult {
  const ref = useRef<View>(null);
  const [offset, setOffset] = useState<ElementOffset>({ left: 0, top: 0 });
  const offsetRef = useRef(offset);
  offsetRef.current = offset;

  const apply = useCallback((left: number, top: number) => {
    if (!Number.isFinite(left) || !Number.isFinite(top)) return;
    const prev = offsetRef.current;
    if (Math.abs(prev.left - left) < 0.5 && Math.abs(prev.top - top) < 0.5) return;
    setOffset({ left, top });
  }, []);

  const measure = useCallback(() => {
    const node = ref.current as any;
    if (!node) return;
    if (isWeb()) {
      // RN-web ref is (or wraps) the DOM node; getBoundingClientRect is present.
      const el = typeof node.getBoundingClientRect === 'function' ? node : node?.getNode?.();
      if (el && typeof el.getBoundingClientRect === 'function') {
        const r = el.getBoundingClientRect();
        const sx = typeof window !== 'undefined' ? window.scrollX || 0 : 0;
        const sy = typeof window !== 'undefined' ? window.scrollY || 0 : 0;
        apply(r.left + sx, r.top + sy);
      }
      return;
    }
    // native
    if (typeof node.measureInWindow === 'function') {
      node.measureInWindow((x: number, y: number) => apply(x, y));
    }
  }, [apply]);

  const handleLayout = useCallback((_e: LayoutChangeEvent) => {
    measure();
  }, [measure]);
  const onLayout = isWeb() ? undefined : handleLayout;

  // Web: keep offset fresh across scroll/resize. Native relies on onLayout +
  // imperative measure.
  useEffect(() => {
    if (!isWeb() || typeof window === 'undefined') return;
    let frame: number | null = null;
    const handler = () => {
      if (frame != null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        measure();
      });
    };
    measure();
    window.addEventListener('scroll', handler, { passive: true } as any);
    window.addEventListener('resize', handler);
    return () => {
      if (frame != null) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', handler as any);
      window.removeEventListener('resize', handler as any);
    };
  }, [measure]);

  return { offset, measure, onLayout, ref };
}
