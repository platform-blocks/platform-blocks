import React from 'react';
import { StyleSheet } from 'react-native';
import { fireEvent, render } from '@testing-library/react-native';

import { DEFAULT_THEME } from '@plocks/ui';
import { YearPicker } from '../YearPicker';

const thisYear = new Date().getFullYear();
const thisDecade = Math.floor(thisYear / 10) * 10;

const styleOf = (utils: ReturnType<typeof render>, year: number) =>
  StyleSheet.flatten(utils.getByLabelText(String(year)).props.style) as Record<string, unknown>;

describe('YearPicker - current period', () => {
  it('rings the current year', () => {
    const utils = render(<YearPicker decade={thisDecade} />);

    const styles = styleOf(utils, thisYear);
    expect(styles.borderWidth).toBe(1);
    expect(styles.borderColor).toBe(DEFAULT_THEME.colors.primary[4]);
    // The ring is the marker — the current year is never filled.
    expect(styles.backgroundColor).toBe('transparent');
  });

  it('leaves other years unringed', () => {
    const utils = render(<YearPicker decade={thisDecade} />);

    const styles = styleOf(utils, thisYear + 1);
    expect(styles.borderWidth).toBe(0);
  });

  it('drops the ring when the current year is also selected', () => {
    const utils = render(<YearPicker decade={thisDecade} value={new Date(thisYear, 0, 1)} />);

    const styles = styleOf(utils, thisYear);
    expect(styles.borderWidth).toBe(0);
    expect(styles.backgroundColor).toBe(DEFAULT_THEME.colors.primary[5]);
  });
});

describe('YearPicker - selection and accessibility', () => {
  it('exposes each year as a labelled button with its selected state', () => {
    const utils = render(<YearPicker decade={2020} value={new Date(2031, 4, 9)} />);

    expect(utils.getByRole('button', { name: '2031', selected: true })).toBeTruthy();
    expect(utils.getByRole('button', { name: '2030', selected: false })).toBeTruthy();
    expect(utils.getByRole('button', { name: 'Previous decade' })).toBeTruthy();
    expect(utils.getByRole('button', { name: 'Next decade' })).toBeTruthy();
  });

  it('keeps the month and day of the current value when a year is picked', () => {
    const onChange = jest.fn();
    const utils = render(<YearPicker decade={2020} value={new Date(2024, 4, 9)} onChange={onChange} />);

    fireEvent.press(utils.getByLabelText('2027'));
    expect(onChange).toHaveBeenCalledWith(new Date(2027, 4, 9));
  });

  it('disables years outside min/max', () => {
    const onChange = jest.fn();
    const utils = render(
      <YearPicker decade={2020} minDate={new Date(2022, 0, 1)} onChange={onChange} />
    );

    const early = utils.getByRole('button', { name: '2021', disabled: true });
    fireEvent.press(early);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('pages by decade', () => {
    const onDecadeChange = jest.fn();
    const utils = render(<YearPicker decade={2020} onDecadeChange={onDecadeChange} />);

    fireEvent.press(utils.getByRole('button', { name: 'Next decade' }));
    expect(onDecadeChange).toHaveBeenCalledWith(2030);
  });

  it('forwards the ref, testID and style to the root view', () => {
    const ref = React.createRef<import('react-native').View>();
    const utils = render(<YearPicker ref={ref} testID="years" style={{ opacity: 0.5 }} mt="md" />);

    const root = utils.getByTestId('years');
    expect(ref.current).toBeTruthy();
    expect(StyleSheet.flatten(root.props.style)).toMatchObject({ opacity: 0.5, marginTop: 12 });
  });
});
