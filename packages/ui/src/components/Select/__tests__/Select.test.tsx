/**
 * Select (native).
 *
 * Native renders the mobile presentation: the trigger is a `button` (value read
 * through `aria-valuetext`), and the options open in the shared DropdownSheet.
 * The anchored (desktop web) path is covered by Select.persistentMenu.test.tsx
 * and the DOM tests in __web_tests__.
 */

import React from 'react';
import { Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

import type { FieldHandle } from '../../../core/types/base';
import { Select } from '../Select';

// Surfaces which glyph rendered, so the check mark is queryable.
jest.mock('../../Icon', () => ({
  Icon: ({ name }: { name: string }) => {
    const MockedView = require('react-native').View;
    return <MockedView testID={`icon-${name}`} />;
  },
}));

const options = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3' },
];

const trigger = () => screen.getByTestId('select-trigger');

/**
 * RN's Pressable turns `aria-*` into `accessibilityState` / `accessibilityLabel`
 * / `accessibilityValue` on the host view; read either form.
 */
const a11y = (node: { props: Record<string, any> }) => ({
  label: node.props.accessibilityLabel ?? node.props['aria-label'],
  expanded: node.props.accessibilityState?.expanded ?? node.props['aria-expanded'],
  selected: node.props.accessibilityState?.selected ?? node.props['aria-selected'],
  disabled: node.props.accessibilityState?.disabled ?? node.props['aria-disabled'],
  valueText: node.props.accessibilityValue?.text ?? node.props['aria-valuetext'],
});
const open = () => fireEvent.press(trigger());

