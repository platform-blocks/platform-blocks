import React from 'react';
import { StyleSheet } from 'react-native';
import { render, fireEvent, configure } from '@testing-library/react-native';

import { Checkbox } from '../Checkbox';

// The visual label is hidden from native screen readers (the control's own
// accessible name carries it), so text queries must include hidden elements.
configure({ defaultIncludeHiddenElements: true });

describe('Checkbox', () => {
  it('toggles state and calls onChange when pressed in uncontrolled mode', () => {
    const onChange = jest.fn();
    const { getByRole } = render(<Checkbox label="Marketing" defaultChecked={false} onChange={onChange} />);

    fireEvent.press(getByRole('checkbox', { checked: false }));

    expect(onChange).toHaveBeenCalledWith(true);
    expect(getByRole('checkbox', { checked: true })).toBeTruthy();
  });

  it('honors a controlled checked prop', () => {
    const onChange = jest.fn();
    const { getByRole } = render(<Checkbox label="Controlled" checked onChange={onChange} />);

    fireEvent.press(getByRole('checkbox', { checked: true }));

    expect(onChange).toHaveBeenCalledWith(false);
    // Controlled: the parent did not update, so the state holds.
    expect(getByRole('checkbox', { checked: true })).toBeTruthy();
  });

  it('reports a mixed state when indeterminate, and checks on press', () => {
    const onChange = jest.fn();
    const { getByRole } = render(<Checkbox label="Partial" indeterminate onChange={onChange} />);

    fireEvent.press(getByRole('checkbox', { checked: 'mixed' }));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('toggles the same control when the label is pressed', () => {
    const onChange = jest.fn();
    const { getByText, getAllByRole } = render(<Checkbox label="Accept" onChange={onChange} />);

    fireEvent.press(getByText('Accept'));
    expect(onChange).toHaveBeenCalledWith(true);
    // One control: the label is a press target, not a second checkbox.
    expect(getAllByRole('checkbox')).toHaveLength(1);
  });

  it('names the control by its label on native', () => {
    const { getByRole } = render(<Checkbox label="Accept terms" required />);
    expect(getByRole('checkbox', { name: 'Accept terms, required' })).toBeTruthy();
  });

  it('prevents interaction when disabled, even via the label', () => {
    const onChange = jest.fn();
    const { getByRole, getByText } = render(
      <Checkbox label="Disabled" disabled defaultChecked onChange={onChange} />
    );

    fireEvent.press(getByRole('checkbox'));
    fireEvent.press(getByText('Disabled'));

    expect(onChange).not.toHaveBeenCalled();
    expect(getByRole('checkbox', { disabled: true })).toBeTruthy();
  });

  it('ignores presses when readOnly', () => {
    const onChange = jest.fn();
    const { getByRole } = render(<Checkbox label="Locked" readOnly onChange={onChange} />);

    fireEvent.press(getByRole('checkbox'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows helper text, replaced by the error while one is set', () => {
    const { getByText, queryByText, rerender } = render(
      <Checkbox label="Terms" helperText="Read them first" />
    );
    expect(getByText('Read them first')).toBeTruthy();

    rerender(<Checkbox label="Terms" helperText="Read them first" error="Required" />);
    expect(getByText('Required')).toBeTruthy();
    expect(queryByText('Read them first')).toBeNull();
  });

  it('applies spacing props to the root, not the control', () => {
    const { getByRole, toJSON } = render(<Checkbox label="Spaced" mt={12} testID="cb" />);
    const root = toJSON() as { props: { style?: unknown } };
    expect(StyleSheet.flatten(root.props.style as never)).toMatchObject({ marginTop: 12 });
    expect(getByRole('checkbox').props.testID).toBe('cb');
  });

  it('forwards its ref to the control', () => {
    const ref = React.createRef<import('react-native').View>();
    const { getByRole } = render(<Checkbox label="Ref" ref={ref} />);
    expect(ref.current).toBeTruthy();
    expect(getByRole('checkbox')).toBeTruthy();
  });
});
