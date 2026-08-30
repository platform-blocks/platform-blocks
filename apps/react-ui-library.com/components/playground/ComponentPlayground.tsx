import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import {
  Card,
  Text,
  Flex,
  Switch,
  SegmentedControl,
  Select,
  Input,
  NumberInput,
  Slider,
  RangeSlider,
  ColorPicker,
  Space,
  CodeBlock
} from '@platform-blocks/react-ui-library';
import * as Blocks from '@platform-blocks/react-ui-library';
import * as Charts from '@platform-blocks/charts';
import { GlobalChartsRoot } from '@platform-blocks/charts';
import { DOCS_CHART_INTERACTION_CONFIG } from '../../config/chartInteraction';
import type { ComponentPlaygroundConfig, PlaygroundControlOverride, PlaygroundControlType, PlaygroundExtraControl } from './registry';

interface PropDoc {
  name: string;
  type?: string;
  description?: string;
  required?: boolean;
  defaultValue?: string;
  internal?: boolean;
}

interface ComponentPlaygroundProps {
  component: string;
  propsMeta: PropDoc[];
  config: ComponentPlaygroundConfig;
}

interface ControlDefinition {
  name: string;
  label: string;
  type?: string;
  description?: string;
  required?: boolean;
  controlType: PlaygroundControlType;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  colorPresets?: string[];
  initialValue: any;
  /** `range` controls only — the prop driven by the upper thumb. */
  pairWith?: string;
}

const SIZE_TOKEN_OPTIONS = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
const DEFAULT_COLOR_PRESETS = ['#228be6', '#845ef7', '#12b886', '#f59f00', '#e03131', '#0f172a', '#f8f9fa'];
const SPACING_PROP_NAMES = ['m', 'mx', 'my', 'mt', 'mr', 'mb', 'ml', 'p', 'px', 'py', 'pt', 'pr', 'pb', 'pl', 'gap', 'rowGap', 'columnGap'];
const CONTROL_EXCLUDED_PROPS = ['children', 'style', 'testID', 'ref', 'id', 'className', 'key', 'fullWidth'];
const GLOBAL_EXCLUDED_PROPS = new Set([...CONTROL_EXCLUDED_PROPS, ...SPACING_PROP_NAMES, 'checked', 'defaultChecked', 'activeTab', 'defaultValue']);

const TYPE_TOKEN_MAPPINGS: Record<string, string[]> = {
  SizeValue: SIZE_TOKEN_OPTIONS,
  ComponentSizeValue: SIZE_TOKEN_OPTIONS,
  ComponentSize: SIZE_TOKEN_OPTIONS
};

const DEFAULT_NUMBER_RANGE = { min: 0, max: 100, step: 1 };
const CONTROL_TYPES_WITH_FIELD_LABEL = new Set<PlaygroundControlType>([
  'boolean',
  'segmented',
  'select',
  'number',
  'size-slider',
  'range',
  'text'
]);

// Build a stable change-detection key for the default prop values. Defaults can
// contain non-serializable values — React elements (e.g. `children`), functions,
// or circular structures (React 19 dev-mode elements reference their owner) — which
// would make a plain JSON.stringify throw, so skip those.
function serializeDefaults(defaults: Record<string, any>): string {
  const seen = new WeakSet<object>();
  try {
    return JSON.stringify(defaults, (_key, value) => {
      if (typeof value === 'function') return undefined;
      if (value !== null && typeof value === 'object') {
        if ((value as any).$$typeof) return undefined; // React element / portal / etc.
        if (seen.has(value)) return undefined; // circular
        seen.add(value);
      }
      return value;
    });
  } catch {
    return Object.keys(defaults).join('|');
  }
}

// Catches render-time errors thrown by the previewed component and shows a
// fallback. A try/catch around JSX construction can't do this — React renders
// the element later, so the throw happens outside the try — hence a real
// error boundary (react-hooks/error-boundaries).
class PreviewErrorBoundary extends React.Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    console.warn('[ComponentPlayground] Failed to render preview', error);
  }
  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

