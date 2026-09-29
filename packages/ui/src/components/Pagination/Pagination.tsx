import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { useRovingFocus } from '../../core/accessibility/useRovingFocus';
import { factory } from '../../core/factory';
import { createThemedStyles } from '../../core/hooks/useThemedStyles';
import { webProps } from '../../core/platform';
import { resolveColorProp } from '../../core/theme/resolveColors';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getControlSize, onColor, stepDown } from '../../core/theme/tokens';
import type { PlatformBlocksTheme, SizeValue } from '../../core/theme/types';
import { warnOnce } from '../../core/utils/logger';
import { mergeSlotProps } from '../../core/utils/mergeSlotProps';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import { useControllableState } from '../../hooks/useControllableState';
import { Button } from '../Button';
import { Icon } from '../Icon';
import { Menu, MenuDropdown, MenuItem, MenuLabel } from '../Menu';
import { Text } from '../Text';
import type { PaginationAccessibilityLabels, PaginationProps } from './types';

type PaginationVariant = NonNullable<PaginationProps['variant']>;

const DEFAULT_A11Y_LABELS: Required<PaginationAccessibilityLabels> = {
  root: 'Pagination',
  first: 'First page',
  previous: 'Previous page',
  next: 'Next page',
  last: 'Last page',
  page: (page: number) => `Page ${page}`,
};

/**
 * Page items are compact controls: one step below `size` on the shared control
 * scale (`md` renders `sm`-height items).
 */
const getPaginationStyles = createThemedStyles(
  (theme: PlatformBlocksTheme, size: SizeValue, variant: PaginationVariant, color: string) => {
    const metrics = getControlSize(theme, stepDown(size));
    const fill = resolveColorProp(theme, color, { shades: [6, 5] }) ?? theme.colors.primary[6];
    const tint = resolveColorProp(theme, color, { shades: [1, 0] }) ?? theme.colors.primary[1];
    const tintText = resolveColorProp(theme, color, { shades: [7, 6] }) ?? theme.colors.primary[7];
    // A raw CSS color has no ramp: tint and tint text collapse onto the same
    // value, so pick a readable text color for it instead.
    const subtleActiveText = tint === tintText ? onColor(theme, tint) : tintText;

    const item: ViewStyle = {
      height: metrics.height,
      minWidth: metrics.height,
      paddingHorizontal: Math.round(metrics.paddingX * 0.8),
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: metrics.radius,
      marginHorizontal: 2,
      borderWidth: variant === 'outline' ? 1 : 0,
      borderColor: variant === 'outline' ? theme.backgrounds.borderStrong : undefined,
      backgroundColor:
        variant === 'default' ? theme.backgrounds.subtle : 'transparent',
    };

    const active: ViewStyle =
      variant === 'subtle'
        ? { backgroundColor: tint, borderWidth: 0 }
        : { backgroundColor: fill, borderColor: fill };

    const disabled: ViewStyle = {
      backgroundColor: variant === 'outline' ? 'transparent' : theme.backgrounds.disabled,
      opacity: 0.5,
    };

    return {
      root: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' } as ViewStyle,
      item,
      active,
      disabled,
      pressed: { opacity: 0.7 } as ViewStyle,
      ellipsis: {
        height: metrics.height,
        minWidth: metrics.height,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 2,
      } as ViewStyle,
      text: { fontSize: metrics.fontSize, color: theme.text.primary } as TextStyle,
      activeText: {
        color: variant === 'subtle' ? subtleActiveText : onColor(theme, fill),
      } as TextStyle,
      disabledText: { color: theme.text.disabled } as TextStyle,
      mutedText: { fontSize: metrics.fontSize, color: theme.text.muted } as TextStyle,
      totalText: { fontSize: metrics.fontSize, color: theme.text.secondary } as TextStyle,
      total: { marginEnd: 16 } as ViewStyle,
      sizeChanger: { marginStart: 12 } as ViewStyle,
      iconSize: metrics.iconSize,
      checkColor: fill,
    };
  }
);

/** Page numbers to render: boundaries, the window around `current`, and ellipses between. */
function getPageItems(current: number, total: number, siblings: number, boundaries: number): (number | 'ellipsis')[] {
  const pages: (number | 'ellipsis')[] = [];

  // Always show first boundary pages
  for (let i = 1; i <= Math.min(boundaries, total); i++) {
    pages.push(i);
  }

  // Calculate range around current page
  const startPage = Math.max(current - siblings, boundaries + 1);
  const endPage = Math.min(current + siblings, total - boundaries);

  // Add ellipsis if there's a gap between boundaries and current range
  if (startPage > boundaries + 1) {
    pages.push('ellipsis');
  }

  // Add pages around current page
  for (let i = startPage; i <= endPage; i++) {
    if (i > boundaries && i <= total - boundaries) {
      pages.push(i);
    }
  }

  // Add ellipsis if there's a gap between current range and last boundaries
  if (endPage < total - boundaries) {
    pages.push('ellipsis');
  }

  // Always show last boundary pages
  for (let i = Math.max(total - boundaries + 1, boundaries + 1); i <= total; i++) {
    if (i > boundaries) {
      pages.push(i);
    }
  }

  // Remove duplicate page numbers (ellipses are positional, keep both)
  const seen = new Set<number>();
  return pages.filter((page) => {
    if (page === 'ellipsis') return true;
    if (seen.has(page)) return false;
    seen.add(page);
    return true;
  });
}

