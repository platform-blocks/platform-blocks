import { AccessibilityInfo } from 'react-native';

import { announce } from '../announce';

describe('announce (native, iOS)', () => {
  beforeEach(() => jest.clearAllMocks());
  afterEach(() => jest.restoreAllMocks());

  it('queues polite messages behind current speech', () => {
    const withOptions = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibilityWithOptions')
      .mockImplementation(() => {});
    announce('Saved');
    expect(withOptions).toHaveBeenCalledWith('Saved', { queue: true });
  });

  it('interrupts for assertive messages', () => {
    const withOptions = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibilityWithOptions')
      .mockImplementation(() => {});
    announce('Payment failed', { politeness: 'assertive' });
    expect(withOptions).toHaveBeenCalledWith('Payment failed', { queue: false });
  });

  it('ignores empty messages', () => {
    const withOptions = jest
      .spyOn(AccessibilityInfo, 'announceForAccessibilityWithOptions')
      .mockImplementation(() => {});
    announce('');
    expect(withOptions).not.toHaveBeenCalled();
  });

  it('never throws when the native module fails', () => {
    jest.spyOn(AccessibilityInfo, 'announceForAccessibilityWithOptions').mockImplementation(() => {
      throw new Error('no native module');
    });
    expect(() => announce('x')).not.toThrow();
  });
});

describe('announce (native, Android)', () => {
  it('uses announceForAccessibility', () => {
    jest.isolateModules(() => {
      const { Platform } = require('react-native');
      const originalOS = Platform.OS;
      Platform.OS = 'android';
      try {
        const RN = require('react-native');
        const spy = jest.spyOn(RN.AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
        const { announce: announceAndroid } = require('../announce');
        announceAndroid('Hello', { politeness: 'assertive' });
        expect(spy).toHaveBeenCalledWith('Hello');
        spy.mockRestore();
      } finally {
        Platform.OS = originalOS;
      }
    });
  });
});
