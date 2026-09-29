import React, { useMemo, useCallback, useRef, useState, useEffect, memo } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  interpolateColor,
  runOnJS,
  type SharedValue,
} from 'react-native-reanimated';

import { factory } from '../../core/factory/factory';
import { a11yProps } from '../../core/accessibility/a11yProps';
import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { useReducedMotion } from '../../core/motion/useReducedMotion';
import { isNative, isWeb } from '../../core/platform';
import { useViewport, type Breakpoint } from '../../core/responsive';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getControlSize } from '../../core/theme/tokens';
import type { PlatformBlocksTheme, SizeValue } from '../../core/theme/types';
import { useStyleProps } from '../../core/utils/spacing';
import { useMergedRef } from '../../core/utils/mergeRefs';
import { resolveOptionalModule } from '../../utils/optionalModule';
import { useHover } from '../../hooks/useHover/useHover';
import { Button } from '../Button';
import { Icon } from '../Icon';
import type { CarouselProps } from './types';

// ---------------------------------------------------------------------------
// Engine (react-native-reanimated-carousel, an optional peer)
// ---------------------------------------------------------------------------

/** The engine instance methods Carousel calls. */
interface CarouselEngineHandle {
  scrollTo(options: { count?: number; index?: number; animated?: boolean }): void;
  prev(): void;
  next(): void;
}

/** Engine props are forwarded structurally; the optional peer's own types aren't referenced. */
type CarouselEngine = React.ComponentType<Record<string, unknown> & React.RefAttributes<CarouselEngineHandle>>;

/**
 * The carousel engine, resolved lazily so apps that never render a Carousel
 * neither bundle react-native-reanimated-carousel nor need it installed.
 * Without it the component warns in dev and renders its chrome only.
 */
const resolveCarouselEngine = () =>
  resolveOptionalModule<CarouselEngine>('react-native-reanimated-carousel', {
    accessor: (mod: { default?: CarouselEngine } | CarouselEngine | null | undefined) =>
      (mod && typeof mod === 'object' && 'default' in mod ? mod.default : (mod as CarouselEngine | null | undefined)) ?? null,
    devWarning:
      'react-native-reanimated-carousel is not installed; <Carousel> has no engine to render with. Install it to use this component.',
  });

// ---------------------------------------------------------------------------
// Responsive helpers
// ---------------------------------------------------------------------------

type ResponsiveConfig<T> = T | Partial<Record<Breakpoint, T>> | null | undefined;

const ORDER: readonly Breakpoint[] = ['base', 'xs', 'sm', 'md', 'lg', 'xl'];

/**
 * A value for the current breakpoint: the nearest defined entry at or below it.
 * Below the `xs` width (`base`) an `xs` entry still applies, as it always has.
 */
function resolveResponsive<T extends string | number>(config: ResponsiveConfig<T>, breakpoint: Breakpoint): T | undefined {
  if (config == null) return undefined;
  if (typeof config !== 'object') return config;
  const idx = Math.max(ORDER.indexOf(breakpoint), ORDER.indexOf('xs'));
  for (let i = idx; i >= 0; i--) {
    const value = config[ORDER[i]];
    if (value != null) return value;
  }
  return undefined;
}

const parseMediaQuery = (query: string) => {
  const minMatch = query.match(/min-width:\s*(\d+)px/);
  const maxMatch = query.match(/max-width:\s*(\d+)px/);
  return {
    min: minMatch ? parseInt(minMatch[1], 10) : undefined,
    max: maxMatch ? parseInt(maxMatch[1], 10) : undefined,
  };
};

const matchQuery = (query: string, width: number) => {
  const { min, max } = parseMediaQuery(query);
  if (min != null && width < min) return false;
  if (max != null && width > max) return false;
  return true;
};

/** Applies `breakpoints` overrides (`'(min-width: 768px)': {...}`) for the viewport width, smallest first. */
function mergeBreakpointProps(
  baseProps: CarouselProps,
  breakpointProps: Record<string, Partial<CarouselProps>> | undefined,
  width: number
): CarouselProps {
  if (!breakpointProps) return baseProps;
  const sortedEntries = Object.entries(breakpointProps).sort(
    (a, b) => (parseMediaQuery(a[0]).min ?? 0) - (parseMediaQuery(b[0]).min ?? 0)
  );

  let resolvedProps: CarouselProps = baseProps;
  sortedEntries.forEach(([query, value]) => {
    if (matchQuery(query, width)) resolvedProps = { ...resolvedProps, ...value };
  });
  return resolvedProps;
}

