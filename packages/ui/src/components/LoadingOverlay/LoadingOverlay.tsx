import React, { useEffect, useRef } from 'react';
import type { Ref } from 'react';
import type { View } from 'react-native';

import { Overlay } from '../Overlay';
import { Loader } from '../Loader';
import type { OverlayProps } from '../Overlay';
import { factory } from '../../core/factory';
import { hasDOM } from '../../core/platform';
import { announce } from '../../core/accessibility/announce';
import { a11yProps } from '../../core/accessibility/a11yProps';
import { resolveDOMElement } from '../../core/overlay/focus';
import { useMergedRef } from '../../core/utils/mergeRefs';
import type { LoadingOverlayFactoryPayload, LoadingOverlayProps } from './types';

const DEFAULT_ANNOUNCE_AFTER = 1000;

/**
 * Covers its (relatively positioned) parent with a dimmed layer and a loader
 * while work is in progress. The covered region is marked `aria-busy` (web),
 * the overlay itself is an indeterminate progress indicator named
 * `loadingLabel`, and long waits are announced to screen readers.
 */
function LoadingOverlayBase(props: LoadingOverlayProps, ref: Ref<View>) {
  const {
    visible = false,
    zIndex,
    overlayProps,
    loaderProps,
    loader,
    loadingLabel = 'Loading',
    announceAfter = DEFAULT_ANNOUNCE_AFTER,
    ...rest
  } = props;

  const nodeRef = useRef<View>(null);
  const mergedRef = useMergedRef<View>(ref, nodeRef);

  // Web: mark the region it covers (its parent) busy while visible.
  useEffect(() => {
    if (!visible || !hasDOM) return undefined;
    const region = resolveDOMElement(nodeRef)?.parentElement;
    if (!region) return undefined;
    const previous = region.getAttribute('aria-busy');
    region.setAttribute('aria-busy', 'true');
    return () => {
      if (previous === null) region.removeAttribute('aria-busy');
      else region.setAttribute('aria-busy', previous);
    };
  }, [visible]);

  // Only a wait long enough to notice is worth interrupting a screen reader for.
  useEffect(() => {
    if (!visible || announceAfter === false) return undefined;
    const timer = setTimeout(() => announce(loadingLabel, { politeness: 'polite' }), Math.max(0, announceAfter));
    return () => clearTimeout(timer);
  }, [visible, announceAfter, loadingLabel]);

  if (!visible) {
    return null;
  }

  const resolvedOverlayProps: OverlayProps = {
    center: true,
    ...overlayProps,
    ...(zIndex != null && overlayProps?.zIndex == null ? { zIndex } : null),
  };

  return (
    <Overlay
      ref={mergedRef}
      {...a11yProps({ role: 'progressbar', label: loadingLabel, busy: true })}
      {...resolvedOverlayProps}
      {...rest}
    >
      {loader ?? <Loader {...loaderProps} />}
    </Overlay>
  );
}

export const LoadingOverlay = factory<LoadingOverlayFactoryPayload>(LoadingOverlayBase, { displayName: 'LoadingOverlay' });
