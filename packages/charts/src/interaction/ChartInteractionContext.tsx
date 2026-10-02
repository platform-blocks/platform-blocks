import React, { createContext, useContext, useRef, useState, useCallback, useEffect, useMemo } from 'react';
import type { ActiveTarget, HitTester, HitQuery } from '../core/hittest/types';
import type { ChartRegistration } from '../core/hittest/registration';
import { createHitTester } from '../core/hittest/registration';
import { CHART_TOUCH_HOLD_MS } from './touchInput';

/**
 * Pair of numeric domains for x and y axes
 */
export interface DomainPair { 
  /** X-axis domain range */
  x: [number, number]; 
  /** Y-axis domain range */
  y: [number, number]; 
}

/**
 * Configuration options for chart interactions
 */
export interface InteractionConfig {
  /** Enable panning and zooming interactions. Default true. */
  enablePanZoom?: boolean;
  /** Zoom mode: 'x' (default), 'y', or 'both'. */
  zoomMode?: 'x' | 'y' | 'both';
  /** Minimum zoom level (relative to initial domain width/height). Default 0.1 (10%). */
  minZoom?: number;
  /** Step factor for each wheel event (smaller = finer). Default 0.1 */
  wheelZoomStep?: number;
  /** Reset zoom to initial domains on double tap. Default true. */
  resetOnDoubleTap?: boolean;
  /** Enable zooming via mouse wheel. Default false. */
  enableWheelZoom?: boolean;
  /** Minimum pixel delta before wheel zooming occurs (noise filter). Default 0 (disabled). */
  wheelZoomPixelThreshold?: number;
  /** Minimum zoom level when using wheel zoom (relative to initial domain width/height). Default 0.05 (5%). */
  wheelMinZoom?: number;
  /** Clamp panning to initial domains (no blank space). Default false. */
  clampToInitialDomain?: boolean;
  /** Show a vertical guide line tracking the active point. Default false. */
  enableCrosshair?: boolean;
  /** Show a tooltip for the nearest point(s) to the pointer. Default false. */
  liveTooltip?: boolean;
  /** Show a tooltip for all series at the pointer x (vertical slice). Default false. */
  multiTooltip?: boolean;
  /** Invert the direction of pinch zooming. Default false. */
  invertPinchZoom?: boolean;
  /** Invert the direction of wheel zooming. Default false. */
  invertWheelZoom?: boolean;
  /** Render the shared tooltip in a portal attached to document.body (web only) using page coordinates. Default true. */
  popoverPortal?: boolean;
  /** Throttle high-frequency pointer updates to animation frames (reduces rerenders). Default true. */
  pointerRAF?: boolean;
  /** Minimum pixel delta before pointer state update (noise filter). Default 0 (disabled). */
  pointerPixelThreshold?: number;
  /** Max rows shown in a multi-series slice tooltip. Default 8. */
  aggregatorMaxSeries?: number;
}

/**
 * Data series registered with the interaction provider
 */
export interface RegisteredSeries {
  /** Unique identifier for the series */
  id: string | number;
  /** Display name for the series */
  name?: string;
  /** Color used to render the series */
  color?: string;
  /** Whether the series is currently visible */
  visible: boolean;
}

// Content-equality for active targets/slices. The hit-test engine hands the store a fresh
// object/array on every pointer move, so reference checks always mutate → every chart that
// consumes the context re-renders each frame. Deduping by the resolved mark's identity
// (series + mark + kind + anchor) collapses "moving within the same slice/point/category"
// to a no-op, while still updating when the resolved target actually changes. Position
// follow-the-cursor is driven by `pointer`, not the anchor, so this changes no behavior.
const sameTarget = (a: ActiveTarget | null, b: ActiveTarget | null): boolean => {
  if (a === b) return true;
  if (!a || !b) return false;
  return (
    a.seriesId === b.seriesId &&
    a.markId === b.markId &&
    a.kind === b.kind &&
    a.pixel?.x === b.pixel?.x &&
    a.pixel?.y === b.pixel?.y
  );
};

const sameSlice = (a: ActiveTarget[], b: ActiveTarget[]): boolean => {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (!sameTarget(a[i], b[i])) return false;
  }
  return true;
};

/**
 * High-frequency ("volatile") state — changes on every pointer move. Lives in its own
 * context so only the components that actually render pointer-driven visuals (the tooltip
 * + the crosshair charts) re-render each frame. Chart bodies read the stable context and
 * never see these, so a hover sweep doesn't re-render the whole chart.
 */