export function ComponentPlayground({ component, propsMeta, config }: ComponentPlaygroundProps) {
  const { width, height } = useWindowDimensions();
  const isStacked = width < 1100;
  const targetName = config.component || component;
  const blockComponent = Blocks[targetName as keyof typeof Blocks] as React.ComponentType | undefined;
  const chartComponent = Charts[targetName as keyof typeof Charts] as React.ComponentType | undefined;
  const targetComponent = blockComponent || chartComponent;
  // Charts live in @platform-blocks/charts and need a ChartsProvider (GlobalChartsRoot)
  // around them for shared crosshair/tooltip behavior — mirror the demo host.
  const isChart = !blockComponent && !!chartComponent;

  const { controls, defaults } = useMemo(() => deriveControls(propsMeta, config), [propsMeta, config]);
  const defaultsKey = useMemo(() => serializeDefaults(defaults), [defaults]);
  const [values, setValues] = useState<Record<string, any>>(defaults);

  // Reset control values when the component's defaults change (e.g. navigating
  // to a different component). Adjusting state during render (React's recommended
  // pattern) avoids a setState-in-effect.
  const [prevDefaultsKey, setPrevDefaultsKey] = useState(defaultsKey);
  if (defaultsKey !== prevDefaultsKey) {
    setPrevDefaultsKey(defaultsKey);
    setValues(defaults);
  }

  // Plain computations (not useMemo): `values` can be reset via a state update
  // during render above, which the React Compiler can't reconcile with manual
  // memoization (react-hooks/preserve-manual-memoization). These are cheap and
  // React handles the element re-creation via reconciliation.
  const mergedProps = { ...(config.initialProps || {}), ...values };
  const previewProps = config.transformProps ? config.transformProps(mergedProps) : mergedProps;

  let renderedComponent: React.ReactNode = null;
  if (targetComponent) {
    const node = React.createElement(targetComponent, previewProps);
    const wrapped = config.previewWrapper ? config.previewWrapper(node, previewProps) : node;
    renderedComponent = isChart ? (
      <GlobalChartsRoot
        style={{ width: '100%', alignItems: 'center' }}
        config={DOCS_CHART_INTERACTION_CONFIG}
      >
        {wrapped}
      </GlobalChartsRoot>
    ) : wrapped;
  }

  const snippet = useMemo(() => buildSnippet(targetName, previewProps), [previewProps, targetName]);

  const handlePropChange = (name: string, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }));
  };

  // Split into a compact toggle grid (booleans) and a full-width settings list
  // (everything else) so long control lists stay scannable instead of sprawling
  // into one endless column.
  const toggleControls = controls.filter(c => c.controlType === 'boolean');
  const settingControls = controls.filter(c => c.controlType !== 'boolean');

  const renderControlFor = (control: ControlDefinition) =>
    renderControl(
      control,
      values[control.name],
      handlePropChange,
      control.pairWith ? values[control.pairWith] : undefined
    );

  const renderSettingControl = (control: ControlDefinition) => {
    // Controls that render their own field label need no header row of their
    // own; the required marker rides on that label, so the row is just a label.
    const usesFieldLabel = CONTROL_TYPES_WITH_FIELD_LABEL.has(control.controlType);
    return (
      <View key={control.name}>
        {!usesFieldLabel && (
          <Text variant="small" weight="semibold" style={styles.controlHeader}>
            {control.label}
          </Text>
        )}
        <View style={styles.controlBody}>
          {renderControlFor(control)}
        </View>
      </View>
    );
  };

  const controlsContent = controls.length ? (
    <ScrollView
      style={[!isStacked && { maxHeight: Math.max(360, height - 220) }]}
      contentContainerStyle={styles.controlsContent}
      showsVerticalScrollIndicator={false}
    >
      {toggleControls.length > 0 && (
        <View style={styles.controlGroup}>
          <Flex direction="row" wrap="wrap" gap={12}>
            {toggleControls.map(control => (
              <View key={control.name} style={isStacked ? styles.fullWidth : styles.toggleCell}>
                {renderControlFor(control)}
              </View>
            ))}
          </Flex>
        </View>
      )}
      {settingControls.length > 0 && (
        <View style={styles.controlGroup}>
          <View style={styles.controlsContent}>
            {settingControls.map(renderSettingControl)}
          </View>
        </View>
      )}
    </ScrollView>
  ) : (
    <View style={styles.emptyState}>
      <Text variant="p" color="muted">
        No interactive props detected yet. Add doc comments in the component source to expose controls.
      </Text>
    </View>
  );

  return (
    <View style={styles.root}>
      <View style={[styles.wrapper, isStacked && styles.wrapperStack]}>
        {/* Left column holds only the live preview so it stays short and can
            stay pinned for the full length of the (often long) controls list.
            The JSX snippet moves below the row where it can scroll freely. */}
        <View
          style={[
            styles.previewColumn,
            isStacked
              ? styles.fullWidth
              : ({ position: 'sticky', top: 88, alignSelf: 'flex-start' } as any),
          ]}
        >
          <Card style={styles.previewCard}>
            {targetComponent ? (
              <PreviewErrorBoundary
                key={snippet}
                fallback={
                  <Text color="error">
                    Component threw while rendering. Check console for details.
                  </Text>
                }
              >
                {renderedComponent || (
                  <Text variant="p" color="muted">
                    Component rendered no output.
                  </Text>
                )}
              </PreviewErrorBoundary>
            ) : (
              <Text variant="p" color="error">
                {`Component "${targetName}" is not exported from @platform-blocks/react-ui-library or @platform-blocks/charts.`}
              </Text>
            )}
          </Card>
        </View>
        <Card style={[styles.controlsCard, isStacked && styles.fullWidth]}>
          {controlsContent}
        </Card>
      </View>

      <Card variant="ghost">
        <Text variant="small" color="muted" style={styles.snippetLabel}>JSX preview</Text>
        <CodeBlock fullWidth>{snippet}</CodeBlock>
      </Card>
    </View>
  );
}

