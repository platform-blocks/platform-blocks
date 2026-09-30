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

  it('fires onComplete once on the transition to complete, not on parent re-renders', () => {
    const onComplete = jest.fn();
    const Parent = ({ tick }: { tick: number }) => {
      const [value, setValue] = useState('');
      // An inline callback: a new identity on every render.
      return <PinInput length={4} value={value} onChange={setValue} onComplete={(pin) => onComplete(pin, tick)} />;
    };
    const root = render(<Parent tick={0} />);
    fireEvent.changeText(getCells(root)[0], '1234');
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith('1234', 0);

    root.rerender(<Parent tick={1} />);
    root.rerender(<Parent tick={2} />);
    expect(onComplete).toHaveBeenCalledTimes(1);

    // Changing a digit makes a new complete code.
    fireEvent.changeText(getCells(root)[1], '9');
    expect(onComplete).toHaveBeenCalledTimes(2);
    expect(onComplete).toHaveBeenLastCalledWith('1934', 2);
  });

  it('does not fire onComplete for a value that is already complete on mount', () => {
    const onComplete = jest.fn();
    render(<PinInput length={4} defaultValue="1234" onComplete={onComplete} />);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('names each cell by the field label and its position', () => {
    const root = render(<PinInput length={3} label="Code" />);
    expect(getCells(root).map((cell) => cell.props['aria-label'])).toEqual([
      'Code, digit 1 of 3',
      'Code, digit 2 of 3',
      'Code, digit 3 of 3',
    ]);
    const unnamed = render(<PinInput length={2} />);
    expect(getCells(unnamed)[1].props['aria-label']).toBe('Digit 2 of 2');
  });

  it('sizes cells from the theme control height', () => {
    const root = render(<PinInput length={2} size="lg" />);
    const cellFrame = getCells(root)[0].parent?.parent;
    const flat = require('react-native').StyleSheet.flatten(cellFrame?.props.style);
    expect(flat.height).toBe(44);
    expect(flat.width).toBe(44);
  });

  it('exposes a focus handle through its ref', () => {
    const ref = React.createRef<import('../../../core/types/base').FieldHandle>();
    render(<PinInput length={4} ref={ref} />);
    expect(typeof ref.current?.focus).toBe('function');
    expect(typeof ref.current?.clear).toBe('function');
  });
});
