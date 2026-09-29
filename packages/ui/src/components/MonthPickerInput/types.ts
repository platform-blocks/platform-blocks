import type { FieldHandle } from '../../core/types/base';
import type { PickerFieldBaseProps } from '../DatePickerInput/PickerField';
import type { MonthPickerProps } from '../MonthPicker/types';

/**
 * A form field that opens a month grid. Extends the shared field props (label,
 * description, error, helperText, required, disabled, readOnly, size, radius,
 * variant, …) plus placeholder / clearable / sections.
 */
export interface MonthPickerInputProps extends PickerFieldBaseProps {
  /** Controlled value for the selected month */
  value?: Date | null;
  /** Default month when uncontrolled */
  defaultValue?: Date | null;
  /** Called when the month selection changes */
  onChange?: (value: Date | null) => void;
  /** Locale used for formatting the input value */
  locale?: string;
  /** Intl format options for rendering the selected month */
  formatOptions?: Intl.DateTimeFormatOptions;
  /** Custom formatter for the input value; overrides locale/formatOptions */
  formatValue?: (value: Date) => string;
  /** Close the picker after selecting a month */
  closeOnSelect?: boolean;
  /** Additional props forwarded to MonthPicker (except value) */
  monthPickerProps?: Partial<Omit<MonthPickerProps, 'value'>>;
  /**
   * `modal` (default): a centered sheet. `popover`: a dropdown anchored to the
   * field on desktop web (the sheet on native and small screens).
   */
  dropdownType?: 'modal' | 'popover';
  /** Title of the picker sheet / name of the popover. */
  modalTitle?: string;
  /** Called when the picker opens */
  onOpen?: () => void;
  /** Called when the picker closes */
  onClose?: () => void;
}

/** Ref of MonthPickerInput: focus / blur the field, clear the value. */
export type MonthPickerInputHandle = FieldHandle;
