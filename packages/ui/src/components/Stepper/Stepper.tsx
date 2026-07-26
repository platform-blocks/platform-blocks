import React, { createContext, useContext, forwardRef, useMemo } from 'react';
import { View, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { Text } from '../Text';
import { StepperProps, StepperStepProps, StepperCompletedProps, StepperContextValue, type StepperMetrics } from './types';
import { useTheme } from '../../core/theme/ThemeProvider';
import { readableTextOn } from '../../core/theme/colorUtils';
import { resolveSurface } from '../../core/theme/surfaces';
import { Loader } from '../Loader';
import { resolveComponentSize, type ComponentSize, type ComponentSizeValue } from '../../core/theme/componentSize';
import { getComponentSize } from '../../core/theme/unified-sizing';
import { mergeSlotProps } from '../../core/utils';

// Create Stepper Context
const StepperContext = createContext<StepperContextValue | null>(null);

const useStepperContext = () => {
  const context = useContext(StepperContext);
  if (!context) {
    throw new Error('Stepper components must be used within a Stepper');
  }
  return context;
};

const STEPPER_ALLOWED_SIZES = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'] as const;
const STEPPER_ALLOWED_SIZES_ARRAY: ComponentSize[] = [...STEPPER_ALLOWED_SIZES];

const MIN_STEPPER_METRICS = {
  iconSize: 20,
  fontSize: 12,
  descriptionFontSize: 10,
  spacing: 8,
  lineWidth: 2,
} as const;

/** Thickness of the connector, scaled off the indicator so large steppers keep their proportions. */
const lineWidthForIcon = (iconSize: number) => Math.max(MIN_STEPPER_METRICS.lineWidth, Math.round(iconSize / 16));

const STEPPER_SIZE_SCALE: Partial<Record<ComponentSize, StepperMetrics>> = STEPPER_ALLOWED_SIZES_ARRAY.reduce(
  (acc, token) => {
    acc[token] = createMetricsForToken(token);
    return acc;
  },
  {} as Partial<Record<ComponentSize, StepperMetrics>>
);

const BASE_STEPPER_METRICS = STEPPER_SIZE_SCALE.md ?? createMetricsForToken('md');
const BASE_STEPPER_HEIGHT = getComponentSize('md').height;

function createMetricsForToken(size: ComponentSize): StepperMetrics {
  const config = getComponentSize(size);

  const fontSize = Math.max(MIN_STEPPER_METRICS.fontSize, config.fontSize);
  const descriptionFontSize = Math.max(
    MIN_STEPPER_METRICS.descriptionFontSize,
    Math.min(fontSize - 1, Math.round(config.fontSize * 0.9))
  );

  const iconSize = Math.max(MIN_STEPPER_METRICS.iconSize, Math.round(config.height * 0.8));

  return {
    iconSize,
    fontSize,
    descriptionFontSize,
    spacing: Math.max(MIN_STEPPER_METRICS.spacing, Math.round(config.padding * 1.25) + 1),
    lineWidth: lineWidthForIcon(iconSize),
  };
}

function resolveStepperMetrics(value: ComponentSizeValue | undefined): StepperMetrics {
  const resolved = resolveComponentSize(value, STEPPER_SIZE_SCALE, {
    allowedSizes: STEPPER_ALLOWED_SIZES_ARRAY,
    fallback: 'md',
  });

  if (typeof resolved === 'number') {
    return calculateNumericMetrics(resolved);
  }

  return resolved;
}

function calculateNumericMetrics(height: number): StepperMetrics {
  const normalizedHeight = Math.max(MIN_STEPPER_METRICS.iconSize + 4, Math.round(height));
  const scale = normalizedHeight / BASE_STEPPER_HEIGHT;

  const fontSize = Math.max(MIN_STEPPER_METRICS.fontSize, Math.round(BASE_STEPPER_METRICS.fontSize * scale));
  const descriptionFontSize = Math.max(
    MIN_STEPPER_METRICS.descriptionFontSize,
    Math.min(fontSize - 1, Math.round(BASE_STEPPER_METRICS.descriptionFontSize * scale))
  );

  const iconSize = Math.max(MIN_STEPPER_METRICS.iconSize, Math.round(normalizedHeight * 0.8));

  return {
    iconSize,
    fontSize,
    descriptionFontSize,
    spacing: Math.max(MIN_STEPPER_METRICS.spacing, Math.round(BASE_STEPPER_METRICS.spacing * scale)),
    lineWidth: lineWidthForIcon(iconSize),
  };
}

// Step Component
const StepperStep = forwardRef<View, StepperStepProps>((
  {
    children,
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
    ...props
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
  } = useStepperContext();

  const finalIconSize = contextIconSize || metrics.iconSize;
  const stepColor = color || contextColor || theme.colors.primary[5];
  const isVertical = orientation === 'vertical';
  const isCompleted = stepIndex < active;
  const isActive = stepIndex === active;
  const isClickable = allowStepSelect && (allowNextStepsSelect || stepIndex <= active) && onStepClick;

  const mutedColor = theme.backgrounds?.border ?? resolveSurface(theme, 1).border;
  // Content sitting inside a filled indicator has to read against the fill, not the page.
  const indicatorContentColor = isCompleted || isActive ? readableTextOn(stepColor) : theme.text.muted;
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

  const getStepIconStyles = (): ViewStyle => ({
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
  });

  const getStepNumberStyles = (): TextStyle => ({
    fontSize: Math.round(metrics.fontSize * 0.85),
    fontWeight: '600',
    color: indicatorContentColor,
    lineHeight: Math.round(metrics.fontSize * 1.1),
  });

  const getStepLabelStyles = (): TextStyle => ({
    fontSize: metrics.fontSize,
    // Upcoming steps recede so the active/completed trail carries the eye.
    color: isActive ? stepColor : isCompleted ? theme.text.primary : theme.text.secondary,
    marginBottom: description ? 2 : 0,
    textAlign: bodyTextAlign,
  });

  const getStepDescriptionStyles = (): TextStyle => ({
    fontSize: metrics.descriptionFontSize,
    color: theme.text.secondary,
    textAlign: bodyTextAlign,
  });

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

    return (
      <Text style={getStepNumberStyles()}>
        {stepIndex + 1}
      </Text>
    );
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
          marginLeft: side === 'trailing' ? railGap : 0,
          marginRight: side === 'leading' ? railGap : 0,
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
          <Text
            {...mergeSlotProps(
              { weight: isActive ? '600' : '500', style: getStepLabelStyles() },
              labelProps
            )}
          >
            {label}
          </Text>
        )}
        {description && (
          <Text {...mergeSlotProps({ style: getStepDescriptionStyles() }, descriptionProps)}>
            {description}
          </Text>
        )}
      </>
    );

    if (isVertical) {
      return (
        <View
          style={{
            flex: 1,
            marginLeft: iconPosition === 'right' ? 0 : metrics.spacing,
            marginRight: iconPosition === 'right' ? metrics.spacing : 0,
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

    return (
      <View style={{ alignSelf: 'stretch', alignItems: 'center', marginTop: bodyGap }}>
        {body}
      </View>
    );
  };

  const handlePress = () => {
    if (isClickable) {
      onStepClick!(stepIndex);
    }
  };

  const renderVertical = () => (
    <View style={{ flexDirection: iconPosition === 'right' ? 'row-reverse' : 'row', alignItems: 'stretch' }}>
      <View style={{ width: finalIconSize, alignItems: 'center' }}>
        <View style={getStepIconStyles()}>
          {renderStepIcon()}
        </View>
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
      {renderStepBody()}
    </View>
  );

  const renderHorizontal = () => (
    <View style={{ alignItems: 'center' }}>
      {/* Indicator sits centered in an equal-width column, with the connector halves
          filling the space out to the neighbouring steps at the exact same axis. */}
      <View style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' }}>
        {renderRailSegment('leading')}
        <View style={getStepIconStyles()}>
          {renderStepIcon()}
        </View>
        {renderRailSegment('trailing')}
      </View>
      {renderStepBody()}
    </View>
  );

  return (
    <TouchableOpacity
      ref={ref}
      onPress={handlePress}
      disabled={!isClickable}
      accessibilityLabel={ariaLabel || label || `Step ${stepIndex + 1}`}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive, disabled: !isClickable }}
      {...(props as Record<string, unknown>)}
      // `title` renders a native tooltip on web; harmless elsewhere.
      {...(title ? ({ title } as Record<string, unknown>) : {})}
      style={[
        isVertical ? { alignSelf: 'stretch' } : { flex: 1, minWidth: 0 },
        (props as { style?: ViewStyle }).style,
      ]}
    >
      {isVertical ? renderVertical() : renderHorizontal()}
    </TouchableOpacity>
  );
});

