import { Platform } from 'react-native';
import { isChartTouchInput } from './touchInput';

describe('web chart touch detection', () => {
  const originalOS = Platform.OS;
  beforeEach(() => { Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' }); });
  afterEach(() => { Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS }); });

  it.each([
    { pointerType: 'touch' },
    { nativeEvent: { pointerType: 'touch' } },
    { nativeEvent: { changedTouches: [{ identifier: 1 }], touches: [] } },
    { nativeEvent: { type: 'touchend' } },
    { nativeEvent: { sourceCapabilities: { firesTouchEvents: true } } },
  ])('recognizes pointer, responder and compatibility events: %j', (event) => {
    expect(isChartTouchInput(event)).toBe(true);
  });

  it.each([{ pointerType: 'mouse' }, { pointerType: 'pen' }, { nativeEvent: { type: 'mouseup' } }])(
    'leaves non-touch input alone: %j', (event) => { expect(isChartTouchInput(event)).toBe(false); }
  );
});
