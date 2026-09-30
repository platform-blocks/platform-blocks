import React from 'react';
import { View } from 'react-native';
import { render, fireEvent, configure } from '@testing-library/react-native';

import { Radio, RadioGroup } from '../Radio';

// A radio's visual label is hidden from native screen readers (the control's
// accessible name carries it), so text queries must include hidden elements.
configure({ defaultIncludeHiddenElements: true });

const mockIconSpy = jest.fn();

jest.mock('../../Icon', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Icon: (props: { name: string }) => {
      mockIconSpy(props);
      return React.createElement(Text, { testID: `icon-${props.name}` }, props.name);
    },
  };
});

describe('Radio - behavior', () => {
  beforeEach(() => {
    mockIconSpy.mockClear();
  });

  it('fires onChange when the control is pressed', () => {
    const handleChange = jest.fn();
    const { getByRole } = render(<Radio value="one" label="One" onChange={handleChange} />);

    fireEvent.press(getByRole('radio'));
    expect(handleChange).toHaveBeenCalledWith('one');
  });

  it('invokes onChange when the label region is pressed', () => {
    const handleChange = jest.fn();
    const { getByText, getAllByRole } = render(<Radio value="label" label="Notify me" onChange={handleChange} />);

    fireEvent.press(getByText('Notify me'));
    expect(handleChange).toHaveBeenCalledWith('label');
    expect(getAllByRole('radio')).toHaveLength(1);
  });

  it('prevents presses when disabled', () => {
    const handleChange = jest.fn();
    const { getByRole, getByText } = render(<Radio value="off" label="Offline" onChange={handleChange} disabled />);

    fireEvent.press(getByRole('radio'));
    fireEvent.press(getByText('Offline'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('renders description text', () => {
    const { getByText } = render(
      <Radio value="help" label="Helpful" description="Small hint" onChange={() => {}} />
    );

    expect(getByText('Small hint')).toBeTruthy();
  });

  it('renders error text when provided', () => {
    const { getByText } = render(<Radio value="help" label="Helpful" error="Required" onChange={() => {}} />);

    expect(getByText('Required')).toBeTruthy();
  });

  it('renders the icon prop when a registry name is given', () => {
    const { getByTestId } = render(<Radio value="icon" label="Icon option" icon="star" onChange={() => {}} />);

    expect(getByTestId('icon-star')).toBeTruthy();
    expect(mockIconSpy).toHaveBeenCalledWith(expect.objectContaining({ name: 'star' }));
  });

  it('reports its checked state', () => {
    const { getByRole } = render(<Radio value="a" label="A" checked />);
    expect(getByRole('radio', { checked: true, name: 'A' })).toBeTruthy();
  });

  it('applies spacing props to its root', () => {
    const { toJSON } = render(<Radio value="a" label="A" mb={16} />);
    const root = toJSON() as { props: { style?: unknown } };
    expect(require('react-native').StyleSheet.flatten(root.props.style)).toMatchObject({ marginBottom: 16 });
  });
});

const findRadiogroup = (api: ReturnType<typeof render>) => {
  const node = api.UNSAFE_getAllByType(View).find((instance) => instance.props.role === 'radiogroup');
  if (!node) throw new Error('radiogroup view not found');
  return node;
};

describe('RadioGroup - behavior', () => {
  it('calls onChange with the option value', () => {
    const handleChange = jest.fn();
    const { getByTestId } = render(
      <RadioGroup
        value="basic"
        onChange={handleChange}
        options={[
          { label: 'Basic', value: 'basic' },
          { label: 'Pro', value: 'pro' },
        ]}
        testID="plan-group"
      />
    );

    fireEvent.press(getByTestId('plan-group-option-1'));
    expect(handleChange).toHaveBeenCalledWith('pro');
  });

  it('works uncontrolled from defaultValue', () => {
    const handleChange = jest.fn();
    const { getAllByRole, getByTestId } = render(
      <RadioGroup
        defaultValue="basic"
        onChange={handleChange}
        options={[
          { label: 'Basic', value: 'basic' },
          { label: 'Pro', value: 'pro' },
        ]}
        testID="plan"
      />
    );

    expect(getAllByRole('radio', { checked: true })).toHaveLength(1);
    fireEvent.press(getByTestId('plan-option-1'));
    expect(handleChange).toHaveBeenCalledWith('pro');
    expect(getAllByRole('radio')[1].props.accessibilityState.checked).toBe(true);
  });

  it('respects disabled options', () => {
    const handleChange = jest.fn();
    const { getByTestId } = render(
      <RadioGroup
        value="basic"
        onChange={handleChange}
        options={[
          { label: 'Basic', value: 'basic' },
          { label: 'Locked', value: 'locked', disabled: true },
        ]}
        testID="billing"
      />
    );

    fireEvent.press(getByTestId('billing-option-1'));
    expect(handleChange).not.toHaveBeenCalled();
  });

  it('exposes the radiogroup role, named by its label', () => {
    const api = render(
      <RadioGroup
        label="Choose plan"
        value="basic"
        options={[
          { label: 'Basic', value: 'basic' },
          { label: 'Pro', value: 'pro' },
        ]}
      />
    );

    const radiogroup = findRadiogroup(api);
    expect(radiogroup.props.accessibilityLabel ?? radiogroup.props['aria-label']).toBe('Choose plan');
  });

  it('sets checked and disabled state on child radios', () => {
    const { getAllByRole } = render(
      <RadioGroup
        value="pro"
        options={[
          { label: 'Basic', value: 'basic' },
          { label: 'Pro', value: 'pro' },
          { label: 'Locked', value: 'locked', disabled: true },
        ]}
      />
    );

    const radios = getAllByRole('radio');
    expect(radios[0].props.accessibilityState).toMatchObject({ checked: false, disabled: false });
    expect(radios[1].props.accessibilityState).toMatchObject({ checked: true, disabled: false });
    expect(radios[2].props.accessibilityState).toMatchObject({ checked: false, disabled: true });
  });

  it('renders a visual asterisk for required groups', () => {
    const { getByText } = render(
      <RadioGroup label="Choose plan" required value="basic" options={[{ label: 'Basic', value: 'basic' }]} />
    );

    expect(getByText(/Choose plan/)).toBeTruthy();
    expect(getByText(/\*/)).toBeTruthy();
  });

  it('moves selection forward with arrow keys', () => {
    const handleChange = jest.fn();
    const preventDefault = jest.fn();
    const { getAllByRole } = render(
      <RadioGroup
        value="basic"
        onChange={handleChange}
        options={[
          { label: 'Basic', value: 'basic' },
          { label: 'Pro', value: 'pro' },
        ]}
      />
    );

    fireEvent(getAllByRole('radio')[0], 'keyDown', {
      nativeEvent: { key: 'ArrowRight' },
      preventDefault,
    });

    expect(preventDefault).toHaveBeenCalled();
    expect(handleChange).toHaveBeenCalledWith('pro');
  });

  it('keeps moving on repeated arrow presses (focus follows the selection)', () => {
    const handleChange = jest.fn();
    const Controlled = () => {
      const [value, setValue] = React.useState('a');
      return (
        <RadioGroup
          value={value}
          onChange={(next) => {
            handleChange(next);
            setValue(next);
          }}
          options={[
            { label: 'A', value: 'a' },
            { label: 'B', value: 'b' },
            { label: 'C', value: 'c' },
          ]}
        />
      );
    };
    const { getAllByRole } = render(<Controlled />);

    fireEvent(getAllByRole('radio')[0], 'keyDown', { nativeEvent: { key: 'ArrowDown' } });
    fireEvent(getAllByRole('radio')[1], 'keyDown', { nativeEvent: { key: 'ArrowDown' } });
    fireEvent(getAllByRole('radio')[2], 'keyDown', { nativeEvent: { key: 'ArrowDown' } });

    expect(handleChange.mock.calls.map(([value]) => value)).toEqual(['b', 'c', 'a']);
  });

  it('skips disabled options when navigating with arrow keys', () => {
    const handleChange = jest.fn();
    const { getAllByRole } = render(
      <RadioGroup
        value="basic"
        onChange={handleChange}
        options={[
          { label: 'Basic', value: 'basic' },
          { label: 'Disabled', value: 'disabled', disabled: true },
          { label: 'Enterprise', value: 'enterprise' },
        ]}
      />
    );

    fireEvent(getAllByRole('radio')[0], 'keyDown', {
      nativeEvent: { key: 'ArrowRight' },
    });

    expect(handleChange).toHaveBeenCalledWith('enterprise');
  });

  it('shows helper text and error through the field frame', () => {
    const { getByText, queryByText, rerender } = render(
      <RadioGroup label="Plan" helperText="Pick one" options={[{ label: 'Basic', value: 'basic' }]} />
    );
    expect(getByText('Pick one')).toBeTruthy();

    rerender(
      <RadioGroup label="Plan" helperText="Pick one" error="Required" options={[{ label: 'Basic', value: 'basic' }]} />
    );
    expect(getByText('Required')).toBeTruthy();
    expect(queryByText('Pick one')).toBeNull();
  });
});
