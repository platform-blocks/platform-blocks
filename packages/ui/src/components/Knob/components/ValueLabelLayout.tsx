import React from 'react';
import { View, ViewStyle } from 'react-native';

import { FieldHeader } from '../../_internal/FieldHeader';
import { Row, Column } from '../../Layout';
import type { StyleProps } from '../../../core/utils/spacing';
import type { LayoutProps } from '../../../core/utils/layout';
import type { KnobProps, KnobValueLabelPosition } from '../types';
import type { ValueLabelSlots } from '../hooks/useKnobValueLabels';

const hasStyleEntries = (style?: ViewStyle | null) =>
  !!style && Object.keys(style).length > 0;

export type ValueLabelLayoutProps = {
  knobElement: React.ReactNode;
  valueLabelSlots: ValueLabelSlots;
  spacingStyles?: ViewStyle;
  layoutStyles?: ViewStyle;
  spacingProps: StyleProps;
  layoutProps: LayoutProps;
  hasLabelContent: boolean;
  label?: KnobProps['label'];
  description?: KnobProps['description'];
  labelPosition: KnobValueLabelPosition;
  /** Id of the label text (the knob references it through aria-labelledby). */
  labelId?: string;
  /** Id of the description text (aria-describedby). */
  descriptionId?: string;
};

export const ValueLabelLayout: React.FC<ValueLabelLayoutProps> = ({
  knobElement,
  valueLabelSlots,
  spacingStyles,
  layoutStyles,
  spacingProps,
  layoutProps,
  hasLabelContent,
  label,
  description,
  labelPosition,
  labelId,
  descriptionId,
}) => {
  let composed = knobElement;

  if (valueLabelSlots.left || valueLabelSlots.right) {
    composed = (
      <Row gap="sm" align="center">
        {valueLabelSlots.left}
        {composed}
        {valueLabelSlots.right}
      </Row>
    );
  }

  if (valueLabelSlots.top || valueLabelSlots.bottom) {
    composed = (
      <Column gap="xs" align="center">
        {valueLabelSlots.top}
        {composed}
        {valueLabelSlots.bottom}
      </Column>
    );
  }

  if (!hasLabelContent) {
    const hasOuterStyles = hasStyleEntries(spacingStyles) || hasStyleEntries(layoutStyles);
    if (hasOuterStyles) {
      // `fullWidth` first, so an explicit `w` wins.
      return <View style={[layoutStyles, spacingStyles]}>{composed}</View>;
    }
    return <>{composed}</>;
  }

  const labelNode = (
    <FieldHeader
      label={label}
      description={description}
      size="md"
      marginBottom={labelPosition === 'top' || labelPosition === 'bottom' ? undefined : 0}
      labelId={label != null ? labelId : undefined}
      descriptionId={description != null ? descriptionId : undefined}
    />
  );

  const isVertical = labelPosition === 'top' || labelPosition === 'bottom';
  const LayoutComponent = isVertical ? Column : Row;
  const layoutGap = isVertical ? 'xs' : 'sm';
  const layoutAlign = isVertical ? 'stretch' : 'center';

  return (
    <LayoutComponent gap={layoutGap} align={layoutAlign} {...spacingProps} {...layoutProps}>
      {labelPosition === 'top' && labelNode}
      {labelPosition === 'left' && labelNode}
      {composed}
      {labelPosition === 'right' && labelNode}
      {labelPosition === 'bottom' && labelNode}
    </LayoutComponent>
  );
};
