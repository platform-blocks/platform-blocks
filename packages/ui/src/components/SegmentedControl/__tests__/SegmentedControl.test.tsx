import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { SegmentedControl } from '../SegmentedControl';

const mockPalette = {
  colors: {
    primary: ['#EFF6FF', '#DBEAFE', '#BFDBFE', '#93C5FD', '#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8'],
    gray: ['#F8FAFC', '#F1F5F9', '#E2E8F0', '#CBD5F5', '#94A3B8', '#64748B'],
    surface: ['#FFFFFF'],
  },
};

jest.mock('../../../core/theme/ThemeProvider', () => {
  const actual = jest.requireActual('../../../core/theme/ThemeProvider');
  const { DEFAULT_THEME } = jest.requireActual('../../../core/theme/defaultTheme');
  let theme: unknown;
  return {
    ...actual,
    // Built lazily: this factory runs before the module-scope palette is initialized.
    useTheme: () => (theme ??= { ...DEFAULT_THEME, colors: { ...DEFAULT_THEME.colors, ...mockPalette.colors } }),
  };
});

jest.mock('../../../core/motion/useReducedMotion', () => ({
  useReducedMotion: () => false,
}));

jest.mock('../../../core/providers/DirectionProvider', () => ({
  useDirection: () => ({ isRTL: false }),
}));

jest.mock('../../Text', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Text: ({ children, ...props }: any) => React.createElement(Text, props, children),
  };
});

jest.mock('../../_internal/FieldHeader', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  return {
    FieldHeader: ({ label, description }: any) => (
      React.createElement(
        View,
        null,
        label ? React.createElement(Text, null, label) : null,
        description ? React.createElement(Text, null, description) : null
      )
    ),
  };
});

const flattenStyle = (style: any): Record<string, any> => {
  if (!style) return {};
  if (Array.isArray(style)) {
    return style.reduce((acc, item) => ({ ...acc, ...flattenStyle(item) }), {});
  }
  return typeof style === 'object' ? style : {};
};

describe('SegmentedControl - behavior', () => {
  it('selects the first enabled value by default when initial item is disabled', () => {
    const { getByTestId } = render(
      <SegmentedControl
        data={[
          { value: 'draft', label: 'Drafts', disabled: true, testID: 'seg-draft' },
          { value: 'sent', label: 'Sent', testID: 'seg-sent' },
        ]}
      />
    );

    expect(getByTestId('seg-draft')).not.toBeChecked();
    expect(getByTestId('seg-sent')).toBeChecked();
  });

  it('invokes onChange and updates selection in uncontrolled mode', () => {
    const handleChange = jest.fn();
    const { getByTestId } = render(
      <SegmentedControl
        defaultValue="daily"
        onChange={handleChange}
        data={[
          { value: 'daily', label: 'Daily', testID: 'seg-daily' },
          { value: 'weekly', label: 'Weekly', testID: 'seg-weekly' },
        ]}
      />
    );

    fireEvent.press(getByTestId('seg-weekly'));
    expect(handleChange).toHaveBeenCalledWith('weekly');
    expect(getByTestId('seg-weekly')).toBeChecked();
    expect(getByTestId('seg-daily')).not.toBeChecked();
  });

  it('does not emit changes when the control is readOnly', () => {
    const handleChange = jest.fn();
    const { getByTestId } = render(
      <SegmentedControl
        readOnly
        value="daily"
        onChange={handleChange}
        data={[
          { value: 'daily', label: 'Daily', testID: 'seg-daily' },
          { value: 'weekly', label: 'Weekly', testID: 'seg-weekly' },
        ]}
      />
    );

    fireEvent.press(getByTestId('seg-weekly'));
    expect(handleChange).not.toHaveBeenCalled();
    expect(getByTestId('seg-daily')).toBeChecked();
  });

  it('honors the controlled value and only updates after rerender', () => {
    const handleChange = jest.fn();
    const data = [
      { value: 'monthly', label: 'Monthly', testID: 'seg-monthly' },
      { value: 'quarterly', label: 'Quarterly', testID: 'seg-quarterly' },
    ];

    const { getByTestId, rerender } = render(
      <SegmentedControl value="monthly" onChange={handleChange} data={data} />
    );

    fireEvent.press(getByTestId('seg-quarterly'));
    expect(handleChange).toHaveBeenCalledWith('quarterly');
    expect(getByTestId('seg-quarterly')).not.toBeChecked();

    rerender(<SegmentedControl value="quarterly" onChange={handleChange} data={data} />);
    expect(getByTestId('seg-quarterly')).toBeChecked();
    expect(getByTestId('seg-monthly')).not.toBeChecked();
  });

  it('applies divider styles when withItemsBorders is enabled', () => {
    // Explicit variant="default" — the divider color is variant-dependent and
    // the default variant changed; this test asserts the 'default' variant's
    // dotted divider color specifically.
    const { getByTestId } = render(
      <SegmentedControl
        variant="default"
        withItemsBorders
        defaultValue="reports"
        data={[
          { value: 'overview', label: 'Overview', testID: 'seg-overview' },
          { value: 'analytics', label: 'Analytics', testID: 'seg-analytics' },
          { value: 'reports', label: 'Reports', testID: 'seg-reports' },
        ]}
      />
    );

    // Logical (end) divider, in the theme's strong border color.
    const firstItemStyles = flattenStyle(getByTestId('seg-overview').props.style);
    expect(firstItemStyles.borderEndWidth).toBe(StyleSheet.hairlineWidth);
    expect(firstItemStyles.borderEndColor).toBe('#D1D1D6');
  });

  it('names each segment and exposes the radio group semantics', () => {
    const { getByRole } = render(
      <SegmentedControl
        defaultValue="list"
        data={[
          { value: 'list', label: 'List' },
          { value: 'grid', label: 'Grid', disabled: true },
        ]}
      />
    );

    expect(getByRole('radio', { name: 'List', checked: true })).toBeTruthy();
    expect(getByRole('radio', { name: 'Grid', checked: false, disabled: true })).toBeTruthy();
  });

  describe('box props', () => {
    const data = [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B' },
    ];

    it('sizes the control and stops it hugging its items; an explicit `w` wins over `fullWidth`', () => {
      const hugged = render(<SegmentedControl testID="hug" data={data} />);
      expect(flattenStyle(hugged.getByTestId('hug').props.style).alignSelf).toBe('flex-start');

      const sized = render(<SegmentedControl testID="sized" data={data} fullWidth w={240} />);
      const style = flattenStyle(sized.getByTestId('sized').props.style);
      expect(style.width).toBe(240);
      expect(style.alignSelf).toBeUndefined();
    });

    it('sizes the label wrapper, not the control, when there is a label', () => {
      const { getByTestId, toJSON } = render(<SegmentedControl testID="sc" label="View" data={data} w={240} />);
      expect(flattenStyle((toJSON() as any).props.style).width).toBe(240);
      expect(flattenStyle(getByTestId('sc').props.style).width).toBeUndefined();
    });
  });
});
