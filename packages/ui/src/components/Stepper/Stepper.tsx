import React, { createContext, useContext, useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import type { TextStyle, ViewProps, ViewStyle } from 'react-native';

import { a11yProps } from '../../core/accessibility/a11yProps';
import { useRovingFocus, type UseRovingFocusResult } from '../../core/accessibility/useRovingFocus';
import { factory, withStatics } from '../../core/factory';
import { webProps } from '../../core/platform';
import { resolveAccentColor } from '../../core/theme/resolveColors';
import { resolveSurface } from '../../core/theme/surfaces';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getControlSize, onColor } from '../../core/theme/tokens';
import type { PlatformBlocksTheme, SizeValue } from '../../core/theme/types';
import { mergeSlotProps } from '../../core/utils/mergeSlotProps';
import { useMergedRef } from '../../core/utils/mergeRefs';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import { Loader } from '../Loader';
import { Text } from '../Text';
import type {
  StepperCompletedProps,
  StepperContextValue,
  StepperMetrics,
  StepperProps,
  StepperStepProps,
} from './types';

// Create Stepper Context
const StepperContext = createContext<StepperContextValue | null>(null);

const useStepperContext = () => {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error('Stepper components must be used within a Stepper');
  }
  return context;
};

const MIN_STEPPER_METRICS = {
  iconSize: 20,
  fontSize: 12,
  descriptionFontSize: 10,
  spacing: 8,
  lineWidth: 2,
} as const;

/** Thickness of the connector, scaled off the indicator so large steppers keep their proportions. */
const lineWidthForIcon = (iconSize: number) => Math.max(MIN_STEPPER_METRICS.lineWidth, Math.round(iconSize / 16));

/** Stepper proportions, derived from the shared control-size scale (a numeric `size` is a control height). */
function getStepperMetrics(theme: PlatformBlocksTheme, size: SizeValue): StepperMetrics {
  const control = getControlSize(theme, size);
  const fontSize = Math.max(MIN_STEPPER_METRICS.fontSize, control.fontSize);
  const descriptionFontSize = Math.max(
    MIN_STEPPER_METRICS.descriptionFontSize,
    Math.min(fontSize - 1, Math.round(control.fontSize * 0.9))
  );
  const iconSize = Math.max(MIN_STEPPER_METRICS.iconSize, Math.round(control.height * 0.8));

  return {
    iconSize,
    fontSize,
    descriptionFontSize,
    spacing: Math.max(MIN_STEPPER_METRICS.spacing, Math.round(control.paddingX * 1.25) + 1),
    lineWidth: lineWidthForIcon(iconSize),
  };
}

