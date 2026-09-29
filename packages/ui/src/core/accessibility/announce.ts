import { AccessibilityInfo } from 'react-native';

import { hasDOM, isIOS, isWeb } from '../platform';

export type AnnouncePoliteness = 'polite' | 'assertive';

export interface AnnounceOptions {
  /**
   * `polite` (default) waits for the screen reader to finish what it is saying;
   * `assertive` interrupts it. Use assertive only for errors and time-critical news.
   */
  politeness?: AnnouncePoliteness;
}

/** Delay between clearing a live region and writing the new message. */
const WRITE_DELAY_MS = 50;
/** Messages are cleared after this long so a virtual cursor doesn't find stale text. */
const CLEAR_AFTER_MS = 7000;

const CONTAINER_ATTR = 'data-pb-announcer';

interface LiveRegion {
  node: HTMLElement;
  writeTimer: ReturnType<typeof setTimeout> | null;
  clearTimer: ReturnType<typeof setTimeout> | null;
}

let container: HTMLElement | null = null;
const regions: Partial<Record<AnnouncePoliteness, LiveRegion>> = {};

// Visually hidden but still in the accessibility tree (the standard "sr-only" recipe).
const VISUALLY_HIDDEN =
  'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;' +
  'clip:rect(0,0,0,0);clip-path:inset(50%);white-space:nowrap;border:0;';

function ensureRegion(politeness: AnnouncePoliteness): LiveRegion | null {
  if (!hasDOM || !document.body) return null;

  if (!container || !container.isConnected) {
    // Reuse a container left by another copy of the library (or a hot reload).
    container = document.querySelector<HTMLElement>(`[${CONTAINER_ATTR}]`);
    if (!container) {
      container = document.createElement('div');
      container.setAttribute(CONTAINER_ATTR, '');
      container.setAttribute('style', VISUALLY_HIDDEN);
      document.body.appendChild(container);
    }
    delete regions.polite;
    delete regions.assertive;
  }

  const existing = regions[politeness];
  if (existing && existing.node.isConnected) return existing;

  let node = container.querySelector<HTMLElement>(`[aria-live="${politeness}"]`);
  if (!node) {
    node = document.createElement('div');
    node.setAttribute('aria-live', politeness);
    node.setAttribute('aria-atomic', 'true');
    // `role` gives older screen readers the matching implicit live semantics.
    node.setAttribute('role', politeness === 'assertive' ? 'alert' : 'status');
    container.appendChild(node);
  }
  const region: LiveRegion = { node, writeTimer: null, clearTimer: null };
  regions[politeness] = region;
  return region;
}

function announceOnWeb(message: string, politeness: AnnouncePoliteness) {
  const region = ensureRegion(politeness);
  if (!region) return;

  if (region.writeTimer) clearTimeout(region.writeTimer);
  if (region.clearTimer) clearTimeout(region.clearTimer);

  // Clear first, then write on a later task: a live region only announces
  // *changes*, so writing the same text twice in a row would be silent.
  region.node.textContent = '';
  region.writeTimer = setTimeout(() => {
    region.writeTimer = null;
    region.node.textContent = message;
    region.clearTimer = setTimeout(() => {
      region.clearTimer = null;
      region.node.textContent = '';
    }, CLEAR_AFTER_MS);
  }, WRITE_DELAY_MS);
}

function announceOnNative(message: string, politeness: AnnouncePoliteness) {
  try {
    // iOS can queue behind current speech (polite) or interrupt it (assertive).
    if (isIOS && typeof AccessibilityInfo.announceForAccessibilityWithOptions === 'function') {
      AccessibilityInfo.announceForAccessibilityWithOptions(message, { queue: politeness === 'polite' });
      return;
    }
    AccessibilityInfo.announceForAccessibility?.(message);
  } catch {
    // Announcing is best-effort; a missing native module must never crash the app.
  }
}

/**
 * Asks the screen reader to speak `message`.
 *
 * Native: `AccessibilityInfo.announceForAccessibility` (iOS honours politeness
 * by queueing). Web: a persistent, visually-hidden `aria-live` container created
 * lazily on `document.body` (one polite and one assertive region), cleared then
 * rewritten so repeating the same message announces it again.
 *
 * Safe to call anywhere, including outside React and during SSR (no-op).
 *
 * @example
 * announce('3 results');
 * announce('Payment failed', { politeness: 'assertive' });
 */
export function announce(message: string, options: AnnounceOptions = {}): void {
  if (!message) return;
  const politeness = options.politeness ?? 'polite';
  if (isWeb) announceOnWeb(message, politeness);
  else announceOnNative(message, politeness);
}

/** Clears pending and visible web announcements. For tests and teardown. */
export function clearAnnouncer(): void {
  (Object.keys(regions) as AnnouncePoliteness[]).forEach((key) => {
    const region = regions[key];
    if (!region) return;
    if (region.writeTimer) clearTimeout(region.writeTimer);
    if (region.clearTimer) clearTimeout(region.clearTimer);
    region.writeTimer = null;
    region.clearTimer = null;
    region.node.textContent = '';
  });
}