// ---------------------------------------------------------------------------
// Size metrics (derived from the theme's control-size table)
// ---------------------------------------------------------------------------

const SIZE_TOKENS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;

interface ArrowMetrics {
  buttonSize: SizeValue;
  buttonHeight: number;
  iconSize: number;
  edgeOffset: number;
}

interface DotMetrics {
  baseSize: number;
  margin: number;
  trackOffset: number;
}

function getArrowMetrics(theme: PlatformBlocksTheme, size: SizeValue): ArrowMetrics {
  const control = getControlSize(theme, size);
  const buttonHeight = Math.max(28, control.height);
  // A numeric size maps to the nearest token so the Button keeps its own proportions.
  let buttonSize: SizeValue = size;
  if (typeof size === 'number') {
    buttonSize = SIZE_TOKENS.reduce((best, token) =>
      Math.abs(getControlSize(theme, token).height - buttonHeight) < Math.abs(getControlSize(theme, best).height - buttonHeight)
        ? token
        : best
    );
  }
  return {
    buttonSize,
    buttonHeight,
    iconSize: Math.max(12, Math.round(control.iconSize * 0.9)),
    edgeOffset: Math.max(6, Math.round(control.paddingX * 0.66)),
  };
}

function getDotMetrics(theme: PlatformBlocksTheme, size: SizeValue): DotMetrics {
  const md = getControlSize(theme, 'md');
  const mdMetrics = {
    baseSize: Math.max(4, Math.round(md.iconSize * 0.5)),
    margin: Math.max(2, Math.round(md.paddingX * 0.25)),
    trackOffset: Math.max(8, Math.round(md.paddingX)),
  };
  // A numeric dot size is the resting dot diameter.
  if (typeof size === 'number') {
    const baseSize = Math.max(4, Math.round(size));
    const scale = baseSize / mdMetrics.baseSize;
    return {
      baseSize,
      margin: Math.max(2, Math.round(mdMetrics.margin * scale)),
      trackOffset: Math.max(8, Math.round(mdMetrics.trackOffset * scale)),
    };
  }
  const control = getControlSize(theme, size);
  return {
    baseSize: Math.max(4, Math.round(control.iconSize * 0.5)),
    margin: Math.max(2, Math.round(control.paddingX * 0.25)),
    trackOffset: Math.max(8, Math.round(control.paddingX)),
  };
}

// ---------------------------------------------------------------------------
// Pagination dots
// ---------------------------------------------------------------------------

// How much wider (or taller) the active dot grows relative to its resting size.
const DOT_ACTIVE_GROWTH = 1.4;
/** Dot press target: ≥24px on web; on native 44pt across the track, 24pt along it plus hitSlop. */
const DOT_HIT_MAIN = 24;
const DOT_HIT_CROSS = isNative ? 44 : 24;
const DOT_HIT_SLOP = isNative ? 10 : 0;

const styles = StyleSheet.create({
  arrowColumn: { alignItems: 'center', end: 0, position: 'absolute', start: 0, zIndex: 10 },
  arrowRow: { bottom: 0, justifyContent: 'center', position: 'absolute', top: 0, zIndex: 10 },
  dotFill: { position: 'absolute' },
  dotsColumn: { alignItems: 'center', flexDirection: 'column', justifyContent: 'center' },
  dotsRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  dotTarget: { alignItems: 'center', justifyContent: 'center' },
  fill: { flex: 1 },
  pageRow: { alignItems: 'stretch', flex: 1, flexWrap: 'nowrap' },
  root: { position: 'relative', width: '100%' },
  rootVertical: { flexDirection: 'row' },
  stage: { position: 'relative' },
});

interface CarouselDotProps {
  index: number;
  pageProgress: SharedValue<number>;
  metrics: DotMetrics;
  totalPages: number;
  loop: boolean;
  active: boolean;
  activeColor: string;
  inactiveColor: string;
  onPress: (index: number) => void;
  isVertical: boolean;
}

