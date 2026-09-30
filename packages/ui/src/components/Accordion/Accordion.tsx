import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { View } from 'react-native';

import { useA11yId } from '../../core/accessibility/useA11yId';
import { factory } from '../../core/factory';
import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { useReducedMotion } from '../../core/motion/useReducedMotion';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveRadius } from '../../core/theme/tokens';
import { fastHash } from '../../core/utils/hash';
import { devWarn, isDev } from '../../core/utils/logger';
import { extractStyleProps, useStyleProps } from '../../core/utils/spacing';
import { useControllableState } from '../../hooks/useControllableState';
import { AccordionItemComponent } from './AccordionItem';
import { buildAccentStyles, getAccordionStyles, type AccordionAccentStyles } from './styles';
import type { AccordionProps, AccordionRef } from './types';

const PERSIST_STORE_KEY = '__PLOCKS_ACCORDION_PERSIST__';
type PersistGlobal = typeof globalThis & { [PERSIST_STORE_KEY]?: Map<string, string[]> };

/** Process-wide store for uncontrolled accordions' expanded keys (see `autoPersist`). */
function getPersistStore(): Map<string, string[]> {
  const store = globalThis as PersistGlobal;
  if (!store[PERSIST_STORE_KEY]) store[PERSIST_STORE_KEY] = new Map<string, string[]>();
  return store[PERSIST_STORE_KEY];
}

/**
 * Collapsible sections. Each header is a button with `aria-expanded` /
 * `aria-controls`; each panel is a `region` labelled by its header. Panels
 * animate their height (reduced motion: instantly).
 *
 * The ref exposes `expandAll()`, `collapseAll()`, `toggle(key)` and `getExpanded()`.
 */
