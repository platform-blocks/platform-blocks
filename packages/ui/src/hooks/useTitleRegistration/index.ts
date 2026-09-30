import { useEffect, useMemo, useRef, type RefObject } from 'react';
import type { View } from 'react-native';

import { useTitleRegistryOptional, type TitleItem } from './contexts/TitleRegistryContext';

export interface UseTitleRegistrationOptions {
  /** Text content of the title */
  text: string;
  /** Heading level (1–6); titles appear in page order */
  order: number;
  /** Optional ID, if not provided it will be generated from text */
  id?: string;
  /** Whether to automatically register/unregister the title */
  autoRegister?: boolean;
}

export interface UseTitleRegistrationReturn<T = View> {
  /** Attach to the heading's host element (the table of contents scrolls to it on web). */
  elementRef: RefObject<T | null>;
  /** The registry id: `options.id`, or a slug of `text`. */
  id: string;
}

/** Lower-case slug: spaces → `-`, anything else outside `[a-z0-9-]` dropped. */
const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

/**
 * Registers a heading with the nearest `TitleRegistryProvider` (used by
 * `useScrollSpy` / TableOfContents) while mounted. No-op without a provider.
 * `T` is the element type `elementRef` is attached to (a `View` by default).
 *
 * @example
 * const { elementRef, id } = useTitleRegistration({ text: 'Installation', order: 2 });
 * return <View ref={elementRef} nativeID={id}>…</View>;
 */
export const useTitleRegistration = <T = View>(
  options: UseTitleRegistrationOptions
): UseTitleRegistrationReturn<T> => {
  const registry = useTitleRegistryOptional();
  const elementRef = useRef<T | null>(null);
  const { text, order, id: providedId, autoRegister = true } = options;

  const id = providedId || slugify(text);

  const registerTitle = registry?.registerTitle;
  const unregisterTitle = registry?.unregisterTitle;

  useEffect(() => {
    if (!registerTitle || !unregisterTitle || !autoRegister || !text) return undefined;

    const titleItem: TitleItem = { id, text, order, ref: elementRef };
    registerTitle(titleItem);

    return () => {
      unregisterTitle(id);
    };
  }, [registerTitle, unregisterTitle, id, text, order, autoRegister]);

  return useMemo(() => ({ elementRef, id }), [id]);
};
