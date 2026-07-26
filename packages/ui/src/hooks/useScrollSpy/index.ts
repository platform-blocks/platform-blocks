import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import { useTitleRegistryOptional } from '../useTitleRegistration/contexts/TitleRegistryContext';

export interface ScrollSpyOptions {
  /** CSS selector for the headings to track */
  selector?: string;
  /** Margin around the root element */
  rootMargin?: string;
  /** Container to search for headings */
  container?: string | HTMLElement;
  /** Function to get heading depth, defaults to h1=1, h2=2, etc. */
  getDepth?: (el: Element) => number;
  /** Function to get text value from element, defaults to textContent */
  getValue?: (el: Element) => string;
  /** Function to get ID from element, defaults to element ID or generated from text */
  getId?: (el: Element) => string;
  /** Disable automatic active ID updates from scroll events */
  disableAutoUpdate?: boolean;
}

export interface TocItem {
  /** Unique identifier for the heading */
  id: string;
  /** Text content of the heading */
  value: string;
  /** Heading depth, e.g. 1 for h1, 2 for h2, etc. */
  depth: number;
  /** Function to get the underlying DOM node, if available */
  getNode?: () => HTMLElement | null;
}

export interface UseScrollSpyReturn {
  /** Collected heading items */
  items: TocItem[];
  /** Currently active heading ID, or null if none */
  activeId: string | null;
  /** Set the active ID programmatically */
  setActiveId: (id: string | null) => void;
  /** Re-collect headings and re-initialize the observer */
  reinitialize: () => void;
}

const DEFAULT_SELECTOR = 'h1, h2, h3, h4, h5, h6';

export function useScrollSpy(options?: ScrollSpyOptions, initialData: TocItem[] = []): UseScrollSpyReturn {
  const [items, setItems] = useState<TocItem[]>(initialData);
  const [activeId, setActiveId] = useState<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const visibilityMap = useRef<Map<string, number>>(new Map());
  const titleRegistry = useTitleRegistryOptional();

  // Memoize options to prevent infinite re-renders
  const stableOptions = useMemo(() => options, [
    options?.selector,
    options?.container,
    options?.rootMargin,
    options?.getDepth,
    options?.getValue,
    options?.getId,
    options?.disableAutoUpdate,
  ]);

  const collectHeadings = useCallback(() => {
    let collectedItems: TocItem[] = [];

    // Collect from Title registry if available (React Native or web with Title components)
    if (titleRegistry && titleRegistry.titles.length > 0) {
      collectedItems = titleRegistry.titles.map(title => ({
        id: title.id,
        value: title.text,
        depth: title.order,
        getNode: () => title.ref?.current || null,
      }));
    }

    // On web, also collect from DOM headings if no Title registry or as fallback
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const sel = stableOptions?.selector || DEFAULT_SELECTOR;

      // Determine the container to search within
      let container: HTMLElement | Document = document;
      if (stableOptions?.container) {
        if (typeof stableOptions.container === 'string') {
          // Try multiple selectors if provided as a comma-separated list
          const selectors = stableOptions.container.split(',').map(s => s.trim());
          for (const selector of selectors) {
            const containerEl = document.querySelector(selector);
            if (containerEl) {
              container = containerEl as HTMLElement;
              break;
            }
          }
        } else {
          container = stableOptions.container;
        }
      }

      const nodeList = container.querySelectorAll(sel);
      const getDepth = stableOptions?.getDepth || ((el: Element) => {
        const tag = el.tagName.toLowerCase();
        const match = tag.match(/h([1-6])/);
        return match ? parseInt(match[1], 10) : 1;
      });
      const getValue = stableOptions?.getValue || ((el: Element) => (el.textContent || '').trim());
      const getId = stableOptions?.getId || ((el: Element) => (el.getAttribute('id') || getValue(el).toLowerCase().replace(/\s+/g, '-')));

      const domItems: TocItem[] = Array.from(nodeList).map(el => ({
        id: getId(el),
        value: getValue(el),
        depth: getDepth(el),
        getNode: () => el as HTMLElement
      }));

      // Merge with Title registry items, preferring Title registry for duplicates
      collectedItems = [...collectedItems, ...domItems];
    }

    // Ids are used as React keys and to look up elements, so keep the first
    // occurrence of each id (registry items win over DOM headings, and repeated
    // heading text on a page collapses to a single entry).
    const seenIds = new Set<string>();
    collectedItems = collectedItems.filter(item => {
      if (seenIds.has(item.id)) return false;
      seenIds.add(item.id);
      return true;
    });

    setItems(collectedItems);

    // Set IDs on DOM elements if they don't have them (web only)
    if (Platform.OS === 'web') {
      collectedItems.forEach(item => {
        const el = item.getNode?.();
        if (el && !el.id) el.id = item.id;
      });
    }
  }, [stableOptions, titleRegistry]);

  // Initialize
  useEffect(() => {
    collectHeadings();
  }, [collectHeadings]);

  // Clear items immediately when container changes to prevent stale data
  useEffect(() => {
    setItems([]);
    setActiveId(null);
    // Small delay before re-collecting to ensure DOM is updated
    const timeoutId = setTimeout(() => {
      collectHeadings();
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [stableOptions?.container, collectHeadings]);

  // Re-collect when Title registry changes
  useEffect(() => {
    if (titleRegistry) {
      collectHeadings();
    }
  }, [titleRegistry?.titles, collectHeadings]);

  // Observer logic
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    if (!items.length) return;
    if (observerRef.current) observerRef.current.disconnect();
    const rootMargin = stableOptions?.rootMargin || '0px 0px -60% 0px';
    observerRef.current = new IntersectionObserver((entries) => {
      // Skip automatic updates if disabled
      if (stableOptions?.disableAutoUpdate) {
        // Uncomment for debugging: console.log('ScrollSpy disabled during programmatic scroll');
        return;
      }

      entries.forEach(entry => {
        const id = (entry.target as HTMLElement).id;
        if (!id) return;
        if (entry.isIntersecting) visibilityMap.current.set(id, entry.boundingClientRect.top);
        else visibilityMap.current.delete(id);
      });
      if (visibilityMap.current.size) {
        interface Candidate { id: string; top: number }
        let candidate: Candidate | null = null as Candidate | null;
        visibilityMap.current.forEach((top, id) => {
          if (candidate == null) candidate = { id, top };
          else {
            const cur = candidate.top;
            if (top >= 0 && (cur < 0 || top < cur)) candidate = { id, top };
            else if (top < 0 && cur < 0 && top > cur) candidate = { id, top };
          }
        });
        if (candidate && candidate.id !== activeId) setActiveId(candidate.id);
      }
    }, { rootMargin, threshold: [0, 1] });
    items.forEach(it => {
      const el = it.getNode?.();
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [items, stableOptions?.rootMargin, stableOptions?.disableAutoUpdate, activeId]);

  return { items, activeId, setActiveId, reinitialize: collectHeadings };
}

export type { TocItem as UseScrollSpyItem };