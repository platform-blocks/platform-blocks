import React, { useMemo, useCallback, useRef, useState, useEffect, memo } from 'react';
import { View, Pressable, ViewStyle, Text as RNText, Platform, Dimensions } from 'react-native';
import ReanimatedCarousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import Animated, { useSharedValue, useAnimatedStyle, useAnimatedReaction, interpolateColor, runOnJS, type SharedValue } from 'react-native-reanimated';
import { useTheme } from '../../core/theme/ThemeProvider';
import { useDirection } from '../../core/providers/DirectionProvider';
import type { CarouselProps } from './types';
import { getSpacingStyles, extractSpacingProps, useMergedRef } from '../../core/utils';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { resolveComponentSize, type ComponentSize, type ComponentSizeValue } from '../../core/theme/componentSize';
import { getComponentSize } from '../../core/theme/unified-sizing';

// Wrapper implementation using react-native-reanimated-carousel as the engine
// Keeps PlatformBlocks Carousel API (subset) while delegating gesture/scroll physics.

const ORDER: any[] = ['base', 'xs', 'sm', 'md', 'lg', 'xl'];

const resolveResponsive = (config: any, breakpoint: string) => {
  if (config == null) return undefined;
  if (typeof config === 'number' || typeof config === 'string') return config;
  const idx = ORDER.indexOf(breakpoint);
  for (let i = idx; i >= 0; i--) {
    const k = ORDER[i];
    if (config[k] != null) return config[k];
  }
  return undefined;
};

const CAROUSEL_ALLOWED_SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
const CAROUSEL_ALLOWED_SIZES_ARRAY: ComponentSize[] = [...CAROUSEL_ALLOWED_SIZES];

interface CarouselArrowMetrics {
  buttonSizeToken: ComponentSize;
  buttonHeight: number;
  buttonRadius: number;
  iconSize: number;
  edgeOffset: number;
  translate: number;
}

interface CarouselDotMetrics {
  baseSize: number;
  margin: number;
  trackOffset: number;
}

const MIN_ARROW_METRICS = {
  height: 28,
  iconSize: 12,
  edgeOffset: 6,
} as const;

const MIN_DOT_METRICS = {
  baseSize: 4,
  margin: 2,
  trackOffset: 8,
} as const;

function createArrowMetricsForToken(size: ComponentSize): CarouselArrowMetrics {
  const config = getComponentSize(size);
  const buttonHeight = Math.max(MIN_ARROW_METRICS.height, config.height);

  return {
    buttonSizeToken: size,
    buttonHeight,
    buttonRadius: Math.round(buttonHeight / 2),
    iconSize: Math.max(MIN_ARROW_METRICS.iconSize, Math.round(config.iconSize * 0.9)),
    edgeOffset: Math.max(MIN_ARROW_METRICS.edgeOffset, Math.round(config.padding * 0.66)),
    translate: Math.round(buttonHeight / 2),
  };
}

function createDotMetricsForToken(size: ComponentSize): CarouselDotMetrics {
  const config = getComponentSize(size);

  return {
    baseSize: Math.max(MIN_DOT_METRICS.baseSize, Math.round(config.iconSize * 0.5)),
    margin: Math.max(MIN_DOT_METRICS.margin, Math.round(config.padding * 0.25)),
    trackOffset: Math.max(MIN_DOT_METRICS.trackOffset, Math.round(config.padding)),
  };
}

const CAROUSEL_ARROW_SCALE: Partial<Record<ComponentSize, CarouselArrowMetrics>> = CAROUSEL_ALLOWED_SIZES_ARRAY.reduce(
  (acc, token) => {
    acc[token] = createArrowMetricsForToken(token);
    return acc;
  },
  {} as Partial<Record<ComponentSize, CarouselArrowMetrics>>
);

