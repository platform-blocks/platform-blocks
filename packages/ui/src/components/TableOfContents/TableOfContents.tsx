import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { View, Pressable, Platform } from 'react-native';
import type { LayoutChangeEvent, LayoutRectangle } from 'react-native';
// NOTE: Direct imports to prevent circular dependency with root index.ts
import { Text } from '../Text';
import { useTheme } from '../../core/theme';
import { useReducedMotion } from '../../core/motion/ReducedMotionProvider';
import { getSpacing } from '../../core/theme/sizes';
import { createRadiusStyles } from '../../core/theme/radius';
import { getSpacingStyles } from '../../core/utils/spacing';
import { useScrollSpy } from '../../hooks/useScrollSpy';
import { useDirection } from '../../core/providers/DirectionProvider';
import { TableOfContentsProps, TocItem } from './types';

const pickContrast = (bg: string, light: string, dark: string) => {
  if (/^#?[0-9a-fA-F]{6}$/.test(bg)) {
    const hex = bg.replace('#','');
    const r = parseInt(hex.slice(0,2),16);
    const g = parseInt(hex.slice(2,4),16);
    const b = parseInt(hex.slice(4,6),16);
    const yiq = (r*299 + g*587 + b*114)/1000;
    return yiq >= 160 ? dark : light;
  }
  return dark;
};

export const TableOfContents = React.forwardRef<View, TableOfContentsProps>((props, ref) => {
  const {
    variant = 'none',
    color,
    size = 'sm',
    radius,
    scrollSpyOptions,
    getControlProps,
    initialData,
    minDepthToOffset = 1,
    depthOffset = 20,
    reinitializeRef,
    autoContrast = false,
    style,
    onActiveChange,
    container,
    ...rest
  } = props;

  const theme = useTheme();
  const { isRTL } = useDirection();
  const spacingStyles = getSpacingStyles(rest);
  const radiusStyles = createRadiusStyles(radius);
  
  const { items, activeId, setActiveId, reinitialize } = useScrollSpy({
    container: container || 'main, [role="main"], .main-content, #main-content, article, .content, #content',
    ...scrollSpyOptions
  }, initialData || []);

  const resolvedColor = color || theme.colors.primary[5];
  const backgroundStyles = (() => {
    switch (variant) {
      case 'filled': return { backgroundColor: resolvedColor };
      case 'ghost': return { backgroundColor: 'transparent' };
      default: return {};
    }
  })();

  const textColor = variant === 'filled' && autoContrast
    ? pickContrast(resolvedColor, '#FFFFFF', theme.colors.gray[9])
    : (variant === 'filled' ? '#FFFFFF' : theme.colors.gray[9]);

  useEffect(() => {
    if (reinitializeRef) (reinitializeRef as any).current = () => reinitialize();
  }, [reinitializeRef, reinitialize]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      reinitialize();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [container, reinitialize]);

  useEffect(() => {
    if (activeId) {
      const item = items.find(i => i.id === activeId);
      onActiveChange?.(activeId, item);
    } else {
      onActiveChange?.(null, undefined);
    }
  }, [activeId, items, onActiveChange]);

  const sizePx = (() => {
    switch (size) {
      case 'xs': return 10;
      case 'sm': return 12;
      case 'md': return 14;
      case 'lg': return 16;
      case 'xl': return 18;
      default: return 14;
    }
  })();

  const containerStyle = [
    { 
      padding: getSpacing('sm'), 
      // gap: 4,
      // margin: 'auto',
      width: '100%'
    },
    backgroundStyles,
    radiusStyles,
    spacingStyles,
    style,
  ];

  const controlBase = (depth: number): any => {
    const offsetDepth = Math.max(0, depth - minDepthToOffset);
    return {
      paddingVertical: 4,
      paddingHorizontal: 6,
      // borderRadius: 4,
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 32,
    };
  };

  const activeIndex = useMemo(() => items.findIndex(i => i.id === activeId), [items, activeId]);
  const activeDepth = activeIndex >= 0 ? items[activeIndex].depth : null;

  const renderItem = (item: TocItem, index: number) => {
    const active = item.id === activeId;
    const isAncestor = !active && activeIndex > index && activeDepth != null && item.depth < activeDepth;
    
    const handlePress = () => {
      setActiveId(item.id);
      
      if (Platform.OS === 'web') {
        const el = item.getNode?.();
        if (el) {
          el.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
      }
    };

    const defaultProps = {
      onPress: handlePress,
      style: {
        ...controlBase(item.depth),
        backgroundColor: active 
          ? (variant === 'filled' ? 'rgba(255,255,255,0.15)' : theme.colors.primary[0])
          : 'transparent',
        ...(isRTL ? {
          borderRightWidth: 2,
          borderRightColor: active 
            ? (variant === 'filled' ? '#FFFFFF' : theme.colors.primary[5])
            : theme.colors.surface[2],
        } : {
          borderLeftWidth: 2,
          borderLeftColor: active 
            ? (variant === 'filled' ? '#FFFFFF' : theme.colors.primary[5])
            : theme.colors.surface[2],
        }),
        // marginLeft: item.depth > 0 ? depthOffset * (item.depth - (minDepthToOffset > 0 ? minDepthToOffset - 1 : 0)) : 0,
        opacity: isAncestor ? 0.85 : 1,
      },
      accessibilityRole: 'button' as const,
      accessibilityLabel: item.value,
      accessibilityHint: `Navigate to ${item.value}`,
    };

    const labelNode = (
      <Text 
        size={size as any} 
        style={{ 
          color: textColor, 
          fontWeight: active ? '600' : '400',
          fontSize: sizePx,
        }}
      >
        {item.value}
      </Text>
    );

    const extra = getControlProps ? getControlProps({ data: item, active, index }) : {};
    const content = (extra as any).children ?? labelNode;

    return (
      <Pressable key={`toc-item-${item.id}-${index}`} {...defaultProps} {...extra}>
        {content}
      </Pressable>
    );
  };

  return (
    <View ref={ref} style={containerStyle}>
      {items.map((item, index) => renderItem(item, index))}
    </View>
  );
});

TableOfContents.displayName = 'TableOfContents';

