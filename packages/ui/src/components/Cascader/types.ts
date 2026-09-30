import type React from 'react';
import type { FieldBaseProps } from '../_internal/Field/fieldProps';
import type { PlacementType } from '../../core/utils/positioning-enhanced';
export interface CascaderOption { value: string; label?: string; children?: CascaderOption[]; disabled?: boolean }
export interface CascaderProps extends FieldBaseProps {
  data: CascaderOption[]; value?: string[] | null; defaultValue?: string[] | null; onChange?: (path: string[] | null, options: CascaderOption[]) => void;
  placeholder?: string; changeOnSelect?: boolean; allowDeselect?: boolean; closeOnSelect?: boolean;
  expandTrigger?: 'click' | 'hover';
  /** Protect diagonal pointer travel into the child column; buffer is in pixels. @default true */
  safeAreaPolygon?: boolean | { buffer?: number }; withColumns?: boolean;
  maxDisplayedLevels?: number; previousLevelsControlLabel?: string; nextLevelsControlLabel?: string;
  searchable?: boolean; filter?: (query: string, path: CascaderOption[]) => boolean; renderSearchOption?: (path: CascaderOption[]) => React.ReactNode;
  searchValue?: string; defaultSearchValue?: string; onSearchChange?: (query: string) => void; nothingFoundMessage?: React.ReactNode; openOnFocus?: boolean;
  separator?: string; formatValue?: (path: CascaderOption[]) => string; columnWidth?: number; maxDropdownHeight?: number;
  renderOption?: (option: CascaderOption, level: number) => React.ReactNode; withCheckIcon?: boolean; checkIconPosition?: 'start' | 'end';
  clearable?: boolean; dropdownOpened?: boolean; defaultDropdownOpened?: boolean; onDropdownOpen?: () => void; onDropdownClose?: () => void;
  position?: PlacementType; offset?: number; dropdownWidth?: number | 'target'; startSection?: React.ReactNode;
}
