import React from 'react';
import { Platform, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { Checkbox } from '../Checkbox';
import { Icon } from '../Icon';
import { Loader } from '../Loader';
import { Text } from '../Text';
import { useHover } from '../../hooks/useHover';

import type { TreeMetrics } from './treeSizes';
import type { TreeCheckState, TreeNode, TreeNodeState, TreeProps, TreeRow as TreeRowMeta } from './types';

const web = Platform.OS === 'web';

/** Every color a row can paint, resolved once by the tree and shared by all rows. */
export interface TreeRowColors {
  selectedBg: string;
  hoverBg: string;
  pressedBg: string;
  stripeBg: string;
  selectedBorder: string;
  focusRing: string;
  label: string;
  selectedLabel: string;
  chevron: string;
  disabled: string;
  guide: string;
}

export interface TreeRowProps {
  row: TreeRowMeta;
  metrics: TreeMetrics;
  indent: number;
  colors: TreeRowColors;
  isRTL: boolean;
  selected: boolean;
  /** Current-location row. Paints like a selection without consuming one. */
  active: boolean;
  focused: boolean;
  loading: boolean;
  checkState: TreeCheckState;
  showCheckbox: boolean;
  showDisclosure: boolean;
  showGuides: boolean;
  striped: boolean;
  domId?: string;
  filterQuery: string;
  multiSelectable: boolean;
  selectable: boolean;
  /** Roving focus is on, so link rows stay out of the tab order. */
  keyboardNavigation: boolean;
  /**
   * The tree has somewhere to route a link press. When it does not, an `href`
   * row is left as a plain anchor and the browser handles it.
   */
  interceptLinks: boolean;
  rowStyle?: StyleProp<ViewStyle>;
  renderLabel?: TreeProps['renderLabel'];
  renderEndSection?: TreeProps['renderEndSection'];
  highlight?: TreeProps['highlight'];
  onPress: (node: TreeNode, isBranch: boolean, event?: any) => void;
  onToggle: (node: TreeNode) => void;
  onCheck: (node: TreeNode) => void;
}

/**
 * One row of the tree. Memoized: the flattened row list only changes when the
 * data, filter or expansion changes, so selecting a node re-renders the two
 * rows whose selected flag flipped instead of the whole tree.
 */
export const TreeRow = React.memo(function TreeRow({
  row,
  metrics,
  indent,
  colors,
  isRTL,
  selected,
  active,
  focused,
  loading,
  checkState,
  showCheckbox,
  showDisclosure,
  showGuides,
  striped,
  domId,
  filterQuery,
  multiSelectable,
  selectable,
  keyboardNavigation,
  interceptLinks,
  rowStyle,
  renderLabel,
  renderEndSection,
  highlight,
  onPress,
  onToggle,
  onCheck,
}: TreeRowProps) {
  const { node, depth, isBranch, expanded } = row;
  const disabled = !!node.disabled;
  const checked = checkState === 'checked';
  const indeterminate = checkState === 'indeterminate';
  const [hovered, hoverHandlers] = useHover();

  const state: TreeNodeState = {
    selected,
    active,
    checked,
    indeterminate,
    expanded,
    disabled,
    focused,
    loading,
    matched: row.matched,
    depth,
  };

  // A vertical guide sits at every ancestor column whose subtree continues below
  // this row. `ancestorLines[k]` describes the ancestor at depth k, so the column
  // drawn next to this row is its own "has a following sibling" flag.
  const guides = showGuides && depth > 0 ? [...row.ancestorLines.slice(1), !row.isLastChild] : [];

  // Active and selected paint the same. They answer different questions — "the
  // page you are on" vs "the rows you picked" — but a tree is only ever asked
  // one of them at a time, and a sidebar with two competing highlights reads as
  // a bug rather than a distinction.
  const emphasized = selected || active;

  const background = emphasized
    ? colors.selectedBg
    : hovered && !disabled
      ? colors.hoverBg
      : striped
        ? colors.stripeBg
        : 'transparent';

  const borderColor = focused
    ? colors.focusRing
    : emphasized
      ? colors.selectedBorder
      : 'transparent';

  const labelContent = filterQuery && highlight ? highlight(node.label, filterQuery) : node.label;

  const stopPress = (event: any) => {
    event?.stopPropagation?.();
  };

  // react-native-web renders a View as an `<a>` as soon as it gets an `href`,
  // keeping the whole RN style pipeline — so the row becomes a real link
  // without hand-flattening its styles into plain CSS.
  const linked = web && !!node.href && !disabled;

  const handlePress = (event: any) => {
    if (linked && interceptLinks) {
      // A modified click is the reader asking the browser for something —
      // a new tab, a new window, a download. The anchor already does all of
      // that, so bow out and leave the default alone. RNW's press responder
      // never fires for middle-click (no `click` event), so that path is
      // native too. Everything else is ours: cancel the navigation and hand
      // the row to the tree, which routes it client-side.
      if (event?.metaKey || event?.ctrlKey || event?.shiftKey || event?.altKey) return;
      event?.preventDefault?.();
    }
    onPress(node, isBranch, event);
  };

  // A branch that is also a link still needs its caret to expand rather than
  // navigate, so the disclosure control cancels the anchor on its own.
  const stopLink = (event: any) => {
    stopPress(event);
    if (linked) event?.preventDefault?.();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      {...hoverHandlers}
      style={({ pressed }) => [
        {
          minHeight: metrics.rowHeight,
          flexDirection: isRTL ? 'row-reverse' : 'row',
          alignItems: 'center',
          paddingHorizontal: metrics.paddingHorizontal,
          gap: metrics.gap,
          borderRadius: metrics.radius,
          // Width stays constant across states: the border is always present and
          // only its color changes. Toggling `borderWidth` grew selected rows by
          // 2px and nudged their contents.
          borderWidth: 1,
          borderColor,
          backgroundColor: pressed && !disabled && !emphasized ? colors.pressedBg : background,
          opacity: disabled ? 0.45 : 1,
        } as ViewStyle,
        rowStyle,
      ]}
      accessibilityRole={node.href ? 'link' : 'button'}
      accessibilityLabel={node.label}
      accessibilityState={{
        disabled,
        selected,
        expanded: isBranch ? expanded : undefined,
        checked: showCheckbox ? (indeterminate ? 'mixed' : checked) : undefined,
      }}
      {...(web
        ? {
            ...(linked
              ? {
                  href: node.href,
                  // An `<a href>` is focusable on its own, which would put every
                  // row into the tab order and break the roving focus the tree
                  // pattern asks for — the container is the single tab stop and
                  // moves the ring with `aria-activedescendant`.
                  ...(keyboardNavigation ? { tabIndex: -1 } : {}),
                }
              : {}),
            id: domId,
            // `role` beats `accessibilityRole` in RNW, so a linked row stays a
            // `treeitem` for assistive tech while keeping the href a crawler
            // (and a middle-click) can follow.
            role: 'treeitem',
            'aria-level': depth + 1,
            'aria-posinset': row.posInSet,
            'aria-setsize': row.setSize,
            ...(isBranch ? { 'aria-expanded': expanded } : {}),
            ...(multiSelectable || selectable ? { 'aria-selected': selected } : {}),
            ...(active ? { 'aria-current': 'page' as const } : {}),
            ...(disabled ? { 'aria-disabled': true } : {}),
          }
        : {})}
    >
      {depth > 0 && (
        <View
          style={{ width: depth * indent, alignSelf: 'stretch', flexDirection: isRTL ? 'row-reverse' : 'row' }}
          {...(web ? { 'aria-hidden': true } : {})}
        >
          {guides.map((visible, level) => (
            <View
              key={level}
              style={{
                width: indent,
                alignSelf: 'stretch',
                ...(isRTL
                  ? { borderRightWidth: 1, borderRightColor: visible ? colors.guide : 'transparent' }
                  : { borderLeftWidth: 1, borderLeftColor: visible ? colors.guide : 'transparent' }),
              }}
            />
          ))}
        </View>
      )}

      <View style={{ width: metrics.iconSize, height: metrics.iconSize, alignItems: 'center', justifyContent: 'center' }}>
        {loading ? (
          <Loader size={metrics.iconSize} />
        ) : isBranch && showDisclosure ? (
          <Pressable
            onPress={(event) => {
              stopLink(event);
              if (!disabled) onToggle(node);
            }}
            hitSlop={6}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={expanded ? 'Collapse' : 'Expand'}
            {...(web ? { tabIndex: -1 } : {})}
          >
            <Icon
              name={expanded ? 'chevron-down' : 'chevron-right'}
              size={metrics.iconSize}
              color={disabled ? colors.disabled : colors.chevron}
              stroke={2}
            />
          </Pressable>
        ) : null}
      </View>

      {showCheckbox && (
        <Pressable onPress={stopLink} {...(web ? { tabIndex: -1 } : {})}>
          <Checkbox
            checked={checked}
            indeterminate={indeterminate}
            indeterminateIcon={<Icon name="minus" />}
            disabled={disabled}
            onChange={() => onCheck(node)}
            size={metrics.checkboxSize}
          />
        </Pressable>
      )}

      {node.icon && (
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>{node.icon}</View>
      )}

      <View style={{ flexShrink: 1 }}>
        {renderLabel ? (
          renderLabel(node, depth, expanded, state)
        ) : (
          <Text
            size={metrics.textSize}
            weight={emphasized ? 'semibold' : 'normal'}
            style={{ color: disabled ? colors.disabled : emphasized ? colors.selectedLabel : colors.label }}
          >
            {labelContent}
          </Text>
        )}
      </View>

      {renderEndSection && (
        <View style={isRTL ? { marginRight: 'auto' } : { marginLeft: 'auto' }}>
          {renderEndSection(node, state)}
        </View>
      )}
    </Pressable>
  );
});

TreeRow.displayName = 'TreeRow';
