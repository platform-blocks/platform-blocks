import type { FieldHandle } from '../../core/types/base';
import type { PickerFieldBaseProps } from '../DatePickerInput/PickerField';
import type { YearPickerProps } from '../YearPicker/types';

/**
 * A form field that opens a year grid. Extends the shared field props (label,
 * description, error, helperText, required, disabled, readOnly, size, radius,
 * variant, …) plus placeholder / clearable / sections.
 */
export interface YearPickerInputProps extends PickerFieldBaseProps {
  /** Controlled value for the selected year */
  value?: Date | null;
  /** Default year when uncontrolled */
  defaultValue?: Date | null;
  /** Called when the year selection changes */
  onChange?: (value: Date | null) => void;
  /** Custom formatter for the input value */
  formatValue?: (value: Date) => string;
  /** Close the picker after selecting a year */
  closeOnSelect?: boolean;
  /** Additional props forwarded to YearPicker (except value) */
  yearPickerProps?: Partial<Omit<YearPickerProps, 'value'>>;
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

/** Ref of YearPickerInput: focus / blur the field, clear the value. */
export type YearPickerInputHandle = FieldHandle;