function renderControl(
  control: ControlDefinition,
  value: any,
  onChange: (name: string, next: any) => void,
  pairValue?: any
): React.ReactNode {
  const commonPlaceholder = control.placeholder || `Set ${control.label.toLowerCase()}`;
  const handleChange = (nextValue: any) => onChange(control.name, nextValue);

  switch (control.controlType) {
    case 'boolean':
      return (
        <Switch
          label={control.label}
          labelPosition="right"
          checked={Boolean(value)}
          onChange={(checked: boolean) => handleChange(checked)}
          required={control.required}
          // description={control.description}
        />
      );
    case 'segmented':
      if (!control.options || !control.options.length) break;
      return (
        <SegmentedControl
          fullWidth
          label={control.label}
          // description={control.description}
          data={control.options.map(option => ({ label: formatOptionLabel(option), value: option }))}
          value={(value ?? control.options[0]) as string}
          onChange={(next: string) => handleChange(next)}
        />
      );
    case 'select':
      if (!control.options || !control.options.length) break;
      return (
        <Select
          label={control.label}
          // description={control.description}
          options={control.options.map(option => ({ label: formatOptionLabel(option), value: option }))}
          value={value ?? null}
          onChange={(next) => handleChange(next ?? undefined)}
          placeholder={commonPlaceholder}
        />
      );
    case 'number': {
      const min = control.min ?? DEFAULT_NUMBER_RANGE.min;
      const max = control.max ?? DEFAULT_NUMBER_RANGE.max;
      const step = control.step ?? DEFAULT_NUMBER_RANGE.step;
      const sliderValue = typeof value === 'number'
        ? value
        : typeof control.initialValue === 'number'
          ? control.initialValue
          : min;
      return (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Slider
              label={control.label}
              // description={control.description}
              required={control.required}
              value={sliderValue}
              min={min}
              max={max}
              step={step}
              onChange={(next: number) => handleChange(next)}
            />
          </View>
          <View style={{ width: 96 }}>
            <NumberInput
              value={sliderValue}
              min={min}
              max={max}
              step={step}
              onChange={(next) => handleChange(typeof next === 'number' ? next : sliderValue)}
            />
          </View>
        </View>
      );
    }
    case 'range': {
      if (!control.pairWith) break;
      const bound = control.pairWith;
      const min = control.min ?? DEFAULT_NUMBER_RANGE.min;
      const max = control.max ?? DEFAULT_NUMBER_RANGE.max;
      const step = control.step ?? DEFAULT_NUMBER_RANGE.step;
      const toNumber = (candidate: any, fallback: number) =>
        typeof candidate === 'number' && Number.isFinite(candidate) ? candidate : fallback;
      const lower = toNumber(value, min);
      const upper = toNumber(pairValue, max);
      // The two props are independent state entries, so a user typing into either
      // NumberInput can invert them — keep the slider's own value ordered while
      // still writing each prop back under its own name.
      const sliderValue: [number, number] = [Math.min(lower, upper), Math.max(lower, upper)];
      return (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <RangeSlider
              label={control.label}
              required={control.required}
              value={sliderValue}
              min={min}
              max={max}
              step={step}
              onChange={([nextLower, nextUpper]) => {
                onChange(control.name, nextLower);
                onChange(bound, nextUpper);
              }}
            />
          </View>
          <View style={{ width: 96 }}>
            <NumberInput
              value={lower}
              min={min}
              max={max}
              step={step}
              onChange={(next) => handleChange(typeof next === 'number' ? next : lower)}
            />
          </View>
          <View style={{ width: 96 }}>
            <NumberInput
              value={upper}
              min={min}
              max={max}
              step={step}
              onChange={(next) => onChange(bound, typeof next === 'number' ? next : upper)}
            />
          </View>
        </View>
      );
    }
    case 'size-slider': {
      const tokens = (control.options && control.options.length ? control.options : SIZE_TOKEN_OPTIONS);
      const fallbackToken = (typeof control.initialValue === 'string' && tokens.includes(control.initialValue)) ? control.initialValue : tokens[0];
      const currentToken = (typeof value === 'string' && tokens.includes(value)) ? value : fallbackToken;
      const currentIndex = Math.max(0, tokens.indexOf(currentToken));
      // Ticks and the thumb bubble show the token verbatim — they *are* the prop value,
      // so `formatOptionLabel` would render a misleading "Xs" next to a raw "2xl".
      const tokenAt = (idx: number) => tokens[Math.min(tokens.length - 1, Math.max(0, Math.round(idx)))];
      const ticks = tokens.map((token, idx) => ({ value: idx, label: token }));
      return (
        <View>
          <Slider
            label={control.label}
            // description={control.description}
            required={control.required}
            value={currentIndex}
            min={0}
            max={Math.max(tokens.length - 1, 0)}
            step={1}
            ticks={ticks}
            showTicks
            restrictToTicks
            valueLabel={(idx: number) => tokenAt(idx)}
            onChange={(nextIdx: number) => handleChange(tokenAt(nextIdx))}
          />
          <Space h="xs" />
          {/* <Text variant="small" color="muted">
            {formatOptionLabel(currentToken)}
          </Text> */}
        </View>
      );
    }
    case 'color': {
      const presets = control.colorPresets?.length ? control.colorPresets : DEFAULT_COLOR_PRESETS;
      const currentValue = typeof value === 'string' ? value : (control.initialValue ?? presets[0]);
      return (
        <ColorPicker
          value={currentValue || ''}
          onChange={(color) => handleChange(color)}
          swatches={presets}
        />
      );
    }
    case 'text':
    default:
      return (
        <Input
          label={control.label}
          // description={control.description}
          required={control.required}
          value={value ?? ''}
          onChangeText={(text) => handleChange(text)}
          placeholder={commonPlaceholder}
        />
      );
  }

  return (
    <Input
      label={control.label}
      // description={control.description}
      required={control.required}
      value={value ?? ''}
      onChangeText={(text) => handleChange(text)}
      placeholder={commonPlaceholder}
    />
  );
}

