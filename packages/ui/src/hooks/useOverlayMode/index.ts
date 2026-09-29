import { useMemo } from 'react';

import { isWeb } from '../../core/platform/flags';
import { useDeviceInfo } from '../useDeviceInfo';
import type { DeviceInfo } from '../useDeviceInfo/types';

export interface UseOverlayModeOptions {
  /** Force modal presentation regardless of platform */
  forceModal?: boolean;
  /** Force anchored overlay/portal regardless of platform */
  forceOverlay?: boolean;
}

export interface UseOverlayModeResult {
  /** Raw device info reference (forwarded for convenience) */
  deviceInfo: DeviceInfo;
  /** True when running on React Native Web */
  isWeb: boolean;
  /** Consolidated mobile experience flag (native or narrow web) */
  isMobileExperience: boolean;
  /** Inverse of mobile experience flag */
  isDesktopExperience: boolean;
  /** Prefer fullscreen/modal surfaces (native + mobile web) */
  shouldUseModal: boolean;
  /** Prefer anchored overlays/portals (desktop web) */
  shouldUseOverlay: boolean;
  /** Alias for shouldUseOverlay for popover/portal driven surfaces */
  shouldUsePortal: boolean;
}

/**
 * Normalises how components decide between fullscreen modals and anchored overlays
 * by combining platform + device heuristics from useDeviceInfo. The result keeps
 * its identity until the device info or the options change.
 */
export function useOverlayMode(options: UseOverlayModeOptions = {}): UseOverlayModeResult {
  const { forceModal, forceOverlay } = options;
  const deviceInfo = useDeviceInfo();

  return useMemo<UseOverlayModeResult>(() => {
    const detectedMobile = deviceInfo.helpers?.isMobile ?? !isWeb;

    const resolvedModal = forceOverlay ? false : (forceModal ?? detectedMobile);
    const resolvedOverlay = forceModal ? false : (forceOverlay ?? (isWeb && !resolvedModal));

    return {
      deviceInfo,
      isWeb,
      isMobileExperience: resolvedModal,
      isDesktopExperience: !resolvedModal,
      shouldUseModal: resolvedModal,
      shouldUseOverlay: resolvedOverlay,
      shouldUsePortal: resolvedOverlay,
    };
  }, [deviceInfo, forceModal, forceOverlay]);
}

export default useOverlayMode;
