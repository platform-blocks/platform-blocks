import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithPlocks } from '../../../__web_tests__/renderWithPlocks';
import { StickyNote } from '../StickyNote';

test('makes an interactive note a named button and respects disabled', () => {
  const onPress = jest.fn();
  renderWithPlocks(<><StickyNote title="Review" onPress={onPress}>Draft</StickyNote><StickyNote title="Locked" onPress={onPress} disabled>Done</StickyNote></>);
  fireEvent.click(screen.getByRole('button', { name: /Review/ }));
  expect(onPress).toHaveBeenCalledTimes(1);
  expect(screen.getByRole('button', { name: /Locked/ }).getAttribute('aria-disabled')).toBe('true');
});
