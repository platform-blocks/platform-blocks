import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { DEFAULT_THEME } from '../../../core/theme/defaultTheme';
import { getControlSize, stepDown } from '../../../core/theme/tokens';
import { Chip } from '../Chip';

const styleOf = (node: { props: { [key: string]: unknown } }) =>
  StyleSheet.flatten(node.props.style as StyleProp<ViewStyle>) as Record<string, unknown>;

describe('Chip', () => {
  it('sizes one step below a control of the same size', () => {
    const { getByTestId } = render(<Chip testID="chip">Tag</Chip>);
    expect(styleOf(getByTestId('chip')).height).toBe(getControlSize(DEFAULT_THEME, stepDown('md')).height);
  });

  it('toggles an uncontrolled selectable chip and reports it', () => {
    const onChange = jest.fn();
    const { getByRole } = render(
      <Chip defaultChecked onChange={onChange}>
        Filter
      </Chip>
    );
    const chip = getByRole('checkbox', { name: 'Filter' });
    expect(chip).toBeChecked();
    fireEvent.press(chip);
    expect(onChange).toHaveBeenCalledWith(false);
    expect(chip).not.toBeChecked();
  });

  it('respects a controlled checked value', () => {
    const onChange = jest.fn();
    const { getByRole } = render(
      <Chip checked={false} onChange={onChange}>
        Controlled
      </Chip>
    );
    fireEvent.press(getByRole('checkbox', { name: 'Controlled' }));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(getByRole('checkbox', { name: 'Controlled' })).not.toBeChecked();
  });

  it('names the remove button after the chip and gives it a 44pt native target', () => {
    const onRemove = jest.fn();
    const { getByRole } = render(<Chip onRemove={onRemove}>React</Chip>);
    const remove = getByRole('button', { name: 'Remove React' });
    const hitSlop = remove.props.hitSlop as number;
    expect(24 + 2 * hitSlop).toBeGreaterThanOrEqual(44);
    fireEvent.press(remove);
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('does not fire when disabled', () => {
    const onChange = jest.fn();
    const { getByRole } = render(
      <Chip defaultChecked={false} onChange={onChange} disabled>
        Off
      </Chip>
    );
    fireEvent.press(getByRole('checkbox', { name: 'Off' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('keeps the deprecated startIcon working', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const { getByText } = render(<Chip startIcon={<React.Fragment>★</React.Fragment>}>Star</Chip>);
    expect(getByText('Star')).toBeTruthy();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('`startIcon` is deprecated'));
    warn.mockRestore();
  });
});
