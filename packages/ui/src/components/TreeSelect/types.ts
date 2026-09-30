import type React from 'react';
import type { TreeNode, TreeNodeState } from '../Tree';
import type { FieldBaseProps } from '../_internal/Field/fieldProps';
import type { PlacementType } from '../../core/utils/positioning-enhanced';
interface TreeSelectSharedProps extends FieldBaseProps {
  data: TreeNode[];
  placeholder?: string; expandOnClick?: boolean; checkStrictly?: boolean; checkedStrategy?: 'child' | 'all' | 'parent';
  onRemove?: (value: string) => void; maxDisplayedValues?: number; maxDisplayedValuesContent?: React.ReactNode; maxValues?: number;
  searchable?: boolean; searchValue?: string; defaultSearchValue?: string; onSearchChange?: (query: string) => void;
  filter?: (node: TreeNode, query: string) => boolean; clearSearchOnChange?: boolean; nothingFoundMessage?: React.ReactNode;
  clearable?: boolean; allowDeselect?: boolean; withLines?: boolean; renderNode?: (node: TreeNode, state: TreeNodeState) => React.ReactNode;
  maxDropdownHeight?: number; expandedValues?: string[]; defaultExpandedValues?: string[]; defaultExpandAll?: boolean; onExpandedChange?: (ids: string[]) => void;
  dropdownOpened?: boolean; defaultDropdownOpened?: boolean; onDropdownOpen?: () => void; onDropdownClose?: () => void;
  position?: PlacementType; dropdownWidth?: number | 'target';
  offset?: number; startSection?: React.ReactNode;
}

export interface TreeSelectSingleProps extends TreeSelectSharedProps { mode?: 'single'; value?: string | null; defaultValue?: string | null; onChange?: (value: string | null) => void }
export interface TreeSelectMultipleProps extends TreeSelectSharedProps { mode: 'multiple' | 'checkbox'; value?: string[]; defaultValue?: string[]; onChange?: (value: string[]) => void }
export type TreeSelectProps = TreeSelectSingleProps | TreeSelectMultipleProps;