export interface ChartVolatileState {
  /** Current pointer/mouse position */
  pointer: { x: number; y: number; inside: boolean; insideX?: boolean; insideY?: boolean; pageX?: number; pageY?: number; data?: any } | null;
  /**
   * Normalized active target from the hit-test engine. Carries geometry-specific
   * fields (categoryIndex / cell / angleDeg / axisIndex) and a canonical pixel anchor.
   */
  activeTarget: ActiveTarget | null;
  /**
   * All series' targets at the current pointer x/angle (a "slice"), for
   * multi-series tooltips. Empty unless a tester with slice() is active and
   * multiTooltip is on.
   */
  activeSlice: ActiveTarget[];
}

/** Low-frequency ("stable") state — changes rarely (legend toggle, zoom, layout). */
interface StableState {
  /**
   * Series registry used for legend visibility, upserted by
   * `updateSeriesVisibility`.
   */
  series: RegisteredSeries[];
  /** Initial and current domains */
  domains: { initial: DomainPair; current: DomainPair } | null;
  /** Offset of the chart root element */
  rootOffset?: { left: number; top: number } | null;
}

/**
 * Stable context value provided to chart bodies — everything EXCEPT the per-frame
 * volatile fields (pointer/activeTarget/activeSlice), which live in the volatile context.
 * Setters live here so charts can feed the store without subscribing to volatile state.
 */
interface InteractionContextValue extends StableState {
  /** Interaction configuration */
  config: InteractionConfig;
  /** Update visibility of a series (upserts a visibility-only entry for legend toggles). */
  updateSeriesVisibility: (id: string | number, visible: boolean) => void;
  /** Update pointer position */
  setPointer: (p: ChartVolatileState['pointer']) => void;
  /** Update the normalized active target (new hit-test engine). */
  setActiveTarget: (t: ActiveTarget | null) => void;
  /** Clear a held touch target only if it is still the active selection. */
  clearActiveTargetIf: (t: ActiveTarget) => void;
  /** Keep the current target and slice readable after an explicit touch release. */
  holdTouchTarget: () => void;
  /** End a held selection before a new gesture begins. */
  cancelTouchHold: () => void;
  /** Update the multi-series slice (new hit-test engine). */
  setActiveSlice: (s: ActiveTarget[]) => void;
  /**
   * Register (or replace) a chart's hit-test geometry under a stable key. The
   * store derives a HitTester from the registration. Call with `null` to
   * unregister on unmount.
   */
  register: (key: string | number, reg: ChartRegistration | null) => void;
  /** Run the registered hit-testers and return the closest target (best distance). */
  hitTest: (q: HitQuery) => ActiveTarget | null;
  /** Update domains (flexible signature) */
  setDomains: (d: DomainPair['x'] | DomainPair['y'] | Partial<DomainPair>) => void;
  /** Initialize domains with initial values */
  initializeDomains: (initial: DomainPair) => void;
  /** Reset zoom to initial domains */
  resetZoom: () => void;
  /** Set the root element offset */
  setRootOffset: (o: { left: number; top: number }) => void;
}

/** Pointer position — changes on every pointer move (per-frame during hover). */
export type PointerState = ChartVolatileState['pointer'];

/** Resolved hit-test target(s) — changes only when the active mark changes (deduped). */
export interface TargetState {
  activeTarget: ActiveTarget | null;
  activeSlice: ActiveTarget[];
}

const StableContext = createContext<InteractionContextValue | null>(null);
// The old single volatile context is split in two so a consumer subscribes only to the
// slice it actually renders. `pointer` churns every frame; `target` changes only when the
// resolved mark changes. A chart that highlights the active mark (e.g. GroupedBar) reads
// TargetContext and no longer re-renders on cursor motion — only the crosshair/tooltip
// components that read the raw pointer re-render each frame.
const PointerContext = createContext<PointerState>(null);
const TargetContext = createContext<TargetState | null>(null);

const EMPTY_TARGET: TargetState = { activeTarget: null, activeSlice: [] };
const EMPTY_VOLATILE: ChartVolatileState = { pointer: null, activeTarget: null, activeSlice: [] };

/**
 * Hook to access the (stable) chart interaction context — config, series, setters,
 * register/hitTest, domains. Does NOT subscribe to per-frame pointer/target/slice, so a
 * component reading this does not re-render on pointer moves.
 * @throws Error if used outside of ChartInteractionProvider
 */
export const useChartInteractionContext = () => {
  const ctx = useContext(StableContext);
  if (!ctx) throw new Error('useChartInteractionContext must be used within <ChartInteractionProvider>');
  return ctx;
};

