import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Linking, Text } from 'react-native';

import { LinkBox } from '../LinkBox';

describe('LinkBox on native', () => {
  beforeEach(() => {
    jest.spyOn(Linking, 'openURL').mockClear().mockResolvedValue(true);
  });

  it('uses client navigation when supplied', () => {
    const onNavigate = jest.fn();
    const { getByRole } = render(<LinkBox href="/docs" onNavigate={onNavigate}><Text>Docs</Text></LinkBox>);
    fireEvent.press(getByRole('link'));
    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(Linking.openURL).not.toHaveBeenCalled();
  });

  it('opens its href when no navigation callback is supplied', () => {
    const { getByRole } = render(<LinkBox href="https://example.com"><Text>Example</Text></LinkBox>);
    fireEvent.press(getByRole('link'));
    expect(Linking.openURL).toHaveBeenCalledWith('https://example.com');
  });
});
