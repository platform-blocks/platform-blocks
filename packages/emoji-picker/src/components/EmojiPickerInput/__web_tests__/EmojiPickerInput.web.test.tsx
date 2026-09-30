import React from 'react';
import { act, fireEvent, render, screen, within } from '@testing-library/react';

import { PlocksProvider } from '@plocks/ui';
import { __resetLayerStackForTests } from '@plocks/ui/test-utils';
import { EmojiPickerInput } from '../EmojiPickerInput';

beforeEach(() => __resetLayerStackForTests());
beforeEach(() => {
  jest.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    x: 20, y: 20, top: 20, left: 20, right: 320, bottom: 60, width: 300, height: 40,
    toJSON: () => ({}),
  });
});
afterEach(() => jest.restoreAllMocks());

const flush = async () => {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 50));
  });
};

it('opens a searchable dialog and displays the chosen emoji', async () => {
  const onChange = jest.fn();
  render(
    <PlocksProvider>
      <EmojiPickerInput
        label="Reaction"
        onChange={onChange}
        pickerProps={{ emojis: [{ id: 'heart', emoji: '❤️', name: 'Heart', category: 'reactions' }] }}
      />
    </PlocksProvider>
  );

  const trigger = screen.getByRole('button', { name: 'Reaction' });
  fireEvent.click(trigger);
  const dialog = await screen.findByRole('dialog', { name: 'Select emoji' });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Heart' }));
  await flush();

  expect(onChange).toHaveBeenCalledWith('❤️', expect.objectContaining({ id: 'heart' }));
  expect(trigger.textContent).toContain('❤️');
  expect(screen.queryByRole('dialog', { name: 'Select emoji' })).toBeNull();
});