// Memoized so a page change re-renders only the two dots whose state flipped.
const CarouselDot = memo(function CarouselDot({
  index,
  pageProgress,
  metrics,
  totalPages,
  loop,
  active,
  activeColor,
  inactiveColor,
  onPress,
  isVertical,
}: CarouselDotProps) {
  const baseDotSize = metrics.baseSize;
  const maxDotSize = baseDotSize * (1 + DOT_ACTIVE_GROWTH);
  // Drive the dot straight off scroll progress. Progress is already a smooth,
  // UI-thread value, so wrapping these in withTiming only restarted a fresh
  // animation on every frame — which is what made the dots lag the slide.
  const animatedStyle = useAnimatedStyle(() => {
    let current = pageProgress.value;
    // Normalize for loop jitter: map absolute progress to logical page index space
    if (loop && totalPages > 0) {
      current = ((current % totalPages) + totalPages) % totalPages;
    }
    const rawDist = Math.abs(current - index);
    const dist = loop ? Math.min(rawDist, totalPages - rawDist) : rawDist;
    const activeAmount = 1 - Math.min(dist, 1); // clamp to [0,1]

    const size = baseDotSize + baseDotSize * DOT_ACTIVE_GROWTH * activeAmount;

    return {
      width: isVertical ? baseDotSize : size,
      height: isVertical ? size : baseDotSize,
      opacity: 0.4 + 0.6 * activeAmount,
      backgroundColor: interpolateColor(activeAmount, [0, 1], [inactiveColor, activeColor]),
    };
  }, [baseDotSize, isVertical, loop, totalPages, index, activeColor, inactiveColor]);

  const handlePress = useCallback(() => {
    onPress(index);
  }, [index, onPress]);

  // The target reserves room for the fully expanded dot so growing the active
  // one never reflows the track mid-scroll, and is at least the minimum hit size.
  const main = Math.max(maxDotSize, DOT_HIT_MAIN);
  const cross = Math.max(baseDotSize, DOT_HIT_CROSS);
  const targetStyle: ViewStyle = isVertical
    ? { marginVertical: metrics.margin, width: cross, height: main }
    : { marginHorizontal: metrics.margin, width: main, height: cross };
  const hitSlop = isVertical
    ? { top: DOT_HIT_SLOP, bottom: DOT_HIT_SLOP }
    : { left: DOT_HIT_SLOP, right: DOT_HIT_SLOP };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={hitSlop}
      style={[styles.dotTarget, targetStyle]}
      {...a11yProps({ role: 'button', label: `Go to slide ${index + 1}`, current: active || undefined })}
    >
      {/* Absolute so the width/height animation never triggers flow layout. */}
      <Animated.View style={[styles.dotFill, { borderRadius: baseDotSize / 2 }, animatedStyle]} />
    </Pressable>
  );
});

interface CarouselPaginationProps extends Omit<CarouselDotProps, 'index' | 'active'> {
  initialPage: number;
  style: ViewStyle;
  leading?: React.ReactNode;
}

/**
 * The dots own the "current page" state, so a page flip re-renders the dots
 * (for `aria-current`) and not the whole carousel.
 */
