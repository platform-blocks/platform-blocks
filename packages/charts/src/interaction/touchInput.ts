import { Platform } from 'react-native';

export const CHART_TOUCH_HOLD_MS = 8000;

/** Native chart presses are touch; web pointer/click events identify their source. */
export const isChartTouchInput = (event: any): boolean => {
  if (Platform.OS !== 'web') return true;
  const source = event?.pointerType ?? event?.nativeEvent?.pointerType;
  const nativeEvent = event?.nativeEvent ?? event;
  return source === 'touch' ||
    Boolean(nativeEvent?.changedTouches?.length || nativeEvent?.touches?.length) ||
    /^touch/.test(nativeEvent?.type ?? '') ||
    Boolean(event?.sourceCapabilities?.firesTouchEvents ?? event?.nativeEvent?.sourceCapabilities?.firesTouchEvents);
};
