import React from 'react';
import { Pressable, View } from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { mergeSlotProps } from '../../core/utils/mergeSlotProps';
import { Collapse } from '../Collapse';
import { Icon } from '../Icon';
import { Text, type TextProps } from '../Text';
import { useAccordionItemAnimation } from './hooks/useAccordionItemAnimation';
import type { AccordionAccentStyles, AccordionStyles } from './styles';
import type { AccordionAnimationProp, AccordionItem } from './types';

export interface AccordionItemComponentProps {
  item: AccordionItem;
  isExpanded: boolean;
  isDisabled: boolean;
  isLast: boolean;
  /** Called with the item's key. */
  onPress: (key: string) => void;
  showChevron: boolean;
  styles: AccordionStyles;
  /** Resolved expanded-item emphasis (accordion-level or per-item `color`). */
  accent: AccordionAccentStyles;
  chevronColor: string;
  disabledChevronColor: string;
  headerStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  headerTextStyle?: StyleProp<TextStyle>;
  titleProps?: Omit<TextProps, 'children'>;
  idPrefix: string;
  animated: AccordionAnimationProp;
  /** Explicit ms override for the chevron spin and height transition; `0` is instant. */
  transitionDuration?: number;
  reducedMotion?: boolean;
  chevronPosition?: 'start' | 'end';
}

/** Header ids are built from item keys, which may hold any characters. */
const idSafe = (key: string) => key.replace(/[^A-Za-z0-9_-]/g, '_');

const AccordionItemInner = React.forwardRef<View, AccordionItemComponentProps>(({
  item,
  isExpanded,
  isDisabled,
  isLast,
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
  const headerId = `${idPrefix}-header-${idSafe(item.key)}`;
  const panelId = `${idPrefix}-panel-${idSafe(item.key)}`;
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

  const chevron = (
    <Animated.View
      style={[styles.chevron, chevronPosition === 'end' && styles.chevronEnd, animatedChevronStyle]}
      {...a11yProps({ hidden: true })}
    >
      <Icon name="chevron-down" size="md" color={resolvedChevronColor} />
    </Animated.View>
  );

  return (
    <View
      ref={ref}
      style={[styles.item, isLast && styles.lastItem, isExpanded && !isDisabled && accent.activeItem]}
    >
      <Pressable
        style={[styles.header, headerStyle]}
        onPress={() => onPress(item.key)}
        disabled={isDisabled}
        {...a11yProps({
          role: 'button',
          id: headerId,
          controls: panelId,
          expanded: isExpanded,
          disabled: isDisabled,
        })}
      >
        <View style={styles.headerRow}>
          {chevronPosition === 'start' && showChevron && chevron}
          {item.icon ? (
            <View style={styles.icon} {...a11yProps({ hidden: true })}>
              {item.icon}
            </View>
          ) : null}
          <Text
            {...mergeSlotProps(
              {
                fw: isExpanded ? '600' : '400',
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
          {chevronPosition === 'end' && showChevron && chevron}
        </View>
      </Pressable>
      <View
        style={[styles.panel, !shouldAnimate && !isExpanded && styles.panelClosed]}
        {...a11yProps({ role: 'region', id: panelId, labelledBy: headerId })}
      >
        {shouldAnimate ? (
          // Collapse hides fully collapsed content from assistive technology.
          <Collapse
            isCollapsed={!isExpanded}
            transitionDuration={duration}
            easing={easing}
            fadeContent={false}
            contentStyle={[styles.content, contentStyle]}
          >
            <View pointerEvents="box-none">{item.content}</View>
          </Collapse>
        ) : (
          isExpanded && (
            <View pointerEvents="box-none" style={[styles.content, contentStyle]}>
              <View>{item.content}</View>
            </View>
          )
        )}
      </View>
    </View>
  );
});

AccordionItemInner.displayName = 'Accordion.Item';

/** One accordion section (header button + collapsible region). Memoized: rows re-render only when their inputs change. */
export const AccordionItemComponent = React.memo(AccordionItemInner);

export default AccordionItemComponent;
