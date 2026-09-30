import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { render } from '@testing-library/react-native';

import { mockPositioning, WithOverlays } from './testHarness';
import { AutoComplete } from '../AutoComplete';

jest.mock('../../../core/hooks/usePopoverPositioning', () => mockPositioning());

// The platform flags follow `Platform.OS`, so a case can run as Android.
jest.mock('../../../core/platform/flags', () =>
  require('../../../__test-utils__/platformFlags').livePlatformFlags()
);

const originalOS = Platform.OS;
const setPlatform = (os: string) => {
  (Platform as unknown as { OS: string }).OS = os;
};

const data = [{ label: 'Apple', value: 'apple' }];

const rootStyle = (props: Record<string, unknown> = {}) => {
  const { getByTestId } = render(
    <WithOverlays>
      <AutoComplete data={data} testID="ac" {...props} />
    </WithOverlays>
  );
  return StyleSheet.flatten(getByTestId('ac-root').props.style);
};

describe('AutoComplete box props', () => {
  afterEach(() => setPlatform(originalOS));

  it('applies `w` to the root, over the default full width', () => {
    expect(rootStyle().width).toBe('100%');
    expect(rootStyle({ w: 320 }).width).toBe(320);
  });

  it('lets an explicit `w` win over `fullWidth`', () => {
    expect(rootStyle({ fullWidth: true, w: 320 }).width).toBe(320);
  });

  it('applies `miw` to the root', () => {
    expect(rootStyle({ miw: 120 }).minWidth).toBe(120);
  });

  it('floors the width on Android unless `miw` overrides it', () => {
    setPlatform('android');
    expect(rootStyle().minWidth).toBe(240);
    expect(rootStyle({ miw: 0 }).minWidth).toBe(0);
  });
});
