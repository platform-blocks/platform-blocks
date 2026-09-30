import React, { useCallback } from 'react';
import {
  Pressable,
  View,
  type AccessibilityActionEvent,
  type AccessibilityActionInfo,
  type GestureResponderEvent,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { isWeb } from '../../core/platform/flags';
import { webProps } from '../../core/platform/webProps';
import { useHover } from '../../hooks/useHover/useHover';
import { Checkbox } from '../Checkbox/Checkbox';
import { ChoiceIndicatorProvider } from '../Checkbox/ChoiceField';
import { Icon } from '../Icon/Icon';
import { Loader } from '../Loader/Loader';
import { Text } from '../Text/Text';

import type { TreeMetrics } from './treeSizes';
import { hasModifier } from './treeUtils';
import type {
  TreeCheckState,
  TreeNode,
  TreeNodeState,
  TreePressEvent,
  TreeProps,
  TreeRow as TreeRowMeta,
} from './types';

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
  selected: boolean;
  /** Current-location row. Paints like a selection without consuming one. */
  active: boolean;
  focused: boolean;
  loading: boolean;
  checkState: TreeCheckState;
  showCheckbox: boolean;
  showDisclosure: boolean;
  /** Keep the caret's column on rows that have no caret, so labels line up. */
  reserveDisclosure: boolean;
  /**
   * A top-level branch under `disclosure="nested"`: it heads the rows below it,
   * so its label takes the theme's `sectionLabel` text role instead of the
   * row typography.
   */
  heading?: boolean;
  showGuides: boolean;
  striped: boolean;
  domId?: string;
  filterQuery: string;
  /** The tree has a selection mode, so rows report `aria-selected`. */
  selectable: boolean;
  /** Roving focus is on: the tree is the one tab stop, so rows stay out of the tab order. */
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
  onPress: (node: TreeNode, isBranch: boolean, event?: TreePressEvent) => void;
  onToggle: (node: TreeNode) => void;
  onCheck: (node: TreeNode) => void;
}

/** Web: a small caret still gets a 24px target, without widening its column. */
const MIN_WEB_TARGET = 24;
/** Native: hitSlop takes the caret's target the rest of the way to ~44pt. */
const NATIVE_HIT_SLOP = 10;

const CENTERED: ViewStyle = { alignItems: 'center', justifyContent: 'center' };
const LABEL_SLOT: ViewStyle = { flexShrink: 1 };
const END_SLOT: ViewStyle = { marginStart: 'auto' };

const stopPropagation = (event: GestureResponderEvent) => {
  event?.stopPropagation?.();
};

/**
 * One row of the tree. Memoized, and every callback the tree hands it keeps
 * its identity, so selecting a node re-renders the rows whose flags flipped
 * instead of the whole tree.
 */
