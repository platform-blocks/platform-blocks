import React, { useCallback, useRef, useState } from 'react';
import { View, type ViewStyle } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { factory } from '../../core/factory';
import { useDirection } from '../../core/providers/DirectionProvider';
import { useTheme } from '../../core/theme/ThemeProvider';
import type { BaseProps, ColorProp } from '../../core/types/base';
import { extractStyleProps, resolveStyleProps } from '../../core/utils/spacing';
import { defaultExportOf, resolveOptionalModule } from '../../utils/optionalModule';
import { Button } from '../Button';
import type { ButtonVariant } from '../Button/types';
import { Icon } from '../Icon';
import { IconButton } from '../IconButton';

export interface SwipeableRowAction {
  key: string;
  label: string;
  icon?: string;
  onPress: () => void;
  color?: ColorProp;
  variant?: ButtonVariant;
  disabled?: boolean;
}

export interface SwipeableRowProps extends BaseProps<ViewStyle> {
  children: React.ReactNode;
  /** Actions revealed from the logical start edge. */
  startActions?: SwipeableRowAction[];
  /** Actions revealed from the logical end edge. */
  endActions?: SwipeableRowAction[];
  /** Accessible name for this row's action group. */
  accessibilityLabel?: string;
  /** Width of each revealed action. @default 104 */
  actionWidth?: number;
  /** Disable swipe and action activation. */
  disabled?: boolean;
  /** Show an action-menu button for keyboard and touch discovery. @default true */
  showActionButton?: boolean;
}

interface SwipeableMethodsLike { close(): void }
interface SwipeablePropsLike {
  children: React.ReactNode;
  enabled?: boolean;
  renderLeftActions?: (_progress: unknown, _translation: unknown, methods: SwipeableMethodsLike) => React.ReactNode;
  renderRightActions?: (_progress: unknown, _translation: unknown, methods: SwipeableMethodsLike) => React.ReactNode;
  containerStyle?: ViewStyle;
  onSwipeableOpen?: () => void;
  onSwipeableClose?: () => void;
}

const Swipeable = resolveOptionalModule<React.ComponentType<SwipeablePropsLike & React.RefAttributes<SwipeableMethodsLike>>>(
  'react-native-gesture-handler/ReanimatedSwipeable',
  { accessor: defaultExportOf },
);

/** A themed row with native swipe actions and a visible, accessible action path. */
export const SwipeableRow = factory<{ props: SwipeableRowProps; ref: View }>((props, ref) => {
  const {
    children,
    startActions = [],
    endActions = [],
    accessibilityLabel,
    actionWidth = 104,
    disabled = false,
    showActionButton = true,
    style,
    testID,
    ...rest
  } = props;
  const theme = useTheme();
  const { isRTL } = useDirection();
  const { styleProps, otherProps } = extractStyleProps(rest);
  const [expanded, setExpanded] = useState(false);
  const [swipeOpen, setSwipeOpen] = useState(false);
  const swipeRef = useRef<SwipeableMethodsLike | null>(null);
  const hasActions = startActions.length + endActions.length > 0;

  const activate = useCallback((action: SwipeableRowAction) => {
    try {
      action.onPress();
    } finally {
      swipeRef.current?.close();
      setSwipeOpen(false);
      setExpanded(false);
    }
  }, []);

  const actionButtons = (actions: SwipeableRowAction[], fullHeight: boolean) => actions.map((action) => (
    <Button
      key={action.key}
      title={action.label}
      accessibilityLabel={action.label}
      startSection={action.icon ? <Icon name={action.icon} size="sm" /> : undefined}
      onPress={() => activate(action)}
      disabled={disabled || action.disabled}
      variant={action.variant ?? 'filled'}
      color={action.color ?? 'primary'}
      radius={0}
      size="sm"
      style={{ width: actionWidth, minHeight: fullHeight ? 56 : 40, height: fullHeight ? '100%' : undefined, paddingHorizontal: 4 }}
    />
  ));

  const renderActionSide = (actions: SwipeableRowAction[]) =>
    actions.length ? (
      <View aria-hidden={!swipeOpen} importantForAccessibility={swipeOpen ? 'auto' : 'no-hide-descendants'} style={{ flexDirection: 'row', width: actionWidth * actions.length }}>
        {actionButtons(actions, true)}
      </View>
    ) : null;

  const row = (
    <View style={{ minHeight: 56, flexDirection: 'row', alignItems: 'center', backgroundColor: theme.backgrounds.surface }}>
      <View style={{ flex: 1, minWidth: 0 }}>{children}</View>
      {hasActions && showActionButton && (
        <IconButton
          icon="dots"
          accessibilityLabel={expanded ? 'Hide row actions' : 'Show row actions'}
          aria-expanded={expanded}
          accessibilityHint="Shows the actions available for this row"
          variant="ghost"
          disabled={disabled}
          onPress={() => {
            swipeRef.current?.close();
            setSwipeOpen(false);
            setExpanded((value) => !value);
          }}
        />
      )}
    </View>
  );

  return (
    <View
      {...otherProps}
      {...a11yProps({ role: accessibilityLabel ? 'group' : undefined, label: accessibilityLabel })}
      ref={ref}
      testID={testID}
      style={[{ overflow: 'hidden' }, resolveStyleProps(styleProps, theme), style]}
    >
      {Swipeable && hasActions ? (
        <Swipeable
          enabled={!disabled}
          containerStyle={{ overflow: 'hidden' }}
          renderLeftActions={(isRTL ? endActions : startActions).length ? () => renderActionSide(isRTL ? endActions : startActions) : undefined}
          renderRightActions={(isRTL ? startActions : endActions).length ? () => renderActionSide(isRTL ? startActions : endActions) : undefined}
          onSwipeableOpen={() => { setSwipeOpen(true); setExpanded(false); }}
          onSwipeableClose={() => setSwipeOpen(false)}
          ref={swipeRef}
        >
          {row}
        </Swipeable>
      ) : row}
      {expanded && hasActions && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', backgroundColor: theme.backgrounds.surface }}>
          {actionButtons([...startActions, ...endActions], false)}
        </View>
      )}
    </View>
  );
}, { displayName: 'SwipeableRow' });
