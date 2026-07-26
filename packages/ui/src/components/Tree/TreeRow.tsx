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

  const background = selected
    ? colors.selectedBg
    : hovered && !disabled
      ? colors.hoverBg
      : striped
        ? colors.stripeBg
        : 'transparent';

  const borderColor = focused
    ? colors.focusRing
    : selected
      ? colors.selectedBorder
      : 'transparent';

  const labelContent = filterQuery && highlight ? highlight(node.label, filterQuery) : node.label;

  const stopPress = (event: any) => {
    event?.stopPropagation?.();
  };

  return (
    <Pressable
      onPress={(event) => onPress(node, isBranch, event)}
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
          backgroundColor: pressed && !disabled && !selected ? colors.pressedBg : background,
          opacity: disabled ? 0.45 : 1,
        } as ViewStyle,
        rowStyle,
      ]}
      accessibilityRole="button"
      accessibilityLabel={node.label}
      accessibilityState={{
        disabled,
        selected,
        expanded: isBranch ? expanded : undefined,
        checked: showCheckbox ? (indeterminate ? 'mixed' : checked) : undefined,
      }}
      {...(web
        ? {
            id: domId,
            role: 'treeitem',
            'aria-level': depth + 1,
            'aria-posinset': row.posInSet,
            'aria-setsize': row.setSize,
            ...(isBranch ? { 'aria-expanded': expanded } : {}),
            ...(multiSelectable || selectable ? { 'aria-selected': selected } : {}),
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
              stopPress(event);
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
        <Pressable onPress={stopPress} {...(web ? { tabIndex: -1 } : {})}>
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
            weight={selected ? 'semibold' : 'normal'}
            style={{ color: disabled ? colors.disabled : selected ? colors.selectedLabel : colors.label }}
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
