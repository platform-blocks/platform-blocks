import { View, ScrollView } from 'react-native';
import { Card, Text, DatePickerInput, TimePickerInput, Input, PasswordInput, NumberInput, PinInput, Checkbox, RadioGroup, Switch, Slider, RangeSlider, Select, AutoComplete, FileInput, PhoneInput, Divider, Icon, ColorInput, Block } from '@platform-blocks/react-ui-library';
import React from 'react';

interface FormState {
  // Text inputs
  basicInput: string;
  password: string;
  numberValue: number;
  pin: string;
  phone: string;
  phoneFormatted: string;

  // Selection components
  checkbox1: boolean;
  checkbox2: boolean;
  checkbox3: boolean;
  radioValue: string;
  radioGroupValue: string;
  switch1: boolean;
  switch2: boolean;
  switch3: boolean;

  // Range inputs
  sliderValue: number;
  rangeValue: [number, number];

  // Dropdowns
  selectValue: string;
  autoCompleteValue: string;

  // Date/Time
  dateValue: Date | null;
  timeValue: { hours: number; minutes: number; seconds?: number } | null;

  // File
  fileValue: any;
}

const initialState: FormState = {
  basicInput: '',
  password: '',
  numberValue: 0,
  pin: '',
  phone: '',
  phoneFormatted: '',
  checkbox1: false,
  checkbox2: true,
  checkbox3: false,
  radioValue: '',
  radioGroupValue: 'option2',
  switch1: false,
  switch2: true,
  switch3: false,
  sliderValue: 50,
  rangeValue: [320, 750],
  selectValue: '',
  autoCompleteValue: '',
  dateValue: null,
  timeValue: null,
  fileValue: null,
};

const selectOptions = [
  { label: 'React Native', value: 'react-native' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Node.js', value: 'nodejs' },
  { label: 'Python', value: 'python' },
];

const autoCompleteData = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Date', value: 'date' },
  { label: 'Elderberry', value: 'elderberry' },
  { label: 'Fig', value: 'fig' },
  { label: 'Grape', value: 'grape' },
  { label: 'Honeydew', value: 'honeydew' },
  { label: 'Kiwi', value: 'kiwi' },
  { label: 'Lemon', value: 'lemon' }
];

const radioOptions = [
  { label: 'Small', value: 'small', description: 'Compact size' },
  { label: 'Medium', value: 'medium', description: 'Standard size' },
  { label: 'Large', value: 'large', description: 'Maximum size' },
];

const focusIds = {
  basicInput: 'playground-basic-input',
  password: 'playground-password-input',
  number: 'playground-number-input',
  pin: 'playground-pin-input',
  phone: 'playground-phone-input',
};