/**
 * Non-throwing variant. Returns null when there is no provider, replacing the
 * copy-pasted `try { useChartInteractionContext() } catch {}` blocks.
 */
export const useOptionalChartInteraction = (): InteractionContextValue | null =>
  useContext(StableContext);

/**
 * Subscribe to the raw pointer position ONLY. Re-renders every frame during hover, so use
 * it only for cursor-following visuals (crosshair line, hover readout). Returns null when
 * there is no provider.
 */
export const usePointer = (): PointerState => useContext(PointerContext);

/**
 * Subscribe to the resolved hit-test target/slice ONLY. Re-renders when the active mark
 * changes, NOT on every pointer move — the right hook for "highlight the active mark".
 * Returns EMPTY_TARGET when there is no provider.
 */
export const useActiveTarget = (): TargetState => useContext(TargetContext) ?? EMPTY_TARGET;

/**
 * Combined convenience: pointer + target. Re-renders every frame (it reads the pointer),
 * so prefer usePointer()/useActiveTarget() when a component needs only one. Returns
 * EMPTY_VOLATILE when there is no provider.
 */
export const useChartInteractionVolatile = (): ChartVolatileState => {
  const pointer = useContext(PointerContext);
  const target = useContext(TargetContext);
  return target ? { pointer, ...target } : EMPTY_VOLATILE;
};

/**
 * Provider component for chart interaction state and behaviors
 */
