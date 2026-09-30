// Jest setup file for React Native Testing Library
// Note: @testing-library/jest-native is deprecated, use built-in matchers instead
// import '@testing-library/react-native/extend-expect';

// The @react-native/jest-preset polyfills requestAnimationFrame as
// `setTimeout(() => callback(jest.now()), 0)`. React Native internals (overlay
// focus, Animated, layout) schedule frames during a render, and if one of those
// 0ms timers is still pending when a test finishes, it fires *after* Jest tears
// down the environment — the `jest.now()` call then throws "trying to access a
// property or method of the Jest environment outside of the scope of the test
// code", which surfaces as flaky failures in unrelated suites.
//
// Re-polyfill with a cancelable, Date.now()-based version (so a late frame can
// never touch the torn-down Jest environment) and cancel any strays after each
// test.
const scheduledFrames = new Set();
global.requestAnimationFrame = (callback) => {
  const id = setTimeout(() => {
    scheduledFrames.delete(id);
    callback(Date.now());
  }, 0);
  scheduledFrames.add(id);
  return id;
};
global.cancelAnimationFrame = (id) => {
  scheduledFrames.delete(id);
  clearTimeout(id);
};
afterEach(() => {
  scheduledFrames.forEach((id) => clearTimeout(id));
  scheduledFrames.clear();
});

// React Native Reanimated: shared values that persist across renders, instant
// animations. See src/__test-utils__/reanimatedMock.ts (tests needing other
// behavior spread it and override).
jest.mock('react-native-reanimated', () => require('./src/__test-utils__/reanimatedMock'));

// Mock React Native Gesture Handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native/Libraries/Components/View/View');
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: jest.fn(),
    Directions: {},
  };
});

// Mock SVG: every element renders as a View with its props, so geometry can be
// asserted. `default` is `Svg`, as in the real package (`import Svg, { Path }`).
jest.mock('react-native-svg', () => {
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: View,
    Svg: View,
    Circle: View,
    Ellipse: View,
    G: View,
    Text: View,
    TSpan: View,
    TextPath: View,
    Path: View,
    Polygon: View,
    Polyline: View,
    Line: View,
    Rect: View,
    Use: View,
    Image: View,
    Symbol: View,
    Defs: View,
    LinearGradient: View,
    RadialGradient: View,
    Stop: View,
    ClipPath: View,
    Pattern: View,
    Mask: View,
  };
});

// Mock Expo Linear Gradient
jest.mock('expo-linear-gradient', () => {
  const View = require('react-native').View;
  return {
    LinearGradient: View,
  };
});

// Simplified mocks for initial setup
// React Native mocks can be added as needed

global.testUtils = {
  createMockTheme: () => ({
    colors: {
      primary: ['#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3', '#1E88E5', '#1976D2', '#1565C0', '#0D47A1'],
      gray: ['#FAFAFA', '#F5F5F5', '#EEEEEE', '#E0E0E0', '#BDBDBD', '#9E9E9E', '#757575', '#616161', '#424242', '#212121'],
      success: ['#E8F5E9', '#C8E6C9', '#A5D6A7', '#81C784', '#66BB6A', '#4CAF50', '#43A047', '#388E3C', '#2E7D32', '#1B5E20'],
      warning: ['#FFF3E0', '#FFE0B2', '#FFCC80', '#FFB74D', '#FFA726', '#FF9800', '#FB8C00', '#F57C00', '#EF6C00', '#E65100'],
      error: ['#FFEBEE', '#FFCDD2', '#EF9A9A', '#E57373', '#EF5350', '#F44336', '#E53935', '#D32F2F', '#C62828', '#B71C1C'],
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    radius: {
      xs: 2,
      sm: 4,
      md: 8,
      lg: 16,
      xl: 24,
    },
    colorScheme: 'light',
  }),
};
