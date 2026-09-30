import React from 'react';
import { fireEvent, render as rtlRender, screen } from '@testing-library/react';

import { PlocksProvider } from '../../../core/theme/PlocksProvider';
import { Chip } from '../Chip';

const render = (ui: React.ReactElement) => rtlRender(<PlocksProvider>{ui}</PlocksProvider>);

describe('Chip (react-native-web DOM)', () => {
  it('a static chip has no interactive role', () => {
    render(<Chip testID="tag">Static</Chip>);
    expect(screen.getByTestId('tag').getAttribute('role')).toBeNull();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('a selectable chip is a checkbox that toggles on click and Space', () => {
    const onChange = jest.fn();
    render(
      <Chip defaultChecked={false} onChange={onChange}>
        Expo
      </Chip>
    );
    const chip = screen.getByRole('checkbox', { name: 'Expo' });
    expect(chip.getAttribute('aria-checked')).toBe('false');
    fireEvent.click(chip);
    expect(onChange).toHaveBeenLastCalledWith(true);
    expect(chip.getAttribute('aria-checked')).toBe('true');
    fireEvent.keyDown(chip, { key: ' ' });
    expect(onChange).toHaveBeenLastCalledWith(false);
    expect(chip.getAttribute('aria-checked')).toBe('false');
  });

  it('the remove button is named after the chip and is at least 24px', () => {
    const onRemove = jest.fn();
    render(<Chip onRemove={onRemove}>React</Chip>);
    const remove = screen.getByRole('button', { name: 'Remove React' });
    expect(parseFloat(remove.style.minWidth)).toBeGreaterThanOrEqual(24);
    expect(parseFloat(remove.style.minHeight)).toBeGreaterThanOrEqual(24);
    fireEvent.click(remove);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('a pressable, removable chip renders two sibling controls (no nested buttons)', () => {
    render(
      <Chip onPress={() => {}} onRemove={() => {}}>
        Tag
      </Chip>
    );
    const main = screen.getByRole('button', { name: 'Tag' });
    const remove = screen.getByRole('button', { name: 'Remove Tag' });
    expect(main.contains(remove)).toBe(false);
  });
});
