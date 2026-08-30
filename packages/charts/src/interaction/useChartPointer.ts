// useChartPointer — the ONE cross-platform input path. Returns a spread-ready
// set of handlers (web PointerEvents | native Responder) plus the ref/onLayout
// for offset measurement. Every raw event is normalized once, optionally
// hit-tested via a supplied HitTester, and pushed into the interaction store.
//
// The web/native split is intentional and kept internal: RN-web forwards DOM
// PointerEvents to the node but does NOT route them through the responder
// system, so we must attach DOM handlers on web and responder props on native.

import { useCallback, useEffect, useMemo, useRef } from 'react';
import { LayoutChangeEvent } from 'react-native';
import { isWeb } from '../utils/platform';
import { useOptionalChartInteraction } from './ChartInteractionContext';
import { useElementOffset } from './useElementOffset';
import {
  normalizePointer,
  NormalizedPointerEvent,
  NormalizeContext,
  PointerPhase,
  WheelGesture,
} from './pointerNormalize';
import { ActiveTarget, HitTester } from '../core/hittest/types';

export interface UseChartPointerOptions {
  padding: { top: number; right: number; bottom: number; left: number };
  plotWidth: number;
  plotHeight: number;
  enabled?: boolean;
  /** Track hover/move → pointer + active target. Default true. */
  hover?: boolean;
  /** Emit press/tap. Default true. */
  press?: boolean;
  /** Handle web wheel. Default false. */
  wheel?: boolean;
  /** Hit-tester used to resolve the active target on move/press. */
  tester?: HitTester | null;
  /** Max hit distance in px. */
  maxDistance?: number;
  /** Push pointer + active target into the interaction store. Default true. */
  feedStore?: boolean;
  onPointer?: (e: NormalizedPointerEvent, target: ActiveTarget | null) => void;
  onPress?: (e: NormalizedPointerEvent, target: ActiveTarget | null) => void;
  onLeave?: (e: NormalizedPointerEvent) => void;
  onWheel?: (g: WheelGesture, e: NormalizedPointerEvent) => void;
}

export interface ChartPointerHandlers {
  handlers: Record<string, any>;
  ref: ReturnType<typeof useElementOffset>['ref'];
  onLayout?: (e: LayoutChangeEvent) => void;
}