function deriveControls(propsMeta: PropDoc[], config: ComponentPlaygroundConfig) {
  const hiddenProps = new Set([...(config.hiddenProps || []), ...GLOBAL_EXCLUDED_PROPS]);
  const overrides = config.controlOverrides || {};

  const controls: ControlDefinition[] = [];

  for (const prop of propsMeta) {
    const override = overrides[prop.name];
    if (override === false) continue;
    if (!override && shouldSkipProp(prop, hiddenProps)) continue;
    if (override && hiddenProps.has(prop.name)) continue;
    const control = buildControlDefinition(prop, override);
    if (control) {
      controls.push(control);
    }
  }

  const extras = config.extraControls || [];
  for (const extra of extras) {
    if (controls.some(c => c.name === extra.name)) continue;
    const control = buildExtraControl(extra);
    if (control) controls.push(control);
  }

  // A `range` control edits two props at once, so the upper prop must not also
  // get a control of its own.
  const pairedNames = new Set(
    controls
      .filter(control => control.controlType === 'range' && control.pairWith)
      .map(control => control.pairWith as string)
  );
  const visibleControls = pairedNames.size
    ? controls.filter(control => !pairedNames.has(control.name))
    : controls;

  const pinned = config.pinnedProps || [];
  visibleControls.sort((a, b) => {
    const idxA = pinned.indexOf(a.name);
    const idxB = pinned.indexOf(b.name);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.name.localeCompare(b.name);
  });

  // Seeded from every derived control, including the one hidden behind a range
  // pairing — that prop still needs a starting value.
  const defaults: Record<string, any> = { ...(config.initialProps || {}) };
  controls.forEach(control => {
    if (defaults[control.name] === undefined) {
      defaults[control.name] = control.initialValue;
    }
  });

  return { controls: visibleControls, defaults };
}

