import React, { useMemo } from 'react';
import { View } from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { Text } from '../../Text';
import type {
  KnobBehavior,
  KnobMark,
  KnobProps,
  KnobValueLabelConfig,
  KnobValueLabelPosition,
} from '../types';
import { knobStyles as styles } from '../styles';
import { getKnobValueLabelFontSize, getKnobSecondaryLabelFontSize } from '../sizes';

const defaultKnobLabelFormatter = (val: number) => `${Math.round(val)}°`;

const getPercentFromValue = (value: number, min: number, max: number) => {
  if (max <= min) return 0;
  const ratio = (value - min) / (max - min);
  return Math.min(100, Math.max(0, ratio * 100));
};

const getOppositePosition = (position: KnobValueLabelPosition): KnobValueLabelPosition => {
  switch (position) {
    case 'top':
      return 'bottom';
    case 'bottom':
      return 'top';
    case 'left':
      return 'right';
    case 'right':
      return 'left';
    default:
      return 'bottom';
  }
};

export type ValueLabelSlots = Record<KnobValueLabelPosition, React.ReactNode | null>;

type UseKnobValueLabelsOptions = {
  resolvedBehavior: KnobBehavior;
  /** Knob diameter in pixels; the readout scales with it. */
  size: number;
  withLabel: boolean;
  valueLabelProp: KnobProps['valueLabel'];
  formatLabel?: KnobProps['formatLabel'];
  panningValueFormatter?: (value: number) => React.ReactNode;
  min: number;
  max: number;
  displayValue: number;
  theme: any;
  labelColor: string;
  activeMark?: KnobMark | null;
};

