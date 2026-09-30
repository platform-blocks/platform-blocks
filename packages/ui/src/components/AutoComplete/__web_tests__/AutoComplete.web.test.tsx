import React, { useState } from 'react';
import { act, fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { __resetLayerStackForTests } from '../../../core/overlay/layerStack';
import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { AutoComplete } from '../AutoComplete';
import type { AutoCompleteOption, AutoCompleteProps } from '../types';

const render = (ui: React.ReactElement) => rtlRender(<PlocksProvider>{ui}</PlocksProvider>);

// jsdom has no layout; give every element a box so the positioner can place
// the dropdown (an unmeasurable anchor keeps it closed).
const originalRect = Element.prototype.getBoundingClientRect;
beforeAll(() => {
  Element.prototype.getBoundingClientRect = function getBoundingClientRect() {
    return { x: 20, y: 40, top: 40, left: 20, right: 320, bottom: 80, width: 300, height: 40, toJSON: () => ({}) } as DOMRect;
  };
});
afterAll(() => {
  Element.prototype.getBoundingClientRect = originalRect;
});
beforeEach(() => __resetLayerStackForTests());

const fruits: AutoCompleteOption[] = [
  { label: 'Apple', value: 'apple' },
  { label: 'Apricot', value: 'apricot', disabled: true },
  { label: 'Banana', value: 'banana' },
  { label: 'Blueberry', value: 'blueberry' },
];

const flush = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
  });
};

const key = (element: Element, keyName: string) => fireEvent.keyDown(element, { key: keyName });

function Controlled(props: Partial<AutoCompleteProps>) {
  const [value, setValue] = useState('');
  return (
    <AutoComplete
      label="Fruit"
      data={fruits}
      minSearchLength={1}
      value={value}
      onChangeText={setValue}
      {...props}
    />
  );
}

async function focusInput(name = 'Fruit') {
  const input = screen.getByRole('combobox', { name });
  act(() => {
    input.focus();
  });
  await flush();
  return input;
}

describe('AutoComplete (react-native-web DOM)', () => {
  it('is an editable combobox named by its label, with list autocomplete', () => {
    render(<Controlled required />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    expect(input.tagName).toBe('INPUT');
    expect(input.getAttribute('aria-autocomplete')).toBe('list');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(input.getAttribute('aria-required')).toBe('true');
  });

  it('opens a listbox on focus and moves the active option with arrow keys (aria-activedescendant)', async () => {
    render(<Controlled />);
    const input = await focusInput();

    expect(input.getAttribute('aria-expanded')).toBe('true');
    const listbox = screen.getByRole('listbox', { name: 'Fruit' });
    expect(input.getAttribute('aria-controls')).toBe(listbox.id);
    const options = screen.getAllByRole('option');
    expect(options.map((node) => node.textContent)).toEqual(['Apple', 'Apricot', 'Banana', 'Blueberry']);
    expect(options[1].getAttribute('aria-disabled')).toBe('true');

    // No option is active until the user arrows into the list.
    expect(input.getAttribute('aria-activedescendant')).toBeNull();
    key(input, 'ArrowDown');
    expect(input.getAttribute('aria-activedescendant')).toBe(options[0].id);
    // The disabled option is skipped.
    key(input, 'ArrowDown');
    expect(input.getAttribute('aria-activedescendant')).toBe(options[2].id);
    key(input, 'ArrowUp');
    expect(input.getAttribute('aria-activedescendant')).toBe(options[0].id);
    // Real focus stays in the text field.
    expect(document.activeElement).toBe(input);
  });

  it('filters as you type and selects the active option with Enter', async () => {
    const onSelect = jest.fn();
    render(<Controlled onSelect={onSelect} displayProperty="label" />);
    const input = await focusInput();

    fireEvent.change(input, { target: { value: 'b' } });
    await flush();
    expect(screen.getAllByRole('option').map((node) => node.textContent)).toEqual(['Banana', 'Blueberry']);

    key(input, 'ArrowDown');
    key(input, 'ArrowDown');
    key(input, 'Enter');
    await flush();

    expect(onSelect).toHaveBeenCalledWith(fruits[3]);
    expect((input as HTMLInputElement).value).toBe('Blueberry');
    expect(input.getAttribute('aria-expanded')).toBe('false');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('marks the chosen option aria-selected', async () => {
    render(<Controlled displayProperty="label" />);
    const input = await focusInput();
    fireEvent.click(screen.getByRole('option', { name: 'Banana' }));
    await flush();
    // Reopen via the toggle button.
    fireEvent.click(screen.getByRole('button', { name: 'Show suggestions' }));
    await flush();
    expect(screen.getByRole('option', { selected: true }).textContent).toBe('Banana');
    expect(document.activeElement).toBe(input);
  });

  it('writes the chosen option\'s label into the input by default', async () => {
    render(<Controlled />);
    const input = await focusInput();
    fireEvent.click(screen.getByRole('option', { name: 'Banana' }));
    await flush();
    expect((input as HTMLInputElement).value).toBe('Banana');
  });

  it('writes the chosen option\'s value with displayProperty="value"', async () => {
    render(<Controlled displayProperty="value" />);
    const input = await focusInput();
    fireEvent.click(screen.getByRole('option', { name: 'Banana' }));
    await flush();
    expect((input as HTMLInputElement).value).toBe('banana');
  });

  it('closes on Escape', async () => {
    render(<Controlled />);
    const input = await focusInput();
    expect(screen.getByRole('listbox')).toBeTruthy();
    fireEvent.keyDown(input, { key: 'Escape' });
    await flush();
    expect(input.getAttribute('aria-expanded')).toBe('false');
  });

  it('exposes groups as labelled option groups', async () => {
    render(
      <Controlled
        data={[
          { label: 'France', value: 'fr', group: 'Europe' },
          { label: 'Japan', value: 'jp', group: 'Asia' },
          { label: 'Spain', value: 'es', group: 'Europe' },
        ]}
      />
    );
    await focusInput();
    const europe = screen.getByRole('group', { name: 'Europe' });
    expect(Array.from(europe.querySelectorAll('[role="option"]')).map((node) => node.textContent)).toEqual([
      'France',
      'Spain',
    ]);
    expect(screen.getByRole('group', { name: 'Asia' })).toBeTruthy();
  });

  it('links the error message and renders a labelled clear button', async () => {
    const onClear = jest.fn();
    render(<Controlled error="Pick a fruit" clearable onClear={onClear} />);
    const input = screen.getByRole('combobox', { name: 'Fruit' });
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toContain(screen.getByRole('alert').id);

    fireEvent.change(input, { target: { value: 'app' } });
    await flush();
    fireEvent.click(screen.getByRole('button', { name: 'Clear input' }));
    await flush();
    expect((input as HTMLInputElement).value).toBe('');
    expect(onClear).toHaveBeenCalled();
  });
});
