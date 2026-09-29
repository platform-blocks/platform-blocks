import React, { createContext, useContext, useEffect } from 'react';
import { Pressable, Text as RNText, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import type { A11yProps } from '../../core/accessibility/a11yProps';
import { announce } from '../../core/accessibility/announce';
import { getNodeText } from '../../core/accessibility/useA11yId';
import { useFieldA11y, type FieldA11yIds } from '../../core/accessibility/useFieldA11y';
import { useThemedStyles } from '../../core/hooks/useThemedStyles';
import { isIOS, isNative, webStyle } from '../../core/platform';
import { getControlSize } from '../../core/theme/tokens';
import { mergeSlotProps } from '../../core/utils/mergeSlotProps';
import type { SizeValue } from '../../core/theme/types';
import type { TextProps } from '../Text';
import { FieldHeader } from '../_internal/FieldHeader';
import { useDisclaimer, type DisclaimerSupport } from '../_internal/Disclaimer/disclaimerUtils';

/**
 * Where a choice control's label sits. `left` / `right` are logical — they
 * follow the reading direction (`right` = after the control, so it lands on the
 * left in RTL).
 */
export type ChoiceLabelPosition = 'left' | 'right' | 'top' | 'bottom';

/** What the control rendered inside a `ChoiceField` receives. */
export interface ChoiceFieldRenderProps {
  /** Spread on the focusable control: id, name/description wiring, aria-invalid/required/disabled. */
  controlProps: A11yProps;
  ids: FieldA11yIds;
  invalid: boolean;
}

export interface ChoiceFieldProps extends DisclaimerSupport {
  id?: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  /** Error message; `true` marks the control invalid without rendering a message. */
  error?: React.ReactNode;
  helperText?: React.ReactNode;
  required?: boolean;
  withAsterisk?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  size?: SizeValue;
  labelPosition?: ChoiceLabelPosition;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  labelProps?: Omit<TextProps, 'children'>;
  descriptionProps?: Omit<TextProps, 'children'>;
  /**
   * The label names one option (Checkbox, Radio, Switch) rather than a whole
   * field (Rating). Options take regular weight, so the semibold field label
   * of the group they sit in (RadioGroup's, say) stands above them instead of
   * matching them. `labelProps.fw` still wins.
   * @default true
   */
  choice?: boolean;
  /**
   * Pressing the label / description acts on the control, like an HTML
   * `<label>`. The label is a press target only — never a tab stop.
   */
  onLabelPress?: () => void;
  /** Rendered before the label inside the label block (an icon, for instance); part of the press target. */
  labelAdornment?: React.ReactNode;
  /**
   * Cross-axis alignment of the control against a label block beside it.
   * Default: `center`, or `flex-start` when there is a description (so the
   * control lines up with the label, not the middle of two lines).
   */
  align?: 'center' | 'flex-start';
  /** Cross-axis alignment when the label sits above / below the control. Default `center`. */
  stackedAlign?: 'center' | 'flex-start';
  /** Space between the control and the label block (px). Default 8. */
  gap?: number;
  /**
   * Leading offset (px) of the error / helper footer, so it lines up with a
   * label that sits after the control (usually the control's width + `gap`).
   */
  footerInset?: number;
  style?: StyleProp<ViewStyle>;
  children: (field: ChoiceFieldRenderProps) => React.ReactNode;
}

/** Hides a subtree from VoiceOver / TalkBack (native only). */
const NATIVE_HIDDEN = { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' } as const;

const hasContent = (node: React.ReactNode) =>
  node !== undefined && node !== null && node !== false && node !== true && node !== '';

/**
 * Set by `ControlField.Indicator`: a Checkbox / Switch / Radio rendered inside
 * it is only the picture of the state — the surrounding row is the control —
 * so it drops its own role, focus stop and label frame.
 */
const ChoiceIndicatorContext = createContext(false);
ChoiceIndicatorContext.displayName = 'ChoiceIndicatorContext';

export const ChoiceIndicatorProvider = ChoiceIndicatorContext.Provider;

/** True when rendered as the decorative indicator of a `ControlField` row. */
export function useIsChoiceIndicator(): boolean {
  return useContext(ChoiceIndicatorContext);
}

/**
 * The field frame for choice controls (Checkbox, Switch, Radio): the control,
 * a label block beside / above / below it, and the error / helper footer —
 * all wired through `useFieldA11y`, following the same contract as the
 * shared `Field` frame (label + description ids referenced by the control,
 * error as a polite `role="alert"` region, spoken on iOS).
 *
 * It exists next to `Field` because a choice control's label must also be a
 * press target (without becoming a second tab stop) and supports a `bottom`
 * position, neither of which `Field` offers.
 */
export function ChoiceField({
  id,
  label,
  description,
  error,
  helperText,
  required = false,
  withAsterisk,
  disabled = false,
  readOnly = false,
  size = 'md',
  labelPosition = 'right',
  accessibilityLabel,
  accessibilityHint,
  labelProps,
  descriptionProps,
  choice = true,
  onLabelPress,
  labelAdornment,
  align: alignProp,
  stackedAlign = 'center',
  gap = 8,
  footerInset = 0,
  style,
  disclaimer,
  disclaimerProps,
  children,
}: ChoiceFieldProps) {
  const { controlProps, ids, invalid, showError, showHelper, errorProps, helperProps } = useFieldA11y({
    id,
    label,
    description,
    error,
    helperText,
    required,
    disabled,
    readOnly,
    accessibilityLabel,
    accessibilityHint,
  });

  const align = alignProp ?? (hasContent(description) ? 'flex-start' : 'center');
  const styles = useThemedStyles(
    (theme) => {
      const footerFontSize = Math.max(10, getControlSize(theme, size).fontSize - 1);
      return {
        row: { flexDirection: 'row', alignItems: align, gap } as ViewStyle,
        adornedHeader: { flexDirection: 'row', alignItems: 'center', gap } as ViewStyle,
        column: { flexDirection: 'column', alignItems: stackedAlign, gap } as ViewStyle,
        headerBeside: { flexShrink: 1 } as ViewStyle,
        headerStacked: { alignItems: stackedAlign } as ViewStyle,
        pressableHeader: webStyle({ cursor: 'pointer' }),
        footer: { marginTop: 4 } as ViewStyle,
        footerStacked: { alignSelf: stackedAlign } as ViewStyle,
        error: { color: theme.colors.error[5], fontSize: footerFontSize, fontFamily: theme.fontFamily } as TextStyle,
        helper: { color: theme.text.muted, fontSize: footerFontSize, fontFamily: theme.fontFamily } as TextStyle,
      };
    },
    [size, align, stackedAlign, gap]
  );

  // Live regions are Android/web only: on iOS, speak a newly shown error.
  const errorText = showError && isIOS ? getNodeText(error) : '';
  useEffect(() => {
    if (errorText) announce(errorText);
  }, [errorText]);

  const renderDisclaimer = useDisclaimer(disclaimer, disclaimerProps);

  const stacked = labelPosition === 'top' || labelPosition === 'bottom';
  const labelFirst = labelPosition === 'left' || labelPosition === 'top';
  const pressable = !!onLabelPress && !disabled && !readOnly;
  const hasHeader = hasContent(label) || hasContent(description) || labelAdornment != null;

  const fieldHeader = (
    <FieldHeader
      label={label}
      description={description}
      required={required}
      withAsterisk={withAsterisk ?? required}
      disabled={disabled}
      error={invalid}
      size={size}
      labelProps={choice ? mergeSlotProps({ fw: '400' }, labelProps) : labelProps}
      descriptionProps={descriptionProps}
      labelId={hasContent(label) ? ids.label : undefined}
      descriptionId={hasContent(description) ? ids.description : undefined}
      marginBottom={0}
    />
  );

  const header = hasHeader ? (
    <Pressable
      onPress={pressable ? onLabelPress : undefined}
      // A press target for pointers only: the control itself is the one tab
      // stop. On native the control's accessible name and hint already carry
      // the label and description (useFieldA11y composes them), so the visual
      // copy is hidden from the screen reader instead of being read twice; on
      // web it stays — the control references it through aria-labelledby.
      accessible={false}
      tabIndex={-1}
      {...(isNative ? NATIVE_HIDDEN : null)}
      style={[stacked ? styles.headerStacked : styles.headerBeside, pressable && styles.pressableHeader]}
    >
      {labelAdornment != null ? (
        <View style={styles.adornedHeader}>
          {labelAdornment}
          {fieldHeader}
        </View>
      ) : (
        fieldHeader
      )}
    </Pressable>
  ) : null;

  // Line the footer up with a label that sits after the control.
  const footerStyle = [
    styles.footer,
    stacked ? styles.footerStacked : labelPosition === 'right' && footerInset ? { marginStart: footerInset } : null,
  ];

  // The error replaces the helper text while present; its container is always a
  // polite `role="alert"` region so a newly shown error is announced.
  const footer = showError ? (
    // `accessible` groups the message into one native node (ignored on web).
    <View {...errorProps} accessible style={footerStyle}>
      <RNText style={styles.error}>{error}</RNText>
    </View>
  ) : showHelper ? (
    <View id={helperProps.id} style={footerStyle}>
      <RNText style={styles.helper}>{helperText}</RNText>
    </View>
  ) : null;

  const control = children({ controlProps, ids, invalid });
  const disclaimerNode = renderDisclaimer();

  return (
    <View style={style}>
      <View style={stacked ? styles.column : styles.row}>
        {labelFirst ? header : null}
        {control}
        {labelFirst ? null : header}
      </View>
      {footer}
      {disclaimerNode}
    </View>
  );
}

ChoiceField.displayName = 'ChoiceField';