export const useKnobValueLabels = ({
  resolvedBehavior,
  size,
  withLabel,
  valueLabelProp,
  formatLabel,
  panningValueFormatter,
  min,
  max,
  displayValue,
  theme,
  labelColor,
  activeMark,
}: UseKnobValueLabelsOptions) => {
  const defaultLabelFormatterMemo = useMemo(
    () => formatLabel ?? panningValueFormatter ?? defaultKnobLabelFormatter,
    [formatLabel, panningValueFormatter]
  );

  // Derived from the diameter rather than fixed tokens, so the readout stays proportional
  // across the whole `size` scale. `valueLabel.textStyle` still wins — Text applies the
  // caller's style after the size-derived one.
  const primaryFontSize = getKnobValueLabelFontSize(size);
  const secondaryFontSize = getKnobSecondaryLabelFontSize(size);

  const behaviorValueLabelDefaults = useMemo<Partial<KnobValueLabelConfig>>(() => {
    switch (resolvedBehavior) {
      case 'status':
        return { position: 'bottom' };
      case 'dual':
        return { position: 'center', secondary: { position: 'bottom' } };
      default:
        return { position: 'center' };
    }
  }, [resolvedBehavior]);

  const resolvedValueLabelConfig = useMemo<KnobValueLabelConfig | null>(() => {
    if (!withLabel || valueLabelProp === false) return null;
    const customConfig =
      valueLabelProp && typeof valueLabelProp === 'object' ? valueLabelProp : undefined;
    const mergedSecondary =
      customConfig?.secondary || behaviorValueLabelDefaults.secondary
        ? {
            ...(behaviorValueLabelDefaults.secondary ?? {}),
            ...(customConfig?.secondary ?? {}),
          }
        : undefined;
    const config: KnobValueLabelConfig = {
      ...behaviorValueLabelDefaults,
      ...(customConfig ?? {}),
      secondary: mergedSecondary,
    };
    config.position = config.position ?? 'center';
    config.formatter = config.formatter ?? defaultLabelFormatterMemo;
    if (config.secondary) {
      config.secondary.position =
        config.secondary.position ?? getOppositePosition(config.position);
      config.secondary.formatter =
        config.secondary.formatter ??
        (resolvedBehavior === 'dual'
          ? (nextValue: number) =>
              `${Math.round(getPercentFromValue(nextValue, min, max))}%`
          : defaultLabelFormatterMemo);
    }
    return config;
  }, [
    withLabel,
    valueLabelProp,
    behaviorValueLabelDefaults,
    defaultLabelFormatterMemo,
    resolvedBehavior,
    min,
    max,
  ]);

  const slots = useMemo<ValueLabelSlots>(() => {
    type SlotAccumulator = Record<KnobValueLabelPosition, React.ReactNode[]>;
    const valueLabelSlotArrays: SlotAccumulator = {
      center: [],
      top: [],
      bottom: [],
      left: [],
      right: [],
    };

    const pushSlot = (
      slot: KnobValueLabelPosition,
      node: React.ReactNode | null,
      options?: { prepend?: boolean }
    ) => {
      if (!node) return;
      if (options?.prepend) {
        valueLabelSlotArrays[slot].unshift(node);
      } else {
        valueLabelSlotArrays[slot].push(node);
      }
    };

    const renderAffix = (
      content: React.ReactNode,
      variantType: 'primary' | 'secondary'
    ) => {
      if (content == null) return null;
      if (typeof content === 'string' || typeof content === 'number') {
        return (
          <Text
            size={secondaryFontSize}
            weight="500"
            selectable={false}
            style={[
              styles.valueLabelAffix,
              {
                color: variantType === 'secondary' ? theme.text.secondary : labelColor,
              },
            ]}
          >
            {content}
          </Text>
        );
      }
      return content;
    };

    const renderValueContent = (
      content: React.ReactNode,
      variantType: 'primary' | 'secondary',
      customStyle?: StyleProp<TextStyle>
    ) => {
      if (content == null) return null;
      if (typeof content === 'string' || typeof content === 'number') {
        return (
          <Text
            size={variantType === 'primary' ? primaryFontSize : secondaryFontSize}
            weight={variantType === 'primary' ? '600' : '500'}
            selectable={false}
            style={[
              variantType === 'primary'
                ? styles.valueLabelText
                : styles.valueLabelSecondaryText,
              {
                color: variantType === 'secondary' ? theme.text.secondary : labelColor,
              },
              customStyle,
            ]}
          >
            {content}
          </Text>
        );
      }
      return content;
    };

    const createValueLabelNode = (
      variantType: 'primary' | 'secondary',
      value: React.ReactNode,
      config?: {
        prefix?: React.ReactNode;
        suffix?: React.ReactNode;
        containerStyle?: StyleProp<ViewStyle>;
        textStyle?: StyleProp<TextStyle>;
      }
    ) => {
      if (value == null) return null;
      return (
        <View
          style={[
            styles.valueLabelContainer,
            variantType === 'secondary' && styles.valueLabelSecondaryContainer,
            config?.containerStyle,
          ]}
          pointerEvents="none"
        >
          {renderAffix(config?.prefix, variantType)}
          {renderValueContent(value, variantType, config?.textStyle)}
          {renderAffix(config?.suffix, variantType)}
        </View>
      );
    };

    const statusIconNode =
      resolvedBehavior === 'status' && activeMark?.icon ? (
        <View pointerEvents="none" style={styles.statusIconContainer}>
          {activeMark.icon}
        </View>
      ) : null;

    if (statusIconNode) {
      pushSlot('center', statusIconNode, { prepend: true });
    }

    if (resolvedValueLabelConfig) {
      const primaryValue = resolvedValueLabelConfig.formatter?.(displayValue);
      const primaryNode = createValueLabelNode('primary', primaryValue, {
        prefix: resolvedValueLabelConfig.prefix,
        suffix: resolvedValueLabelConfig.suffix,
        containerStyle: resolvedValueLabelConfig.containerStyle,
        textStyle: resolvedValueLabelConfig.textStyle,
      });
      pushSlot(resolvedValueLabelConfig.position ?? 'center', primaryNode);

      if (resolvedValueLabelConfig.secondary) {
        const secondaryValue = resolvedValueLabelConfig.secondary.formatter?.(displayValue);
        const secondaryNode = createValueLabelNode('secondary', secondaryValue, {
          prefix: resolvedValueLabelConfig.secondary.prefix,
          suffix: resolvedValueLabelConfig.secondary.suffix,
          containerStyle: resolvedValueLabelConfig.secondary.containerStyle,
          textStyle: resolvedValueLabelConfig.secondary.textStyle,
        });
        const secondaryPosition =
          resolvedValueLabelConfig.secondary.position ??
          getOppositePosition(resolvedValueLabelConfig.position ?? 'center');
        pushSlot(secondaryPosition, secondaryNode);
      }
    }

    const wrapSlotChildren = (slot: KnobValueLabelPosition) => {
      const items = valueLabelSlotArrays[slot];
      if (!items.length) return null;
      if (items.length === 1) return items[0];
      const isVertical = slot === 'top' || slot === 'bottom' || slot === 'center';
      return (
        <View
          style={
            isVertical ? styles.valueLabelStackVertical : styles.valueLabelStackHorizontal
          }
          pointerEvents="none"
        >
          {items.map((child, index) => (
            <View
              key={`${slot}-${index}`}
              style={{
                marginTop: isVertical && index > 0 ? 4 : 0,
                marginLeft: !isVertical && index > 0 ? 6 : 0,
              }}
            >
              {child}
            </View>
          ))}
        </View>
      );
    };

    return {
      center: wrapSlotChildren('center'),
      top: wrapSlotChildren('top'),
      bottom: wrapSlotChildren('bottom'),
      left: wrapSlotChildren('left'),
      right: wrapSlotChildren('right'),
    } as ValueLabelSlots;
  }, [
    resolvedBehavior,
    activeMark,
    resolvedValueLabelConfig,
    displayValue,
    theme.text.secondary,
    labelColor,
    primaryFontSize,
    secondaryFontSize,
  ]);

  return { valueLabelSlots: slots };
};
