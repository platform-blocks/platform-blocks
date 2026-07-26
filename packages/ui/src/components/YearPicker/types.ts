import type { SizeValue } from '../../core/theme/types';
import type { ResponsiveProp } from '../../core/theme/breakpoints';

export interface YearPickerProps {
  /** Currently selected date */
  value?: Date | null;
  /** Called when a year is selected */
  onChange?: (date: Date | null) => void;
  /** Decade anchor that should be displayed */
  decade?: number;
  /** Called when the visible decade changes */
  onDecadeChange?: (decade: number) => void;
  /** Minimum selectable date (inclusive) */
  minDate?: Date;
  /** Maximum selectable date (inclusive) */
  maxDate?: Date;
  /** Typography size token */
  size?: SizeValue;
  /** Responsive override for number of years per row */
  yearsPerRow?: ResponsiveProp<number>;
  /** Hide navigation header when embedding the picker */
  hideHeader?: boolean;
  /** Total number of years to render (defaults to 20) */
  totalYears?: number;
  /** Stretch to fill the container instead of sizing to the natural grid width. Default `false`. */
  fullWidth?: boolean;
}