export function useChartPointer(opts: UseChartPointerOptions): ChartPointerHandlers {
  const {
    padding,
    plotWidth,
    plotHeight,
    enabled = true,
    hover = true,
    press = true,
    wheel = false,
    tester = null,
    maxDistance,
    feedStore = true,
  } = opts;

  const store = useOptionalChartInteraction();
  const { offset, measure, onLayout, ref } = useElementOffset();
  const web = isWeb();
  const measuredOnce = useRef(false);

  const ctxFor = useCallback(
    (phase: PointerPhase): NormalizeContext => ({
      offset,
      padding,
      plotWidth,
      plotHeight,
      phase,
      platform: web ? 'web' : 'native',
    }),
    [offset, padding, plotWidth, plotHeight, web],
  );

  const resolveTarget = useCallback(
    (e: NormalizedPointerEvent): ActiveTarget | null => {
      if (!tester || !e.inside) return null;
      return tester.hit({ px: e.containerX, py: e.containerY, maxDistance });
    },
    [tester, maxDistance],
  );

  // The expensive per-event work — hit-test + store writes + user callbacks. Split
  // out of `dispatch` so it can be deferred to an animation frame for high-frequency
  // `move` events (the raw event is normalized synchronously first, so we never read a
  // pooled/recycled native event off-frame).
  const process = useCallback(
    (e: NormalizedPointerEvent, phase: PointerPhase) => {
      const target = hover ? resolveTarget(e) : null;

      if (feedStore && store) {
        if (phase === 'leave' || phase === 'cancel') {
          store.setPointer?.({ x: e.containerX, y: e.containerY, inside: false, insideX: false, pageX: e.pageX, pageY: e.pageY });
          store.setActiveTarget?.(null);
          store.setActiveSlice?.([]);
        } else {
          store.setPointer?.({
            x: e.containerX,
            y: e.containerY,
            inside: e.inside,
            insideX: e.insideX,
            pageX: e.pageX,
            pageY: e.pageY,
          });
          if (hover) {
            store.setActiveTarget?.(target);
            // Multi-series slice (only when requested and supported).
            if (store.config?.multiTooltip && tester?.slice && e.inside) {
              store.setActiveSlice?.(tester.slice({ px: e.containerX, py: e.containerY, maxDistance }));
            } else if (store.config?.multiTooltip) {
              store.setActiveSlice?.([]);
            }
          }
        }
      }

      if (phase === 'leave' || phase === 'cancel') {
        opts.onLeave?.(e);
        return;
      }
      if (phase === 'press') opts.onPress?.(e, target);
      opts.onPointer?.(e, target);
    },
    [hover, resolveTarget, feedStore, store, tester, maxDistance, opts],
  );

  // rAF coalescing for `move`: many raw pointer moves can fire per frame (120–1000 Hz
  // mice, plus browser event batching). We hit-test + update the store at most once per
  // frame off the latest normalized event, instead of running `tester.hit()`/`slice()`
  // and a state write per raw event. Discrete phases (down/up/press/leave/cancel) run
  // immediately — they're low-frequency and need synchronous ordering.
  const moveRafRef = useRef<number | null>(null);
  const pendingMove = useRef<NormalizedPointerEvent | null>(null);
  const flushMove = useCallback(() => {
    moveRafRef.current = null;
    const e = pendingMove.current;
    pendingMove.current = null;
    if (e) process(e, 'move');
  }, [process]);

  const dispatch = useCallback(
    (raw: any, phase: PointerPhase) => {
      if (!enabled) return;
      // Ensure offset is fresh on the first interaction (native measureInWindow
      // is async and may not have fired from onLayout yet).
      if (!measuredOnce.current) {
        measuredOnce.current = true;
        measure();
      }
      // Normalize synchronously — native responder events may be recycled after the
      // handler returns, so we must not defer reading them.
      const e = normalizePointer(raw, ctxFor(phase));

      const coalesce =
        phase === 'move' &&
        (store?.config?.pointerRAF ?? true) &&
        typeof requestAnimationFrame !== 'undefined';
      if (coalesce) {
        pendingMove.current = e;
        if (moveRafRef.current == null) moveRafRef.current = requestAnimationFrame(flushMove);
        return;
      }

      // A discrete phase supersedes any queued move (its position is more recent).
      if (moveRafRef.current != null) {
        cancelAnimationFrame(moveRafRef.current);
        moveRafRef.current = null;
        pendingMove.current = null;
      }
      process(e, phase);
    },
    [enabled, measure, ctxFor, store, flushMove, process],
  );

  useEffect(
    () => () => {
      if (moveRafRef.current != null) {
        cancelAnimationFrame(moveRafRef.current);
        moveRafRef.current = null;
      }
    },
    [],
  );

  const handlers = useMemo(() => {
    if (!enabled) return {};
    if (web) {
      const h: Record<string, any> = {
        onPointerMove: (e: any) => dispatch(e, 'move'),
        onPointerDown: (e: any) => {
          try { e.currentTarget?.setPointerCapture?.(e.pointerId); } catch { /* noop */ }
          dispatch(e, 'down');
        },
        onPointerUp: (e: any) => { dispatch(e, 'up'); if (press) dispatch(e, 'press'); },
        onPointerLeave: (e: any) => dispatch(e, 'leave'),
        onPointerCancel: (e: any) => dispatch(e, 'cancel'),
      };
      if (wheel && opts.onWheel) {
        h.onWheel = (e: any) => {
          if (e?.cancelable) e.preventDefault?.();
          e?.stopPropagation?.();
          const ne = normalizePointer(e, ctxFor('move'));
          const anchorXRatio = plotWidth > 0 ? Math.min(1, Math.max(0, ne.plotX / plotWidth)) : 0.5;
          const anchorYRatio = plotHeight > 0 ? Math.min(1, Math.max(0, ne.plotY / plotHeight)) : 0.5;
          opts.onWheel!({ deltaY: e.deltaY ?? 0, anchorXRatio, anchorYRatio }, ne);
        };
      }
      return h;
    }
    // native responder
    return {
      onStartShouldSetResponder: () => true,
      onMoveShouldSetResponder: () => true,
      onResponderGrant: (e: any) => dispatch(e, 'down'),
      onResponderMove: (e: any) => dispatch(e, 'move'),
      onResponderRelease: (e: any) => { dispatch(e, 'up'); if (press) dispatch(e, 'press'); dispatch(e, 'leave'); },
      onResponderTerminate: (e: any) => dispatch(e, 'cancel'),
    };
  }, [enabled, web, dispatch, wheel, press, ctxFor, plotWidth, plotHeight, opts]);

  return { handlers, ref, onLayout };
}