describe('Select (native)', () => {
  describe('rendering', () => {
    it('renders the placeholder until a value is chosen', () => {
      render(<Select testID="select" options={options} />);
      expect(screen.getByText('Select…')).toBeTruthy();
    });

    it('accepts a custom placeholder', () => {
      render(<Select testID="select" options={options} placeholder="Choose one" />);
      expect(screen.getByText('Choose one')).toBeTruthy();
    });

    it('renders an empty options list', () => {
      render(<Select testID="select" options={[]} />);
      open();
      expect(screen.getByText('Nothing found')).toBeTruthy();
    });

    it.each(['xs', 'sm', 'md', 'lg', 'xl'] as const)('renders at size %s', (size) => {
      render(<Select testID="select" options={options} size={size} />);
      expect(trigger()).toBeTruthy();
    });

    it('renders label, description, helper text and error through the field frame', () => {
      render(
        <Select
          testID="select"
          options={options}
          label="Label"
          description="Description"
          helperText="Helper"
          error="Error message"
        />
      );
      expect(screen.getByText('Label')).toBeTruthy();
      expect(screen.getByText('Description')).toBeTruthy();
      // The error replaces the helper text and is announced.
      expect(screen.getByText('Error message')).toBeTruthy();
      expect(screen.queryByText('Helper')).toBeNull();
      expect(screen.getByRole('alert')).toBeTruthy();
    });

    it('accepts a ReactNode label', () => {
      render(<Select testID="select" options={options} label={<Text>Rich label</Text>} />);
      expect(screen.getByText('Rich label')).toBeTruthy();
    });
  });

  describe('value', () => {
    it('shows defaultValue (uncontrolled)', () => {
      render(<Select testID="select" options={options} defaultValue="2" />);
      expect(screen.getByText('Option 2')).toBeTruthy();
    });

    it('follows a controlled value, including null', () => {
      const { rerender } = render(<Select testID="select" options={options} value="1" />);
      expect(screen.getByText('Option 1')).toBeTruthy();
      rerender(<Select testID="select" options={options} value="2" />);
      expect(screen.getByText('Option 2')).toBeTruthy();
      rerender(<Select testID="select" options={options} value={null} />);
      expect(screen.getByText('Select…')).toBeTruthy();
    });

    it('selects an option from the sheet and reports value + option', () => {
      const onChange = jest.fn();
      render(<Select testID="select" options={options} onChange={onChange} />);
      open();
      fireEvent.press(screen.getByText('Option 2'));
      expect(onChange).toHaveBeenCalledWith('2', options[1]);
      // Uncontrolled: the trigger shows the new value and the sheet closed.
      expect(screen.getByText('Option 2')).toBeTruthy();
      expect(screen.queryByText('Option 3')).toBeNull();
    });

    it('keeps the sheet open with closeOnSelect={false}', () => {
      render(<Select testID="select" options={options} closeOnSelect={false} />);
      open();
      fireEvent.press(screen.getByText('Option 2'));
      expect(screen.getByText('Option 3')).toBeTruthy();
      expect(a11y(trigger()).expanded).toBe(true);
    });

    it('does not select disabled options', () => {
      const onChange = jest.fn();
      render(
        <Select
          testID="select"
          options={[{ label: 'Enabled', value: 'a' }, { label: 'Disabled', value: 'b', disabled: true }]}
          onChange={onChange}
        />
      );
      open();
      fireEvent.press(screen.getByText('Disabled'));
      expect(onChange).not.toHaveBeenCalled();
    });

    it.each([
      ['zero', [{ label: 'Zero', value: 0 }, { label: 'One', value: 1 }], 0, 'Zero'],
      ['empty string', [{ label: 'Empty', value: '' }, { label: 'Other', value: 'x' }], '', 'Empty'],
      ['boolean', [{ label: 'True', value: true }, { label: 'False', value: false }], true, 'True'],
    ])('handles %s values', (_name, opts, value, expected) => {
      render(<Select testID="select" options={opts as { label: string; value: unknown }[]} value={value} />);
      expect(screen.getByText(expected as string)).toBeTruthy();
    });

    it('renders option descriptions in the list', () => {
      render(
        <Select testID="select" options={[{ label: 'Tennis', value: 't', description: 'Sets decided by serve' }]} />
      );
      open();
      expect(screen.getByText('Sets decided by serve')).toBeTruthy();
    });
  });

  describe('searchable', () => {
    it('filters options by the query', () => {
      render(<Select testID="select" options={options} searchable />);
      open();
      fireEvent.changeText(screen.getByLabelText('Search…'), '3');
      expect(screen.getByText('Option 3')).toBeTruthy();
      expect(screen.queryByText('Option 1')).toBeNull();
      fireEvent.changeText(screen.getByLabelText('Search…'), 'zzz');
      expect(screen.getByText('Nothing found')).toBeTruthy();
    });
  });

  describe('clearable', () => {
    it('shows a labelled clear button only with a value', () => {
      const { rerender } = render(<Select testID="select" options={options} clearable />);
      expect(screen.queryByLabelText('Clear selection')).toBeNull();
      rerender(<Select testID="select" options={options} clearable value="1" />);
      expect(screen.getByLabelText('Clear selection')).toBeTruthy();
    });

    it('clears to null and calls onClear', () => {
      const onChange = jest.fn();
      const onClear = jest.fn();
      render(
        <Select testID="select" options={options} value="1" clearable clearButtonLabel="Clear" onChange={onChange} onClear={onClear} />
      );
      fireEvent.press(screen.getByLabelText('Clear'));
      expect(onChange).toHaveBeenCalledWith(null, null);
      expect(onClear).toHaveBeenCalled();
    });

    it('hides the clear button when disabled', () => {
      render(<Select testID="select" options={options} value="1" clearable disabled />);
      expect(screen.queryByLabelText('Clear selection')).toBeNull();
    });
  });

  describe('disabled / readOnly', () => {
    it('does not open when disabled', () => {
      render(<Select testID="select" options={options} disabled />);
      expect(a11y(trigger()).disabled).toBe(true);
      open();
      expect(screen.queryByText('Option 1')).toBeNull();
    });

    it('does not open when readOnly', () => {
      render(<Select testID="select" options={options} readOnly defaultValue="1" />);
      open();
      expect(screen.queryByText('Option 2')).toBeNull();
    });
  });

  describe('renderOption', () => {
    it('selects a custom-rendered option when pressed', () => {
      const onChange = jest.fn();
      render(
        <Select
          testID="select"
          options={options}
          onChange={onChange}
          renderOption={(opt) => <Text>{opt.label} Custom</Text>}
        />
      );
      open();
      fireEvent.press(screen.getByText('Option 2 Custom'));
      expect(onChange).toHaveBeenCalledWith('2', options[1]);
    });

    it('keeps custom rows accessible options named by their label', () => {
      render(
        <Select testID="select" options={options} value="2" renderOption={(opt) => <Text>{opt.label} Custom</Text>} />
      );
      open();
      const row = screen.getByRole('option', { name: 'Option 2' });
      expect(a11y(row).selected).toBe(true);
    });

    it('does not select a disabled custom-rendered option', () => {
      const onChange = jest.fn();
      render(
        <Select
          testID="select"
          options={[{ label: 'Nope', value: 'nope', disabled: true }]}
          onChange={onChange}
          renderOption={(opt) => <Text>{opt.label} Custom</Text>}
        />
      );
      open();
      fireEvent.press(screen.getByText('Nope Custom'));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('is a button named by the label, with the value as its value text', () => {
      render(<Select testID="select" options={options} label="Sport" value="2" />);
      const button = screen.getByRole('button', { name: 'Sport' });
      expect(button).toBe(trigger());
      expect(a11y(button).valueText).toBe('Option 2');
      expect(a11y(button).expanded).toBe(false);
    });

    it('announces required and falls back to the placeholder as its name', () => {
      const { rerender } = render(<Select testID="select" options={options} label="Sport" required />);
      expect(a11y(trigger()).label).toBe('Sport, required');
      rerender(<Select testID="select" options={options} placeholder="Choose one" />);
      expect(a11y(trigger()).label).toBe('Choose one');
    });

    it('reports expanded while open and marks the selected option', () => {
      render(<Select testID="select" options={options} value="3" />);
      open();
      expect(a11y(trigger()).expanded).toBe(true);
      const selected = screen.getAllByRole('option').filter((node) => a11y(node).selected);
      expect(selected).toHaveLength(1);
      expect(screen.getAllByTestId('icon-check')).toHaveLength(1);
    });
  });

  describe('ref', () => {
    it('exposes a FieldHandle that can clear the selection', () => {
      const ref = React.createRef<FieldHandle>();
      const onChange = jest.fn();
      render(<Select testID="select" ref={ref} options={options} defaultValue="1" onChange={onChange} />);
      expect(typeof ref.current?.focus).toBe('function');
      expect(typeof ref.current?.blur).toBe('function');
      ref.current?.clear?.();
      expect(onChange).toHaveBeenCalledWith(null, null);
    });
  });

  describe('layout and spacing props', () => {
    it('accepts spacing, layout, style and fullWidth', () => {
      render(
        <Select testID="select" options={options} m="md" p="sm" w={300} miw={200} fullWidth style={{ opacity: 1 }} />
      );
      expect(screen.getByTestId('select')).toBeTruthy();
    });

    it('sizes the root with the box props; an explicit `w` wins over `fullWidth`', () => {
      const rootStyle = (element: React.ReactElement) => {
        render(element);
        return Object.assign({}, ...[screen.getByTestId('select').props.style].flat(Infinity).filter(Boolean));
      };
      expect(rootStyle(<Select testID="select" options={options} />)).toMatchObject({ width: 'auto', minWidth: 200 });
      const sized = rootStyle(<Select testID="select" options={options} w={300} fullWidth />);
      expect(sized.width).toBe(300);
      expect(sized.minWidth).toBeUndefined();
      expect(rootStyle(<Select testID="select" options={options} miw={120} />).minWidth).toBe(120);
    });

    it('treats maxDropdownHeight as the dropdown height, not the field height', () => {
      render(<Select testID="select" options={options} maxDropdownHeight={120} />);
      const root = screen.getByTestId('select');
      const flat = Object.assign({}, ...[root.props.style].flat(Infinity).filter(Boolean));
      expect(flat.maxHeight).toBeUndefined();
    });
  });
});

describe('generic value type', () => {
  it('infers the value type from options (compile-time check)', () => {
    const numeric = [{ label: 'One', value: 1 }];
    const element = (
      <Select
        options={numeric}
        onChange={(value) => {
          // @ts-expect-error — `value` is `number | null`, not `string`.
          const text: string = value;
          return text;
        }}
      />
    );
    expect(element).toBeTruthy();
  });
});