export function InputShowcase() {
  const [state, setState] = React.useState<FormState>(initialState);
  const [showValues, setShowValues] = React.useState(false);

  const updateState = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  const resetAll = () => {
    setState(initialState);
  };

  const countActiveInputs = () => {
    let count = 0;
    if (state.basicInput) count++;
    if (state.password) count++;
    if (state.numberValue !== 0) count++;
    if (state.pin) count++;
    if (state.phone) count++;
    if (state.checkbox1 || state.checkbox2 || state.checkbox3) count++;
    if (state.radioValue || state.radioGroupValue !== 'option2') count++;
    if (state.switch1 || state.switch2 || state.switch3) count++;
    if (state.sliderValue !== 50) count++;
    if (state.rangeValue[0] !== 20 || state.rangeValue[1] !== 80) count++;
    if (state.selectValue) count++;
    if (state.autoCompleteValue) count++;
    if (state.dateValue) count++;
    if (state.timeValue) count++;
    if (state.fileValue) count++;
    return count;
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ padding: 16 }}>


        <Block direction="row" gap={20} wrap="wrap">
          {/* Text Input Section */}
          <Card padding={20} style={{ minWidth: 280, flex: 1 }}>
            <Block direction="column" gap={16}>
              <Text variant="h6" color="primary">Text Inputs</Text>

              <Input
                label="Basic Input"
                placeholder="Enter some text..."
                value={state.basicInput}
                onChangeText={(value) => updateState('basicInput', value)}
                description="Standard text input field"
                fullWidth
                clearable
                keyboardFocusId={focusIds.basicInput}
              />

              <PasswordInput
                label="Password Input"
                placeholder="Enter password..."
                value={state.password}
                onChangeText={(value) => updateState('password', value)}
                description="Secure password input with toggle visibility"
                clearable
                fullWidth
                keyboardFocusId={focusIds.password}
              />

              <NumberInput
                label="Number Input"
                placeholder="Enter a number..."
                value={state.numberValue}
                onChange={(value: number | undefined) => updateState('numberValue', value || 0)}
                min={0}
                max={1000}
                step={10}
                description="Numeric input with validation"
                fullWidth
                keyboardFocusId={focusIds.number}
              />

              <PinInput
                label="PIN Input"
                length={4}
                value={state.pin}
                onChange={(value) => updateState('pin', value)}
                description="Secure PIN entry with individual digits"
                keyboardFocusId={focusIds.pin}
              />

              <PhoneInput
                label="Phone Input"
                value={state.phone}
                onChange={(raw: string, formatted: string) => {
                  setState(prev => ({ ...prev, phone: raw, phoneFormatted: formatted }));
                }}
                showCountryCode={true}
                mask="(000) 000-0000"
                clearable
                description="Custom mask formatting - try typing a phone number!"
                keyboardFocusId={focusIds.phone}
              />

              {showValues && (
                <Card padding={12} style={{ backgroundColor: '#f8fafc' }}>
                  <Text size="xs" color="dimmed" weight="medium">Current Values:</Text>
                  <Text size="xs" color="dimmed">Input: "{state.basicInput}"</Text>
                  <Text size="xs" color="dimmed">Password: {'*'.repeat(state.password.length)}</Text>
                  <Text size="xs" color="dimmed">Number: {state.numberValue}</Text>
                  <Text size="xs" color="dimmed">PIN: {state.pin}</Text>
                  <Text size="xs" color="dimmed">Phone (raw): {state.phone}</Text>
                  <Text size="xs" color="dimmed">Phone (formatted): {state.phoneFormatted || '—'}</Text>
                </Card>
              )}
            </Block>
          </Card>

          <Card padding={20} style={{ minWidth: 280, flex: 1 }}>
            <RadioGroup
              label="Radio Group"
              options={radioOptions}
              size={'xl'}
              value={state.radioGroupValue}
              onChange={(value) => updateState('radioGroupValue', value)}
              orientation="vertical"
            />
          </Card>


          <Card style={{ flex: 1, minWidth: 280 }} padding={20}>
            <Block direction="column" gap={12}>
              <Text size="sm" weight="medium">Checkboxes</Text>
              <Checkbox
                label="Enable notifications"
                checked={state.checkbox1}
                onChange={(checked) => updateState('checkbox1', checked)}
                description="Receive email notifications"
              />

              <Checkbox
                label="Marketing emails"
                checked={state.checkbox3}
                onChange={(checked) => updateState('checkbox3', checked)}
                // Custom color and icon example
                color="#f59e0b" // amber-500
                icon={<Icon name="star" variant={state.checkbox3 ? 'filled' : 'outlined'} size={14} color="#fff" />}
              />
            </Block>
          </Card>

          {/* Selection Components */}
          <Card padding={20} style={{ minWidth: 280 }}>
            <Block direction="column" gap={16}>

              <Block direction="column" gap={12}>
                <Text size="sm" weight="medium">Switches</Text>
                <Switch
                  label="Dark mode"
                  checked={state.switch1}
                  onChange={(checked) => updateState('switch1', checked)}
                  description="Toggle dark/light theme"
                />
                <Switch
                  label="Auto-save"
                  checked={state.switch2}
                  onChange={(checked) => updateState('switch2', checked)}
                  color="success"
                />
                <Switch
                  label="Beta features"
                  checked={state.switch3}
                  onChange={(checked) => updateState('switch3', checked)}
                  color="warning"
                />
              </Block>

              {showValues && (
                <Card padding={12} style={{ backgroundColor: '#f8fafc' }}>
                  <Text size="xs" color="dimmed" weight="medium">Selection State:</Text>
                  <Text size="xs" color="dimmed">Checkboxes: [{state.checkbox1 ? '✓' : '○'}, {state.checkbox2 ? '✓' : '○'}, {state.checkbox3 ? '✓' : '○'}]</Text>
                  <Text size="xs" color="dimmed">Radio: {state.radioValue || 'none'}</Text>
                  <Text size="xs" color="dimmed">Group: {state.radioGroupValue}</Text>
                  <Text size="xs" color="dimmed">Switches: [{state.switch1 ? 'ON' : 'OFF'}, {state.switch2 ? 'ON' : 'OFF'}, {state.switch3 ? 'ON' : 'OFF'}]</Text>
                </Card>
              )}
            </Block>
          </Card>

          {/* Range & Slider Components */}
          {/* <Card padding={20} >
            <Block direction="column" gap={16}>
              <Text variant="h6" color="primary">Sliders</Text>

              <Block direction="column" gap={12}>
                <Slider
                  label="Volume Level"
                  value={state.sliderValue}
                  onChange={(value) => updateState('sliderValue', value)}
                  min={0}
                  max={100}
                  step={5}
                  description={`Current volume: ${state.sliderValue}%`}
                />

                <RangeSlider
                  label="Price Range"
                  value={state.rangeValue}
                  onChange={(value) => updateState('rangeValue', value)}
                  min={0}
                  max={1000}
                  step={10}
                  ticks={[{ value: 0 }, { value: 250 }, { value: 500 }, { value: 750 }, { value: 1000 }]}
                  description={`Range: $${state.rangeValue[0]} - $${state.rangeValue[1]}`}
                />
              </Block>

              {showValues && (
                <Card padding={12} style={{ backgroundColor: '#f8fafc' }}>
                  <Text size="xs" color="dimmed" weight="medium">Range Values:</Text>
                  <Text size="xs" color="dimmed">Slider: {state.sliderValue}</Text>
                  <Text size="xs" color="dimmed">Range: [{state.rangeValue[0]}, {state.rangeValue[1]}]</Text>
                </Card>
              )}
            </Block>
          </Card> */}

          {/* Dropdown Components */}
          <Card padding={20} style={{ minWidth: 280, flex: 1 }}>
            <Block direction="column" gap={16}>
              <Text variant="h6" color="primary">Dropdown Inputs</Text>

              <Select
                label="Technology Stack"
                placeholder="Choose a technology..."
                options={selectOptions}
                value={state.selectValue}
                onChange={(value) => updateState('selectValue', value ?? '')}
                description="Select your preferred technology"
                clearable
                fullWidth
              />

              <AutoComplete
                label="Favorite Fruit"
                placeholder="Type to search fruits..."
                data={autoCompleteData}
                value={state.autoCompleteValue}
                onSelect={(item: any) => updateState('autoCompleteValue', item.value)}
                onChangeText={(text) => updateState('autoCompleteValue', text)}
                description="Auto-complete with search"
                minSearchLength={0}
                showSuggestionsOnFocus={true}
                clearable
              />
              <ColorInput
                label="Pick a Color"
                // value="#10b981"
                onChange={(color) => console.log('Selected color:', color)}
                description="Select a color from the palette"
                fullWidth
                clearable
              />

              {showValues && (
                <Card padding={12} style={{ backgroundColor: '#f8fafc' }}>
                  <Text size="xs" color="dimmed" weight="medium">Dropdown Values:</Text>
                  <Text size="xs" color="dimmed">Select: {state.selectValue || 'none'}</Text>
                  <Text size="xs" color="dimmed">AutoComplete: {state.autoCompleteValue || 'none'}</Text>
                </Card>
              )}
            </Block>
          </Card>

          {/* Date & Time Components */}
          <Card padding={20} style={{ minWidth: 280, flex: 1 }}>
            <Text variant="h6" color="primary">Date & Time</Text>

            <DatePickerInput
              label="Select Date"
              value={state.dateValue}
              onChange={(date) => updateState('dateValue', date as Date | null)}
              placeholder="Choose a date..."
              description="Calendar date picker"
              fullWidth
              clearable
            />

            <TimePickerInput
              label="Select Time"
              value={state.timeValue}
              onChange={(time) => updateState('timeValue', time)}
              // inputWidth={240}
              panelWidth={240}
              fullWidth
              clearable
            />
            {state.timeValue && (
              <Text size="sm" color="success">
                Selected: {`${state.timeValue.hours.toString().padStart(2, '0')}:${state.timeValue.minutes.toString().padStart(2, '0')}`}
              </Text>
            )}

            {showValues && (
              <Card padding={12} style={{ backgroundColor: '#f8fafc' }}>
                <Text size="xs" color="dimmed" weight="medium">Date/Time Values:</Text>
                <Text size="xs" color="dimmed">Date: {state.dateValue ? state.dateValue.toDateString() : 'none'}</Text>
                <Text size="xs" color="dimmed">Time: {state.timeValue ? `${state.timeValue.hours}:${state.timeValue.minutes}` : 'none'}</Text>
              </Card>
            )}
          </Card>

          {/* File Input */}
          <Card padding={20} style={{ minWidth: 280, flex: 1 }}>
            <Block direction="column" gap={16}>
              <Text variant="h6" color="primary">File Input</Text>

              <FileInput
                label="Upload File"
                onFilesChange={(files: any[]) => updateState('fileValue', files[0] || null)}
                accept={['image/*', '.pdf', '.doc', '.docx']}
                description="Select images, PDFs, or documents"
              />

              {showValues && state.fileValue && (
                <Card padding={12} style={{ backgroundColor: '#f8fafc' }}>
                  <Text size="xs" color="dimmed" weight="medium">File Info:</Text>
                  <Text size="xs" color="dimmed">Name: {state.fileValue?.name || 'N/A'}</Text>
                  <Text size="xs" color="dimmed">Size: {state.fileValue?.size ? `${Math.round(state.fileValue.size / 1024)} KB` : 'N/A'}</Text>
                </Card>
              )}
            </Block>
          </Card>
        </Block>

      </View>
    </ScrollView>
  );
}