const CAROUSEL_DOT_SCALE: Partial<Record<ComponentSize, CarouselDotMetrics>> = CAROUSEL_ALLOWED_SIZES_ARRAY.reduce(
  (acc, token) => {
    acc[token] = createDotMetricsForToken(token);
    return acc;
  },
  {} as Partial<Record<ComponentSize, CarouselDotMetrics>>
);

const BASE_ARROW_METRICS = CAROUSEL_ARROW_SCALE.md ?? createArrowMetricsForToken('md');
const BASE_DOT_METRICS = CAROUSEL_DOT_SCALE.md ?? createDotMetricsForToken('md');

function findClosestCarouselSize(height: number): ComponentSize {
  let closest = CAROUSEL_ALLOWED_SIZES_ARRAY[0];
  let smallestDiff = Number.POSITIVE_INFINITY;

  for (const token of CAROUSEL_ALLOWED_SIZES_ARRAY) {
    const diff = Math.abs(getComponentSize(token).height - height);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      closest = token;
    }
  }

  return closest;
}

function resolveCarouselArrowMetrics(value: ComponentSizeValue | undefined): CarouselArrowMetrics {
  const resolved = resolveComponentSize(value, CAROUSEL_ARROW_SCALE, {
    allowedSizes: CAROUSEL_ALLOWED_SIZES_ARRAY,
    fallback: 'md',
  });

  if (typeof resolved === 'number') {
    return calculateNumericArrowMetrics(resolved);
  }

  return resolved;
}

function resolveCarouselDotMetrics(value: ComponentSizeValue | undefined): CarouselDotMetrics {
  const resolved = resolveComponentSize(value, CAROUSEL_DOT_SCALE, {
    allowedSizes: CAROUSEL_ALLOWED_SIZES_ARRAY,
    fallback: 'md',
  });

  if (typeof resolved === 'number') {
    return calculateNumericDotMetrics(resolved);
  }

  return resolved;
}

function calculateNumericArrowMetrics(height: number): CarouselArrowMetrics {
  const normalizedHeight = Math.max(MIN_ARROW_METRICS.height, Math.round(height));
  const scale = normalizedHeight / BASE_ARROW_METRICS.buttonHeight;

  return {
    buttonSizeToken: findClosestCarouselSize(normalizedHeight),
    buttonHeight: normalizedHeight,
    buttonRadius: Math.round(normalizedHeight / 2),
    iconSize: Math.max(MIN_ARROW_METRICS.iconSize, Math.round(BASE_ARROW_METRICS.iconSize * scale)),
    edgeOffset: Math.max(MIN_ARROW_METRICS.edgeOffset, Math.round(BASE_ARROW_METRICS.edgeOffset * scale)),
    translate: Math.round(normalizedHeight / 2),
  };
}

function calculateNumericDotMetrics(size: number): CarouselDotMetrics {
  const normalizedSize = Math.max(MIN_DOT_METRICS.baseSize, Math.round(size));
  const scale = normalizedSize / BASE_DOT_METRICS.baseSize;

  return {
    baseSize: normalizedSize,
    margin: Math.max(MIN_DOT_METRICS.margin, Math.round(BASE_DOT_METRICS.margin * scale)),
    trackOffset: Math.max(MIN_DOT_METRICS.trackOffset, Math.round(BASE_DOT_METRICS.trackOffset * scale)),
  };
}

// How much wider (or taller) the active dot grows relative to its resting size.
const DOT_ACTIVE_GROWTH = 1.4;

