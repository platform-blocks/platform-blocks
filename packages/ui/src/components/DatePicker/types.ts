import type { SizeValue } from '../../core/theme/types';
import type { BaseProps } from '../../core/types/base';
import type { FieldBaseProps } from '../_internal/Field/fieldProps';
import type {
  CalendarProps as CoreCalendarProps,
  CalendarType,
  CalendarValue,
  CalendarLevel,
} from '../Calendar/types';

export interface DatePickerProps extends BaseProps {
  /** Selected value; type depends on `type` prop */
  value?: CalendarValue;
  /** Initial value for uncontrolled usage */
  defaultValue?: CalendarValue;
  /** Called when value changes */
  onChange?: (value: CalendarValue) => void;
  /** Selection behavior */
  type?: CalendarType; // 'single' | 'multiple' | 'range'
  /** Pass-through customization for underlying Calendar */
  calendarProps?: Partial<CoreCalendarProps>;

  /**
   * Accessible name of the inline calendar, exposed as a `group` around it
   * (every day stays individually reachable by screen readers).
   */
  accessibilityLabel?: string;
  /** Extra description of the inline calendar (native `accessibilityHint`). */
  accessibilityHint?: string;
}

/**
 * DateTimePickerProps – combines calendar date + time selection.
 * (Type only: no component implements it yet.)
 */
export interface DateTimePickerProps extends FieldBaseProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (value: Date | null) => void;
  calendarProps?: Partial<CoreCalendarProps>;
  withTime?: boolean; // enable time selection
  timeFormat?: 12 | 24;
  withSeconds?: boolean;
  minuteStep?: number;
  secondStep?: number;
  placeholder?: string;
  displayFormat?: string;
  clearable?: boolean;
  dropdownType?: 'modal' | 'popover';
  closeOnSelect?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
  size?: SizeValue;
}

// Re-export core calendar related types
export type { CalendarType, CalendarValue, CalendarLevel };
