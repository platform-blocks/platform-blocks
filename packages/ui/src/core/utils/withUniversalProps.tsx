/**
 * Higher-order component for applying universal props to React UI Library components
 * Optimized for React Native with web compatibility
 */

import React from 'react';
import { Platform, View, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import {
  UniversalSystemProps,
  getUniversalClasses,
  useUniversalStyles
} from './universal';

interface WithUniversalPropsOptions {
  /** Whether to render as a View wrapper (React Native) or apply classes (web) */
  useWrapper?: boolean;
}

/**
 * Higher-order component that adds universal props support to any component
 */
export function withUniversalProps<P extends object>(
  Component: React.ComponentType<P>,
  options: WithUniversalPropsOptions = {}
) {
  const { useWrapper = Platform.OS !== 'web' } = options;

  return React.forwardRef<any, P & UniversalSystemProps>((props, ref) => {
    const {
      lightHidden,
      darkHidden,
      hiddenFrom,
      visibleFrom,
      ...componentProps
    } = props;

    const theme = useTheme();
    const universalProps = { lightHidden, darkHidden, hiddenFrom, visibleFrom };
    const universalStyles = useUniversalStyles(universalProps, theme.colorScheme);
    const shouldHide = Platform.OS !== 'web' && universalStyles.display === 'none';
    
    // For React Native, check if component should be hidden
    if (shouldHide) {
      return null;
    }

    if (Platform.OS !== 'web' && useWrapper) {
      return (
        <View style={universalStyles as ViewStyle}>
          <Component {...(componentProps as P)} ref={ref} />
        </View>
      );
    }
    
    // For web or non-wrapper mode, apply CSS classes
    if (Platform.OS === 'web') {
      const classes = getUniversalClasses(universalProps);
      const existingClassName = (componentProps as any).className || '';
      const newClassName = [...classes, existingClassName].filter(Boolean).join(' ');
      
      return (
        <Component 
          {...(componentProps as P)} 
          className={newClassName}
          ref={ref}
        />
      );
    }

    // Fallback: render component without modifications
    return <Component {...(componentProps as P)} ref={ref} />;
  });
}

/**
 * Hook to apply universal styles to component props
 * Use this in component implementations for manual integration
 */
export function useUniversalProps<P extends UniversalSystemProps>(
  props: P
): {
  componentProps: Omit<P, keyof UniversalSystemProps>;
  universalStyles: ViewStyle | undefined;
  shouldRender: boolean;
  webClassName: string;
} {
  const theme = useTheme();
  const {
    lightHidden,
    darkHidden,
    hiddenFrom,
    visibleFrom,
    ...componentProps
  } = props;

  const universalProps = { lightHidden, darkHidden, hiddenFrom, visibleFrom };
  const universalStyles = useUniversalStyles(universalProps, theme.colorScheme);
  const shouldRender = Platform.OS === 'web' || universalStyles.display !== 'none';
  
  // Get styles for React Native
  const nativeStyles = Platform.OS !== 'web' ? universalStyles : undefined;
  
  // Get classes for web
  const webClassName = Platform.OS === 'web' 
    ? getUniversalClasses(universalProps).join(' ')
    : '';

  return {
    componentProps: componentProps as Omit<P, keyof UniversalSystemProps>,
    universalStyles: nativeStyles,
    shouldRender,
    webClassName
  };
}