// Optimized Dot component with memo to prevent unnecessary re-renders
const CarouselDot = memo(({
  index,
  pageProgress,
  metrics,
  totalPages,
  loop,
  activeColor,
  inactiveColor,
  onPress,
  isVertical = false
}: {
  index: number;
  pageProgress: SharedValue<number>;
  metrics: CarouselDotMetrics;
  totalPages: number;
  loop: boolean;
  activeColor: string;
  inactiveColor: string;
  onPress: (index: number) => void;
  isVertical?: boolean;
}) => {
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
    const active = 1 - Math.min(dist, 1); // clamp to [0,1]

    const size = baseDotSize + (baseDotSize * DOT_ACTIVE_GROWTH) * active;

    return {
      width: isVertical ? baseDotSize : size,
      height: isVertical ? size : baseDotSize,
      opacity: 0.4 + 0.6 * active,
      backgroundColor: interpolateColor(active, [0, 1], [inactiveColor, activeColor])
    } as any;
  }, [baseDotSize, isVertical, loop, totalPages, index, activeColor, inactiveColor]);

  const handlePress = useCallback(() => {
    onPress(index);
  }, [index, onPress]);

  // The hit area reserves room for the fully expanded dot so growing the active
  // one never reflows the rest of the track mid-scroll.
  const containerStyle = isVertical
    ? {
      marginVertical: metrics.margin,
      width: baseDotSize,
      height: maxDotSize,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    }
    : {
      marginHorizontal: metrics.margin,
      width: maxDotSize,
      height: baseDotSize,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`Go to slide ${index + 1}`}
      style={containerStyle}
    >
      {/* Absolute so the width/height animation never triggers flow layout. */}
      <Animated.View style={[{ position: 'absolute', borderRadius: baseDotSize / 2 }, animatedStyle]} />
    </Pressable>
  );
});

const BREAKPOINT_ORDER = ['xs', 'sm', 'md', 'lg', 'xl'] as const;
type BreakpointKey = typeof BREAKPOINT_ORDER[number];

const getBreakpointName = (width: number): BreakpointKey => {
  if (width >= 1200) return 'xl';
  if (width >= 992) return 'lg';
  if (width >= 768) return 'md';
  if (width >= 576) return 'sm';
  return 'xs';
};

const getViewportWidth = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && typeof window.innerWidth === 'number') {
    return window.innerWidth;
  }

  const dimensions = Dimensions.get('window');
  return typeof dimensions?.width === 'number' ? dimensions.width : 0;
};

// Optimized breakpoint hook with debouncing
const useOptimizedBreakpoint = () => {
  const computeState = () => {
    const width = getViewportWidth();
    return {
      width,
      breakpoint: getBreakpointName(width),
    };
  };

  const [state, setState] = useState<{ breakpoint: BreakpointKey; width: number }>(computeState);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const update = () => {
      const next = computeState();
      setState(prev => (prev.breakpoint === next.breakpoint && prev.width === next.width) ? prev : next);
    };

    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(update, 100); // Debounce resize events
    };

    update();

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.addEventListener('resize', debouncedUpdate, { passive: true });
      return () => {
        window.removeEventListener('resize', debouncedUpdate);
        clearTimeout(timeoutId);
      };
    }

    const subscription = Dimensions.addEventListener('change', debouncedUpdate);
    return () => {
      subscription?.remove();
      clearTimeout(timeoutId);
    };
  }, []);

  return state;
};
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

const mergeBreakpointProps = (baseProps: CarouselProps, breakpointProps?: Record<string, Partial<CarouselProps>>, width?: number) => {
  if (!breakpointProps) return baseProps;
  const sortedEntries = Object.entries(breakpointProps).sort((a, b) => {
    const aMin = parseMediaQuery(a[0]).min ?? 0;
    const bMin = parseMediaQuery(b[0]).min ?? 0;
    return aMin - bMin;
  });

  let resolvedProps: CarouselProps = { ...baseProps };
  sortedEntries.forEach(([query, value]) => {
    const shouldApply = width != null ? matchQuery(query, width) : (Platform.OS === 'web' && typeof window !== 'undefined' ? window.matchMedia(query).matches : false);
    if (shouldApply) {
      resolvedProps = { ...resolvedProps, ...value };
    }
  });

  return resolvedProps;
};

