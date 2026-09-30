import { useCallback, useRef, useState } from 'react';
import type { SplitterPaneSize, UseSplitterOptions, UseSplitterReturn } from './types';

function px(size: SplitterPaneSize, total: number): number {
  if (typeof size === 'number') return (total * size) / 100;
  if (size.endsWith('px')) return parseFloat(size);
  if (size.endsWith('rem')) return parseFloat(size) * 16;
  return (total * parseFloat(size)) / 100;
}

function actualPixels(sizes: SplitterPaneSize[], total: number): number[] {
  const fixed = sizes.map(
    (size) => typeof size === 'string' && (size.endsWith('px') || size.endsWith('rem')),
  );
  const fixedTotal = sizes.reduce<number>(
    (sum, size, index) => sum + (fixed[index] ? px(size, total) : 0),
    0,
  );
  const remaining = Math.max(0, total - fixedTotal);
  const weights = sizes.reduce<number>(
    (sum, size, index) =>
      sum + (fixed[index] ? 0 : Math.max(0, typeof size === 'number' ? size : parseFloat(size))),
    0,
  );
  return sizes.map((size, index) =>
    fixed[index]
      ? px(size, total)
      : weights
        ? (remaining * (typeof size === 'number' ? size : parseFloat(size))) / weights
        : 0,
  );
}

function fromPx(value: number, original: SplitterPaneSize, total: number): SplitterPaneSize {
  if (typeof original === 'string' && original.endsWith('px')) return `${Math.round(value)}px`;
  if (typeof original === 'string' && original.endsWith('rem'))
    return `${+(value / 16).toFixed(2)}rem`;
  const percent = total ? +((value / total) * 100).toFixed(3) : 0;
  return typeof original === 'string' ? `${percent}%` : percent;
}

export function useSplitter({
  panels,
  orientation = 'horizontal',
  sizes: controlled,
  onSizeChange,
  onCollapseChange,
  redistribute = 'nearest',
}: UseSplitterOptions): UseSplitterReturn {
  const [containerSize, setContainerSize] = useState(0);
  const [internal, setInternal] = useState<SplitterPaneSize[]>(() =>
    panels.map((panel) => panel.defaultSize ?? 100 / Math.max(1, panels.length)),
  );
  const sizes = controlled ?? internal;
  const previous = useRef<SplitterPaneSize[]>([]);
  const setSizes = useCallback(
    (next: SplitterPaneSize[]) => {
      if (!controlled) setInternal(next);
      onSizeChange?.(next);
    },
    [controlled, onSizeChange],
  );
  const collapse = (index: number) => {
    if (!panels[index]?.collapsible || !sizes[index]) return;
    previous.current[index] = sizes[index];
    const next = [...sizes];
    const pixels = actualPixels(sizes, containerSize);
    const value = pixels[index];
    next[index] = fromPx(0, next[index], containerSize);
    const neighbor = index === next.length - 1 ? index - 1 : index + 1;
    if (neighbor >= 0)
      next[neighbor] = fromPx(pixels[neighbor] + value, next[neighbor], containerSize);
    setSizes(next);
    onCollapseChange?.(index, true);
  };
  const expand = (index: number) => {
    const original = previous.current[index] ?? panels[index]?.defaultSize;
    if (original == null) return;
    const next = [...sizes];
    const pixels = actualPixels(sizes, containerSize);
    const value = px(original, containerSize);
    next[index] = original;
    const neighbor = index === next.length - 1 ? index - 1 : index + 1;
    if (neighbor >= 0)
      next[neighbor] = fromPx(Math.max(0, pixels[neighbor] - value), next[neighbor], containerSize);
    setSizes(next);
    onCollapseChange?.(index, false);
  };
  const resize = (index: number, delta: number) => {
    if (!containerSize || sizes[index] == null || sizes[index + 1] == null || delta === 0) return;
    if (typeof redistribute === 'function') {
      setSizes(redistribute(sizes, index, delta));
      return;
    }
    const pixels = actualPixels(sizes, containerSize);
    const receiver = delta > 0 ? index : index + 1;
    const donors =
      delta > 0
        ? Array.from({ length: sizes.length - index - 1 }, (_, n) => index + n + 1)
        : Array.from({ length: index + 1 }, (_, n) => index - n);
    const maxReceiver =
      panels[receiver]?.max == null ? containerSize : px(panels[receiver].max!, containerSize);
    let remaining = Math.min(Math.abs(delta), Math.max(0, maxReceiver - pixels[receiver]));
    let movedTotal = 0;
    const capacities = donors.map((donor) =>
      Math.max(
        0,
        pixels[donor] - (panels[donor]?.min == null ? 0 : px(panels[donor].min!, containerSize)),
      ),
    );
    if (redistribute === 'equal') {
      let active = donors.map((_, n) => n).filter((n) => capacities[n] > 0);
      while (remaining > 0.01 && active.length) {
        const share = remaining / active.length;
        let moved = 0;
        for (const n of active) {
          const take = Math.min(share, capacities[n]);
          pixels[donors[n]] -= take;
          capacities[n] -= take;
          moved += take;
        }
        remaining -= moved;
        movedTotal += moved;
        active = active.filter((n) => capacities[n] > 0.01);
        if (moved < 0.01) break;
      }
    } else {
      donors.forEach((donor, n) => {
        if (remaining <= 0) return;
        const panel = panels[donor];
        const threshold =
          panel?.collapseThreshold == null
            ? panel?.min == null
              ? 0
              : px(panel.min, containerSize)
            : px(panel.collapseThreshold, containerSize);
        const snap =
          panel?.collapsible &&
          pixels[donor] - remaining < threshold &&
          pixels[donor] <= maxReceiver - pixels[receiver] - movedTotal;
        const take = snap ? pixels[donor] : Math.min(remaining, capacities[n]);
        pixels[donor] -= take;
        remaining = Math.max(0, remaining - take);
        movedTotal += take;
        if (snap) onCollapseChange?.(donor, true);
      });
    }
    pixels[receiver] += movedTotal;
    setSizes(pixels.map((value, n) => fromPx(value, sizes[n], containerSize)));
  };
  return {
    sizes,
    collapsed: actualPixels(sizes, containerSize).map((size) => size === 0),
    setSizes,
    collapse,
    expand,
    toggleCollapse: (index) =>
      px(sizes[index], containerSize) === 0 ? expand(index) : collapse(index),
    containerSize,
    onLayout: (event) =>
      setContainerSize(
        orientation === 'horizontal'
          ? event.nativeEvent.layout.width
          : event.nativeEvent.layout.height,
      ),
    resize,
  };
}
