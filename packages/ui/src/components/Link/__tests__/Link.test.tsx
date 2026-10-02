import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { Linking, StyleSheet } from 'react-native';

import { DEFAULT_THEME } from '../../../core/theme/defaultTheme';
import { Link } from '../Link';

describe('Link', () => {
  beforeEach(() => {
    // The RN jest preset already mocks Linking; reset its call log per test.
    jest.spyOn(Linking, 'openURL').mockClear().mockResolvedValue(true);
  });

  it('is a link named by its text that opens its href', () => {
    const { getByRole } = render(<Link href="https://example.com">Example</Link>);
    fireEvent.press(getByRole('link', { name: 'Example' }));
    expect(Linking.openURL).toHaveBeenCalledWith('https://example.com');
  });

  it('prefers onPress over the href', () => {
    const onPress = jest.fn();
    const { getByRole } = render(
      <Link href="https://example.com" onPress={onPress}>
        Custom
      </Link>
    );
    fireEvent.press(getByRole('link', { name: 'Custom' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(Linking.openURL).not.toHaveBeenCalled();
  });

  it('uses onNavigate on native', () => {
    const onNavigate = jest.fn();
    const { getByRole } = render(<Link href="/docs" onNavigate={onNavigate}>Docs</Link>);
    fireEvent.press(getByRole('link', { name: 'Docs' }));
    expect(onNavigate).toHaveBeenCalledTimes(1);
    expect(Linking.openURL).not.toHaveBeenCalled();
  });

  it('does nothing when disabled', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <Link onPress={onPress} disabled>
        Off
      </Link>
    );
    fireEvent.press(getByText('Off'));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('announces external links as opening in a new tab', () => {
    const { getByRole } = render(
      <Link href="https://example.com" external>
        Docs
      </Link>
    );
    expect(getByRole('link', { name: 'Docs (opens in a new tab)' })).toBeTruthy();
  });

  it('merges array styles and keeps the consumer margins', () => {
    const { getByText } = render(
      <Link href="#" style={[{ marginTop: 4 }, { marginBottom: 6 }]}>
        Styled
      </Link>
    );
    const style = StyleSheet.flatten(getByText('Styled').props.style);
    expect(style.marginTop).toBe(4);
    expect(style.marginBottom).toBe(6);
  });

  it('resolves the color vocabulary (raw, shade syntax, bare token at shade 6)', () => {
    const colorOf = (color: string) =>
      StyleSheet.flatten(render(<Link href="#" c={color}>{color}</Link>).getByText(color).props.style).color;
    expect(colorOf('#FF0000')).toBe('#FF0000');
    expect(colorOf('success.2')).toBe(DEFAULT_THEME.colors.success[2]);
    expect(colorOf('success')).toBe(DEFAULT_THEME.colors.success[6]);
    expect(colorOf('primary')).not.toBe(DEFAULT_THEME.text.primary);
  });
});