export const Carousel = React.forwardRef<View, CarouselProps>((incomingProps, ref) => {
  const { breakpoint, width: viewportWidth } = useOptimizedBreakpoint();
  const mergedProps = useMemo(
    () => mergeBreakpointProps(incomingProps as CarouselProps, incomingProps.breakpoints, viewportWidth),
    [incomingProps, viewportWidth]
  );
  const {
    children,
    orientation = 'horizontal',
    height = 200,
    showDots = true,
    showArrows = true,
    loop = true,
    autoPlay = false,
    autoPlayInterval = 3000,
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
    breakpoints: _breakpoints,
    onSlideChange,
    style,
    itemStyle,
    arrowSize = 'md',
    dotSize = 'md', // currently uniform size; active expands
    snapToItem = true, // kept for API parity (engine handles snapping)
    windowSize = 0, // 0 means no virtualization
    reducedMotion = false,
    ...rest
  } = mergedProps as any;

  const { spacingProps, otherProps } = extractSpacingProps(rest);
  const spacingStyles = getSpacingStyles(spacingProps);
  const theme = useTheme();
  const { isRTL } = useDirection();

  // `transitionDuration` is the cross-component spelling and wins over the
  // Carousel-specific `duration`; 0 jumps between slides with no animation.
  const resolvedScrollDuration = Math.max(transitionDuration ?? duration ?? 500, 0);

  const containerRef = useRef<View>(null);
  // Internal measurements need the node too, so compose rather than replace.
  const mergedContainerRef = useMergedRef<View>(containerRef, ref);
  const carouselRef = useRef<ICarouselInstance>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  // progress holds absolute item progress (fractional, not modulo) supplied by engine
  const progress = useSharedValue(0);
  // Kept in a ref rather than state: nothing renders from it, and re-rendering
  // the carousel mid-scroll is what dropped frames.
  const currentIndexRef = useRef(0);
  const hasInitializedRef = useRef(false);
  const onSlideChangeRef = useRef(onSlideChange);
  onSlideChangeRef.current = onSlideChange;

  const itemsArray = useMemo(() => React.Children.toArray(children), [children]);
  const totalItems = itemsArray.length;

  const resolvedGap = useMemo(() => {
    const raw = resolveResponsive(slideGap, breakpoint);
    if (raw == null) return itemGap;
    if (typeof raw === 'number') return raw;
    if (typeof raw === 'string') {
      const parsed = parseFloat(raw);
      return isNaN(parsed) ? itemGap : parsed;
    }
    return itemGap;
  }, [slideGap, breakpoint, itemGap]);

  const isVertical = orientation === 'vertical';
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
    if (typeof rawSize === 'string') {
      if (rawSize.endsWith('%')) {
        const p = parseFloat(rawSize.slice(0, -1));
        return containerSize * (isNaN(p) ? 1 : p / 100);
      }
      const num = parseFloat(rawSize);
      if (!isNaN(num)) {
        if (num > 0 && num <= 1) return containerSize * num;
        return num;
      }
    }
    return (containerSize - resolvedGap * (itemsPerPage - 1)) / itemsPerPage;
  }, [slideSize, breakpoint, containerSize, itemsPerPage, resolvedGap]);

  const hasLayout = isVertical ? containerHeight > 0 : containerWidth > 0;
  const baseItemsPerPage = Math.max(1, itemsPerPage);
  const slidesToScrollValue = Math.max(1, slidesToScroll ?? baseItemsPerPage);
  const containMode: 'trimSnaps' | 'keepSnaps' | 'none' = containScroll === false
    ? 'none'
    : containScroll === 'keepSnaps'
      ? 'keepSnaps'
      : 'trimSnaps';
  const isDragFree = !!dragFree;
  const allowSkipSnaps = skipSnaps ?? true;
  const dragThresholdValue = typeof dragThreshold === 'number'
    ? Math.max(dragThreshold, 0)
    : undefined;

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
      const value = containMode === 'trimSnaps'
        ? Math.min(start, lastStart)
        : start;
      addStart(value);
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
    if (containMode === 'none') {
      return Math.min(base, Math.max(totalItems - 1, 0));
    }
    if (containMode === 'keepSnaps') {
      return Math.min(base, Math.max(totalItems - 1, 0));
    }
    return Math.min(base, lastStart);
  }, [normalizedStartIndex, scrollStep, loop, totalItems, containMode, lastStart]);

  const initialPageIndex = useMemo(() => {
    if (!pageStartIndices.length) return 0;
    const idx = pageStartIndices.indexOf(initialPageStart);
    return idx >= 0 ? idx : 0;
  }, [pageStartIndices, initialPageStart]);

  const handleLayout = useCallback((e: any) => {
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
    if (!carouselRef.current) return;
    carouselRef.current.prev();
  }, []);

  const goNext = useCallback(() => {
    if (!carouselRef.current) return;
    carouselRef.current.next();
  }, []);

  // Slide changes are detected on the UI thread and only cross to JS when the
  // rounded page index actually flips — not once per frame.
  const notifySlideChange = useCallback((pageIndex: number) => {
    if (pageIndex === currentIndexRef.current) return;
    currentIndexRef.current = pageIndex;
    onSlideChangeRef.current?.(pageIndex);
  }, []);

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

  const arrowMetrics = useMemo(() => resolveCarouselArrowMetrics(arrowSize), [arrowSize]);
  const dotMetrics = useMemo(() => resolveCarouselDotMetrics(dotSize), [dotSize]);
  const alignJustify = useMemo(() => {
    switch (align) {
      case 'center':
        return 'center';
      case 'end':
        return 'flex-end';
      default:
        return 'flex-start';
    }
  }, [align]);

  // Memoized render functions to prevent unnecessary re-renders
  const dotActiveColor = theme.colors.primary[6];
  const dotInactiveColor = theme.colors.gray[4];
  const renderDots = useMemo(() => {
    if (!showDots || totalPages <= 1) return null;

    const dotsStyle = isVertical
      ? { flexDirection: 'column' as const, alignItems: 'center' as const, marginLeft: dotMetrics.trackOffset }
      : {
        flexDirection: (isRTL ? 'row-reverse' : 'row') as 'row' | 'row-reverse',
        justifyContent: 'center' as const,
        marginTop: dotMetrics.trackOffset
      };

    return (
      <View style={dotsStyle}>
        {Array.from({ length: totalPages }).map((_, i) => (
          <CarouselDot
            key={i}
            index={i}
            pageProgress={progress}
            metrics={dotMetrics}
            totalPages={totalPages}
            loop={loop}
            activeColor={dotActiveColor}
            inactiveColor={dotInactiveColor}
            onPress={goTo}
            isVertical={isVertical}
          />
        ))}
      </View>
    );
  }, [showDots, totalPages, progress, dotMetrics, loop, dotActiveColor, dotInactiveColor, goTo, isVertical, isRTL]);

  // Arrows
  const renderArrows = () => {
    if (!showArrows || totalPages <= 1) return null;

    const buttonSize = arrowMetrics.buttonSizeToken;
    const iconSize = arrowMetrics.iconSize;
    const edgeOffset = arrowMetrics.edgeOffset;
    const translateValue = arrowMetrics.translate;

    if (isVertical) {
      return (
        <>
          <View
            style={{
              position: 'absolute',
              top: edgeOffset,
              left: '50%',
              transform: [{ translateX: -translateValue }],
              zIndex: 10,
            }}
          >
            <Button
              size={buttonSize}
              variant="secondary"
              icon={<Icon name="chevron-up" size={iconSize} />}
              onPress={goPrev}
              radius="full"
            />
          </View>
          <View
            style={{
              position: 'absolute',
              bottom: edgeOffset,
              left: '50%',
              transform: [{ translateX: -translateValue }],
              zIndex: 10,
            }}
          >
            <Button
              size={buttonSize}
              variant="secondary"
              icon={<Icon name="chevron-down" size={iconSize} />}
              onPress={goNext}
              radius="full"
            />
          </View>
        </>
      );
    }

    // Horizontal arrows - swap positions and icons in RTL
    return (
      <>
        <View
          style={{
            position: 'absolute',
            top: '50%',
            ...(isRTL ? { right: edgeOffset } : { left: edgeOffset }),
            transform: [{ translateY: -translateValue }],
            zIndex: 10,
          }}
        >
          <Button
            size={buttonSize}
            variant="secondary"
            icon={<Icon name={isRTL ? 'chevron-right' : 'chevron-left'} size={iconSize} />}
            onPress={goPrev}
            radius="full"
          />
        </View>
        <View
          style={{
            position: 'absolute',
            top: '50%',
            ...(isRTL ? { left: edgeOffset } : { right: edgeOffset }),
            transform: [{ translateY: -translateValue }],
            zIndex: 10,
          }}
        >
          <Button
            size={buttonSize}
            variant="secondary"
            icon={<Icon name={isRTL ? 'chevron-left' : 'chevron-right'} size={iconSize} />}
            onPress={goNext}
            radius="full"
          />
        </View>
      </>
    );
  };

  // Autoplay: if library autoPlay not sufficient for pause logic, we can just pass through for now.
  const enableAutoPlay = autoPlay && totalPages > 1;

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
    const pageHeight = isVertical ? containerHeight : height;
    const justify = containMode === 'trimSnaps' ? 'flex-start' : alignJustify;

    return (
      <View
        style={[
          {
            width: pageWidth,
            height: pageHeight,
            justifyContent: 'center',
          },
          itemStyle,
        ]}
        accessibilityLabel={`Carousel item ${index + 1} of ${totalPages}`}
      >
        <View
          style={{
            flexDirection: isVertical ? 'column' : 'row',
            alignItems: 'stretch',
            justifyContent: justify,
            flexWrap: 'nowrap',
            flex: 1,
          }}
        >
          {pageItems.map((child, childIndex) => (
            <View
              key={childIndex}
              style={{
                width: isVertical ? '100%' : cardSize,
                height: isVertical ? cardSize : '100%',
                marginRight: !isVertical && childIndex < pageItems.length - 1 ? resolvedGap : 0,
                marginBottom: isVertical && childIndex < pageItems.length - 1 ? resolvedGap : 0,
                flexShrink: 0,
              }}
            >
              {child as any}
            </View>
          ))}
        </View>
      </View>
    );
  }, [containerWidth, containerHeight, height, isVertical, containMode, alignJustify, itemStyle, totalPages, cardSize, resolvedGap]);

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

  return (
    <View
      ref={mergedContainerRef}
      style={[
        {
          width: '100%',
          position: 'relative',
          ...(isVertical ? { flexDirection: 'row' } : {})
        },
        spacingStyles,
        style as ViewStyle
      ]}
      onLayout={handleLayout}
      {...otherProps}
    >
      <View style={{ flex: 1 }}>
        {hasLayout && pagedItems.length > 0 && cardSize > 0 && (
          <ReanimatedCarousel
            ref={carouselRef}
            width={isVertical ? containerWidth : containerWidth}
            height={isVertical ? containerHeight : height}
            style={isVertical ? { height: containerHeight } : { width: containerWidth }}
            vertical={isVertical}
            loop={loop}
            autoPlay={enableAutoPlay}
            autoPlayInterval={autoPlayInterval}
            data={pagedItems}
            pagingEnabled={isDragFree ? false : snapToItem}
            snapEnabled={isDragFree ? false : undefined}
            windowSize={windowSize > 0 ? windowSize : undefined}
            scrollAnimationDuration={resolvedScrollDuration}
            // Performance optimizations
            overscrollEnabled={false}
            enabled={!reducedMotion}
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
      {renderArrows()}
      {renderDots}
    </View>
  );
});

Carousel.displayName = 'Carousel';

export default Carousel;
