export interface TimePickerValue {
  hours: number; // 0-23 internal
  minutes: number; // 0-59
  seconds?: number; // 0-59
}

/**
 * Props for the inline time panel. This is the selection surface only — the
 * hour / minute / (second) / meridiem columns, with no field and no dialog.
 * For a form field that opens this panel in a dialog, use `<TimePickerInput/>`.
 */
export interface TimePickerProps {
  value?: TimePickerValue | null;
  defaultValue?: TimePickerValue | null;
  /** Fired on every column selection. */
  onChange?: (next: TimePickerValue) => void;
  /**
   * Fired when the user picks from the last meaningful column — minutes, or
   * seconds when `withSeconds` is set. `TimePickerInput` uses this to drive
   * `autoClose`.
   */
  onChangeComplete?: (next: TimePickerValue) => void;
  format?: 12 | 24;
  withSeconds?: boolean;
  minuteStep?: number;
  secondStep?: number;
  /** Width of each scroll column (hours/minutes/seconds). */
  columnWidth?: number;
  /** Max height of each scroll column. */
  columnHeight?: number;
  disabled?: boolean;
  style?: any;
}