const FUNCTION_ALIAS_SUFFIX = /(Formatter|Renderer|Accessor|Predicate|Comparator|Getter|Selector|Callback|Handler|Fn)$/;

// True when every `|`-separated member of the type is a callback-shaped alias
// (name ending in Formatter/Renderer/… or containing `=>`). Returns false for
// unions that also permit a non-function member, so those stay editable.
function isFunctionAliasType(type: string): boolean {
  const members = type.split('|').map(part => part.trim()).filter(Boolean);
  if (!members.length) return false;
  return members.every(member => member.includes('=>') || FUNCTION_ALIAS_SUFFIX.test(member));
}

function shouldSkipProp(prop: PropDoc, hidden: Set<string>): boolean {
  if (!prop?.name) return true;
  if (hidden.has(prop.name)) return true;
  const type = prop.type || '';
  if (/^on[A-Z]/.test(prop.name)) return true;
  if (prop.internal) return true;
  if (type.includes('=>') || /function/i.test(type)) return true;
  // Function-typed props are often declared via a named alias (e.g.
  // `centerValueFormatter?: DonutCenterValueFormatter`), so the raw type string
  // has no `=>`. If every member of the type is a callback-shaped alias, skip it
  // — otherwise a text control would emit `''`, which downstream `fn?.()` calls
  // treat as non-nullish and invoke, throwing "x is not a function". Unions that
  // also allow a primitive (e.g. `string | DonutCenterLabelFormatter`) are kept.
  if (isFunctionAliasType(type)) return true;
  if (/React\.ReactNode|ReactNode|ReactElement|JSX\./i.test(type)) return true;
  if (/StyleProp|ViewStyle|TextStyle/i.test(type)) return true;
  return false;
}

function buildExtraControl(extra: PlaygroundExtraControl): ControlDefinition | null {
  if (!extra?.name || !extra.controlType) return null;
  const controlType = extra.controlType;
  const options = extra.options;
  let initialValue = extra.initialValue;
  if (initialValue === undefined) {
    if (controlType === 'boolean') initialValue = false;
    else if ((controlType === 'segmented' || controlType === 'select' || controlType === 'size-slider') && options?.length) initialValue = options[0];
    else if (controlType === 'number') initialValue = extra.min ?? 0;
    else initialValue = '';
  }
  return {
    name: extra.name,
    label: extra.label ?? formatOptionLabel(extra.name),
    description: extra.description,
    controlType,
    options,
    min: extra.min,
    max: extra.max,
    step: extra.step,
    placeholder: extra.placeholder,
    colorPresets: extra.colorPresets,
    pairWith: extra.pairWith,
    initialValue,
  };
}