export const ChartInteractionProvider: React.FC<{ config?: InteractionConfig; children: React.ReactNode; }> = ({ config = {}, children }) => {
  // Three separate states so an update to one never changes another context value's
  // identity. `pointer` churns every frame; `target` changes only on hit-change; `stable`
  // is rare. Chart bodies read `stable` and never re-render on hover; target-only consumers
  // read `target` and re-render only when the active mark changes.
  const [pointer, setPointerState] = useState<PointerState>(null);
  const [target, setTarget] = useState<TargetState>({
    activeTarget: null,
    activeSlice: [],
  });
  const [stable, setStable] = useState<StableState>({
    series: [],
    domains: null,
    rootOffset: null,
  });

  // Hit-test registry (refs — testers are heavy and must not trigger rerenders).
  const testers = useRef<Map<string | number, HitTester>>(new Map());
  const register = useCallback((key: string | number, reg: ChartRegistration | null) => {
    if (reg == null) {
      testers.current.delete(key);
      return;
    }
    testers.current.set(key, createHitTester(reg));
  }, []);
  const hitTest = useCallback((q: HitQuery): ActiveTarget | null => {
    let best: ActiveTarget | null = null;
    testers.current.forEach((tester) => {
      const cand = tester.hit(q);
      if (cand && (!best || cand.distance < best.distance)) best = cand;
    });
    return best;
  }, []);
  const activeTargetRef = useRef<ActiveTarget | null>(null);
  const touchHoldRef = useRef<{ target: ActiveTarget; timer: ReturnType<typeof setTimeout> } | null>(null);
  const cancelTouchHold = useCallback(() => {
    if (touchHoldRef.current) clearTimeout(touchHoldRef.current.timer);
    touchHoldRef.current = null;
  }, []);
  const setActiveTarget = useCallback((t: ActiveTarget | null) => {
    if (t == null && touchHoldRef.current) return;
    if (t && touchHoldRef.current && !sameTarget(touchHoldRef.current.target, t)) cancelTouchHold();
    activeTargetRef.current = t;
    setTarget(prev => (sameTarget(prev.activeTarget, t) ? prev : { ...prev, activeTarget: t }));
  }, [cancelTouchHold]);
  const clearActiveTargetIf = useCallback((expected: ActiveTarget) => {
    if (!sameTarget(activeTargetRef.current, expected)) return;
    cancelTouchHold();
    activeTargetRef.current = null;
    setTarget({ activeTarget: null, activeSlice: [] });
    setPointerState(null);
  }, [cancelTouchHold]);
  const setActiveSlice = useCallback((s: ActiveTarget[]) => {
    if (s.length === 0 && touchHoldRef.current) return;
    setTarget(prev => (sameSlice(prev.activeSlice, s) ? prev : { ...prev, activeSlice: s }));
  }, []);
  const holdTouchTarget = useCallback(() => {
    const current = activeTargetRef.current;
    if (!current) return;
    cancelTouchHold();
    const timer = setTimeout(() => clearActiveTargetIf(current), CHART_TOUCH_HOLD_MS);
    touchHoldRef.current = { target: current, timer };
  }, [cancelTouchHold, clearActiveTargetIf]);

  const updateSeriesVisibility = useCallback((id: string | number, visible: boolean) => {
    setStable(prev => {
      const idx = prev.series.findIndex(s => s.id === id);
      if (idx === -1) {
        // Upsert a visibility-only entry so charts can drive legend toggles. Charts read
        // this back via `interaction.series`; `points` is unused (vestigial).
        return { ...prev, series: [...prev.series, { id, visible }] };
      }
      if (prev.series[idx].visible === visible) return prev;
      return { ...prev, series: prev.series.map(s => s.id === id ? { ...s, visible } : s) };
    });
  }, []);

  // rAF coalesced pointer setter
  const rafRef = useRef<number | null>(null);
  const pendingPointer = useRef<ChartVolatileState['pointer'] | null>(null);
  const lastPointer = useRef<ChartVolatileState['pointer'] | null>(null);
  const pointerThreshold = config.pointerPixelThreshold ?? 0;
  const flushPointer = () => {
    rafRef.current = null;
    if (pendingPointer.current) {
      const next = pendingPointer.current;
      pendingPointer.current = null;
      lastPointer.current = next;
      setPointerState(next);
    }
  };
  const setPointer = useCallback((p: ChartVolatileState['pointer']) => {
    // A retained tooltip needs its last screen anchor after pointer leave too.
    if (touchHoldRef.current && !p?.inside) return;
    if (!config.pointerRAF && pointerThreshold === 0) {
      setPointerState(p);
      return;
    }
    if (lastPointer.current && p && pointerThreshold > 0) {
      const dx = (p.pageX ?? p.x) - (lastPointer.current.pageX ?? lastPointer.current.x);
      const dy = (p.pageY ?? p.y) - (lastPointer.current.pageY ?? lastPointer.current.y);
      if (Math.abs(dx) < pointerThreshold && Math.abs(dy) < pointerThreshold) {
        return; // below movement threshold
      }
    }
    pendingPointer.current = p;
    if (config.pointerRAF) {
      if (rafRef.current == null && typeof window !== 'undefined') {
        rafRef.current = window.requestAnimationFrame(flushPointer);
      }
    } else {
      flushPointer();
    }
  }, [config.pointerRAF, pointerThreshold]);
  const setRootOffset = useCallback((o: { left: number; top: number }) => setStable(prev => prev.rootOffset ? prev : ({ ...prev, rootOffset: o })), []);
  const initializeDomains = useCallback((initial: DomainPair) => setStable(prev => ({ ...prev, domains: { initial, current: initial } })), []);
  const setDomains = useCallback((d: any) => setStable(prev => {
    if (!prev.domains) return prev;
    const current = prev.domains.current;
    let next = { ...current } as DomainPair;
    if (d.x) next.x = d.x as [number, number];
    if (d.y) next.y = d.y as [number, number];
    if (d.x && d.y == null && Array.isArray(d)) next.x = d as [number, number];
    return { ...prev, domains: { ...prev.domains, current: next } };
  }), []);
  const resetZoom = useCallback(() => setStable(prev => prev.domains ? { ...prev, domains: { ...prev.domains, current: prev.domains.initial } } : prev), []);

  // Cancel any pending rAFs on unmount to prevent setState on unmounted component
  useEffect(() => {
    return () => {
      cancelTouchHold();
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [cancelTouchHold]);

  // Memoized so its identity only changes when `stable`/`config` change — NOT on volatile
  // updates. This is what keeps chart bodies from re-rendering on every pointer move.
  const stableValue = useMemo<InteractionContextValue>(() => ({
    ...stable,
    config,
    updateSeriesVisibility,
    setPointer,
    setRootOffset,
    setActiveTarget,
    clearActiveTargetIf,
    holdTouchTarget,
    cancelTouchHold,
    setActiveSlice,
    register,
    hitTest,
    initializeDomains,
    setDomains,
    resetZoom,
  }), [stable, config, updateSeriesVisibility, setPointer, setRootOffset, setActiveTarget, clearActiveTargetIf, holdTouchTarget, cancelTouchHold, setActiveSlice, register, hitTest, initializeDomains, setDomains, resetZoom]);

  return (
    <StableContext.Provider value={stableValue}>
      <TargetContext.Provider value={target}>
        {/* Pointer innermost: it changes most often, and `stableValue`/`target` keep a
            stable identity across a pointer-only update, so their consumers skip re-render. */}
        <PointerContext.Provider value={pointer}>
          {children}
        </PointerContext.Provider>
      </TargetContext.Provider>
    </StableContext.Provider>
  );
};
