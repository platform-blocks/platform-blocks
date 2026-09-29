import type { ReactNode, Ref, RefObject } from 'react';
import type { LayoutChangeEvent, ScrollView, StyleProp, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

import type { SpotlightItem } from './SpotlightTypes';
import type { SpotlightStore } from './SpotlightStore';
import type { HighlightProps as HighlightComponentProps } from '../Highlight';
import type { TextProps } from '../Text';
import type { ListNavigationOptionProps } from '../../core/accessibility/useListNavigation';
import type { BaseProps } from '../../core/types/base';

/** `style` / spacing props apply to the panel inside the dialog; `testID` to the dialog. */
export interface SpotlightProps extends BaseProps {
  actions: SpotlightItem[];
  nothingFound?: string;
  highlightQuery?: boolean | HighlightComponentProps['highlight'];
  limit?: number;
  scrollable?: boolean;
  /** Max height of the results list — not the panel — before it scrolls. @default fills the panel */
  maxHeight?: number;
  shortcut?: string | string[] | null;
  /** Props for the search field (placeholder, startSection, autoFocus, inputRef, TextInput props…). */
  searchProps?: Partial<SpotlightSearchProps>;
  /**
   * Override props for each group label `<Text>` (style, weight, size, color,
   * uppercase…). Labels use the theme's `sectionLabel` text role by default.
   */
  groupLabelProps?: Omit<TextProps, 'children'>;
  /** A store from `createSpotlightStore` / `useSpotlightStoreInstance`; defaults to the provider's. */
  store?: SpotlightStore;
  variant?: 'modal' | 'bottomsheet' | 'fullscreen';
  /** Accessible name of the spotlight dialog. @default 'Search' */
  accessibilityLabel?: string;
}

export interface SpotlightRootProps {
  query: string;
  onQueryChange: (query: string) => void;
  children: ReactNode;
  opened?: boolean;
  onClose?: () => void;
  shortcut?: string | string[] | null;
  style?: StyleProp<ViewStyle>;
  /** Element focused when the spotlight opens (the search field). */
  initialFocusRef?: RefObject<TextInput | null>;
  /** Accessible name of the dialog. @default 'Search' */
  accessibilityLabel?: string;
  testID?: string;
}

export interface SpotlightSearchProps extends Omit<TextInputProps, 'value' | 'onChangeText' | 'placeholder' | 'autoFocus'> {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  startSection?: ReactNode;
  onNavigateUp?: () => void;
  onNavigateDown?: () => void;
  onSelectAction?: () => void;
  onClose?: () => void;
  autoFocus?: boolean;
  inputRef?: RefObject<TextInput | null>;
  /**
   * Show a close button in the search row. Defaults to true on the mobile
   * experience, where the fullscreen presentation offers no backdrop or
   * Escape key to dismiss with.
   */
  withCloseButton?: boolean;
}

export interface SpotlightActionsListProps {
  children: ReactNode;
  scrollable?: boolean;
  maxHeight?: number;
  style?: StyleProp<ViewStyle>;
  /** @internal auto-scroll */
  scrollRef?: RefObject<ScrollView | null>;
  /** @internal auto-scroll */
  onScrollChange?: (y: number) => void;
  /** @internal listbox id (`aria-controls` of the search field) */
  id?: string;
}

export interface SpotlightActionProps {
  label?: string;
  description?: string;
  startSection?: ReactNode;
  endSection?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  selected?: boolean;
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /** @internal auto-scroll */
  innerRef?: Ref<View>;
  /** Layout capture (auto-scroll). */
  onLayout?: (event: LayoutChangeEvent) => void;
  highlightQuery?: HighlightComponentProps['highlight'];
  /** @internal option role / id / aria-selected from the list navigation */
  optionProps?: ListNavigationOptionProps;
}

export interface SpotlightActionsGroupProps {
  label: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Override props for the label `<Text>`; the theme's `sectionLabel` text role by default. */
  labelProps?: Omit<TextProps, 'children'>;
}

export interface SpotlightEmptyProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export interface SpotlightFactoryPayload {
  props: SpotlightProps;
  ref: View;
}