// Step Component
const StepperStep = factory<{ props: StepperStepProps; ref: View }>((
  {
    children: _children,
    label,
    description,
    icon,
    completedIcon,
    allowStepSelect = true,
    color,
    loading = false,
    'aria-label': ariaLabel,
    title,
    stepIndex = 0,
    isFirst = false,
    isLast = false,
    labelProps,
    descriptionProps,
    style,
    testID,
  },
  ref
) => {
  const theme = useTheme();
  const {
    active,
    onStepClick,
    orientation,
    iconPosition,
    iconSize: contextIconSize,
    color: contextColor,
    completedIcon: contextCompletedIcon,
    allowNextStepsSelect,
    metrics,
    roving,
  } = useStepperContext();

  const finalIconSize = contextIconSize || metrics.iconSize;
  const stepColor = resolveAccentColor(theme, color) ?? contextColor;
  const isVertical = orientation === 'vertical';
  const isCompleted = stepIndex < active;
  const isActive = stepIndex === active;
  const isClickable = !!onStepClick && allowStepSelect && (allowNextStepsSelect || stepIndex <= active);

  const mutedColor = theme.backgrounds?.border ?? resolveSurface(theme, 1).border;
  // Content sitting inside a filled indicator has to read against the fill, not the page.
  const indicatorContentColor = isCompleted || isActive ? onColor(theme, stepColor, 3) : theme.text.muted;
  // Gap between the indicator and the connector so the line never collides with the ring.
  // Vertical runs use a tighter gap because its connector is short by comparison.
  const railGap = isVertical
    ? Math.max(3, Math.round(metrics.spacing * 0.35))
    : Math.max(4, Math.round(metrics.spacing * 0.5));
  const bodyGap = Math.max(6, Math.round(metrics.spacing * 0.75));
  // Horizontal steps sit under their indicator; vertical ones hug the rail they belong to.
  const bodyTextAlign: TextStyle['textAlign'] = !isVertical
    ? 'center'
    : iconPosition === 'right' ? 'right' : 'left';

  const stepIconStyle: ViewStyle = {
    width: finalIconSize,
    height: finalIconSize,
    borderRadius: finalIconSize / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    // Pending steps read off the theme rather than a hardcoded white circle,
    // which inverted into a bright dot on dark backgrounds.
    borderColor: isCompleted || isActive ? stepColor : mutedColor,
    backgroundColor: isCompleted || isActive ? stepColor : theme.backgrounds?.surface ?? resolveSurface(theme, 1).background,
  };

  const stepNumberStyle: TextStyle = {
    fontSize: Math.round(metrics.fontSize * 0.85),
    fontWeight: '600',
    color: indicatorContentColor,
    lineHeight: Math.round(metrics.fontSize * 1.1),
  };

  const stepLabelStyle: TextStyle = {
    fontSize: metrics.fontSize,
    // Upcoming steps recede so the active/completed trail carries the eye.
    color: isActive ? stepColor : isCompleted ? theme.text.primary : theme.text.secondary,
    marginBottom: description ? 2 : 0,
    textAlign: bodyTextAlign,
  };

  const stepDescriptionStyle: TextStyle = {
    fontSize: metrics.descriptionFontSize,
    color: theme.text.secondary,
    textAlign: bodyTextAlign,
  };

  // Icons handed in by consumers default to body text color, which disappears on a
  // filled indicator — tint them unless the caller picked a color themselves.
  const tintIndicatorContent = (node: React.ReactNode): React.ReactNode => {
    if (!React.isValidElement(node) || typeof node.type === 'string') return node;
    const nodeProps = node.props as { color?: string };
    if (nodeProps.color != null) return node;
    return React.cloneElement(node as React.ReactElement<{ color?: string }>, { color: indicatorContentColor });
  };

  const renderStepIcon = () => {
    if (loading) {
      return <Loader size={Math.max(12, Math.round(finalIconSize * 0.55))} color={indicatorContentColor} />;
    }

    if (isCompleted && (completedIcon || contextCompletedIcon)) {
      return tintIndicatorContent(completedIcon || contextCompletedIcon);
    }

    if (icon) {
      return tintIndicatorContent(icon);
    }

    return <Text style={stepNumberStyle}>{stepIndex + 1}</Text>;
  };

  /** Half-connector rendered on either side of the indicator. */
  const renderRailSegment = (side: 'leading' | 'trailing') => {
    const hidden = side === 'leading' ? isFirst : isLast;
    // The leading half belongs to the segment that ends at this step, so it lights up
    // once the previous step is done; the trailing half lights up once this step is done.
    const filled = side === 'leading' ? isCompleted || isActive : isCompleted;

    return (
      <View
        style={{
          flex: 1,
          height: metrics.lineWidth,
          borderRadius: metrics.lineWidth / 2,
          marginStart: side === 'trailing' ? railGap : 0,
          marginEnd: side === 'leading' ? railGap : 0,
          backgroundColor: hidden ? 'transparent' : filled ? stepColor : mutedColor,
        }}
      />
    );
  };

  const renderStepBody = () => {
    if (!label && !description) return null;

    const body = (
      <>
        {label && (
          <Text {...mergeSlotProps({ fw: isActive ? '600' : '500', style: stepLabelStyle }, labelProps)}>
            {label}
          </Text>
        )}
        {description && (
          <Text {...mergeSlotProps({ style: stepDescriptionStyle }, descriptionProps)}>{description}</Text>
        )}
      </>
    );

    if (isVertical) {
      return (
        <View
          style={{
            flex: 1,
            marginStart: iconPosition === 'right' ? 0 : metrics.spacing,
            marginEnd: iconPosition === 'right' ? metrics.spacing : 0,
            // Bottom padding is what gives the connector its length, so it lives
            // inside the row rather than as a gap between rows.
            paddingBottom: isLast ? 0 : Math.round(metrics.spacing * 1.25),
            paddingTop: Math.max(0, Math.round((finalIconSize - metrics.fontSize * 1.4) / 2)),
          }}
        >
          {body}
        </View>
      );
    }

    return <View style={{ alignSelf: 'stretch', alignItems: 'center', marginTop: bodyGap }}>{body}</View>;
  };

  const renderVertical = () => {
    const rail = (
      <View style={{ width: finalIconSize, alignItems: 'center' }}>
        <View style={stepIconStyle}>{renderStepIcon()}</View>
        {!isLast && (
          <View
            style={{
              flex: 1,
              width: metrics.lineWidth,
              borderRadius: metrics.lineWidth / 2,
              marginVertical: railGap,
              minHeight: metrics.spacing,
              backgroundColor: isCompleted ? stepColor : mutedColor,
            }}
          />
        )}
      </View>
    );
    // `iconPosition="right"` puts the rail after the body (the row flips under RTL).
    return (
      <View style={{ flexDirection: 'row', alignItems: 'stretch' }}>
        {iconPosition === 'right' ? renderStepBody() : rail}
        {iconPosition === 'right' ? rail : renderStepBody()}
      </View>
    );
  };

  const renderHorizontal = () => (
    <View style={{ alignItems: 'center' }}>
      {/* Indicator sits centered in an equal-width column, with the connector halves
          filling the space out to the neighbouring steps at the exact same axis. */}
      <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' }}>
        {renderRailSegment('leading')}
        <View style={stepIconStyle}>{renderStepIcon()}</View>
        {renderRailSegment('trailing')}
      </View>
      {renderStepBody()}
    </View>
  );

  // Pressable steps join the roving tab stop; the hook tracks their nodes.
  const itemProps = onStepClick && roving ? roving.getItemProps(stepIndex) : null;
  const mergedRef = useMergedRef<View>(ref, itemProps?.ref);

  const rootStyle: ViewStyle = isVertical ? { alignSelf: 'stretch' } : { flex: 1, minWidth: 0 };
  const accessibleName = ariaLabel || label || `Step ${stepIndex + 1}`;
  // `title` renders a native tooltip on web (react-native-web forwards it).
  const titleProps = title ? ({ title } as ViewProps) : null;

  if (!onStepClick) {
    // Nothing to press: a static progress indicator (a list of steps), not a set of buttons.
    return (
      <View
        ref={mergedRef}
        testID={testID}
        {...a11yProps({
          role: 'listitem',
          label: accessibleName,
          current: isActive ? 'step' : undefined,
          accessible: true,
        })}
        {...titleProps}
        style={[rootStyle, style]}
      >
        {isVertical ? renderVertical() : renderHorizontal()}
      </View>
    );
  }

  return (
    <Pressable
      ref={mergedRef}
      testID={testID}
      onPress={isClickable ? () => onStepClick(stepIndex) : undefined}
      disabled={!isClickable}
      {...a11yProps({
        role: 'button',
        label: accessibleName,
        current: isActive ? 'step' : undefined,
        disabled: !isClickable,
      })}
      {...(itemProps ? { onFocus: itemProps.onFocus } : null)}
      {...webProps(itemProps ? { tabIndex: itemProps.tabIndex, onKeyDown: itemProps.onKeyDown } : {})}
      {...titleProps}
      style={({ pressed }) => [rootStyle, pressed && isClickable ? { opacity: 0.7 } : null, style]}
    >
      {isVertical ? renderVertical() : renderHorizontal()}
    </Pressable>
  );
}, { displayName: 'Stepper.Step' });

