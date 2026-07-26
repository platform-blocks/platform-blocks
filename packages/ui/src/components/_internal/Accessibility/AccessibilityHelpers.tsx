import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useFocus, useAnnouncer } from '../../../core/accessibility/hooks';
import { createAccessibilityProps, getAccessibilityValueProps } from '../../../core/accessibility/utils';
import { DESIGN_TOKENS } from '../../../core';
import { useTheme } from '../../../core/theme';
import { Icon } from '../../Icon';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  onPress?: () => void;
}

/**
 * Skip link for keyboard navigation - allows users to skip to main content
 */
export const SkipLink: React.FC<SkipLinkProps> = ({
  href,
  children,
  onPress,
}) => {
  const theme = useTheme();
  const { ref: focusRef, isFocused } = useFocus(`skip-link-${href}`);
  const { announce } = useAnnouncer();

  const handlePress = () => {
    announce(`Skipped to ${children}`);
    onPress?.();
  };

  return (
    <Pressable
      ref={focusRef}
      onPress={handlePress}
      style={({ pressed }) => ({
        position: 'absolute',
        top: isFocused ? DESIGN_TOKENS.spacing.sm : -10000,
        left: DESIGN_TOKENS.spacing.sm,
        backgroundColor: theme.colors.primary[5],
        color: 'white',
        padding: DESIGN_TOKENS.spacing.sm,
        borderRadius: DESIGN_TOKENS.radius.sm,
        zIndex: 9999,
        opacity: pressed ? 0.8 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
      {...createAccessibilityProps({
        role: 'link',
        label: `Skip to ${children}`,
        hint: 'Press to skip navigation',
      })}
    >
      <Text style={{ color: 'white', fontSize: DESIGN_TOKENS.typography.fontSize.sm }}>
        {children}
      </Text>
    </Pressable>
  );
};

interface LandmarkProps {
  role: 'main' | 'navigation' | 'banner' | 'contentinfo' | 'complementary';
  label?: string;
  children: React.ReactNode;
  style?: any;
}

/**
 * Semantic landmark component for page structure
 */
export const Landmark: React.FC<LandmarkProps> = ({
  role,
  label,
  children,
  style,
}) => {
  return (
    <View
      style={style}
      {...createAccessibilityProps({
        role: 'none',
        label,
      })}
    >
      {children}
    </View>
  );
};

interface LiveRegionProps {
  priority?: 'polite' | 'assertive';
  children: React.ReactNode;
  atomic?: boolean;
}

/**
 * Live region for dynamic content announcements
 */
export const LiveRegion: React.FC<LiveRegionProps> = ({
  priority = 'polite',
  children,
  atomic = false,
}) => {
  return (
    <View
      accessibilityLiveRegion={priority}
      style={{
        position: 'absolute',
        left: -10000,
        width: 1,
        height: 1,
        overflow: 'hidden',
      }}
    >
      {children}
    </View>
  );
};

interface ProgressIndicatorProps {
  value: number;
  max?: number;
  label?: string;
  description?: string;
  showPercentage?: boolean;
}

/**
 * Accessible progress indicator
 */
export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  value,
  max = 100,
  label,
  description,
  showPercentage = true,
}) => {
  const theme = useTheme();
  const percentage = Math.round((value / max) * 100);
  const { announce } = useAnnouncer();

  React.useEffect(() => {
    // Announce progress at key milestones
    if (percentage === 25 || percentage === 50 || percentage === 75 || percentage === 100) {
      announce(`Progress: ${percentage}% complete`, { priority: 'polite' });
    }
  }, [percentage, announce]);

  return (
    <View style={{ gap: DESIGN_TOKENS.spacing.xs }}>
      {label && (
        <Text style={{ fontSize: DESIGN_TOKENS.typography.fontSize.sm, color: theme.colors.gray[9] }}>
          {label} {showPercentage && `(${percentage}%)`}
        </Text>
      )}
      
      <View
        style={{
          height: 8,
          backgroundColor: theme.colors.gray[2],
          borderRadius: DESIGN_TOKENS.radius.sm,
          overflow: 'hidden',
        }}
        {...createAccessibilityProps({
          role: 'none',
        })}
        accessibilityRole="progressbar"
        {...getAccessibilityValueProps({
          min: 0,
          max,
          now: value,
          text: `${percentage}% complete`,
        })}
        accessibilityLabel={label}
      >
        <View
          style={{
            height: '100%',
            width: `${percentage}%`,
            backgroundColor: theme.colors.primary[5],
          }}
        />
      </View>
      
      {description && (
        <Text style={{ fontSize: DESIGN_TOKENS.typography.fontSize.xs, color: theme.colors.gray[6] }}>
          {description}
        </Text>
      )}
    </View>
  );
};

interface ErrorBoundaryFallbackProps {
  error: Error;
  resetError: () => void;
}

/**
 * Accessible error boundary fallback
 */
export const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  error,
  resetError,
}) => {
  const theme = useTheme();
  const { announce } = useAnnouncer();

  React.useEffect(() => {
    announce('An error occurred. Please try again or contact support.', { priority: 'assertive' });
  }, [announce]);

  return (
    <View
      style={{
        padding: DESIGN_TOKENS.spacing.xl,
        backgroundColor: theme.colors.error[1],
        borderRadius: DESIGN_TOKENS.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.error[3],
        alignItems: 'center',
        gap: DESIGN_TOKENS.spacing.md,
      }}
      {...createAccessibilityProps({
        role: 'alert',
        label: 'Error occurred',
      })}
    >
      <Icon name="alert-circle" size={48} color={theme.colors.error[5]} />
      
      <View style={{ alignItems: 'center', gap: DESIGN_TOKENS.spacing.sm }}>
        <Text
          style={{
            fontSize: DESIGN_TOKENS.typography.fontSize.lg,
            fontWeight: DESIGN_TOKENS.typography.fontWeight.semibold,
            color: theme.colors.error[7],
            textAlign: 'center',
          }}
        >
          Something went wrong
        </Text>
        
        <Text
          style={{
            fontSize: DESIGN_TOKENS.typography.fontSize.sm,
            color: theme.colors.error[6],
            textAlign: 'center',
          }}
        >
          {error.message || 'An unexpected error occurred'}
        </Text>
      </View>

      <Pressable
        onPress={resetError}
        style={({ pressed }) => ({
          backgroundColor: theme.colors.error[5],
          paddingHorizontal: DESIGN_TOKENS.spacing.lg,
          paddingVertical: DESIGN_TOKENS.spacing.md,
          borderRadius: DESIGN_TOKENS.radius.sm,
          opacity: pressed ? 0.8 : 1,
        })}
        {...createAccessibilityProps({
          role: 'button',
          label: 'Try again',
          hint: 'Press to retry the failed operation',
        })}
      >
        <Text style={{ color: 'white', fontSize: DESIGN_TOKENS.typography.fontSize.sm }}>
          Try Again
        </Text>
      </Pressable>
    </View>
  );
};