import type { ReactNode } from 'react';
import type { ViewProps, ViewStyle } from 'react-native';

import type { BaseProps } from '../../core/types/base';
import type { ComponentSizeValue } from '../../core/theme/componentSize';

export type DataListOrientation = 'horizontal' | 'vertical';

export interface DataListSizeMetrics {
  /** Font size for labels and values */
  fontSize: number;
  /** Vertical gap between items */
  gap: number;
  /** Gap between a label and its value in vertical orientation */
  labelGap: number;
  /** Gap between the label and value columns in horizontal orientation */
  columnGap: number;
}

/** Shorthand item used by the `data` prop */
export interface DataListDataItem {
  /** Label / term content */
  label: ReactNode;
  /** Value / definition content */
  value: ReactNode;
}

type DataListHostProps = Omit<ViewProps, 'children' | 'style' | 'testID'>;

export interface DataListProps extends BaseProps<ViewStyle>, DataListHostProps {
  /** `DataList.Item` children. Ignored when `data` is provided. */
  children?: ReactNode;
  /** Shorthand for rendering items without composing `DataList.Item` manually */
  data?: DataListDataItem[];
  /** Layout direction of each label/value pair */
  orientation?: DataListOrientation;
  /** Render a divider between items */
  withDivider?: boolean;
  /** Controls font size and spacing (theme font-size / spacing tokens, or a px font size) */
  size?: ComponentSizeValue;
  /** Override the vertical gap between items (theme spacing token or px) */
  spacing?: ComponentSizeValue | number;
  /** Width of the label column in horizontal orientation (px or percentage) */
  labelWidth?: number | string;
  /** Override the label text color for all items */
  labelColor?: string;
  /** Override the value text color for all items */
  valueColor?: string;
  /** Override the divider color when `withDivider` is set */
  dividerColor?: string;
}

export interface DataListItemProps extends BaseProps<ViewStyle>, DataListHostProps {
  /** Item content. Compose with `DataList.ItemLabel` / `DataList.ItemValue`. */
  children?: ReactNode;
  /** Shorthand label content (rendered when `children` is not provided) */
  label?: ReactNode;
  /** Shorthand value content (rendered when `children` is not provided) */
  value?: ReactNode;
  /** @internal injected by DataList */
  itemIndex?: number;
  /** @internal injected by DataList */
  isLastItem?: boolean;
}

export interface DataListItemLabelProps extends BaseProps<ViewStyle>, DataListHostProps {
  children?: ReactNode;
  /** Override the label text color */
  c?: string;
}

export interface DataListItemValueProps extends BaseProps<ViewStyle>, DataListHostProps {
  children?: ReactNode;
  /** Override the value text color */
  c?: string;
}

export interface DataListContextValue {
  orientation: DataListOrientation;
  withDivider: boolean;
  metrics: DataListSizeMetrics;
  labelWidth?: number | string;
  labelColor?: string;
  valueColor?: string;
  dividerColor: string;
}
