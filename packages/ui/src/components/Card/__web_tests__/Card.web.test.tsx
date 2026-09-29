import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { Text } from '../../Text';
import { Card } from '../Card';

describe('Card (web)', () => {
  it('is a plain container without onPress', () => {
    render(
      <Card testID="card">
        <Text>Body</Text>
      </Card>
    );
    expect(screen.getByTestId('card').getAttribute('role')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('is a focusable button with onPress', () => {
    const onPress = jest.fn();
    render(
      <Card onPress={onPress} aria-label="Open project">
        <Text>Project</Text>
      </Card>
    );
    const button = screen.getByRole('button', { name: 'Open project' });
    expect(button.getAttribute('tabindex')).toBe('0');
    fireEvent.click(button);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('marks a disabled pressable card aria-disabled', () => {
    render(
      <Card onPress={() => {}} disabled aria-label="Unavailable">
        <Text>x</Text>
      </Card>
    );
    expect(screen.getByRole('button', { name: 'Unavailable' }).getAttribute('aria-disabled')).toBe('true');
  });

  it('maps deprecated accessibilityRole / accessibilityState to role and aria-*', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Card onPress={() => {}} accessibilityRole="radio" accessibilityState={{ checked: true }} aria-label="Plan A">
        <Text>Plan A</Text>
      </Card>
    );
    const radio = screen.getByRole('radio', { name: 'Plan A' });
    expect(radio.getAttribute('aria-checked')).toBe('true');
    warn.mockRestore();
  });

  it('uses an explicit role and forwards its ref', () => {
    const ref = React.createRef<unknown>();
    render(
      <Card ref={ref as React.Ref<never>} role="article" aria-label="Post">
        <Text>Post</Text>
      </Card>
    );
    expect(ref.current).toBe(screen.getByRole('article', { name: 'Post' }));
  });
});
