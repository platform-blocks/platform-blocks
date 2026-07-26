import React, { useState } from 'react';
import { TextInput } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';

import { PinInput } from '../PinInput';

const getCells = (root: ReturnType<typeof render>) =>
  root.UNSAFE_getAllByType(TextInput);

describe('PinInput', () => {
  it('is typeable when used uncontrolled (no value/onChange)', () => {
    // Regression: previously the component was always controlled off the `value`
    // prop (default ''), so without an onChange handler every keystroke was a
    // no-op and nothing could be typed.
    const root = render(<PinInput length={4} />);

    fireEvent.changeText(getCells(root)[0], '1');
    expect(getCells(root)[0].props.value).toBe('1');

    fireEvent.changeText(getCells(root)[1], '2');
    const cells = getCells(root);
    expect(cells[0].props.value).toBe('1');
    expect(cells[1].props.value).toBe('2');
  });

  it('seeds uncontrolled state from defaultValue', () => {
    const root = render(<PinInput length={4} defaultValue="42" />);
    const cells = getCells(root);
    expect(cells[0].props.value).toBe('4');
    expect(cells[1].props.value).toBe('2');
    expect(cells[2].props.value).toBe('');
  });

  it('respects the controlled value prop and calls onChange', () => {
    const onChange = jest.fn();

    const Controlled = () => {
      const [value, setValue] = useState('');
      return (
        <PinInput
          length={4}
          value={value}
          onChange={(next) => {
            onChange(next);
            setValue(next);
          }}
        />
      );
    };

    const root = render(<Controlled />);
    fireEvent.changeText(getCells(root)[0], '9');

    expect(onChange).toHaveBeenCalledWith('9');
    expect(getCells(root)[0].props.value).toBe('9');
  });

  it('does not mutate a controlled value when no onChange is provided', () => {
    const root = render(<PinInput length={4} value="" />);
    fireEvent.changeText(getCells(root)[0], '5');
    // Controlled with a fixed value and no handler stays empty by design.
    expect(getCells(root)[0].props.value).toBe('');
  });

  it('treats a char appended to a filled cell as a single edit, not a paste', () => {
    // Regression: a keystroke appended to a filled cell arrived as e.g. "25",
    // which hit the paste path, wiped the value and skipped focus.
    const onChange = jest.fn();
    const root = render(<PinInput length={4} defaultValue="2" onChange={onChange} />);

    // Simulate the platform delivering existing digit + new char to cell 0.
    fireEvent.changeText(getCells(root)[0], '25');

    // Only the newly typed char is kept in that cell; value is not replaced wholesale.
    expect(onChange).toHaveBeenLastCalledWith('5');
    expect(getCells(root)[0].props.value).toBe('5');
  });

  it('editing an earlier cell of a filled PIN keeps the other digits', () => {
    // Regression: editing a non-last cell of a complete PIN used to hit the
    // "completed -> blur all" path; it must instead update just that cell
    // (and, in the browser, advance focus to the next cell).
    const onChange = jest.fn();
    const Controlled = () => {
      const [value, setValue] = useState('1234');
      return (
        <PinInput
          length={4}
          value={value}
          onChange={(next) => { onChange(next); setValue(next); }}
        />
      );
    };
    const root = render(<Controlled />);
    fireEvent.changeText(getCells(root)[0], '9');
    expect(onChange).toHaveBeenLastCalledWith('9234');
    const cells = getCells(root);
    expect(cells.map((c) => c.props.value)).toEqual(['9', '2', '3', '4']);
  });

  it('hides the placeholder on the focused cell', () => {
    const root = render(<PinInput length={4} placeholder="○" />);
    const cells = getCells(root);
    // all show the placeholder before focus
    expect(cells[0].props.placeholder).toBe('○');

    fireEvent(cells[0], 'focus');
    const focused = getCells(root);
    expect(focused[0].props.placeholder).toBe('');
    // non-focused cells still show it
    expect(focused[1].props.placeholder).toBe('○');
  });
});
