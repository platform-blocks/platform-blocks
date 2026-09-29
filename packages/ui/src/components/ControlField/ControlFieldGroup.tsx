import React, { useMemo } from 'react';
import { View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { factory } from '../../core/factory';
import { useThemedStyles } from '../../core/hooks/useThemedStyles';
import { getControlSize, resolveRadius } from '../../core/theme/tokens';
import { mergeSlotProps } from '../../core/utils/mergeSlotProps';
import { useStyleProps } from '../../core/utils/spacing';
import { Divider } from '../Divider';
import { useSurfaceStyles } from '../Surface/useSurfaceStyles';
import { Text } from '../Text';
import { ControlFieldGroupProvider } from './context';
import type { ControlFieldGroupContextValue, ControlFieldGroupProps } from './types';

/**
 * A grouped surface of `ControlField` rows with dividers — the settings-list
 * pattern. `style` and `ref` go to the surface; style props to the outer
 * wrapper that also holds the title and footer.
 */
export const ControlFieldGroup = factory<{ props: ControlFieldGroupProps; ref: View }>((props, ref) => {
  const {
    children,
    variant = 'default',
    dividers = true,
    insetDividers = false,
    radius = 'lg',
    size,
    title,
    titleProps,
    footer,
    style,
    testID,
  } = props;

  const spacingStyles = useStyleProps(props);
  const groupCtx = useMemo<ControlFieldGroupContextValue>(() => ({ size }), [size]);

  // `raised`: the group must stand out from whatever it sits on so control
  // off-states (a gray switch track, a checkbox box) stay visible against it —
  // one step up the elevation ladder rather than a fixed palette index, so it
  // still holds inside a card.
  const groupSurface = useSurfaceStyles({
    raised: true,
    withBorder: variant === 'bordered',
    shadow: 'none',
  });

  const styles = useThemedStyles(
    (theme) => {
      // Rows sit a little taller than plain list rows; padding scales with the control size.
      const metrics = getControlSize(theme, size);
      const py = Math.max(8, Math.round(metrics.height * 0.3));
      const px = metrics.paddingX + 2;
      return {
        surface: {
          borderRadius: resolveRadius(theme, radius),
          overflow: 'hidden',
          backgroundColor: variant === 'flush' ? 'transparent' : groupSurface.token.background,
          borderWidth: variant === 'bordered' ? 1 : 0,
          borderColor: variant === 'bordered' ? groupSurface.token.border : 'transparent',
        } as ViewStyle,
        // Each row gets its padding injected onto the field's Pressable (via its
        // `style` prop) so the whole padded row stays tappable — padding on an
        // outer wrapper would leave dead gutters.
        row: { paddingVertical: py, paddingHorizontal: px } as ViewStyle,
        title: { marginBottom: 6, marginStart: px } as TextStyle,
        footer: { color: theme.text.muted, marginTop: 6, marginStart: px } as TextStyle,
        insetDivider: { marginStart: px } as ViewStyle,
      };
    },
    [size, radius, variant, groupSurface.token.background, groupSurface.token.border]
  );

  const items = React.Children.toArray(children).filter(React.isValidElement) as React.ReactElement<{
    style?: StyleProp<ViewStyle>;
  }>[];

  return (
    <ControlFieldGroupProvider value={groupCtx}>
      <View style={spacingStyles} testID={testID}>
        {title != null ? (
          <Text {...mergeSlotProps({ textRole: 'sectionLabel', selectable: false, style: styles.title }, titleProps)}>
            {title}
          </Text>
        ) : null}

        <View ref={ref} style={[styles.surface, style]}>
          {items.map((child, index) => (
            <React.Fragment key={child.key ?? index}>
              {React.cloneElement(child, { style: [styles.row, child.props.style] })}
              {dividers && index < items.length - 1 ? (
                <Divider color="border" style={insetDividers ? styles.insetDivider : undefined} />
              ) : null}
            </React.Fragment>
          ))}
        </View>

        {footer != null ? (
          <Text size="sm" selectable={false} style={styles.footer}>
            {footer}
          </Text>
        ) : null}
      </View>
    </ControlFieldGroupProvider>
  );
}, { displayName: 'ControlField.Group' });

ControlFieldGroup.displayName = 'ControlField.Group';