interface ControlItem {
  /** Stable identity for keys and the roving tab stop. */
  key: string;
  page: number;
  kind: 'first' | 'previous' | 'page' | 'next' | 'last';
  disabled: boolean;
}

/**
 * Page navigation: first / previous / page numbers / next / last, with an
 * optional "X–Y of N" summary and a rows-per-page menu.
 *
 * Renders a labelled `navigation` landmark; the current page carries
 * `aria-current="page"`, every control has an accessible name ("Page 3",
 * "Next page", …) and the controls share one tab stop (arrow keys, Home/End).
 */
export const Pagination = factory<{
  props: PaginationProps;
  ref: View;
}>((props, ref) => {
  const {
    value: valueProp,
    defaultValue,
    current,
    total,
    siblings = 1,
    boundaries = 1,
    onChange,
    size = 'md',
    variant = 'default',
    color = 'primary',
    showFirst = true,
    showPrevNext = true,
    labels,
    accessibilityLabels,
    disabled = false,
    style,
    buttonStyle,
    activeButtonStyle,
    textStyle,
    activeTextStyle,
    hideOnSinglePage = false,
    showSizeChanger = false,
    pageSizeOptions = [10, 20, 50, 100],
    pageSize = 10,
    onPageSizeChange,
    showTotal = false,
    totalItems,
    labelProps,
    activeLabelProps,
    testID,
    ...rest
  } = props;

  if (current !== undefined) {
    warnOnce('Pagination.current', '[platform-blocks] Pagination: `current` is deprecated; use `value`.');
  }

  const theme = useTheme();
  const { styleProps } = extractStyleProps(rest);
  const spacingStyle = useStyleProps(styleProps);
  const styles = getPaginationStyles(theme, size, variant, color);
  const a11yLabels = useMemo(
    () => ({ ...DEFAULT_A11Y_LABELS, ...accessibilityLabels }),
    [accessibilityLabels]
  );

  const [storedPage, setPage] = useControllableState<number>({
    value: valueProp !== undefined ? valueProp : current,
    defaultValue,
    finalValue: 1,
    onChange,
  });
  const lastPage = Math.max(1, total);
  const page = Math.min(Math.max(1, storedPage), lastPage);

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(1, next), lastPage);
      if (clamped !== page) setPage(clamped);
    },
    [lastPage, page, setPage]
  );

  const pages = getPageItems(page, total, siblings, boundaries);

  // Every focusable control, in visual order, for the shared tab stop.
  const controls: ControlItem[] = [];
  if (showFirst) controls.push({ key: 'first', page: 1, kind: 'first', disabled: disabled || page === 1 });
  if (showPrevNext) controls.push({ key: 'previous', page: page - 1, kind: 'previous', disabled: disabled || page === 1 });
  for (const item of pages) {
    if (item !== 'ellipsis') controls.push({ key: `page-${item}`, page: item, kind: 'page', disabled });
  }
  if (showPrevNext) controls.push({ key: 'next', page: page + 1, kind: 'next', disabled: disabled || page >= total });
  if (showFirst) controls.push({ key: 'last', page: total, kind: 'last', disabled: disabled || page >= total });

  // The tab stop follows the focused control by identity (page buttons shift
  // index as the window moves); when nothing is focused it rests on the
  // current page.
  const [focusKey, setFocusKey] = useState<string | null>(null);
  const focusIndex = focusKey ? controls.findIndex((control) => control.key === focusKey) : -1;
  const currentIndex = controls.findIndex((control) => control.kind === 'page' && control.page === page);
  const roving = useRovingFocus({
    count: controls.length,
    orientation: 'horizontal',
    loop: false,
    activeIndex: focusIndex >= 0 ? focusIndex : Math.max(currentIndex, 0),
    onActiveChange: (index) => setFocusKey(controls[index]?.key ?? null),
    isDisabled: (index) => !!controls[index]?.disabled,
  });

  if (hideOnSinglePage && total <= 1) {
    return null;
  }

  const renderLabel = (content: React.ReactNode, isActive: boolean, isDisabled: boolean) =>
    typeof content === 'string' || typeof content === 'number' ? (
      <Text
        {...mergeSlotProps(
          mergeSlotProps(
            {
              fw: isActive ? ('600' as const) : ('400' as const),
              style: [
                styles.text,
                isActive && styles.activeText,
                isDisabled && styles.disabledText,
                textStyle,
                isActive && activeTextStyle,
              ],
            },
            labelProps
          ),
          isActive ? activeLabelProps : undefined
        )}
      >
        {content}
      </Text>
    ) : (
      content
    );

  const renderControl = (control: ControlItem, index: number, content: React.ReactNode) => {
    const isActive = control.kind === 'page' && control.page === page;
    const itemProps = roving.getItemProps(index);
    // A visible text label names the control itself; icon defaults get a label.
    const hasTextLabel = typeof content === 'string' || typeof content === 'number';
    const label =
      control.kind === 'page'
        ? a11yLabels.page(control.page)
        : hasTextLabel
          ? undefined
          : a11yLabels[control.kind];

    return (
      <Pressable
        key={control.key}
        {...a11yProps({
          role: 'button',
          label,
          current: isActive ? 'page' : undefined,
          disabled: control.disabled,
        })}
        disabled={control.disabled}
        ref={itemProps.ref}
        onFocus={itemProps.onFocus}
        {...webProps({ tabIndex: itemProps.tabIndex, onKeyDown: itemProps.onKeyDown })}
        onPress={() => goTo(control.page)}
        style={({ pressed }) => [
          styles.item,
          isActive && styles.active,
          control.disabled && styles.disabled,
          pressed && !control.disabled && styles.pressed,
          buttonStyle,
          isActive && activeButtonStyle,
        ]}
      >
        {renderLabel(content, isActive, control.disabled && control.kind !== 'page')}
      </Pressable>
    );
  };

  const iconFor = (kind: ControlItem['kind']) => (
    // Directional chevrons mirror automatically under RTL (Icon's mirrorInRTL).
    <Icon name={kind === 'first' || kind === 'previous' ? 'chevron-left' : 'chevron-right'} size={styles.iconSize} />
  );

  const contentFor = (control: ControlItem): React.ReactNode => {
    switch (control.kind) {
      case 'first':
        return labels?.first || iconFor('first');
      case 'previous':
        return labels?.previous || iconFor('previous');
      case 'next':
        return labels?.next || iconFor('next');
      case 'last':
        return labels?.last || iconFor('last');
      default:
        return control.page;
    }
  };

  const renderTotal = () => {
    if (!showTotal || !totalItems) return null;

    const startItem = (page - 1) * pageSize + 1;
    const endItem = Math.min(page * pageSize, totalItems);

    if (typeof showTotal === 'function') {
      return <View style={styles.total}>{showTotal(totalItems, [startItem, endItem])}</View>;
    }

    return (
      <View style={styles.total}>
        <Text style={styles.totalText}>
          {startItem}-{endItem} of {totalItems}
        </Text>
      </View>
    );
  };

  const renderSizeChanger = () => {
    if (!showSizeChanger || !onPageSizeChange) return null;

    const buttonSize = (
      typeof size === 'string' && ['xs', 'sm', 'md', 'lg', 'xl'].includes(size) ? size : 'sm'
    ) as 'xs' | 'sm' | 'md' | 'lg' | 'xl';

    return (
      <View style={styles.sizeChanger}>
        <Menu position="top-end" offset={4}>
          <MenuDropdown>
            <MenuLabel>Rows per page</MenuLabel>
            {pageSizeOptions.map((opt) => (
              <MenuItem
                key={opt}
                onPress={() => {
                  if (opt !== pageSize) onPageSizeChange(opt);
                }}
                startSection={
                  opt === pageSize ? <Icon name="check" size={14} color={styles.checkColor} /> : undefined
                }
              >
                {`${opt} / page`}
              </MenuItem>
            ))}
            {!pageSizeOptions.includes(pageSize) && <MenuItem disabled>{`${pageSize} / page`}</MenuItem>}
          </MenuDropdown>
          <Button
            variant="outline"
            size={buttonSize}
            disabled={disabled}
            endSection={<Icon name="chevron-down" size={styles.iconSize} />}
          >
            {`${pageSize} / page`}
          </Button>
        </Menu>
      </View>
    );
  };

  // Controls render in order; ellipses sit between page controls.
  let controlIndex = 0;
  const pageNodes: React.ReactNode[] = [];
  const leadingCount = (showFirst ? 1 : 0) + (showPrevNext ? 1 : 0);
  const leading = controls.slice(0, leadingCount).map((control) => {
    const node = renderControl(control, controlIndex, contentFor(control));
    controlIndex += 1;
    return node;
  });
  pages.forEach((item, i) => {
    if (item === 'ellipsis') {
      pageNodes.push(
        <View key={`ellipsis-${i}`} style={styles.ellipsis} {...a11yProps({ hidden: true })}>
          <Text style={styles.mutedText}>...</Text>
        </View>
      );
      return;
    }
    const control = controls[controlIndex];
    pageNodes.push(renderControl(control, controlIndex, contentFor(control)));
    controlIndex += 1;
  });
  const trailing = controls.slice(controlIndex).map((control) => {
    const node = renderControl(control, controlIndex, contentFor(control));
    controlIndex += 1;
    return node;
  });

  return (
    <View
      ref={ref}
      testID={testID}
      {...a11yProps({ role: 'navigation', label: a11yLabels.root })}
      style={[styles.root, spacingStyle, style]}
    >
      {renderTotal()}
      {leading}
      {pageNodes}
      {trailing}
      {renderSizeChanger()}
    </View>
  );
}, { displayName: 'Pagination' });
