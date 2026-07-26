import React from 'react';
import { View, Pressable, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import { Text } from '../Text';
import { Icon } from '../Icon';
import type { AccordionItem, AccordionProps } from './types';
import { useAccordionItemAnimation } from './hooks/useAccordionItemAnimation';
import type { AccordionAnimationProp } from './types';
import type { AccordionAccentStyles } from './styles';
import { Collapse } from '../Collapse';
import { mergeSlotProps } from '../../core/utils';
export interface AccordionItemComponentProps {
  item: AccordionItem;
  isExpanded: boolean;
  isDisabled: boolean;
  isLast: boolean;
  variant: AccordionProps['variant'];
  onPress: () => void;
  showChevron: boolean;
  styles: any;
  /** Resolved expanded-item emphasis (accordion-level or per-item `color`). */
  accent: AccordionAccentStyles;
  chevronColor: string;
  disabledChevronColor: string;
  headerStyle?: any;
  contentStyle?: any;
  headerTextStyle?: any;
  titleProps?: any;
  idPrefix: string;
  animated: AccordionAnimationProp;
  /** Explicit ms override for the chevron spin and height transition; `0` is instant. */
  transitionDuration?: number;
  reducedMotion?: boolean;
  chevronPosition?: 'start' | 'end';
}

export const AccordionItemComponent = React.forwardRef<View, AccordionItemComponentProps>(({
  item,
  isExpanded,
  isDisabled,
  isLast,
  variant,
  onPress,
  showChevron,
  styles,
  accent,
  chevronColor,
  disabledChevronColor,
  headerStyle,
  contentStyle,
  headerTextStyle,
  titleProps,
  idPrefix,
  animated,
  transitionDuration,
  reducedMotion,
  chevronPosition = 'end',
}, ref) => {
  const headerId = `${idPrefix}-header-${item.key}`;
  const panelId = `${idPrefix}-panel-${item.key}`;
  const { CollapseConfig, animatedChevronStyle } = useAccordionItemAnimation({
    expanded: isExpanded,
    animated,
    transitionDuration,
    reducedMotion,
  });
  const { shouldAnimate, duration, easing } = CollapseConfig;

  // Chevron keeps its resting tint unless an accent `color` is set — the open
  // state is conveyed by the rotation, not by a heavier-looking icon.
  const resolvedChevronColor = isDisabled
    ? disabledChevronColor
    : isExpanded && accent.activeChevronColor
      ? accent.activeChevronColor
      : chevronColor;

  return (
    <View ref={ref} style={[
      styles.item,
      isLast && variant === 'default' && { borderBottomWidth: 0 },
      isExpanded && !isDisabled && accent.activeItem
    ]}>
      <Pressable
        style={[styles.header, headerStyle]}
        onPress={onPress}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded, disabled: isDisabled }}
        {...(Platform.OS === 'web' ? {
          id: headerId,
          'aria-controls': panelId,
          'aria-expanded': isExpanded,
        } as any : {})}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          {chevronPosition === 'start' && showChevron && (
            <Animated.View style={[styles.chevron, animatedChevronStyle]}>
              <Icon name="chevron-down" size="md" color={resolvedChevronColor} />
            </Animated.View>
          )}
          {item.icon && <View style={{ marginRight: 12 }}>{item.icon}</View>}
          <Text
            {...mergeSlotProps(
              {
                weight: isExpanded ? '600' : '400',
                selectable: false,
                style: [
                  styles.headerText,
                  isExpanded && accent.activeHeaderText,
                  isDisabled && styles.disabledHeaderText,
                  headerTextStyle,
                ],
              },
              titleProps
            )}
          >
            {item.title}
          </Text>
          {chevronPosition === 'end' && showChevron && (
            <Animated.View style={[
              styles.chevron,
              { marginLeft: 'auto' as const },
              animatedChevronStyle,
            ]}>
              <Icon name="chevron-down" size="md" color={resolvedChevronColor} />
            </Animated.View>
          )}
        </View>
      </Pressable>
      <View
        style={[
          { position: 'relative', zIndex: 1 },
          !shouldAnimate && !isExpanded && { height: 0, overflow: 'hidden' as const },
        ]}
        {...(Platform.OS === 'web' ? {
          id: panelId,
          role: 'region',
          'aria-labelledby': headerId,
          hidden: !isExpanded,
        } as any : {})}
      >
        {shouldAnimate ? (
          <Collapse
            isCollapsed={!isExpanded}
            duration={duration}
            easing={easing}
            fadeContent={false}
            contentStyle={[styles.content, contentStyle]}
          >
            <View pointerEvents="box-none">
              {item.content}
            </View>
          </Collapse>
        ) : (
          isExpanded && (
            <View
              pointerEvents="box-none"
              style={[styles.content, contentStyle]}
            >
              <View>
                {item.content}
              </View>
            </View>
          )
        )}
      </View>
    </View>
  );
});

AccordionItemComponent.displayName = 'Accordion.Item';

export default AccordionItemComponent;
