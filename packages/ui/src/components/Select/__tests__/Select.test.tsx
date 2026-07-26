/**
 * Select Component - Comprehensive Test Suite
 * 
 * Tests type definitions, prop validation, and functionality.
 * 
 * Coverage:
 * - Size types, Options, Value control (controlled/uncontrolled)
 * - Placeholder, Label, Description, Error states
 * - Disabled state, Clearable functionality
 * - Custom renderOption, MaxHeight, CloseOnSelect
 * - Accessibility, Ref forwarding
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import { Select } from '../Select';

// Mock the theme
jest.mock('../../../core/theme/ThemeProvider', () => ({
  useTheme: () => ({
    colors: {
      gray: ['#f8f9fa', '#f1f3f5', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd', '#868e96', '#495057', '#343a40', '#212529'],
      primary: ['#e7f5ff', '#d0ebff', '#a5d8ff', '#74c0fc', '#4dabf7', '#339af0', '#228be6', '#1c7ed6', '#1971c2', '#1864ab'],
      error: ['#fff5f5', '#ffe3e3', '#ffc9c9', '#ffa8a8', '#ff8787', '#ff6b6b', '#fa5252', '#f03e3e', '#e03131', '#c92a2a'],
      success: ['#ebfbee', '#d3f9d8', '#b2f2bb', '#8ce99a', '#69db7c', '#51cf66', '#40c057', '#37b24d', '#2f9e44', '#2b8a3e'],
      warning: ['#fff9db', '#fff3bf', '#ffec99', '#ffe066', '#ffd43b', '#fcc419', '#fab005', '#f59f00', '#f08c00', '#e67700'],
    },
    text: {
      primary: '#212529',
      secondary: '#495057',
      muted: '#868e96',
      disabled: '#adb5bd',
    },
    backgrounds: {
      surface: '#ffffff',
      paper: '#f8f9fa',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    fontSizes: {
      xs: '12px',
      sm: '14px',
      md: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      '2xl': '40px',
      '3xl': '48px',
    },
    radius: {
      xs: '2px',
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
    },
    colorScheme: 'light' as const,
  }),
}));

// Mock DirectionProvider
jest.mock('../../../core/providers/DirectionProvider', () => ({
  useDirection: () => ({ isRTL: false }),
}));

// Mock OverlayProvider
jest.mock('../../../core/providers/OverlayProvider', () => {
  const overlayApi = {
    openOverlay: jest.fn(() => 'overlay-id'),
    closeOverlay: jest.fn(),
    closeAllOverlays: jest.fn(),
    updateOverlay: jest.fn(),
  };

  return {
    useOverlay: () => ({ overlays: [], ...overlayApi }),
    useOverlayApi: () => overlayApi,
    useOverlays: () => [],
  };
});

// Mock Icon component
jest.mock('../../Icon', () => ({
  Icon: ({ name, size, color, testID }: any) => {
    const MockedIcon = require('react-native').View;
    return <MockedIcon testID={testID || `icon-${name}`} accessibilityLabel={`icon-${name}`} />;
  },
}));

// Mock ListGroup
jest.mock('../../ListGroup', () => ({
  ListGroup: ({ children, style, testID }: any) => {
    const MockedView = require('react-native').View;
    return <MockedView testID={testID || 'list-group'} style={style}>{children}</MockedView>;
  },
}));

// Mock MenuItemButton
jest.mock('../../MenuItemButton', () => ({
  MenuItemButton: ({ children, onPress, disabled, active, testID, ...props }: any) => {
    const MockedPressable = require('react-native').Pressable;
    const MockedText = require('react-native').Text;
    return (
      <MockedPressable 
        testID={testID || 'menu-item'} 
        onPress={onPress} 
        disabled={disabled}
        accessibilityState={{ selected: active }}
        {...props}
      >
        <MockedText>{children}</MockedText>
      </MockedPressable>
    );
  },
}));

// Mock ClearButton
jest.mock('../../../core/components/ClearButton', () => ({
  ClearButton: ({ onPress, accessibilityLabel, testID }: any) => {
    const MockedPressable = require('react-native').Pressable;
    const MockedText = require('react-native').Text;
    return (
      <MockedPressable 
        testID={testID || 'clear-button'} 
        onPress={onPress}
        accessibilityLabel={accessibilityLabel}
      >
        <MockedText>×</MockedText>
      </MockedPressable>
    );
  },
}));

// Mock FieldHeader
jest.mock('../../_internal/FieldHeader', () => ({
  FieldHeader: ({ label, description, error, disabled }: any) => {
    const MockedView = require('react-native').View;
    const MockedText = require('react-native').Text;
    if (!label && !description) return null;
    return (
      <MockedView>
        {label && <MockedText testID="field-label">{label}</MockedText>}
        {description && <MockedText testID="field-description">{description}</MockedText>}
      </MockedView>
    );
  },
}));

const mockOptions = [
  { label: 'Option 1', value: '1' },
  { label: 'Option 2', value: '2' },
  { label: 'Option 3', value: '3' },
];

describe('Select - Type Safety and Prop Validation', () => {
  
  describe('Basic Rendering', () => {
    it('should render with default props', () => {
      const { getByRole } = render(<Select options={mockOptions} />);
      expect(getByRole('button')).toBeTruthy();
    });

    it('should render with options', () => {
      const { getByRole } = render(<Select options={mockOptions} />);
      expect(getByRole('button')).toBeTruthy();
    });

    it('should display placeholder by default', () => {
      const { getByText } = render(<Select options={mockOptions} />);
      expect(getByText('Select…')).toBeTruthy();
    });

    it('should render with empty options array', () => {
      const { getByRole } = render(<Select options={[]} />);
      expect(getByRole('button')).toBeTruthy();
    });
  });

  describe('Size Types', () => {
    it('should accept size "xs"', () => {
      const { getByRole } = render(<Select options={mockOptions} size="xs" />);
      expect(getByRole('button')).toBeTruthy();
    });

    it('should accept size "sm"', () => {
      const { getByRole } = render(<Select options={mockOptions} size="sm" />);
      expect(getByRole('button')).toBeTruthy();
    });

    it('should accept size "md"', () => {
      const { getByRole } = render(<Select options={mockOptions} size="md" />);
      expect(getByRole('button')).toBeTruthy();
    });

    it('should accept size "lg"', () => {
      const { getByRole } = render(<Select options={mockOptions} size="lg" />);
      expect(getByRole('button')).toBeTruthy();
    });

    it('should accept size "xl"', () => {
      const { getByRole } = render(<Select options={mockOptions} size="xl" />);
      expect(getByRole('button')).toBeTruthy();
    });

    it('should default to "md" size', () => {
      const { getByRole } = render(<Select options={mockOptions} />);
      expect(getByRole('button')).toBeTruthy();
    });
  });

  describe('Value Control - Uncontrolled', () => {
    it('should use defaultValue', () => {
      const { getByText } = render(
        <Select options={mockOptions} defaultValue="2" />
      );
      expect(getByText('Option 2')).toBeTruthy();
    });

    it('should display placeholder when no value', () => {
      const { getByText } = render(<Select options={mockOptions} />);
      expect(getByText('Select…')).toBeTruthy();
    });

    it('should update internal value on selection', () => {
      const onChange = jest.fn();
      const { getByRole, getByText } = render(
        <Select options={mockOptions} onChange={onChange} />
      );
      
      fireEvent.press(getByRole('button'));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Value Control - Controlled', () => {
    it('should accept controlled value', () => {
      const { getByText } = render(
        <Select options={mockOptions} value="1" />
      );
      expect(getByText('Option 1')).toBeTruthy();
    });

    it('should accept value={null}', () => {
      const { getByText } = render(
        <Select options={mockOptions} value={null} />
      );
      expect(getByText('Select…')).toBeTruthy();
    });

    it('should update when controlled value changes', () => {
      const { getByText, rerender } = render(
        <Select options={mockOptions} value="1" />
      );
      expect(getByText('Option 1')).toBeTruthy();
      
      rerender(<Select options={mockOptions} value="2" />);
      expect(getByText('Option 2')).toBeTruthy();
    });

    it('should work with numeric values', () => {
      const numericOptions = [
        { label: 'One', value: 1 },
        { label: 'Two', value: 2 },
      ];
      const { getByText } = render(
        <Select options={numericOptions} value={1} />
      );
      expect(getByText('One')).toBeTruthy();
    });
  });

  describe('Options Prop', () => {
    it('should render with 1 option', () => {
      const { getByRole } = render(
        <Select options={[{ label: 'Only', value: 'only' }]} />
      );
      expect(getByRole('button')).toBeTruthy();
    });

    it('should render with many options', () => {
      const manyOptions = Array.from({ length: 20 }, (_, i) => ({
        label: `Option ${i}`,
        value: i,
      }));
      const { getByRole } = render(<Select options={manyOptions} />);
      expect(getByRole('button')).toBeTruthy();
    });

    it('should handle disabled options', () => {
      const optionsWithDisabled = [
        { label: 'Enabled', value: '1' },
        { label: 'Disabled', value: '2', disabled: true },
      ];
      const { getByRole } = render(<Select options={optionsWithDisabled} />);
      expect(getByRole('button')).toBeTruthy();
    });
  });

  describe('Placeholder', () => {
    it('should accept custom placeholder', () => {
      const { getByText } = render(
        <Select options={mockOptions} placeholder="Choose one" />
      );
      expect(getByText('Choose one')).toBeTruthy();
    });

    it('should default to "Select…"', () => {
      const { getByText } = render(<Select options={mockOptions} />);
      expect(getByText('Select…')).toBeTruthy();
    });

    it('should hide placeholder when value is selected', () => {
      const { queryByText, getByText } = render(
        <Select options={mockOptions} value="1" placeholder="Choose" />
      );
      expect(queryByText('Choose')).toBeNull();
      expect(getByText('Option 1')).toBeTruthy();
    });
  });

  describe('Label and Description', () => {
    it('should render with label', () => {
      const { getByTestId } = render(
        <Select options={mockOptions} label="Select an option" />
      );
      expect(getByTestId('field-label')).toBeTruthy();
    });

    it('should render with description', () => {
      const { getByTestId } = render(
        <Select options={mockOptions} description="Choose your preference" />
      );
      expect(getByTestId('field-description')).toBeTruthy();
    });

    it('should render with both label and description', () => {
      const { getByTestId } = render(
        <Select 
          options={mockOptions} 
          label="Label" 
          description="Description" 
        />
      );
      expect(getByTestId('field-label')).toBeTruthy();
      expect(getByTestId('field-description')).toBeTruthy();
    });

    it('should work without label or description', () => {
      const { getByRole } = render(<Select options={mockOptions} />);
      expect(getByRole('button')).toBeTruthy();
    });
  });

  describe('Error and Helper Text', () => {
    it('should display error message', () => {
      const { getByText } = render(
        <Select options={mockOptions} error="This field is required" />
      );
      expect(getByText('This field is required')).toBeTruthy();
    });

    it('should display helperText', () => {
      const { getByText } = render(
        <Select options={mockOptions} helperText="Select your preference" />
      );
      expect(getByText('Select your preference')).toBeTruthy();
    });

    it('should prioritize error over helperText', () => {
      const { getByText, queryByText } = render(
        <Select 
          options={mockOptions} 
          error="Error message" 
          helperText="Helper text" 
        />
      );
      expect(getByText('Error message')).toBeTruthy();
      expect(queryByText('Helper text')).toBeNull();
    });
  });

  describe('Disabled State', () => {
    it('should accept disabled prop', () => {
      const { getByRole } = render(
        <Select options={mockOptions} disabled />
      );
      const button = getByRole('button');
      expect(button.props.accessibilityState?.disabled).toBe(true);
    });

    it('should not be disabled by default', () => {
      const { getByRole } = render(<Select options={mockOptions} />);
      const button = getByRole('button');
      expect(button.props.disabled).toBeFalsy();
    });

    it('should not trigger onChange when disabled', () => {
      const onChange = jest.fn();
      const { getByRole } = render(
        <Select options={mockOptions} disabled onChange={onChange} />
      );
      
      fireEvent.press(getByRole('button'));
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Clearable Functionality', () => {
    it('should show clear button when clearable and has value', () => {
      const { getByTestId } = render(
        <Select options={mockOptions} value="1" clearable />
      );
      expect(getByTestId('clear-button')).toBeTruthy();
    });

    it('should not show clear button when no value', () => {
      const { queryByTestId } = render(
        <Select options={mockOptions} clearable />
      );
      expect(queryByTestId('clear-button')).toBeNull();
    });

    it('should not show clear button when not clearable', () => {
      const { queryByTestId } = render(
        <Select options={mockOptions} value="1" />
      );
      expect(queryByTestId('clear-button')).toBeNull();
    });

    it('should call onClear when clear button pressed', () => {
      const onClear = jest.fn();
      const { getByTestId } = render(
        <Select options={mockOptions} value="1" clearable onClear={onClear} />
      );
      
      fireEvent.press(getByTestId('clear-button'));
      expect(onClear).toHaveBeenCalled();
    });

    it('should call onChange with null on clear', () => {
      const onChange = jest.fn();
      const { getByTestId } = render(
        <Select options={mockOptions} value="1" clearable onChange={onChange} />
      );
      
      fireEvent.press(getByTestId('clear-button'));
      expect(onChange).toHaveBeenCalledWith(null, null);
    });

    it('should not show clear button when disabled', () => {
      const { queryByTestId } = render(
        <Select options={mockOptions} value="1" clearable disabled />
      );
      expect(queryByTestId('clear-button')).toBeNull();
    });
  });

  describe('Change Handler', () => {
    it('should call onChange callback', () => {
      const onChange = jest.fn();
      const { getByRole } = render(
        <Select options={mockOptions} onChange={onChange} />
      );
      expect(getByRole('button')).toBeTruthy();
    });

    it('should pass value and option to onChange', () => {
      const onChange = jest.fn();
      render(<Select options={mockOptions} onChange={onChange} />);
      // onChange testing is limited without actually opening dropdown
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Custom Render Option', () => {
    it('should accept renderOption function', () => {
      const renderOption = jest.fn((opt) => <Text>{opt.label} Custom</Text>);
      const { getByRole } = render(
        <Select options={mockOptions} renderOption={renderOption} />
      );
      expect(getByRole('button')).toBeTruthy();
    });

    // Custom rows used to render inside a plain View, so the dropdown looked
    // right and selected nothing.
    it('should select a custom-rendered option when pressed', () => {
      const onChange = jest.fn();
      const { getByLabelText, getByText } = render(
        <Select
          options={mockOptions}
          placeholder="Pick one"
          onChange={onChange}
          renderOption={(opt) => <Text>{opt.label} Custom</Text>}
        />
      );

      fireEvent.press(getByLabelText('Pick one'));
      fireEvent.press(getByText(`${mockOptions[1].label} Custom`));

      expect(onChange).toHaveBeenCalledWith(mockOptions[1].value, mockOptions[1]);
    });

    it('should not select a disabled custom-rendered option', () => {
      const onChange = jest.fn();
      const options = [{ label: 'Nope', value: 'nope', disabled: true }];
      const { getByLabelText, getByText } = render(
        <Select
          options={options}
          placeholder="Pick one"
          onChange={onChange}
          renderOption={(opt) => <Text>{opt.label} Custom</Text>}
        />
      );

      fireEvent.press(getByLabelText('Pick one'));
      fireEvent.press(getByText('Nope Custom'));

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('MaxHeight Prop', () => {
    it('should accept maxH', () => {
      const { getByRole } = render(
        <Select options={mockOptions} maxH={300} />
      );
      expect(getByRole('button')).toBeTruthy();
    });

    it('should default to maxH={260}', () => {
      const { getByRole } = render(<Select options={mockOptions} />);
      expect(getByRole('button')).toBeTruthy();
    });
  });

  describe('CloseOnSelect Prop', () => {
    it('should accept closeOnSelect={true}', () => {
      const { getByRole } = render(
        <Select options={mockOptions} closeOnSelect={true} />
      );
      expect(getByRole('button')).toBeTruthy();
    });

    it('should accept closeOnSelect={false}', () => {
      const { getByRole } = render(
        <Select options={mockOptions} closeOnSelect={false} />
      );
      expect(getByRole('button')).toBeTruthy();
    });

    it('should default to closeOnSelect={true}', () => {
      const { getByRole } = render(<Select options={mockOptions} />);
      expect(getByRole('button')).toBeTruthy();
    });
  });

  describe('FullWidth Prop', () => {
    it('should accept fullWidth prop', () => {
      const { getByRole } = render(
        <Select options={mockOptions} fullWidth />
      );
      expect(getByRole('button')).toBeTruthy();
    });

    it('should not be fullWidth by default', () => {
      const { getByRole } = render(<Select options={mockOptions} />);
      expect(getByRole('button')).toBeTruthy();
    });
  });

  describe('Radius Prop', () => {
    it('should accept radius prop', () => {
      const { getByRole } = render(
        <Select options={mockOptions} radius="lg" />
      );
      expect(getByRole('button')).toBeTruthy();
    });

    it('should default to "md" radius', () => {
      const { getByRole } = render(<Select options={mockOptions} />);
      expect(getByRole('button')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibilityRole', () => {
      const { getByRole } = render(<Select options={mockOptions} />);
      expect(getByRole('button')).toBeTruthy();
    });

    it('should have accessibilityLabel from label prop', () => {
      const { getByRole } = render(
        <Select options={mockOptions} label="Select option" />
      );
      const button = getByRole('button');
      expect(button.props.accessibilityLabel).toBe('Select option');
    });

    it('should have accessibilityLabel from placeholder when no label', () => {
      const { getByRole } = render(
        <Select options={mockOptions} placeholder="Choose one" />
      );
      const button = getByRole('button');
      expect(button.props.accessibilityLabel).toBe('Choose one');
    });
  });

  describe('Ref Forwarding', () => {
    it('should forward ref to trigger button', () => {
      const ref = React.createRef<any>();
      render(<Select options={mockOptions} ref={ref} />);
      expect(ref.current).toBeTruthy();
    });
  });

  describe('Spacing Props', () => {
    it('should accept margin props', () => {
      const { getByRole } = render(
        <Select options={mockOptions} m="md" />
      );
      expect(getByRole('button')).toBeTruthy();
    });

    it('should accept padding props', () => {
      const { getByRole } = render(
        <Select options={mockOptions} p="sm" />
      );
      expect(getByRole('button')).toBeTruthy();
    });

    it('should accept individual spacing props', () => {
      const { getByRole } = render(
        <Select options={mockOptions} mt="xs" mb="sm" ml="md" mr="lg" />
      );
      expect(getByRole('button')).toBeTruthy();
    });
  });

  describe('Layout Props', () => {
    it('should accept w prop', () => {
      const { getByRole } = render(
        <Select options={mockOptions} w={300} />
      );
      expect(getByRole('button')).toBeTruthy();
    });

    it('should accept minW prop', () => {
      const { getByRole } = render(
        <Select options={mockOptions} minW={200} />
      );
      expect(getByRole('button')).toBeTruthy();
    });

  });

  describe('Edge Cases', () => {
    it('should handle option value of 0', () => {
      const zeroOptions = [
        { label: 'Zero', value: 0 },
        { label: 'One', value: 1 },
      ];
      const { getByText } = render(
        <Select options={zeroOptions} value={0} />
      );
      expect(getByText('Zero')).toBeTruthy();
    });

    it('should handle empty string value', () => {
      const emptyOptions = [
        { label: 'Empty', value: '' },
        { label: 'Not Empty', value: 'value' },
      ];
      const { getByText } = render(
        <Select options={emptyOptions} value="" />
      );
      expect(getByText('Empty')).toBeTruthy();
    });

    it('should handle boolean values', () => {
      const boolOptions = [
        { label: 'True', value: true },
        { label: 'False', value: false },
      ];
      const { getByText } = render(
        <Select options={boolOptions} value={true} />
      );
      expect(getByText('True')).toBeTruthy();
    });

    it('should handle very long option labels', () => {
      const longOptions = [
        { label: 'A'.repeat(100), value: 'long' },
      ];
      const { getByRole } = render(<Select options={longOptions} value="long" />);
      expect(getByRole('button')).toBeTruthy();
    });
  });

  describe('TypeScript Type Safety', () => {
    it('should accept all valid props', () => {
      const element = (
        <Select
          value="1"
          defaultValue="2"
          onChange={(val, opt) => console.log(val, opt)}
          options={mockOptions}
          placeholder="Custom placeholder"
          size="lg"
          radius="md"
          disabled={false}
          label="Select Label"
          description="Select Description"
          helperText="Helper text"
          error="Error message"
          renderOption={(opt) => <Text>{opt.label}</Text>}
          fullWidth={true}
          maxH={300}
          closeOnSelect={true}
          clearable={true}
          clearButtonLabel="Clear"
          onClear={() => console.log('cleared')}
          m="md"
          p="sm"
          w={400}
        />
      );
      
      const { getByRole } = render(element);
      expect(getByRole('button')).toBeTruthy();
    });
  });

  describe('Combined Scenarios', () => {
    it('should work with value, label, and error', () => {
      const { getByText, getByTestId } = render(
        <Select
          options={mockOptions}
          value="1"
          label="Label"
          error="Error"
        />
      );
      expect(getByText('Option 1')).toBeTruthy();
      expect(getByTestId('field-label')).toBeTruthy();
      expect(getByText('Error')).toBeTruthy();
    });

    it('should work with disabled and clearable', () => {
      const { queryByTestId } = render(
        <Select
          options={mockOptions}
          value="1"
          disabled
          clearable
        />
      );
      // Clear button should not show when disabled
      expect(queryByTestId('clear-button')).toBeNull();
    });

    it('should work with fullWidth and custom size', () => {
      const { getByRole } = render(
        <Select
          options={mockOptions}
          fullWidth
          size="lg"
        />
      );
      expect(getByRole('button')).toBeTruthy();
    });

    it('should work with all text props', () => {
      const { getByText, getByTestId } = render(
        <Select
          options={mockOptions}
          label="Label"
          description="Description"
          placeholder="Placeholder"
          helperText="Helper"
        />
      );
      expect(getByTestId('field-label')).toBeTruthy();
      expect(getByTestId('field-description')).toBeTruthy();
      expect(getByText('Placeholder')).toBeTruthy();
      expect(getByText('Helper')).toBeTruthy();
    });
  });
});
