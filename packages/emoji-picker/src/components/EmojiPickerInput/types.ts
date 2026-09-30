import type { FieldBaseProps, FieldHandle, TextFieldBaseProps } from '@plocks/ui';
import type { EmojiPickerProps, EmojiPickerSelection } from '../EmojiPicker';

export interface EmojiPickerInputProps extends FieldBaseProps,
  Pick<TextFieldBaseProps, 'placeholder' | 'placeholderTextColor' | 'clearable' | 'clearButtonLabel' | 'onClear' | 'startSection' | 'endSection' | 'startSectionProps' | 'endSectionProps'> {
  /** Selected Unicode emoji. Pass null to show the placeholder. */
  value?: string | null;
  defaultValue?: string | null;
  /** Called on selection and when cleared; metadata is null when cleared. */
  onChange?: (emoji: string | null, selection: EmojiPickerSelection | null) => void;
  /** Called only when an emoji is selected. */
  onSelect?: (selection: EmojiPickerSelection) => void;
  /** Props forwarded to the picker, except its selection callback. */
  pickerProps?: Omit<EmojiPickerProps, 'onSelect'>;
  /** Close the panel after selection. @default true */
  closeOnSelect?: boolean;
  /** Desktop presentation; native and narrow screens use a sheet. @default 'popover' */
  dropdownType?: 'popover' | 'modal';
  modalTitle?: string;
  onOpen?: () => void;
  onClose?: () => void;
}

export type EmojiPickerInputHandle = FieldHandle;