// Completed Component
const StepperCompleted: React.FC<StepperCompletedProps> = ({ children }) => {
  const content = typeof children === 'string' || typeof children === 'number'
    ? <Text>{children}</Text>
    : children;
  return <View>{content}</View>;
};

// Main Stepper Component
const Stepper = forwardRef<View, StepperProps>((
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
    ...props
  },
  ref
) => {
  const theme = useTheme();
  const metrics = useMemo(() => resolveStepperMetrics(size), [size]);
  const resolvedIconSize = iconSize ?? metrics.iconSize;
  const resolvedColor = color ?? theme.colors.primary[5];

  const contextValue: StepperContextValue = {
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
  };

  const isVertical = orientation === 'vertical';

  const getStepperStyles = (): ViewStyle => ({
    flexDirection: isVertical ? 'column' : 'row',
    alignItems: isVertical ? 'stretch' : 'flex-start',
  });

  const getContentStyles = (): ViewStyle => ({
    marginTop: metrics.spacing,
    // Line the content up with the step bodies instead of the indicator rail.
    marginLeft: isVertical ? resolvedIconSize + metrics.spacing : 0,
  });

  // Collect the steps first so indices track step order, not raw child order
  // (conditional children and `Stepper.Completed` would otherwise skew them).
  const stepChildren: React.ReactElement<StepperStepProps>[] = [];
  let completedContent: React.ReactElement | null = null;

  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === StepperCompleted) {
      completedContent = child as React.ReactElement;
    } else if (child.type === StepperStep) {
      stepChildren.push(child as React.ReactElement<StepperStepProps>);
    }
  });

  const currentStepContent = stepChildren[active]?.props.children ?? null;

  const renderSteps = () =>
    stepChildren.map((step, index) =>
      React.cloneElement(step, {
        key: step.key ?? `step-${index}`,
        stepIndex: index,
        isFirst: index === 0,
        isLast: index === stepChildren.length - 1,
      })
    );

  const renderContent = () => {
    const content = active >= stepChildren.length && completedContent
      ? completedContent
      : currentStepContent;

    if (!content) return null;

    const node = typeof content === 'string' || typeof content === 'number'
      ? <Text>{content}</Text>
      : content;

    return <View style={getContentStyles()}>{node}</View>;
  };

  return (
    <StepperContext.Provider value={contextValue}>
      <View ref={ref} accessibilityLabel={ariaLabel} {...props}>
        <View style={getStepperStyles()}>
          {renderSteps()}
        </View>
        {renderContent()}
      </View>
    </StepperContext.Provider>
  );
});

// Attach sub-components
const StepperWithSubComponents = Stepper as typeof Stepper & {
  Step: typeof StepperStep;
  Completed: typeof StepperCompleted;
};

StepperWithSubComponents.Step = StepperStep;
StepperWithSubComponents.Completed = StepperCompleted;

StepperStep.displayName = 'Stepper.Step';
StepperCompleted.displayName = 'Stepper.Completed';
Stepper.displayName = 'Stepper';

export { StepperWithSubComponents as Stepper };
export type { StepperProps, StepperStepProps, StepperCompletedProps };