function buildControlDefinition(prop: PropDoc, override?: PlaygroundControlOverride): ControlDefinition | null {
  const type = prop.type || '';
  let controlType: PlaygroundControlType | undefined = override?.controlType;
  let options = override?.options;

  if (!controlType) {
    const isComponentSize = type.includes('ComponentSizeValue');
    const typeOptionKey = Object.keys(TYPE_TOKEN_MAPPINGS).find(key => type.includes(key));
    const literalOptions = options ?? extractStringLiterals(type);

    if (prop.name === 'size') {
      const candidateOptions = (literalOptions && literalOptions.length ? literalOptions : TYPE_TOKEN_MAPPINGS.ComponentSizeValue) ?? SIZE_TOKEN_OPTIONS;
      const deduped = candidateOptions.filter((option, index) => candidateOptions.indexOf(option) === index);
      options = deduped.length ? deduped : SIZE_TOKEN_OPTIONS;
      controlType = 'size-slider';
    } else if (isComponentSize) {
      options = TYPE_TOKEN_MAPPINGS.ComponentSizeValue;
      controlType = 'size-slider';
    } else if (isBooleanType(type)) {
      controlType = 'boolean';
    } else if (literalOptions && literalOptions.length) {
      options = literalOptions;
      controlType = literalOptions.length <= 4 ? 'segmented' : 'select';
    } else if (typeOptionKey) {
      options = TYPE_TOKEN_MAPPINGS[typeOptionKey];
      controlType = options.length <= 4 ? 'segmented' : 'select';
    } else if (looksLikeColor(prop.name, type)) {
      controlType = 'color';
    } else if (isNumberLike(type)) {
      controlType = 'number';
    } else {
      controlType = 'text';
    }
  } else if (!options && override?.options) {
    options = override.options;
  }

  if (prop.name === 'variant' && options && options.length) {
    controlType = 'select';
  }

  if ((controlType === 'segmented' || controlType === 'select') && (!options || !options.length)) {
    controlType = 'text';
  }

  if (prop.name === 'size' && controlType !== 'size-slider') {
    const literalSizeOptions = extractStringLiterals(type);
    const candidateOptions = options && options.length
      ? options
      : literalSizeOptions && literalSizeOptions.length
        ? literalSizeOptions
        : type.includes('ComponentSizeValue') || type.includes('ComponentSize')
          ? TYPE_TOKEN_MAPPINGS.ComponentSizeValue
          : null;

    if (candidateOptions && candidateOptions.length) {
      const deduped = candidateOptions.filter((option, index) => candidateOptions.indexOf(option) === index);
      if (deduped.length) {
        options = deduped;
        controlType = 'size-slider';
      }
    }
  }

  const initialValue = deriveInitialValue(controlType, options, prop.defaultValue, override);
  const label = override?.label ?? formatOptionLabel(prop.name);

  return {
    name: prop.name,
    label,
    type: type || undefined,
    description: prop.description || undefined,
    required: prop.required,
    controlType,
    options,
    min: override?.min,
    max: override?.max,
    step: override?.step,
    placeholder: override?.placeholder,
    colorPresets: override?.colorPresets,
    pairWith: override?.pairWith,
    initialValue
  };
}

function deriveInitialValue(
  controlType: PlaygroundControlType,
  options: string[] | undefined,
  rawDefault: string | undefined,
  override?: PlaygroundControlOverride
) {
  if (override && override.placeholder && controlType === 'text') {
    const parsed = parseDefaultValue(rawDefault);
    return parsed ?? '';
  }

  const parsedDefault = parseDefaultValue(rawDefault);

  if (controlType === 'boolean') {
    return typeof parsedDefault === 'boolean' ? parsedDefault : false;
  }

  if ((controlType === 'segmented' || controlType === 'select' || controlType === 'size-slider') && options?.length) {
    if (parsedDefault && options.includes(String(parsedDefault))) {
      return parsedDefault;
    }
    // Prefer a sensible mid token for size sliders so we never emit an empty
    // string (which downstream size lookups can't resolve).
    return options.includes('md') ? 'md' : options[0];
  }

  if (controlType === 'number' || controlType === 'range') {
    return typeof parsedDefault === 'number' ? parsedDefault : undefined;
  }

  if (controlType === 'color') {
    return typeof parsedDefault === 'string' ? parsedDefault : undefined;
  }

  return parsedDefault || '';
}

function parseDefaultValue(raw?: string): any {
  if (!raw) return undefined;
  let sanitized = raw.trim();
  if (!sanitized) return undefined;
  if (/^undefined$/i.test(sanitized)) return undefined;
  if (/^null$/i.test(sanitized)) return null;
  sanitized = sanitized.replace(/\sas\s.+$/, '');
  if (/^\[(.*)\]$/.test(sanitized) || /^{.*}$/.test(sanitized)) return undefined;
  if (/^true$/i.test(sanitized)) return true;
  if (/^false$/i.test(sanitized)) return false;
  if ((sanitized.startsWith("'") && sanitized.endsWith("'")) || (sanitized.startsWith('"') && sanitized.endsWith('"'))) {
    return sanitized.slice(1, -1);
  }
  const numeric = Number(sanitized);
  if (!Number.isNaN(numeric)) return numeric;
  return sanitized;
}

function extractStringLiterals(type: string): string[] | null {
  const matches = type.match(/'([^']+)'/g) || type.match(/"([^"]+)"/g);
  if (!matches) return null;
  const values = matches
    .map(token => token.slice(1, -1))
    .filter(Boolean);
  return values.length ? Array.from(new Set(values)) : null;
}