export const Accordion = factory<{ props: AccordionProps; ref: AccordionRef }>((props, ref) => {
  const {
    items,
    type = 'single',
    defaultExpanded,
    expanded: controlledExpanded,
    onExpandedChange,
    variant = 'default',
    size = 'md',
    color,
    showChevron = true,
    style,
    headerStyle,
    contentStyle,
    headerTextStyle,
    titleProps,
    radius,
    persistKey,
    autoPersist = true,
    animated = true,
    transitionDuration,
    onItemToggle,
    chevronPosition = 'end',
    density = 'comfortable',
    testID,
    ...rest
  } = props;

  const { styleProps } = extractStyleProps(rest);
  const spacingStyles = useStyleProps(styleProps);

  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const resolvedRadius = radius !== undefined ? resolveRadius(theme, radius) : undefined;

  // Deterministic, SSR-safe id prefix for the header/panel aria wiring.
  const idPrefix = useA11yId(undefined, 'plocks-accordion');

  // Auto key generation when uncontrolled and no persistKey
  const autoKeyRef = useRef<string | null>(null);
  if (autoKeyRef.current === null && !persistKey && autoPersist && controlledExpanded === undefined) {
    const sig = items.map((i) => i.key).join('|') + '|' + type + '|' + variant;
    autoKeyRef.current = 'acc-' + fastHash(sig);
  }
  const effectivePersistKey = persistKey || autoKeyRef.current || undefined;

  const [expanded, setExpanded, isControlled] = useControllableState<string[]>({
    value: controlledExpanded,
    // Restores a persisted set on first mount; `single` keeps at most one key.
    defaultValue: () => {
      const store = getPersistStore();
      if (effectivePersistKey && store.has(effectivePersistKey)) {
        return [...store.get(effectivePersistKey)!];
      }
      const initial = defaultExpanded ?? [];
      return type === 'single' && initial.length > 0 ? [initial[0]] : [...initial];
    },
    finalValue: [],
    onChange: onExpandedChange,
  });

  // Persist on change (uncontrolled only)
  useEffect(() => {
    if (!isControlled && effectivePersistKey) {
      getPersistStore().set(effectivePersistKey, expanded);
    }
  }, [expanded, isControlled, effectivePersistKey]);

  const styles = getAccordionStyles(theme, variant, size, color, resolvedRadius, density);

  // Dev warnings for duplicate keys
  useEffect(() => {
    if (isDev) {
      const seen = new Set<string>();
      const dups: string[] = [];
      items.forEach((i) => {
        if (seen.has(i.key)) dups.push(i.key);
        else seen.add(i.key);
      });
      if (dups.length) devWarn(`[Accordion] Duplicate item keys detected: ${dups.join(', ')}`);
    }
  }, [items]);

  // Drop expanded keys whose items were removed.
  useEffect(() => {
    const itemKeySet = new Set(items.map((i) => i.key));
    const filtered = expanded.filter((k) => itemKeySet.has(k));
    if (filtered.length !== expanded.length) {
      setExpanded(filtered);
    }
  }, [items, expanded, setExpanded]);

  // Reads the latest items/expanded state, so the imperative handle and the
  // per-item press handlers never go stale.
  const handleItemPress = useLatestCallback((itemKey: string) => {
    const item = items.find((i) => i.key === itemKey);
    if (!item || item.disabled) return;

    const currentlyExpanded = expanded.includes(itemKey);
    let newExpanded: string[];

    if (type === 'single') {
      // Single mode: only one item can be open at a time
      newExpanded = currentlyExpanded ? [] : [itemKey];
    } else {
      // Multiple mode: items are independent
      newExpanded = currentlyExpanded ? expanded.filter((key) => key !== itemKey) : [...expanded, itemKey];
    }

    setExpanded(newExpanded);
    onItemToggle?.({
      itemKey,
      expanded: !currentlyExpanded,
      expandedKeys: newExpanded,
      type,
      variant,
    });
  });

  const expandAll = useLatestCallback(() => {
    if (type === 'single') {
      if (items[0] && !expanded.includes(items[0].key)) handleItemPress(items[0].key); // ensure one open
      return;
    }
    setExpanded(items.filter((i) => !i.disabled).map((i) => i.key));
  });
  const getExpanded = useLatestCallback(() => [...expanded]);

  useImperativeHandle(
    ref,
    () => ({
      expandAll: () => expandAll(),
      collapseAll: () => setExpanded([]),
      toggle: (key: string) => handleItemPress(key),
      getExpanded: () => getExpanded() ?? [],
    }),
    [expandAll, getExpanded, handleItemPress, setExpanded]
  );

  const onItemPress = useCallback((key: string) => handleItemPress(key), [handleItemPress]);

  // Accordion-level accent; reused unless an item overrides `color`.
  const defaultAccent = useMemo<AccordionAccentStyles>(
    () => ({
      activeHeaderText: styles.activeHeaderText,
      activeItem: styles.activeItem,
      activeChevronColor: styles.activeChevronColor,
    }),
    [styles]
  );

  return (
    <View testID={testID} style={[styles.container, spacingStyles, style]}>
      {items.map((item, index) => (
        <AccordionItemComponent
          key={item.key}
          item={item}
          isExpanded={expanded.includes(item.key)}
          isDisabled={!!item.disabled}
          isLast={index === items.length - 1}
          onPress={onItemPress}
          showChevron={showChevron}
          styles={styles}
          accent={item.color ? buildAccentStyles(theme, item.color) : defaultAccent}
          chevronColor={theme.text.secondary}
          disabledChevronColor={theme.text.disabled}
          headerStyle={headerStyle}
          contentStyle={contentStyle}
          headerTextStyle={headerTextStyle}
          titleProps={titleProps}
          idPrefix={idPrefix}
          animated={animated}
          transitionDuration={transitionDuration}
          reducedMotion={reducedMotion}
          chevronPosition={chevronPosition}
        />
      ))}
    </View>
  );
}, { displayName: 'Accordion' });

// Compound API scaffolding (future-proof). For now they just proxy to main implementation.
export const Root = Accordion;
export const Item = AccordionItemComponent; // In future could be standalone for advanced composition.

export const AccordionNamespace = Object.assign(Accordion, { Root, Item });
