import type { FieldHandle } from '../../core/types/base';
import type {
  CalendarProps as CoreCalendarProps,
  CalendarType,
  CalendarValue,
  CalendarLevel,
} from '../Calendar/types';
import type { PickerFieldBaseProps } from './PickerField';

/**
 * A form field that opens a calendar. Extends the shared field props (label,
 * description, error, helperText, required, disabled, readOnly, size, radius,
 * variant, …) plus placeholder / clearable / sections.
 */
export interface DatePickerInputProps extends PickerFieldBaseProps {
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
  /** Format string for displaying value in the input (tokens: yyyy, yy, MMMM, MMM, MM, M, dd, d). */
  displayFormat?: string;
  /**
   * `modal` (default): a centered sheet. `popover`: a dropdown anchored to the
   * field on desktop web (the sheet on native and small screens).
   */
  dropdownType?: 'modal' | 'popover';
  /** Close the picker after a selection completes. @default true for `single` */
  closeOnSelect?: boolean;
  /** Title of the picker sheet / name of the popover. Defaults by `type` ("Select date", …). */
  modalTitle?: string;
  /** Called when the picker opens. */
  onOpen?: () => void;
  /** Called when the picker closes. */
  onClose?: () => void;
}

/** Ref of DatePickerInput: focus / blur the field, clear the value. */
export type DatePickerInputHandle = FieldHandle;

export type { CalendarType, CalendarValue, CalendarLevel };
