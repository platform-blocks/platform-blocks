import React, { useCallback } from 'react';
import { Pressable, View } from 'react-native';
import { a11yProps } from '../../core/accessibility/a11yProps';
import { factory } from '../../core/factory/factory';
import { createThemedStyles } from '../../core/hooks/useThemedStyles';
import { webStyle } from '../../core/platform/webStyle';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveSpacing } from '../../core/theme/tokens';
import type { PlatformBlocksTheme } from '../../core/theme/types';
import { warnOnce } from '../../core/utils/logger';
import { resolveStyleProps, extractStyleProps } from '../../core/utils/spacing';
import { useControllableState } from '../../hooks/useControllableState/useControllableState';
import { Icon } from '../Icon';
import { Text } from '../Text';
import type { FormSectionProps } from './types';

const getSectionStyles = createThemedStyles(
  (theme: PlatformBlocksTheme, spacing: NonNullable<FormSectionProps['spacing']>) => {
    const gap = resolveSpacing(theme, spacing) as number;
    return {
      root: { gap },
      content: { gap },
      header: {
        paddingBottom: resolveSpacing(theme, 'sm') as number,
        borderBottomWidth: 1,
        borderBottomColor: theme.backgrounds.border,
      },
      toggle: [
        { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const },
        webStyle({ cursor: 'pointer' }),
      ],
      pressed: { opacity: 0.7 },
      headerText: { flex: 1 },
      title: { color: theme.text.primary },
      description: { color: theme.text.secondary, marginTop: resolveSpacing(theme, 'xs') as number },
      chevron: { marginStart: resolveSpacing(theme, 'sm') as number },
    };
  }
);

/** A titled block of form fields; `collapsible` lets the header expand/collapse it. */
export const FormSection = factory<{ props: FormSectionProps; ref: View }>(
  (props, ref) => {
    const { styleProps, otherProps } = extractStyleProps(props);
    const {
      title,
      description,
      children,
      spacing = 'md',
      collapsible = false,
      expanded,
      defaultExpanded,
      onExpandedChange,
      defaultCollapsed,
      style,
      testID,
    } = otherProps;

    if (defaultCollapsed !== undefined) {
      warnOnce('FormSection.defaultCollapsed', '[platform-blocks] FormSection: `defaultCollapsed` is deprecated. Use `defaultExpanded`.');
    }

    const theme = useTheme();
    const styles = getSectionStyles(theme, spacing);
    const [isExpanded, setExpanded] = useControllableState<boolean>({
      value: expanded,
      defaultValue: defaultExpanded ?? (defaultCollapsed === undefined ? true : !defaultCollapsed),
      finalValue: true,
      onChange: onExpandedChange,
    });
    const toggle = useCallback(() => setExpanded((open) => !open), [setExpanded]);

    const headerContent = (
      <>
        {title ? (
          <Text size="lg" fw="semibold" style={styles.title}>
            {title}
          </Text>
        ) : null}
        {description ? (
          <Text size="sm" style={styles.description}>
            {description}
          </Text>
        ) : null}
      </>
    );

    return (
      <View ref={ref} testID={testID} style={[styles.root, resolveStyleProps(styleProps, theme), style]}>
        {title || description ? (
          <View style={styles.header}>
            {collapsible ? (
              <Pressable
                onPress={toggle}
                {...a11yProps({ role: 'button', expanded: isExpanded })}
                style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}
              >
                <View style={styles.headerText}>{headerContent}</View>
                <Icon
                  name={isExpanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={theme.text.secondary}
                  style={styles.chevron}
                />
              </Pressable>
            ) : (
              headerContent
            )}
          </View>
        ) : null}

        {!collapsible || isExpanded ? <View style={styles.content}>{children}</View> : null}
      </View>
    );
  },
  { displayName: 'FormSection' }
);
