import React from 'react';
import { View, type TextStyle } from 'react-native';
import { Text, type TextProps } from '../Text';
import { useThemedStyles } from '../../core/hooks/useThemedStyles';
import { resolveFontSize } from '../../core/theme/tokens';
import type { SizeValue } from '../../core/theme/types';
import { mergeSlotProps } from '../../core/utils/mergeSlotProps';
import { isWeb } from '../../core/platform';
import { getNodeText } from '../../core/accessibility/useA11yId';
import { getFieldLabelFontSize } from './Field/fieldFrameStyles';

export interface FieldHeaderProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  withAsterisk?: boolean;
  disabled?: boolean;
  error?: boolean;
  size?: SizeValue;
  /** Extra spacing below the block (default auto based on presence) */
  marginBottom?: number;
  /** Optional test id */
  testID?: string;
  /** Override props applied to the label Text element */
  labelProps?: Omit<TextProps, 'children'>;
  /** Override props applied to the description Text element */
  descriptionProps?: Omit<TextProps, 'children'>;
  /** Id of the label element, referenced by the control's `aria-labelledby`. */
  labelId?: string;
  /** Id of the description element, referenced by the control's `aria-describedby`. */
  descriptionId?: string;
  /** Spoken in place of the asterisk on native. Default `'required'`. */
  requiredText?: string;
}

/**
 * Internal utility component to standardize label + description block across field components.
 * Renders label, required asterisk, and muted description text directly beneath.
 *
 * The asterisk is visual only: it is hidden from assistive technology (web) and
 * the native label is announced as "<label>, required" instead of "<label> star".
 * Required-ness reaches the control itself through `aria-required` (see useFieldA11y).
 */
export const FieldHeader: React.FC<FieldHeaderProps> = ({
  label,
  description,
  required,
  withAsterisk,
  disabled,
  error,
  size = 'md',
  marginBottom,
  testID,
  labelProps,
  descriptionProps,
  labelId,
  descriptionId,
  requiredText = 'required',
}) => {
  // Built once per theme/size/disabled, not per keystroke of the field it heads.
  const styles = useThemedStyles(
    (theme) => ({
      label: {
        color: disabled ? theme.text.disabled : theme.text.primary,
        fontSize: getFieldLabelFontSize(theme, size),
        marginBottom: 0,
      } as TextStyle,
      // A plain string color: the web asterisk is a raw <span>.
      required: { color: theme.colors.error[5] },
      description: { fontSize: resolveFontSize(theme, 'sm'), color: theme.text.muted } as TextStyle,
    }),
    [size, disabled]
  );

  if (!label && !description) return null;

  const hasDescription = Boolean(description);
  const resolvedMarginBottom = (() => {
    if (marginBottom !== undefined) return marginBottom;
    if (!hasDescription && !error) return 0;
    return 4;
  })();

  const showAsterisk = Boolean(required && withAsterisk);
  const asterisk = !showAsterisk ? null : isWeb ? (
    // A raw inline element: the library Text doesn't forward ARIA props on web.
    <span aria-hidden="true" style={{ color: styles.required.color }}>
      {' *'}
    </span>
  ) : (
    <Text style={styles.required}>{' *'}</Text>
  );

  const labelElement = label ? (
    // The default weight goes through `fw`, not the style, so `labelProps.fw` can override it.
    <Text {...mergeSlotProps({ style: styles.label, fw: '600', id: labelId }, labelProps)}>
      {label}
      {asterisk}
    </Text>
  ) : null;

  // Native reads a Text's whole string (asterisk included), so a required
  // label is wrapped in one accessible node with a spoken name instead.
  const nativeLabelText = !isWeb && showAsterisk ? getNodeText(label) : '';

  return (
    <View style={{ marginBottom: resolvedMarginBottom }} testID={testID}>
      {nativeLabelText ? (
        <View accessible aria-label={`${nativeLabelText}, ${requiredText}`}>
          {labelElement}
        </View>
      ) : (
        labelElement
      )}
      {description ? (
        <Text {...mergeSlotProps({ style: styles.description, id: descriptionId }, descriptionProps)}>
          {description}
        </Text>
      ) : null}
    </View>
  );
};

export default FieldHeader;
