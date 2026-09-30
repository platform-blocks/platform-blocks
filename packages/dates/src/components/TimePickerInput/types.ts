import type { FieldHandle } from '@plocks/ui';
import type { PickerFieldBaseProps } from '../DatePickerInput/PickerField';
import type { TimePickerProps, TimePickerValue } from '../TimePicker/types';

/** Panel behavior forwarded verbatim to the inline `<TimePicker/>` in the sheet. */
type ForwardedPanelProps = Pick<
  TimePickerProps,
  'format' | 'withSeconds' | 'minuteStep' | 'secondStep' | 'columnWidth'
>;

/**
 * A time field: type a time (`allowInput`, default) or pick it from the time
 * panel opened by the clock button. Extends the shared field props (label,
 * description, error, helperText, required, disabled, readOnly, size, radius,
 * variant, …).
 */
export interface TimePickerInputProps extends PickerFieldBaseProps, ForwardedPanelProps {
  value?: TimePickerValue | null;
  defaultValue?: TimePickerValue | null;
  /** Emits `null` when the field is cleared, which the inline panel never does. */
  onChange?: (next: TimePickerValue | null) => void;
  /** Allow typing a time directly into the field (`hh:mm`, `hh:mm:ss`, optional AM/PM). @default true */
  allowInput?: boolean;
  /** Width of the sheet holding the panel. */
  panelWidth?: number;
  /** Called when the panel opens. */
  onOpen?: () => void;
  /** Called when the panel closes. */
  onClose?: () => void;
  /** Title of the panel sheet. @default 'Select time' */
  title?: string;
  /** Close the panel as soon as the last column is picked, hiding the Done button. */
  autoClose?: boolean;
  /** Accessible label of the button that opens the panel. @default 'Choose time' */
  pickerButtonLabel?: string;
}

/** Ref of TimePickerInput: focus / blur the field, clear the value. */
export type TimePickerInputHandle = FieldHandle;

export type { TimePickerValue };