export const TreeRow = React.memo(function TreeRow({
  row,
  metrics,
  indent,
  colors,
  selected,
  active,
  focused,
  loading,
  checkState,
  showCheckbox,
  showDisclosure,
  reserveDisclosure,
  heading = false,
  showGuides,
  striped,
  domId,
  filterQuery,
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
  const [hovered, { onHoverIn, onHoverOut }] = useHover();

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

  // react-native-web renders a View as an `<a>` as soon as it gets an `href`,
  // keeping the whole RN style pipeline — so the row becomes a real link
  // without hand-flattening its styles into plain CSS.
  const linked = isWeb && !!node.href && !disabled;

  const handlePress = useCallback(
    (event: GestureResponderEvent) => {
      if (linked && interceptLinks) {
        // A modified click is the reader asking the browser for something —
        // a new tab, a new window, a download. The anchor already does all of
        // that, so bow out and leave the default alone. RNW's press responder
        // never fires for middle-click (no `click` event), so that path is
        // native too. Everything else is ours: cancel the navigation and hand
        // the row to the tree, which routes it client-side.
        if (
          hasModifier(event, 'metaKey') ||
          hasModifier(event, 'ctrlKey') ||
          hasModifier(event, 'shiftKey') ||
          hasModifier(event, 'altKey')
        ) {
          return;
        }
        event?.preventDefault?.();
      }
      onPress(node, isBranch, event);
    },
    [interceptLinks, isBranch, linked, node, onPress]
  );

  // A branch that is also a link still needs its caret (and checkbox) to act
  // rather than navigate, so they cancel the anchor on their own.
  const stopLink = useCallback(
    (event: GestureResponderEvent) => {
      stopPropagation(event);
      if (linked) event?.preventDefault?.();
    },
    [linked]
  );

  const handleDisclosurePress = useCallback(
    (event: GestureResponderEvent) => {
      stopLink(event);
      if (!disabled) onToggle(node);
    },
    [disabled, node, onToggle, stopLink]
  );

  const handleCheckPress = useCallback(
    (event: GestureResponderEvent) => {
      stopLink(event);
      if (!disabled) onCheck(node);
    },
    [disabled, node, onCheck, stopLink]
  );

  const pressableStyle = useCallback(
    ({ pressed }: PressableStateCallbackType): StyleProp<ViewStyle> => [
      {
        minHeight: metrics.rowHeight,
        // `row` flips on its own under RTL (I18nManager natively, `dir` on web).
        flexDirection: 'row',
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
      },
      rowStyle,
    ],
    [background, borderColor, colors.pressedBg, disabled, emphasized, metrics, rowStyle]
  );

  // Native screen readers treat the row as one element (its caret and checkbox
  // are not separately reachable), so expanding and checking are offered as
  // actions on the row itself. Web uses the tree's keyboard model instead.
  const canToggle = isBranch && showDisclosure && !disabled;
  const canCheck = showCheckbox && !disabled;
  const nativeActions: AccessibilityActionInfo[] | undefined =
    !isWeb && (canToggle || canCheck)
      ? [
          ...(canToggle ? [{ name: 'toggle', label: expanded ? 'Collapse' : 'Expand' }] : []),
          ...(canCheck ? [{ name: 'check', label: checked ? 'Uncheck' : 'Check' }] : []),
        ]
      : undefined;
  const handleAccessibilityAction = useCallback(
    (event: AccessibilityActionEvent) => {
      if (event.nativeEvent.actionName === 'toggle') onToggle(node);
      else if (event.nativeEvent.actionName === 'check') onCheck(node);
    },
    [node, onCheck, onToggle]
  );

  // What sits in the caret column: a loader while children are being fetched, a
  // caret on a branch that can be toggled, and otherwise nothing — in which case
  // the column itself is dropped unless `reserveDisclosure` holds it open.
  const targetInset = isWeb ? -Math.max(0, (MIN_WEB_TARGET - metrics.iconSize) / 2) : 0;
  const disclosure = loading ? (
    <Loader size={metrics.iconSize} />
  ) : isBranch && showDisclosure ? (
    <Pressable
      onPress={handleDisclosurePress}
      hitSlop={NATIVE_HIT_SLOP}
      disabled={disabled}
      role="button"
      aria-label={expanded ? 'Collapse' : 'Expand'}
      style={[
        CENTERED,
        isWeb ? { minWidth: MIN_WEB_TARGET, minHeight: MIN_WEB_TARGET, margin: targetInset } : null,
      ]}
      {...webProps({ tabIndex: -1 })}
    >
      <Icon
        name={expanded ? 'chevron-down' : 'chevron-right'}
        size={metrics.iconSize}
        color={disabled ? colors.disabled : colors.chevron}
        stroke={2}
        decorative
      />
    </Pressable>
  ) : null;

  const rowA11y = a11yProps({
    // Native has no tree roles; a row is the link or button it acts as there.
    role: isWeb ? 'treeitem' : node.href ? 'link' : 'button',
    label: node.label,
    id: domId,
    disabled,
    // `aria-selected` only means something in a selectable tree on web; native
    // announces the active row as selected too, since it has no `current`.
    selected: isWeb ? (selectable ? selected : undefined) : selected || active,
    expanded: isBranch ? expanded : undefined,
    checked: showCheckbox ? (indeterminate ? 'mixed' : checked) : undefined,
    level: depth + 1,
    current: active ? 'page' : undefined,
    actions: nativeActions,
    onAction: nativeActions ? handleAccessibilityAction : undefined,
  });

  // Not in `a11yProps` (web-only, tree-specific), and RN's prop types don't
  // list them — react-native-web forwards any `aria-*` to the DOM.
  const positionProps = isWeb ? { 'aria-posinset': row.posInSet, 'aria-setsize': row.setSize } : null;

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      onHoverIn={onHoverIn}
      onHoverOut={onHoverOut}
      style={pressableStyle}
      {...rowA11y}
      {...positionProps}
      {...webProps({
        href: linked ? node.href : undefined,
        // Rows are not tab stops while the tree runs roving focus: the tree is
        // the single stop and moves the ring with `aria-activedescendant`. An
        // `<a href>` would otherwise be focusable on its own.
        tabIndex: keyboardNavigation ? -1 : undefined,
      })}
    >
      {depth > 0 && (
        <View
          style={{ width: depth * indent, alignSelf: 'stretch', flexDirection: 'row' }}
          {...a11yProps({ hidden: true })}
        >
          {guides.map((visible, level) => (
            <View
              // Fixed columns, one per depth level; they never reorder.
              key={level}
              style={{
                width: indent,
                alignSelf: 'stretch',
                borderStartWidth: 1,
                borderStartColor: visible ? colors.guide : 'transparent',
              }}
            />
          ))}
        </View>
      )}

      {(reserveDisclosure || disclosure) && (
        <View style={[CENTERED, { width: metrics.iconSize, height: metrics.iconSize }]}>{disclosure}</View>
      )}

      {showCheckbox && (
        // The row is the control (it carries `aria-checked`); the box is only
        // its picture, so it renders as a decorative indicator — no role, no
        // tab stop — and a press on it toggles the row's checked state.
        <Pressable
          onPress={handleCheckPress}
          disabled={disabled}
          {...a11yProps({ hidden: true })}
          {...webProps({ tabIndex: -1 })}
        >
          <ChoiceIndicatorProvider value>
            <Checkbox
              checked={checked}
              indeterminate={indeterminate}
              indeterminateIcon={<Icon name="minus" decorative />}
              disabled={disabled}
              size={metrics.checkboxSize}
            />
          </ChoiceIndicatorProvider>
        </Pressable>
      )}

      {node.icon ? <View style={CENTERED}>{node.icon}</View> : null}

      <View style={LABEL_SLOT}>
        {renderLabel ? (
          renderLabel(node, depth, expanded, state)
        ) : (
          <Text
            textRole={heading ? 'sectionLabel' : undefined}
            size={heading ? undefined : metrics.textSize}
            fw={heading ? undefined : emphasized ? 'semibold' : 'normal'}
            // A heading keeps the role's color unless state recolors it.
            style={
              disabled
                ? { color: colors.disabled }
                : emphasized
                  ? { color: colors.selectedLabel }
                  : heading
                    ? undefined
                    : { color: colors.label }
            }
          >
            {labelContent}
          </Text>
        )}
      </View>

      {renderEndSection && <View style={END_SLOT}>{renderEndSection(node, state)}</View>}
    </Pressable>
  );
});

TreeRow.displayName = 'TreeRow';
