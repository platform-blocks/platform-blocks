import React, { useState } from 'react';
import { act, fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { __resetLayerStackForTests } from '../../../core/overlay/layerStack';
import { PlatformBlocksProvider } from '../../../core/theme/PlatformBlocksProvider';
import { Select } from '../Select';

const render = (ui: React.ReactElement) => rtlRender(<PlatformBlocksProvider>{ui}</PlatformBlocksProvider>);

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

const options = [
  { label: 'Soccer', value: 'soccer' },
  { label: 'Basketball', value: 'basketball', disabled: true },
  { label: 'Tennis', value: 'tennis' },
  { label: 'Football', value: 'football' },
];

/** Lets positioning (async measure + debounced re-measure) settle and the overlay mount. */
const flush = async () => {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 150));
  });
};

const key = (element: Element, keyName: string) => fireEvent.keyDown(element, { key: keyName });

function Controlled(props: Partial<React.ComponentProps<typeof Select>>) {
  const [value, setValue] = useState<string | null>(null);
  return <Select label="Sport" options={options} value={value} onChange={(next) => setValue(next as string | null)} {...props} />;
}

describe('Select (react-native-web DOM)', () => {
  it('is a combobox named by its label, showing the value as its text', () => {
    render(<Select label="Sport" options={options} defaultValue="tennis" required />);
    const combobox = screen.getByRole('combobox', { name: 'Sport' });
    expect(combobox.textContent).toContain('Tennis');
    expect(combobox.getAttribute('aria-expanded')).toBe('false');
    expect(combobox.getAttribute('aria-haspopup')).toBe('listbox');
    expect(combobox.getAttribute('aria-required')).toBe('true');
  });

  it('is named by the placeholder when there is no label', () => {
    render(<Select options={options} placeholder="Pick a sport" />);
    expect(screen.getByRole('combobox', { name: 'Pick a sport' })).toBeTruthy();
  });

  it('opens a listbox of options with ArrowDown and tracks the active option via aria-activedescendant', async () => {
    render(<Controlled />);
    const combobox = screen.getByRole('combobox', { name: 'Sport' });
    act(() => {
      combobox.focus();
    });
    key(combobox, 'ArrowDown');
    await flush();

    expect(combobox.getAttribute('aria-expanded')).toBe('true');
    const listbox = screen.getByRole('listbox', { name: 'Sport' });
    expect(combobox.getAttribute('aria-controls')).toBe(listbox.id);

    const optionNodes = screen.getAllByRole('option');
    expect(optionNodes.map((node) => node.textContent)).toEqual(['Soccer', 'Basketball', 'Tennis', 'Football']);
    expect(optionNodes[1].getAttribute('aria-disabled')).toBe('true');

    // Nothing selected: the first option is active.
    expect(combobox.getAttribute('aria-activedescendant')).toBe(optionNodes[0].id);
    // Down skips the disabled option.
    key(combobox, 'ArrowDown');
    expect(combobox.getAttribute('aria-activedescendant')).toBe(optionNodes[2].id);
    // Focus never left the combobox.
    expect(document.activeElement).toBe(combobox);

    key(combobox, 'Enter');
    await flush();
    expect(combobox.getAttribute('aria-expanded')).toBe('false');
    expect(combobox.textContent).toContain('Tennis');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('marks the selected option with aria-selected and starts on it when reopened', async () => {
    render(<Select label="Sport" options={options} defaultValue="football" />);
    const combobox = screen.getByRole('combobox', { name: 'Sport' });
    key(combobox, 'Enter');
    await flush();

    const selected = screen.getByRole('option', { selected: true });
    expect(selected.textContent).toBe('Football');
    expect(combobox.getAttribute('aria-activedescendant')).toBe(selected.id);
    // Home / End jump to the ends.
    key(combobox, 'Home');
    expect(combobox.getAttribute('aria-activedescendant')).toBe(screen.getAllByRole('option')[0].id);
  });

  it('closes on Escape without changing the value', async () => {
    const onChange = jest.fn();
    render(<Select label="Sport" options={options} onChange={onChange} />);
    const combobox = screen.getByRole('combobox', { name: 'Sport' });
    act(() => {
      combobox.focus();
    });
    key(combobox, 'ArrowDown');
    await flush();
    expect(screen.getByRole('listbox')).toBeTruthy();

    fireEvent.keyDown(document.activeElement ?? combobox, { key: 'Escape' });
    await flush();
    expect(combobox.getAttribute('aria-expanded')).toBe('false');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('selects with a pointer click', async () => {
    const onChange = jest.fn();
    render(<Select label="Sport" options={options} onChange={onChange} />);
    fireEvent.click(screen.getByRole('combobox', { name: 'Sport' }));
    await flush();
    fireEvent.click(screen.getByRole('option', { name: 'Soccer' }));
    expect(onChange).toHaveBeenCalledWith('soccer', options[0]);
  });

  it('filters with the search input when searchable', async () => {
    render(<Select label="Sport" options={options} searchable />);
    fireEvent.click(screen.getByRole('combobox', { name: 'Sport' }));
    await flush();
    const search = screen.getByRole('combobox', { name: 'Search…' });
    // The filter input takes focus when the dropdown opens.
    expect(document.activeElement).toBe(search);
    fireEvent.change(search, { target: { value: 'ball' } });
    expect(screen.getAllByRole('option').map((node) => node.textContent)).toEqual(['Basketball', 'Football']);
    // The disabled match is skipped: Football is active.
    const football = screen.getByRole('option', { name: 'Football' });
    expect(search.getAttribute('aria-activedescendant')).toBe(football.id);
    key(search, 'Enter');
    await flush();
    expect(screen.getByRole('combobox', { name: 'Sport' }).textContent).toContain('Football');
  });

  it('links the error message to the combobox', () => {
    render(<Select label="Sport" options={options} error="Pick one" />);
    const combobox = screen.getByRole('combobox', { name: 'Sport' });
    expect(combobox.getAttribute('aria-invalid')).toBe('true');
    const alert = screen.getByRole('alert');
    expect(combobox.getAttribute('aria-describedby')).toContain(alert.id);
  });

  it('renders a labelled clear button beside (not inside) the combobox', async () => {
    render(<Select label="Sport" options={options} defaultValue="soccer" clearable />);
    const combobox = screen.getByRole('combobox', { name: 'Sport' });
    const clear = screen.getByRole('button', { name: 'Clear selection' });
    expect(combobox.contains(clear)).toBe(false);
    fireEvent.click(clear);
    await flush();
    expect(combobox.textContent).toContain('Select…');
  });
});