function looksLikeColor(name: string, type: string): boolean {
  const lowered = name.toLowerCase();
  if (lowered.includes('color')) return true;
  return /color/i.test(type);
}

function isBooleanType(type: string): boolean {
  const normalized = type.toLowerCase();
  return normalized.includes('boolean') || /^'?(true|false)'?\s*\|\s*'?(true|false)'?$/.test(normalized);
}

function isNumberLike(type: string): boolean {
  return /number/.test(type) || /(\d+\s*\|\s*)+\d+/.test(type);
}

function formatOptionLabel(value: string): string {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^\w/g, match => match.toUpperCase());
}

function buildSnippet(component: string, props: Record<string, any>): string {
  const entries = Object.entries(props || {}).filter(([key, val]) => val !== undefined && typeof val !== 'function');
  const attrParts = entries
    .filter(([key]) => key !== 'children')
    .map(([key, val]) => formatAttribute(key, val))
    .filter(Boolean) as string[];
  const joinedAttrs = attrParts.length ? `\n${attrParts.map(part => `  ${part}`).join('\n')}\n` : '';
  const children = props.children;
  if (typeof children === 'string' && children.length) {
    return `<${component}${joinedAttrs}>${children}</${component}>`;
  }
  if (joinedAttrs) {
    return `<${component}${joinedAttrs}/>`;
  }
  return `<${component} />`;
}

function formatAttribute(key: string, value: any): string | null {
  if (typeof value === 'boolean') {
    return value ? key : `${key}={false}`;
  }
  if (typeof value === 'number') {
    return `${key}={${value}}`;
  }
  if (typeof value === 'string') {
    const escaped = value.replace(/"/g, '\\"');
    return `${key}="${escaped}"`;
  }
  // React element (e.g. an injected onIcon/offIcon node) — render a compact,
  // readable JSX placeholder instead of dumping the element's internals.
  if (value && typeof value === 'object' && (value as any).$$typeof) {
    const elProps = (value as any).props || {};
    if (typeof elProps.name === 'string') {
      return `${key}={<Icon name="${elProps.name}" />}`;
    }
    return `${key}={/* node */}`;
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const inner = Object.entries(value)
      .filter(([, v]) => v !== undefined && typeof v !== 'function')
      .map(([k, v]) => `${k}: ${formatObjectValue(v)}`)
      .join(', ');
    if (!inner) return null;
    return `${key}={{ ${inner} }}`;
  }
  return null;
}

function formatObjectValue(value: any): string {
  if (typeof value === 'string') return `'${value.replace(/'/g, "\\'")}'`;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value === null) return 'null';
  if (Array.isArray(value)) return `[${value.map(formatObjectValue).join(', ')}]`;
  if (typeof value === 'object') {
    const inner = Object.entries(value)
      .filter(([, v]) => v !== undefined && typeof v !== 'function')
      .map(([k, v]) => `${k}: ${formatObjectValue(v)}`)
      .join(', ');
    return `{ ${inner} }`;
  }
  return 'undefined';
}

const styles = StyleSheet.create({
  root: {
    gap: 16
  },
  wrapper: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start'
  },
  wrapperStack: {
    flexDirection: 'column'
  },
  previewColumn: {
    flex: 1,
    gap: 16
  },
  controlsCard: {
    flex: 1,
    padding: 24,
    minHeight: 320
  },
  previewCard: {
    padding: 32,
    minHeight: 280,
    alignItems: 'center',
    justifyContent: 'center'
  },
  snippetCard: {
    padding: 20
  },
  snippetLabel: {
    marginBottom: 8
  },
  codeText: {
    fontFamily: 'monospace',
    fontSize: 14
  },
  controlGroup: {
    gap: 12
  },
  toggleCell: {
    width: '48%',
    flexGrow: 1
  },
  controlsContent: {
    gap: 20
  },
  controlBlock: {
    // borderBottomWidth: StyleSheet.hairlineWidth,
  },
  controlHeader: {
    marginBottom: 8
  },
  controlBody: {
    gap: 12
  },
  controlDescription: {
    marginTop: 6
  },
  typeText: {
    marginTop: 2
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24
  },
  fullWidth: {
    width: '100%'
  }
});
