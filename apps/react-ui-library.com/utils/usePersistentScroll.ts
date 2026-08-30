import React from 'react';
import { Platform, ScrollView } from 'react-native';
import { usePathname } from 'expo-router';

// In-memory scroll position store keyed by route pathname
const scrollPositions = new Map<string, number>();

interface Options {
  restoreIfMissing?: boolean; // default true
  delayFrames?: number; // frames to wait before restoring (default 1)
}

export function getSavedScroll(path: string): number | undefined {
  return scrollPositions.get(path);
}

export function usePersistentScroll(ref: React.RefObject<ScrollView>, opts: Options = {}) {
  const { restoreIfMissing = true, delayFrames = 1 } = opts;
  const pathname = usePathname();
  const restoredRef = React.useRef(false);

  const onScroll = React.useCallback((y: number) => {
    if (!pathname) return;
    scrollPositions.set(pathname, y);
  }, [pathname]);

  // Restore position after mount; delay to allow layout stabilization after theme / layout shift
  React.useEffect(() => {
    if (!pathname) return;
    if (restoredRef.current) return;
    restoredRef.current = true;
    if (Platform.OS === 'web') {
      const saved = scrollPositions.get(pathname);
      const target = saved !== undefined ? saved : (restoreIfMissing ? 0 : undefined);
      if (target === undefined) return;
      let frames = delayFrames;
      const attempt = () => {
        if (!ref.current) return;
        if (frames > 0) {
          frames -= 1;
          requestAnimationFrame(attempt);
          return;
        }
        try {
          ref.current.scrollTo({ y: target, animated: false });
        } catch {
          console.warn('usePersistentScroll: scrollTo failed, ref may be invalid');
        }
      };
      requestAnimationFrame(attempt);
    }
  }, [pathname, delayFrames, restoreIfMissing, ref]);

  return { onScroll };
}

export function clearScrollPositions() {
  scrollPositions.clear();
}
