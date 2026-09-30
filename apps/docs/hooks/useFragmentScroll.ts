import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

/**
 * Scrolls to the element named by the URL fragment on a docs page that streams
 * its content in.
 *
 * The browser's own fragment jump can't do this job here: PageLayout scrolls the
 * page back to its saved position a few frames after mount, and demo previews
 * land after first paint and grow the content above the target. So the target is
 * re-aligned every time `settleKey` changes — until the reader scrolls for
 * themselves, at which point the page is theirs.
 *
 * @param pageKey   Page identity. Changing it arms the hook again for the new page.
 * @param settleKey Value that changes as async content lands (e.g. the map of
 *                  loaded demo components); each change re-aligns the target.
 */
export function useFragmentScroll(pageKey: string | undefined, settleKey: unknown) {
  const followHashRef = useRef(true);

  useEffect(() => { followHashRef.current = true; }, [pageKey]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    if (!followHashRef.current) return;

    const target = decodeURIComponent(window.location.hash.replace('#', ''));
    if (!target) {
      followHashRef.current = false;
      return;
    }

    const align = () => document.getElementById(target)?.scrollIntoView({ block: 'start' });
    align();
    // Outlast PageLayout's own two-frame scroll restore.
    let frame = requestAnimationFrame(() => {
      align();
      frame = requestAnimationFrame(align);
    });

    const release = () => { followHashRef.current = false; };
    window.addEventListener('wheel', release, { passive: true, once: true });
    window.addEventListener('touchmove', release, { passive: true, once: true });
    window.addEventListener('keydown', release, { once: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('wheel', release);
      window.removeEventListener('touchmove', release);
      window.removeEventListener('keydown', release);
    };
  }, [pageKey, settleKey]);
}
