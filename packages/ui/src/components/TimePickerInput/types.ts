import type { ViewProps } from 'react-native';
import type { TextProps } from '../Text';
import type { TimePickerProps, TimePickerValue } from '../TimePicker/types';

/** Panel behavior forwarded verbatim to the inline `<TimePicker/>` in the dialog. */
type ForwardedPanelProps = Pick<
  TimePickerProps,
  'format' | 'withSeconds' | 'minuteStep' | 'secondStep' | 'columnWidth' | 'disabled'
>;

export interface TimePickerInputProps extends ForwardedPanelProps {
  /** Size of the field itself; the panel columns are fixed-width. */
  size?: any;
  value?: TimePickerValue | null;
  defaultValue?: TimePickerValue | null;
  /** Emits `null` when the field is cleared, which the inline panel never does. */
  onChange?: (next: TimePickerValue | null) => void;
  /** Allow typing a time directly into the field. */
  allowInput?: boolean;
  /** Width of the dialog holding the panel. */
  panelWidth?: number | string;
  inputWidth?: number | string;
  label?: string;
  description?: string;
  error?: string;
  helperText?: string;
  style?: any;
  onOpen?: () => void;
  onClose?: () => void;
  title?: string;
  /** Close the dialog as soon as the last column is picked, hiding the Done button. */
  autoClose?: boolean;
  fullWidth?: boolean;
  clearable?: boolean;
  clearButtonLabel?: string;
  /** Override props applied to the field label `<Text>`. */
  labelProps?: Omit<TextProps, 'children'>;
  /** Override props applied to the field description `<Text>`. */
  descriptionProps?: Omit<TextProps, 'children'>;
  /** Color of the placeholder text. */
  placeholderTextColor?: string;
  /** View props applied to the wrapper around startSection. */
  startSectionProps?: Omit<ViewProps, 'children'>;
  /** View props applied to the wrapper around endSection (the clock icon by default). */
  endSectionProps?: Omit<ViewProps, 'children'>;
}

export type { TimePickerValue };
