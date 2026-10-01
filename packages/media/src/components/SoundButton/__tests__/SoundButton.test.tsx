import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { useButtonFeedback } from '../../../sound/hooks';
import { SoundButton } from '../SoundButton';

jest.mock('../../../sound/hooks', () => ({ useButtonFeedback: jest.fn() }));

const playPress = jest.fn(async () => undefined);
const playHover = jest.fn();

describe('SoundButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useButtonFeedback).mockReturnValue({ onPress: playPress, onHover: playHover });
  });

  it('plays configured feedback before calling the consumer', async () => {
    const onPress = jest.fn();
    render(<SoundButton title="Save" onPress={onPress} enableHapticFeedback={false} soundOptions={{}} />);
    fireEvent.press(screen.getByRole('button', { name: 'Save' }));
    await waitFor(() => expect(onPress).toHaveBeenCalledTimes(1));
    expect(playPress).toHaveBeenCalledWith(expect.objectContaining({ playSound: true, playHaptic: false }));
    expect(playPress.mock.invocationCallOrder[0]).toBeLessThan(onPress.mock.invocationCallOrder[0]);
  });

  it('can disable both feedback channels', async () => {
    const onPress = jest.fn();
    render(<SoundButton title="Quiet" onPress={onPress} enableSoundFeedback={false} enableHapticFeedback={false} />);
    fireEvent.press(screen.getByRole('button', { name: 'Quiet' }));
    await waitFor(() => expect(onPress).toHaveBeenCalledTimes(1));
    expect(playPress).not.toHaveBeenCalled();
  });
});