function CarouselPagination({ initialPage, style, leading, ...dotProps }: CarouselPaginationProps) {
  const { pageProgress, totalPages } = dotProps;
  const [activePage, setActivePage] = useState(initialPage);

  useAnimatedReaction(
    () => {
      if (totalPages <= 0) return 0;
      return ((Math.round(pageProgress.value) % totalPages) + totalPages) % totalPages;
    },
    (page, previous) => {
      if (previous != null && page === previous) return;
      runOnJS(setActivePage)(page);
    },
    [totalPages]
  );

  return (
    <View style={style}>
      {leading}
      {Array.from({ length: totalPages }).map((_, i) => (
        <CarouselDot key={i} index={i} active={i === activePage} {...dotProps} />
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Carousel
// ---------------------------------------------------------------------------

const EMPTY_CHILDREN: React.ReactNode[] = [];

/**
 * Slides through its children with arrows, dots, swipe and optional autoplay.
 *
 * Accessibility: the root is a labelled region (`aria-roledescription`
 * "carousel" on web) and each page a group named "n of N"; arrows are
 * "Previous slide" / "Next slide"; dots are "Go to slide n" with
 * `aria-current` on the active one. Autoplay stops under reduced motion
 * (unless the user presses play), pauses while the carousel is hovered,
 * focused or touched, and always shows a pause / play button.
 */
export const Carousel = factory<{ props: CarouselProps; ref: View }>((incomingProps, ref) => {
  const { width: viewportWidth, breakpoint } = useViewport();
  const mergedProps = useMemo(
    () => mergeBreakpointProps(incomingProps, incomingProps.breakpoints, viewportWidth),
    [incomingProps, viewportWidth]
  );
  const {
    children = EMPTY_CHILDREN,
    orientation = 'horizontal',
    h,
    showDots = true,
    showArrows = true,
    loop = true,
    autoPlay = false,
    autoPlayInterval = 3000,
    autoPlayPauseOnTouch = true,
    itemsPerPage = 1,
    slidesToScroll,
    slideSize,
    slideGap,
    itemGap = 16,
    containScroll = 'trimSnaps',
    startIndex,
    align = 'start',
    dragFree = false,
    skipSnaps = true,
    dragThreshold,
    duration,
    transitionDuration,
    onSlideChange,
    style,
    itemStyle,
    arrowPosition = 'inside',
    arrowSize = 'md',
    dotSize = 'md', // currently uniform size; active expands
    snapToItem = true, // kept for API parity (engine handles snapping)
    scrollEnabled = true,
    windowSize = 0, // 0 means no virtualization
    reducedMotion: reducedMotionProp,
    accessibilityLabel,
    testID,
  } = mergedProps;

  const isVertical = orientation === 'vertical';
  // `h` is the slides' height. Vertical dots sit beside the slides, so the root
  // takes it; horizontal dots sit below, so it goes to the slides instead.
  const slideHeight = h ?? 200;
  const spacingStyles = useStyleProps(isVertical ? mergedProps : { ...mergedProps, h: undefined });
  const theme = useTheme();
  const systemReducedMotion = useReducedMotion();
  const reducedMotion = reducedMotionProp ?? systemReducedMotion;

  // `transitionDuration` is the cross-component spelling and wins over the
  // Carousel-specific `duration`; 0 jumps between slides with no animation.
  const resolvedScrollDuration = Math.max(transitionDuration ?? duration ?? 500, 0);

  const containerRef = useRef<View>(null);
  // Internal measurements need the node too, so compose rather than replace.
  const mergedContainerRef = useMergedRef<View>(containerRef, ref);
  const carouselRef = useRef<CarouselEngineHandle>(null);
  const ReanimatedCarousel = resolveCarouselEngine();
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  // progress holds absolute item progress (fractional, not modulo) supplied by engine
  const progress = useSharedValue(0);
  // Kept in a ref rather than state: nothing renders from it, and re-rendering
  // the carousel mid-scroll is what dropped frames.
  const currentIndexRef = useRef(0);
  const hasInitializedRef = useRef(false);
  const emitSlideChange = useLatestCallback(onSlideChange);

  const itemsArray = useMemo(() => React.Children.toArray(children), [children]);
  const totalItems = itemsArray.length;

  const resolvedGap = useMemo(() => {
    const raw = resolveResponsive(slideGap, breakpoint);
    if (raw == null) return itemGap;
    if (typeof raw === 'number') return raw;
    const parsed = parseFloat(String(raw));
    return isNaN(parsed) ? itemGap : parsed;
  }, [slideGap, breakpoint, itemGap]);

  const containerSize = isVertical ? containerHeight : containerWidth;

  const desiredItemSize = useMemo(() => {
    if (containerSize <= 0) return 0;
    const rawSize = resolveResponsive(slideSize, breakpoint);
    if (rawSize == null) {
      return (containerSize - resolvedGap * (itemsPerPage - 1)) / itemsPerPage;
    }
    if (typeof rawSize === 'number') {
      if (rawSize > 0 && rawSize <= 1) return containerSize * rawSize; // fraction
      return rawSize; // pixels
    }
    if (rawSize.endsWith('%')) {
      const p = parseFloat(rawSize.slice(0, -1));
      return containerSize * (isNaN(p) ? 1 : p / 100);
    }
    const num = parseFloat(rawSize);
    if (!isNaN(num)) {
      if (num > 0 && num <= 1) return containerSize * num;
      return num;
    }
    return (containerSize - resolvedGap * (itemsPerPage - 1)) / itemsPerPage;
  }, [slideSize, breakpoint, containerSize, itemsPerPage, resolvedGap]);

  const hasLayout = isVertical ? containerHeight > 0 : containerWidth > 0;
  const baseItemsPerPage = Math.max(1, itemsPerPage);
  const slidesToScrollValue = Math.max(1, slidesToScroll ?? baseItemsPerPage);
  const containMode: 'trimSnaps' | 'keepSnaps' | 'none' =
    containScroll === false ? 'none' : containScroll === 'keepSnaps' ? 'keepSnaps' : 'trimSnaps';
  const isDragFree = !!dragFree;
  const allowSkipSnaps = skipSnaps ?? true;
  const dragThresholdValue = typeof dragThreshold === 'number' ? Math.max(dragThreshold, 0) : undefined;

  const visibleSlides = useMemo(() => {
    if (!hasLayout || containerSize <= 0) return baseItemsPerPage;
    if (desiredItemSize <= 0) return baseItemsPerPage;
    const maxFit = Math.max(1, Math.floor((containerSize + resolvedGap) / (desiredItemSize + resolvedGap)));
    if (slideSize == null) {
      return Math.min(baseItemsPerPage, maxFit);
    }
    return maxFit;
  }, [hasLayout, containerSize, desiredItemSize, resolvedGap, baseItemsPerPage, slideSize]);

  const cardSize = useMemo(() => {
    if (!hasLayout) return desiredItemSize;
    if (visibleSlides <= 1) {
      if (desiredItemSize > 0) return desiredItemSize;
      return containerSize > 0 ? containerSize : desiredItemSize;
    }
    const totalGap = resolvedGap * (visibleSlides - 1);
    const available = Math.max(containerSize - totalGap, 0);
    return available / visibleSlides;
  }, [hasLayout, desiredItemSize, visibleSlides, resolvedGap, containerSize]);

  const slideExtent = useMemo(() => {
    if (!hasLayout || cardSize <= 0) return undefined;
    return cardSize + resolvedGap;
  }, [hasLayout, cardSize, resolvedGap]);

  const scrollStep = useMemo(() => {
    if (totalItems === 0) return slidesToScrollValue;
    return Math.min(slidesToScrollValue, Math.max(1, totalItems));
  }, [slidesToScrollValue, totalItems]);

  const maxScrollDistancePerSwipe = useMemo(() => {
    if (allowSkipSnaps || slideExtent == null) return undefined;
    return slideExtent * scrollStep;
  }, [allowSkipSnaps, slideExtent, scrollStep]);

  const lastStart = useMemo(() => Math.max(totalItems - visibleSlides, 0), [totalItems, visibleSlides]);

  const pageStartIndices = useMemo(() => {
    if (totalItems === 0) return [] as number[];
    if (loop) {
      const count = Math.max(1, Math.ceil(totalItems / scrollStep));
      return Array.from({ length: count }, (_, idx) => (idx * scrollStep) % totalItems);
    }

    const starts: number[] = [];
    const seen = new Set<number>();
    const limit = containMode === 'none' ? Math.max(totalItems - 1, 0) : lastStart;

    const addStart = (value: number) => {
      if (!seen.has(value)) {
        seen.add(value);
        starts.push(Math.max(0, value));
      }
    };

    for (let start = 0; start <= limit; start += scrollStep) {
      addStart(containMode === 'trimSnaps' ? Math.min(start, lastStart) : start);
    }

    if (containMode !== 'trimSnaps') {
      addStart(lastStart);
    }

    starts.sort((a, b) => a - b);
    return starts;
  }, [totalItems, loop, scrollStep, containMode, lastStart]);

  const pagedItems = useMemo(() => {
    if (!totalItems) return [] as React.ReactNode[][];
    return pageStartIndices.map(start => {
      const group: React.ReactNode[] = [];
      for (let offset = 0; offset < visibleSlides; offset++) {
        const targetIndex = start + offset;
        if (loop) {
          const normalized = ((targetIndex % totalItems) + totalItems) % totalItems;
          group.push(itemsArray[normalized]);
        } else if (targetIndex < totalItems) {
          group.push(itemsArray[targetIndex]);
        }
      }
      return group;
    });
  }, [pageStartIndices, visibleSlides, loop, totalItems, itemsArray]);

  const totalPages = pagedItems.length;

  const normalizedStartIndex = useMemo(() => {
    if (!totalItems) return 0;
    const rawIndex = startIndex ?? 0;
    if (loop) {
      return ((rawIndex % totalItems) + totalItems) % totalItems;
    }
    return Math.max(0, Math.min(rawIndex, Math.max(totalItems - 1, 0)));
  }, [startIndex, totalItems, loop]);

  const initialPageStart = useMemo(() => {
    if (!totalItems) return 0;
    const base = Math.floor(normalizedStartIndex / scrollStep) * scrollStep;
    if (loop) {
      return totalItems ? base % totalItems : 0;
    }
    if (containMode === 'none' || containMode === 'keepSnaps') {
      return Math.min(base, Math.max(totalItems - 1, 0));
    }
    return Math.min(base, lastStart);
  }, [normalizedStartIndex, scrollStep, loop, totalItems, containMode, lastStart]);

  const initialPageIndex = useMemo(() => {
    if (!pageStartIndices.length) return 0;
    const idx = pageStartIndices.indexOf(initialPageStart);
    return idx >= 0 ? idx : 0;
  }, [pageStartIndices, initialPageStart]);

  // The viewport (not the root) is measured: arrows placed outside and the
  // vertical dots column take room from it.
  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
    setContainerHeight(e.nativeEvent.layout.height);
  }, []);

  const scrollToPage = useCallback((index: number, animated = true) => {
    if (!carouselRef.current || totalPages === 0) return;
    const clamped = ((index % totalPages) + totalPages) % totalPages;
    const delta = clamped - currentIndexRef.current;
    if (delta === 0) {
      if (!animated) {
        progress.value = clamped;
        currentIndexRef.current = clamped;
      }
      return;
    }

    let count = delta;
    if (loop) {
      const alt = delta > 0 ? delta - totalPages : delta + totalPages;
      if (Math.abs(alt) < Math.abs(count)) count = alt;
    }

    carouselRef.current.scrollTo({ count, animated });
    if (!animated) {
      progress.value = clamped;
      currentIndexRef.current = clamped;
    }
  }, [totalPages, loop, progress]);

  const goTo = useCallback((index: number) => {
    scrollToPage(index, true);
  }, [scrollToPage]);

  const goPrev = useCallback(() => {
    carouselRef.current?.prev();
  }, []);

  const goNext = useCallback(() => {
    carouselRef.current?.next();
  }, []);

  // Slide changes are detected on the UI thread and only cross to JS when the
  // rounded page index actually flips — not once per frame.
  const notifySlideChange = useCallback((pageIndex: number) => {
    if (pageIndex === currentIndexRef.current) return;
    currentIndexRef.current = pageIndex;
    emitSlideChange(pageIndex);
  }, [emitSlideChange]);

  useAnimatedReaction(
    () => {
      if (totalPages <= 0) return 0;
      return ((Math.round(progress.value) % totalPages) + totalPages) % totalPages;
    },
    (pageIndex, previous) => {
      if (previous != null && pageIndex === previous) return;
      runOnJS(notifySlideChange)(pageIndex);
    },
    [totalPages, notifySlideChange]
  );

  const arrowMetrics = useMemo(() => getArrowMetrics(theme, arrowSize), [theme, arrowSize]);
  const dotMetrics = useMemo(() => getDotMetrics(theme, dotSize), [theme, dotSize]);
  const alignJustify = align === 'center' ? 'center' : align === 'end' ? 'flex-end' : 'flex-start';

  // --- Autoplay (WCAG 2.2.2: pausable, and off under reduced motion) ---
  const [playPreference, setPlayPreference] = useState<'auto' | 'playing' | 'paused'>('auto');
  const [hovered, hoverHandlers] = useHover();
  const [focusWithin, setFocusWithin] = useState(false);
  const [touching, setTouching] = useState(false);
  const autoPlayAvailable = autoPlay && totalPages > 1;
  // Reduced motion keeps autoplay off until the user explicitly presses play.
  const wantsAutoPlay = playPreference === 'playing' || (playPreference === 'auto' && !reducedMotion);
  const interactionPaused = hovered || focusWithin || (autoPlayPauseOnTouch && touching);
  const isAutoPlaying = autoPlayAvailable && wantsAutoPlay && !interactionPaused;
  const toggleAutoPlay = useCallback(() => {
    setPlayPreference(wantsAutoPlay ? 'paused' : 'playing');
  }, [wantsAutoPlay]);

  const dotActiveColor = theme.colors.primary[6];
  const dotInactiveColor = theme.text.muted;

  const autoPlayControl = autoPlayAvailable ? (
    <Button
      size="xs"
      variant="subtle"
      radius="full"
      icon={<Icon name={wantsAutoPlay ? 'pause' : 'play'} size={arrowMetrics.iconSize} />}
      onPress={toggleAutoPlay}
      accessibilityLabel={wantsAutoPlay ? 'Pause slideshow' : 'Play slideshow'}
      testID={testID ? `${testID}-autoplay` : undefined}
    />
  ) : null;

  const showPagination = showDots && totalPages > 1;
  const pagination = showPagination || autoPlayControl ? (
    showPagination ? (
      <CarouselPagination
        initialPage={initialPageIndex}
        style={isVertical
          ? { ...StyleSheet.flatten(styles.dotsColumn), marginStart: dotMetrics.trackOffset }
          : { ...StyleSheet.flatten(styles.dotsRow), marginTop: dotMetrics.trackOffset }}
        leading={autoPlayControl}
        pageProgress={progress}
        metrics={dotMetrics}
        totalPages={totalPages}
        loop={loop}
        activeColor={dotActiveColor}
        inactiveColor={dotInactiveColor}
        onPress={goTo}
        isVertical={isVertical}
      />
    ) : (
      <View style={[isVertical ? styles.dotsColumn : styles.dotsRow, isVertical ? { marginStart: dotMetrics.trackOffset } : { marginTop: dotMetrics.trackOffset }]}>
        {autoPlayControl}
      </View>
    )
  ) : null;

  // --- Arrows ---
  const outsideInset = arrowPosition === 'outside' ? arrowMetrics.buttonHeight + arrowMetrics.edgeOffset : 0;
  const arrowOffset = arrowPosition === 'outside' ? 0 : arrowMetrics.edgeOffset;

  const renderArrow = (direction: 'prev' | 'next') => {
    const isPrev = direction === 'prev';
    const iconName = isVertical ? (isPrev ? 'chevron-up' : 'chevron-down') : isPrev ? 'chevron-left' : 'chevron-right';
    // Horizontal: a full-height column pinned to the start / end edge (logical,
    // so RTL puts "previous" on the right; the chevron icons mirror themselves).
    // Vertical: a full-width row pinned to the top / bottom edge.
    const placement: ViewStyle = isVertical
      ? isPrev ? { top: arrowOffset } : { bottom: arrowOffset }
      : isPrev ? { start: arrowOffset } : { end: arrowOffset };
    return (
      <View style={[isVertical ? styles.arrowColumn : styles.arrowRow, placement]} pointerEvents="box-none">
        <Button
          size={arrowMetrics.buttonSize}
          variant="secondary"
          icon={<Icon name={iconName} size={arrowMetrics.iconSize} />}
          onPress={isPrev ? goPrev : goNext}
          radius="full"
          accessibilityLabel={isPrev ? 'Previous slide' : 'Next slide'}
          testID={testID ? `${testID}-${direction}` : undefined}
        />
      </View>
    );
  };

  const arrows = showArrows && totalPages > 1 ? (
    <>
      {renderArrow('prev')}
      {renderArrow('next')}
    </>
  ) : null;

  // A duration-based spring honours `transitionDuration`/`duration` (a stiffness
  // spring ignores it) and settles without the long overdamped crawl.
  const carouselAnimation = useMemo(() => {
    if (reducedMotion || resolvedScrollDuration === 0) {
      return { type: 'timing' as const, config: { duration: reducedMotion ? 100 : 0 } };
    }
    return {
      type: 'spring' as const,
      config: { duration: resolvedScrollDuration, dampingRatio: 1 },
    };
  }, [reducedMotion, resolvedScrollDuration]);

  const renderItem = useCallback(({ item, index }: { item: React.ReactNode[]; index: number }) => {
    const pageItems = Array.isArray(item) ? item : [item];
    const pageWidth = containerWidth;
    const pageHeight = isVertical ? containerHeight : slideHeight;
    const justify = containMode === 'trimSnaps' ? 'flex-start' : alignJustify;

    return (
      <View
        style={[{ width: pageWidth, height: pageHeight, justifyContent: 'center' }, itemStyle]}
        {...a11yProps({ role: 'group', roleDescription: 'slide', label: `${index + 1} of ${totalPages}` })}
      >
        <View style={[styles.pageRow, { flexDirection: isVertical ? 'column' : 'row', justifyContent: justify }]}>
          {pageItems.map((child, childIndex) => (
            <View
              key={childIndex}
              style={{
                width: isVertical ? '100%' : cardSize,
                height: isVertical ? cardSize : '100%',
                marginEnd: !isVertical && childIndex < pageItems.length - 1 ? resolvedGap : 0,
                marginBottom: isVertical && childIndex < pageItems.length - 1 ? resolvedGap : 0,
                flexShrink: 0,
              }}
            >
              {child}
            </View>
          ))}
        </View>
      </View>
    );
  }, [containerWidth, containerHeight, slideHeight, isVertical, containMode, alignJustify, itemStyle, totalPages, cardSize, resolvedGap]);

  useEffect(() => {
    if (!carouselRef.current || totalPages === 0 || !hasLayout) return;
    const controlledStart = startIndex != null;

    if (controlledStart) {
      scrollToPage(initialPageIndex, false);
      return;
    }

    if (!hasInitializedRef.current) {
      scrollToPage(initialPageIndex, false);
      hasInitializedRef.current = true;
    }
  }, [scrollToPage, initialPageIndex, startIndex, totalPages, hasLayout]);

  const viewportInsets: ViewStyle = isVertical
    ? { marginVertical: outsideInset, flex: 1 }
    : { marginHorizontal: outsideInset };

  return (
    <View
      ref={mergedContainerRef}
      style={[styles.root, isVertical && styles.rootVertical, spacingStyles, style]}
      testID={testID}
      {...a11yProps({ role: 'region', roleDescription: 'carousel', label: accessibilityLabel ?? 'Carousel' })}
      {...hoverHandlers}
      onFocus={() => setFocusWithin(true)}
      onBlur={() => setFocusWithin(false)}
      onTouchStart={() => setTouching(true)}
      onTouchEnd={() => setTouching(false)}
      onTouchCancel={() => setTouching(false)}
    >
      <View style={[styles.stage, isVertical && styles.fill]}>
        <View
          style={viewportInsets}
          onLayout={handleLayout}
          testID={testID ? `${testID}-viewport` : undefined}
          // Announce slide changes the user makes; stay quiet while autoplaying.
          {...a11yProps({ live: isAutoPlaying ? 'off' : 'polite' })}
        >
          {hasLayout && pagedItems.length > 0 && cardSize > 0 && ReanimatedCarousel && (
            <ReanimatedCarousel
              ref={carouselRef}
              width={containerWidth}
              height={isVertical ? containerHeight : slideHeight}
              style={isVertical ? { height: containerHeight } : { width: containerWidth }}
              vertical={isVertical}
              loop={loop}
              autoPlay={isAutoPlaying}
              autoPlayInterval={autoPlayInterval}
              data={pagedItems}
              pagingEnabled={isDragFree ? false : snapToItem}
              snapEnabled={isDragFree ? false : undefined}
              windowSize={windowSize > 0 ? windowSize : undefined}
              scrollAnimationDuration={resolvedScrollDuration}
              // Performance optimizations
              overscrollEnabled={false}
              enabled={scrollEnabled}
              withAnimation={carouselAnimation}
              maxScrollDistancePerSwipe={maxScrollDistancePerSwipe}
              minScrollDistancePerSwipe={dragThresholdValue}
              // Handing the shared value straight to the engine keeps progress on
              // the UI thread; a callback here would runOnJS once per frame.
              onProgressChange={progress}
              renderItem={renderItem}
            />
          )}
        </View>
        {arrows}
      </View>
      {pagination}
    </View>
  );
}, { displayName: 'Carousel' });

export default Carousel;
