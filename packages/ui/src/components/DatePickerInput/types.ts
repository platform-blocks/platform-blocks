import { BaseInputProps } from '../Input/types';
import { SizeValue } from '../../core/theme/types';
import type {
  CalendarProps as CoreCalendarProps,
  CalendarType,
  CalendarValue,
  CalendarLevel,
} from '../Calendar/types';

export interface DatePickerInputProps extends Omit<BaseInputProps, 'value' | 'onChangeText'> {
  /** Selected value; type depends on `type` prop */
  value?: CalendarValue;
  /** Initial value for uncontrolled usage */
  defaultValue?: CalendarValue;
  /** Called when value changes */
  onChange?: (value: CalendarValue) => void;
  /** Selection behavior */
  type?: CalendarType;
  /** Pass-through customization for underlying Calendar */
  calendarProps?: Partial<CoreCalendarProps>;

  /** Input placeholder text */
  placeholder?: string;
  /** Format string for displaying value in the input */
  displayFormat?: string;
  /** Serialization/parsing format (reserved for future) */
  valueFormat?: string;
  /** Show a clear button */
  clearable?: boolean;
  /** Visual size */
  size?: SizeValue;
  /** Disable interaction */
  disabled?: boolean;
  /** Show required indicator */
  withAsterisk?: boolean;
  /** Presentation modality */
  dropdownType?: 'modal' | 'popover';
  /** Close picker after single selection (for single mode) */
  closeOnSelect?: boolean;

  /** Lifecycle events */
  onOpen?: () => void;
  onClose?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export type { CalendarType, CalendarValue, CalendarLevel };