// Completed Component
const StepperCompleted: React.FC<StepperCompletedProps> = ({ children }) => {
  const content = typeof children === 'string' || typeof children === 'number'
    ? <Text>{children}</Text>
    : children;
  return <View>{content}</View>;
};
StepperCompleted.displayName = 'Stepper.Completed';

const isStepElement = (child: React.ReactNode): child is React.ReactElement<StepperStepProps> =>
  React.isValidElement(child) && child.type === StepperStep;

// Main Stepper Component
const StepperRoot = factory<{ props: StepperProps; ref: View }>((
  {
    active,
    onStepClick,
    orientation = 'horizontal',
    iconPosition = 'left',
    iconSize,
    size = 'md',
    color,
    completedIcon,
    allowNextStepsSelect = true,
    children,
    'aria-label': ariaLabel,
    style,
    testID,
    ...rest
  },
  ref
) => {
  const theme = useTheme();
  const { styleProps } = extractStyleProps(rest);
  const spacingStyle = useStyleProps(styleProps);
  const metrics = useMemo(() => getStepperMetrics(theme, size), [theme, size]);
  const resolvedIconSize = iconSize ?? metrics.iconSize;
  const resolvedColor = resolveAccentColor(theme, color) ?? theme.colors.primary[5];
  const isVertical = orientation === 'vertical';

  // Collect the steps first so indices track step order, not raw child order
  // (conditional children and `Stepper.Completed` would otherwise skew them).
  const stepChildren: React.ReactElement<StepperStepProps>[] = [];
  let completedContent: React.ReactElement | null = null;

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === StepperCompleted) {
      completedContent = child as React.ReactElement;
    } else if (isStepElement(child)) {
      stepChildren.push(child);
    }
  });

  // Keyboard: pressable steps share one tab stop (arrow keys move between them).
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const stepCount = stepChildren.length;
  const isStepDisabled = (index: number) => {
    const step = stepChildren[index];
    if (!step || step.props.allowStepSelect === false) return true;
    return !allowNextStepsSelect && index > active;
  };
  const roving: UseRovingFocusResult = useRovingFocus({
    count: stepCount,
    orientation: isVertical ? 'vertical' : 'horizontal',
    loop: false,
    activeIndex: focusIndex ?? Math.min(Math.max(active, 0), Math.max(stepCount - 1, 0)),
    onActiveChange: setFocusIndex,
    isDisabled: isStepDisabled,
  });

  const contextValue = useMemo<StepperContextValue>(
    () => ({
      active,
      onStepClick,
      orientation,
      iconPosition,
      iconSize: resolvedIconSize,
      size,
      metrics,
      color: resolvedColor,
      completedIcon,
      allowNextStepsSelect,
      roving: onStepClick ? roving : undefined,
    }),
    [
      active,
      onStepClick,
      orientation,
      iconPosition,
      resolvedIconSize,
      size,
      metrics,
      resolvedColor,
      completedIcon,
      allowNextStepsSelect,
      roving,
    ]
  );

  const stepsStyle: ViewStyle = {
    flexDirection: isVertical ? 'column' : 'row',
    alignItems: isVertical ? 'stretch' : 'flex-start',
  };

  const contentStyle: ViewStyle = {
    marginTop: metrics.spacing,
    // Line the content up with the step bodies instead of the indicator rail.
    marginStart: isVertical ? resolvedIconSize + metrics.spacing : 0,
  };

  const currentStepContent = stepChildren[active]?.props.children ?? null;

  const renderContent = () => {
    const content = active >= stepChildren.length && completedContent ? completedContent : currentStepContent;

    if (!content) return null;

    const node = typeof content === 'string' || typeof content === 'number' ? <Text>{content}</Text> : content;

    return <View style={contentStyle}>{node}</View>;
  };

  return (
    <StepperContext.Provider value={contextValue}>
      <View
        ref={ref}
        testID={testID}
        {...a11yProps({ role: ariaLabel ? 'group' : undefined, label: ariaLabel })}
        style={[spacingStyle, style]}
      >
        <View style={stepsStyle} {...a11yProps({ role: onStepClick ? undefined : 'list' })}>
          {stepChildren.map((step, index) =>
            React.cloneElement(step, {
              key: step.key ?? `step-${index}`,
              stepIndex: index,
              isFirst: index === 0,
              isLast: index === stepChildren.length - 1,
            })
          )}
        </View>
        {renderContent()}
      </View>
    </StepperContext.Provider>
  );
}, { displayName: 'Stepper' });

/**
 * A multi-step progress indicator. Steps are buttons when `onStepClick` is set
 * (one tab stop, arrow keys move between them); the active step carries
 * `aria-current="step"`.
 */
export const Stepper = withStatics(StepperRoot, { Step: StepperStep, Completed: StepperCompleted });

export type { StepperProps, StepperStepProps, StepperCompletedProps };
