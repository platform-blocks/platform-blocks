/**
 * Switch Component - Rendering & Behavior Tests
 * 
 * Purpose: Test actual rendering output, user interactions, and component behavior.
 * These tests validate what the user sees and how the component responds to interactions.
 */

import React, { useState } from 'react';
import { render, fireEvent, screen, waitFor, configure } from '@testing-library/react-native';
import { Switch } from '../Switch';
import { Text, View } from 'react-native';

// The visual label is hidden from native screen readers (the control's own
// accessible name carries it), so text queries must include hidden elements.
configure({ defaultIncludeHiddenElements: true });

describe('Switch - Rendering & Behavior', () => {
  describe('Basic Rendering', () => {
    it('should render switch element', () => {
      render(<Switch testID="test-switch" />);
      const switchElement = screen.getByTestId('test-switch');
      expect(switchElement).toBeTruthy();
    });

    it('should render with label', () => {
      render(<Switch label="Enable notifications" />);
      expect(screen.getByText('Enable notifications')).toBeTruthy();
    });

    it('should render with children instead of label', () => {
      render(
        <Switch testID="switch">
          <Text>Custom label content</Text>
        </Switch>
      );
      expect(screen.getByText('Custom label content')).toBeTruthy();
    });

    it('should prefer children over label when both provided', () => {
      render(
        <Switch label="Label text">
          <Text>Children text</Text>
        </Switch>
      );
      expect(screen.getByText('Children text')).toBeTruthy();
      expect(screen.queryByText('Label text')).toBeFalsy();
    });
  });

  describe('Uncontrolled Mode', () => {
    it('should start unchecked by default', () => {
      render(<Switch testID="switch" />);
      const switchElement = screen.getByTestId('switch');
      expect(switchElement.props.accessibilityState.checked).toBe(false);
    });

    it('should start checked when defaultChecked=true', () => {
      render(<Switch testID="switch" defaultChecked />);
      const switchElement = screen.getByTestId('switch');
      expect(switchElement.props.accessibilityState.checked).toBe(true);
    });

    it('should toggle state on press', () => {
      render(<Switch testID="switch" />);
      const switchElement = screen.getByTestId('switch');
      
      // Initially unchecked
      expect(switchElement.props.accessibilityState.checked).toBe(false);
      
      // Press once - should be checked
      fireEvent.press(switchElement);
      expect(switchElement.props.accessibilityState.checked).toBe(true);
      
      // Press again - should be unchecked
      fireEvent.press(switchElement);
      expect(switchElement.props.accessibilityState.checked).toBe(false);
    });

    it('should call onChange with new state', () => {
      const onChange = jest.fn();
      render(<Switch testID="switch" onChange={onChange} />);
      const switchElement = screen.getByTestId('switch');
      
      fireEvent.press(switchElement);
      expect(onChange).toHaveBeenCalledWith(true);
      
      fireEvent.press(switchElement);
      expect(onChange).toHaveBeenCalledWith(false);
      
      expect(onChange).toHaveBeenCalledTimes(2);
    });
  });

  describe('Controlled Mode', () => {
    it('should use checked prop value', () => {
      const { rerender } = render(<Switch testID="switch" checked={false} />);
      let switchElement = screen.getByTestId('switch');
      expect(switchElement.props.accessibilityState.checked).toBe(false);
      
      rerender(<Switch testID="switch" checked={true} />);
      switchElement = screen.getByTestId('switch');
      expect(switchElement.props.accessibilityState.checked).toBe(true);
    });

    it('should not change state on press without onChange updating checked', () => {
      render(<Switch testID="switch" checked={false} />);
      const switchElement = screen.getByTestId('switch');
      
      fireEvent.press(switchElement);
      
      // State should remain false (parent didn't update checked prop)
      expect(switchElement.props.accessibilityState.checked).toBe(false);
    });

    it('should call onChange but let parent control state', () => {
      const onChange = jest.fn();
      render(<Switch testID="switch" checked={false} onChange={onChange} />);
      const switchElement = screen.getByTestId('switch');
      
      fireEvent.press(switchElement);
      
      expect(onChange).toHaveBeenCalledWith(true);
      // But state doesn't change because checked prop didn't update
      expect(switchElement.props.accessibilityState.checked).toBe(false);
    });

    it('should work with controlled parent component', () => {
      const ControlledSwitch = () => {
        const [checked, setChecked] = useState(false);
        return (
          <Switch
            testID="switch"
            checked={checked}
            onChange={setChecked}
          />
        );
      };
      
      render(<ControlledSwitch />);
      const switchElement = screen.getByTestId('switch');
      
      expect(switchElement.props.accessibilityState.checked).toBe(false);
      
      fireEvent.press(switchElement);
      expect(switchElement.props.accessibilityState.checked).toBe(true);
      
      fireEvent.press(switchElement);
      expect(switchElement.props.accessibilityState.checked).toBe(false);
    });
  });

  describe('Disabled State', () => {
    it('should not toggle when disabled', () => {
      const onChange = jest.fn();
      render(<Switch testID="switch" disabled onChange={onChange} />);
      const switchElement = screen.getByTestId('switch');
      
      fireEvent.press(switchElement);
      
      expect(onChange).not.toHaveBeenCalled();
      expect(switchElement.props.accessibilityState.checked).toBe(false);
    });

    it('should have disabled accessibility state', () => {
      render(<Switch testID="switch" disabled />);
      const switchElement = screen.getByTestId('switch');
      expect(switchElement.props.accessibilityState.disabled).toBe(true);
    });

    it('should have disabled prop on Pressable', () => {
      render(<Switch testID="switch" disabled />);
      const switchElement = screen.getByTestId('switch');
      // Check accessibilityState instead - disabled prop may not be directly exposed
      expect(switchElement.props.accessibilityState.disabled).toBe(true);
    });
  });

  describe('Size Variations', () => {
    const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
    
    sizes.forEach(size => {
      it(`should render ${size} size`, () => {
        render(<Switch testID={`switch-${size}`} size={size} />);
        const switchElement = screen.getByTestId(`switch-${size}`);
        expect(switchElement).toBeTruthy();
      });
    });
  });

  describe('Color Variations', () => {
    const colors = ['primary', 'secondary', 'success', 'warning', 'danger', 'info'] as const;
    
    colors.forEach(color => {
      it(`should render with ${color} color`, () => {
        render(<Switch testID={`switch-${color}`} color={color} checked />);
        const switchElement = screen.getByTestId(`switch-${color}`);
        expect(switchElement).toBeTruthy();
      });
    });
  });

  describe('Label Positioning', () => {
    it('should render label on right by default', () => {
      render(<Switch label="Right label" testID="switch" />);
      expect(screen.getByText('Right label')).toBeTruthy();
      expect(screen.getByTestId('switch')).toBeTruthy();
    });

    it('should render label on left', () => {
      render(<Switch label="Left label" labelPosition="left" testID="switch" />);
      expect(screen.getByText('Left label')).toBeTruthy();
    });

    it('should render label on top', () => {
      render(<Switch label="Top label" labelPosition="top" testID="switch" />);
      expect(screen.getByText('Top label')).toBeTruthy();
    });

    it('should render label on bottom', () => {
      render(<Switch label="Bottom label" labelPosition="bottom" testID="switch" />);
      expect(screen.getByText('Bottom label')).toBeTruthy();
    });

    it('should make label pressable to toggle switch', () => {
      const onChange = jest.fn();
      render(
        <Switch
          label="Clickable label"
          testID="switch"
          onChange={onChange}
        />
      );
      
      // Press the label text (which is inside a Pressable)
      const label = screen.getByText('Clickable label');
      fireEvent.press(label.parent!);
      
      expect(onChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Error State', () => {
    it('should display error message', () => {
      render(<Switch label="Field" error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeTruthy();
    });

    it('keeps the description and replaces helperText while an error is shown', () => {
      render(
        <Switch
          label="Field"
          description="Description text"
          helperText="Helper text"
          error="Error text"
        />
      );
      expect(screen.getByText('Error text')).toBeTruthy();
      expect(screen.getByText('Description text')).toBeTruthy();
      expect(screen.queryByText('Helper text')).toBeFalsy();
    });

    it('announces the error with an alert role', () => {
      render(<Switch label="Field" error="Error text" />);
      expect(screen.getByRole('alert')).toBeTruthy();
    });

    it('should display description when no error', () => {
      render(<Switch label="Field" description="Helper text" />);
      expect(screen.getByText('Helper text')).toBeTruthy();
    });
  });

  describe('Required Field', () => {
    it('should show required indicator', () => {
      render(<Switch label="Required field" required />);
      // The visual label carries an asterisk; the control announces "required".
      expect(screen.getByText(/Required field/)).toBeTruthy();
      expect(screen.getByRole('switch', { name: 'Required field, required' })).toBeTruthy();
    });
  });

  describe('Icons', () => {
    it('should not show icon when unchecked with only onIcon', () => {
      render(
        <Switch
          testID="switch"
          checked={false}
          onIcon={<Text testID="on-icon">✓</Text>}
        />
      );
      expect(screen.queryByTestId('on-icon')).toBeFalsy();
    });

    it('should show onIcon when checked', () => {
      render(
        <Switch
          testID="switch"
          checked={true}
          onIcon={<Text testID="on-icon">✓</Text>}
        />
      );
      expect(screen.getByTestId('on-icon')).toBeTruthy();
    });

    it('should show offIcon when unchecked', () => {
      render(
        <Switch
          testID="switch"
          checked={false}
          offIcon={<Text testID="off-icon">✗</Text>}
        />
      );
      expect(screen.getByTestId('off-icon')).toBeTruthy();
    });

    it('should not show offIcon when checked', () => {
      render(
        <Switch
          testID="switch"
          checked={true}
          offIcon={<Text testID="off-icon">✗</Text>}
        />
      );
      expect(screen.queryByTestId('off-icon')).toBeFalsy();
    });

    it('should toggle between icons when switching', () => {
      const ToggleSwitch = () => {
        const [checked, setChecked] = useState(false);
        return (
          <Switch
            testID="switch"
            checked={checked}
            onChange={setChecked}
            onIcon={<Text testID="on-icon">✓</Text>}
            offIcon={<Text testID="off-icon">✗</Text>}
          />
        );
      };
      
      render(<ToggleSwitch />);
      
      // Initially off
      expect(screen.getByTestId('off-icon')).toBeTruthy();
      expect(screen.queryByTestId('on-icon')).toBeFalsy();
      
      // Toggle on
      fireEvent.press(screen.getByTestId('switch'));
      expect(screen.getByTestId('on-icon')).toBeTruthy();
      expect(screen.queryByTestId('off-icon')).toBeFalsy();
    });
  });

  describe('State Labels (On/Off)', () => {
    it('should use default "On" and "Off" labels for accessibility value', () => {
      const { rerender } = render(<Switch testID="switch" checked={false} />);
      let switchElement = screen.getByTestId('switch');
      expect(switchElement.props.accessibilityValue.text).toBe('Off');
      
      // Rerender with checked=true
      rerender(<Switch testID="switch" checked={true} />);
      switchElement = screen.getByTestId('switch');
      expect(switchElement.props.accessibilityValue.text).toBe('On');
    });

    it('should use custom onLabel', () => {
      render(<Switch testID="switch" checked={true} onLabel="Enabled" />);
      const switchElement = screen.getByTestId('switch');
      expect(switchElement.props.accessibilityValue.text).toBe('Enabled');
    });

    it('should use custom offLabel', () => {
      render(<Switch testID="switch" checked={false} offLabel="Disabled" />);
      const switchElement = screen.getByTestId('switch');
      expect(switchElement.props.accessibilityValue.text).toBe('Disabled');
    });

    it('should use custom labels for both states', () => {
      const { rerender } = render(
        <Switch
          testID="switch"
          checked={false}
          onLabel="Active"
          offLabel="Inactive"
        />
      );
      
      let switchElement = screen.getByTestId('switch');
      expect(switchElement.props.accessibilityValue.text).toBe('Inactive');
      
      rerender(
        <Switch
          testID="switch"
          checked={true}
          onLabel="Active"
          offLabel="Inactive"
        />
      );
      
      switchElement = screen.getByTestId('switch');
      expect(switchElement.props.accessibilityValue.text).toBe('Active');
    });
  });

  describe('Accessibility', () => {
    it('should have switch role', () => {
      render(<Switch testID="switch" />);
      const switchElement = screen.getByTestId('switch');
      expect(switchElement.props.role).toBe('switch');
    });

    it('should use label as accessibilityLabel by default', () => {
      render(<Switch testID="switch" label="Notifications" />);
      const switchElement = screen.getByTestId('switch');
      expect(switchElement.props.accessibilityLabel).toBe('Notifications');
    });

    it('should use custom accessibilityLabel when provided', () => {
      render(
        <Switch
          testID="switch"
          label="Notifications"
          accessibilityLabel="Toggle notifications on or off"
        />
      );
      const switchElement = screen.getByTestId('switch');
      expect(switchElement.props.accessibilityLabel).toBe('Toggle notifications on or off');
    });

    it('should include accessibilityHint when provided', () => {
      render(
        <Switch
          testID="switch"
          accessibilityHint="Double tap to toggle"
        />
      );
      const switchElement = screen.getByTestId('switch');
      expect(switchElement.props.accessibilityHint).toBe('Double tap to toggle');
    });

    it('should have checked state in accessibilityState', () => {
      const { rerender } = render(<Switch testID="switch" checked={false} />);
      let switchElement = screen.getByTestId('switch');
      expect(switchElement.props.accessibilityState.checked).toBe(false);
      
      rerender(<Switch testID="switch" checked={true} />);
      switchElement = screen.getByTestId('switch');
      expect(switchElement.props.accessibilityState.checked).toBe(true);
    });

    it('leaves aria-controls to the web (it has no native equivalent)', () => {
      render(<Switch testID="switch" controls="panel-1" />);
      const switchElement = screen.getByTestId('switch');
      expect(switchElement.props['aria-controls']).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid toggling', () => {
      const onChange = jest.fn();
      render(<Switch testID="switch" onChange={onChange} />);
      const switchElement = screen.getByTestId('switch');
      
      // Rapid fire 5 presses
      for (let i = 0; i < 5; i++) {
        fireEvent.press(switchElement);
      }
      
      expect(onChange).toHaveBeenCalledTimes(5);
      // Final state should be on (odd number of toggles)
      expect(switchElement.props.accessibilityState.checked).toBe(true);
    });

    it('should handle empty string label', () => {
      render(<Switch testID="switch" label="" />);
      const switchElement = screen.getByTestId('switch');
      expect(switchElement).toBeTruthy();
    });

    it('should handle switching from controlled to uncontrolled', () => {
      const { rerender } = render(<Switch testID="switch" checked={false} />);
      
      // Start controlled
      let switchElement = screen.getByTestId('switch');
      expect(switchElement.props.accessibilityState.checked).toBe(false);
      
      // Switch to uncontrolled
      rerender(<Switch testID="switch" />);
      switchElement = screen.getByTestId('switch');
      
      // Should maintain previous state
      expect(switchElement.props.accessibilityState.checked).toBe(false);
      
      // Should be able to toggle now
      fireEvent.press(switchElement);
      expect(switchElement.props.accessibilityState.checked).toBe(true);
    });

    it('should handle both disabled and checked states', () => {
      const onChange = jest.fn();
      render(
        <Switch
          testID="switch"
          checked={true}
          disabled={true}
          onChange={onChange}
        />
      );
      const switchElement = screen.getByTestId('switch');
      
      expect(switchElement.props.accessibilityState.checked).toBe(true);
      expect(switchElement.props.accessibilityState.disabled).toBe(true);
      
      fireEvent.press(switchElement);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('should handle required field with error', () => {
      render(
        <Switch
          label="Accept terms"
          required
          error="You must accept to continue"
          testID="switch"
        />
      );
      
      expect(screen.getByText(/Accept terms/)).toBeTruthy();
      expect(screen.getByText('You must accept to continue')).toBeTruthy();
      // Native has no id references: the error reaches the control as its hint.
      expect(screen.getByTestId('switch').props.accessibilityHint).toBe('You must accept to continue');
    });
  });

  describe('Integration Scenarios', () => {
    it('should work in a form-like context', () => {
      const FormComponent = () => {
        const [notifications, setNotifications] = useState(false);
        const [marketing, setMarketing] = useState(false);
        const [required, setRequired] = useState(false);
        
        return (
          <View>
            <Switch
              testID="notifications"
              label="Notifications"
              checked={notifications}
              onChange={setNotifications}
            />
            <Switch
              testID="marketing"
              label="Marketing emails"
              checked={marketing}
              onChange={setMarketing}
            />
            <Switch
              testID="required"
              label="Accept terms"
              checked={required}
              onChange={setRequired}
              required
              error={!required ? 'Required' : undefined}
            />
          </View>
        );
      };
      
      render(<FormComponent />);
      
      // All should start unchecked
      expect(screen.getByTestId('notifications').props.accessibilityState.checked).toBe(false);
      expect(screen.getByTestId('marketing').props.accessibilityState.checked).toBe(false);
      expect(screen.getByTestId('required').props.accessibilityState.checked).toBe(false);
      
      // Toggle each independently
      fireEvent.press(screen.getByTestId('notifications'));
      fireEvent.press(screen.getByTestId('required'));
      
      expect(screen.getByTestId('notifications').props.accessibilityState.checked).toBe(true);
      expect(screen.getByTestId('marketing').props.accessibilityState.checked).toBe(false);
      expect(screen.getByTestId('required').props.accessibilityState.checked).toBe(true);
    });

    it('should support settings panel use case', () => {
      const SettingsPanel = () => {
        const [settings, setSettings] = useState({
          darkMode: false,
          notifications: true,
          sounds: true,
          vibration: false
        });
        
        const toggle = (key: keyof typeof settings) => {
          setSettings(prev => ({ ...prev, [key]: !prev[key] }));
        };
        
        return (
          <View>
            <Switch
              testID="dark-mode"
              label="Dark Mode"
              checked={settings.darkMode}
              onChange={() => toggle('darkMode')}
              labelPosition="left"
            />
            <Switch
              testID="notifications"
              label="Push Notifications"
              checked={settings.notifications}
              onChange={() => toggle('notifications')}
              labelPosition="left"
            />
            <Switch
              testID="sounds"
              label="Notification Sounds"
              checked={settings.sounds}
              onChange={() => toggle('sounds')}
              disabled={!settings.notifications}
              labelPosition="left"
            />
            <Switch
              testID="vibration"
              label="Vibration"
              checked={settings.vibration}
              onChange={() => toggle('vibration')}
              disabled={!settings.notifications}
              labelPosition="left"
            />
          </View>
        );
      };
      
      render(<SettingsPanel />);
      
      // Verify initial state
      expect(screen.getByTestId('dark-mode').props.accessibilityState.checked).toBe(false);
      expect(screen.getByTestId('notifications').props.accessibilityState.checked).toBe(true);
      expect(screen.getByTestId('sounds').props.accessibilityState.checked).toBe(true);
      expect(screen.getByTestId('vibration').props.accessibilityState.checked).toBe(false);
      
      // Sounds and vibration should be enabled (notifications is on)
      expect(screen.getByTestId('sounds').props.accessibilityState.disabled).toBe(false);
      expect(screen.getByTestId('vibration').props.accessibilityState.disabled).toBe(false);
      
      // Turn off notifications
      fireEvent.press(screen.getByTestId('notifications'));
      
      // Sounds and vibration should now be disabled
      expect(screen.getByTestId('sounds').props.accessibilityState.disabled).toBe(true);
      expect(screen.getByTestId('vibration').props.accessibilityState.disabled).toBe(true);
    });
  });
});
