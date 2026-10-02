import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PlocksProvider } from '@plocks/ui';

const mockPressFeedback = jest.fn(async () => undefined);
const mockHoverFeedback = jest.fn();
jest.mock('../../../sound/hooks', () => ({
  useButtonFeedback: () => ({ onPress: mockPressFeedback, onHover: mockHoverFeedback }),
}));

import { SoundButton } from '../SoundButton';

beforeEach(() => {
  mockPressFeedback.mockClear();
  mockHoverFeedback.mockClear();
});

test('runs enabled feedback before invoking the web button action', async () => {
  const onPress = jest.fn();
  render(<PlocksProvider><SoundButton title="Play sound" onPress={onPress} /></PlocksProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Play sound' }));
  await waitFor(() => expect(onPress).toHaveBeenCalledTimes(1));
  expect(mockPressFeedback).toHaveBeenCalledWith(expect.objectContaining({ playSound: true, playHaptic: true }));
  expect(mockPressFeedback.mock.invocationCallOrder[0]).toBeLessThan(onPress.mock.invocationCallOrder[0]);
});

test('keeps disabled buttons inert', () => {
  const onPress = jest.fn();
  render(<PlocksProvider><SoundButton title="Muted" disabled onPress={onPress} /></PlocksProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'Muted' }));
  expect(onPress).not.toHaveBeenCalled();
  expect(mockPressFeedback).not.toHaveBeenCalled();
});
