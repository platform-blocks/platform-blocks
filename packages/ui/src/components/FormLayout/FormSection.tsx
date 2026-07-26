import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '../Text';
import { Icon } from '../Icon';
import { DESIGN_TOKENS } from '../../core';
import { useTheme } from '../../core/theme';
import type { FormSectionProps } from './types';

export const FormSection = React.forwardRef<View, FormSectionProps>(({
  title,
  description,
  children,
  spacing = 'md',
  collapsible = false,
  defaultCollapsed = false,
}, ref) => {
  const theme = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const getSpacing = () => {
    switch (spacing) {
      case 'sm': return DESIGN_TOKENS.spacing.sm;
      case 'md': return DESIGN_TOKENS.spacing.md;
      case 'lg': return DESIGN_TOKENS.spacing.lg;
      default: return DESIGN_TOKENS.spacing.md;
    }
  };

  const HeaderContent = () => (
    <>
      {title && (
        <Text size="lg" weight="semibold" style={{ color: theme.colors.gray[9] }}>
          {title}
        </Text>
      )}
      {description && (
        <Text size="sm" style={{ color: theme.colors.gray[6], marginTop: DESIGN_TOKENS.spacing.xs }}>
          {description}
        </Text>
      )}
    </>
  );

  return (
    <View ref={ref} style={{ gap: getSpacing() }}>
      {/* Header */}
      {(title || description) && (
        <View style={{ paddingBottom: DESIGN_TOKENS.spacing.sm, borderBottomWidth: 1, borderBottomColor: theme.colors.gray[2] }}>
          {collapsible ? (
            <Pressable
              onPress={() => setIsCollapsed(!isCollapsed)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View style={{ flex: 1 }}>
                <HeaderContent />
              </View>
              <Icon
                name={isCollapsed ? 'chevron-down' : 'chevron-up'}
                size={20}
                color={theme.colors.gray[6]}
                style={{ marginLeft: DESIGN_TOKENS.spacing.sm }}
              />
            </Pressable>
          ) : (
            <HeaderContent />
          )}
        </View>
      )}

      {/* Content */}
      {(!collapsible || !isCollapsed) && (
        <View style={{ gap: getSpacing() }}>
          {children}
        </View>
      )}
    </View>
  );
});

FormSection.displayName = 'FormSection';