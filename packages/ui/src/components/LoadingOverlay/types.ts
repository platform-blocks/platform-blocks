import type { ReactNode } from 'react';
import type { View, ViewProps } from 'react-native';

import type { BaseProps } from '../../core/types/base';
import type { LoaderProps } from '../Loader/types';
import type { OverlayProps } from '../Overlay';

export interface LoadingOverlayProps extends Omit<ViewProps, 'style'>, BaseProps {
  /** Controls visibility of the loading overlay. */
  visible?: boolean;
  /**
   * z-index applied to the overlay container; `overlayProps.zIndex` wins when both are set.
   * Defaults to Overlay's, which lifts it above the content it covers.
   */
  zIndex?: number;
  /** Props forwarded to the underlying Overlay component. */
  overlayProps?: OverlayProps;
  /** Props forwarded to the Loader component. */
  loaderProps?: LoaderProps;
  /** Custom loader content. When provided, Loader component is not rendered. */
  loader?: ReactNode;
  /** Accessible name of the busy indicator, and what is announced. @default 'Loading' */
  loadingLabel?: string;
  /**
   * Announce `loadingLabel` to screen readers when loading lasts longer than
   * this many ms (short waits stay silent). `false` never announces.
   * @default 1000
   */
  announceAfter?: number | false;
}

export interface LoadingOverlayFactoryPayload {
  props: LoadingOverlayProps;
  ref: View;
}
