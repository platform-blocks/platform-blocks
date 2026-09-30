import { detectLocale } from './detect';

export { useDeviceInfo, default } from './useDeviceInfo';
export type { DeviceInfo, UseDeviceInfoOptions } from './types';

/** @internal */
export const __deviceInfoInternals = {
  detectLocale,
};
