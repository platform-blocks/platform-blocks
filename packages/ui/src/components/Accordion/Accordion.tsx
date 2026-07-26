import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View } from 'react-native';
// TODO: Add onItemToggle?: OnAccordionToggle (using existing reserved type).

// TODO: Expose Accordion.Root, Accordion.Item future-proofing a compound API while keeping current wrapper for backward compatibility.

// TODO: Provide forwardRef to expose expandAll(), collapseAll(), toggle(key).


import { useTheme } from '../../core/theme';
import { useReducedMotion } from '../../core/motion/ReducedMotionProvider';
import { SizeValue, getFontSize, getSpacing } from '../../core/theme/sizes';
import { BorderRadiusProps, createRadiusStyles } from '../../core/theme/radius';
import type { PlatformBlocksTheme } from '../../core/theme/types';
import { SpacingProps, getSpacingStyles, extractSpacingProps } from '../../core/utils';
import type { AccordionProps, AccordionRef } from './types';
import { fastHash } from '../../core/utils/hash';
import { getAccordionStyles, buildAccentStyles, type AccordionAccentStyles } from './styles';
import { AccordionItemComponent } from './AccordionItem';
import { useControllableState } from '../../hooks/useControllableState';

// (Item component + styles moved to separate files)

/**
 * Accordion component with instant open/close behavior (no animations).
 * Expansion state toggles immediately for maximum reliability across platforms.
 */
const AccordionBase = (props: AccordionProps, ref: React.Ref<AccordionRef>) => {
  const {
    items,
    type = 'single',
    defaultExpanded = [],
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
    ...rest
  } = props;

  const { spacingProps, otherProps } = extractSpacingProps(rest);
  const spacingStyles = getSpacingStyles(spacingProps);

  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const radiusStylesRef = useRef(radius ? createRadiusStyles(radius) : undefined);
  // Cache radius; update only if radius prop identity changes
  useEffect(() => { radiusStylesRef.current = radius ? createRadiusStyles(radius) : undefined; }, [radius]);

  // Internal instance id (used for deterministic aria ids on web)
  const instanceId = useRef(Math.random().toString(36).substr(2, 9));

  // Persistent store for uncontrolled accordions
  const persistStoreRef = useRef<Map<string, string[]> | undefined>(undefined); // initialized lazily below
  if (!persistStoreRef.current) persistStoreRef.current = (globalThis as any).__PLATFORM_BLOCKS_ACCORDION_PERSIST__ || ((globalThis as any).__PLATFORM_BLOCKS_ACCORDION_PERSIST__ = new Map<string, string[]>());

  // Auto key generation when uncontrolled and no persistKey
  const autoKeyRef = useRef<string | null>(null);
  if (autoKeyRef.current === null && !persistKey && autoPersist && controlledExpanded === undefined) {
    const sig = items.map(i => i.key).join('|') + '|' + type + '|' + variant;
    autoKeyRef.current = 'acc-' + fastHash(sig);
  }
  const effectivePersistKey = persistKey || autoKeyRef.current || undefined;

  const [expanded, setExpanded, isControlled] = useControllableState<string[]>({
    value: controlledExpanded,
    // Restores a persisted set on first mount; `single` keeps at most one key.
    defaultValue: () => {
      if (effectivePersistKey && persistStoreRef.current?.has(effectivePersistKey)) {
        return [...persistStoreRef.current.get(effectivePersistKey)!];
      }
      return type === 'single' && defaultExpanded.length > 0 ? [defaultExpanded[0]] : [...defaultExpanded];
    },
    finalValue: [],
    onChange: onExpandedChange,
  });

  // Persist on change (uncontrolled only)
  useEffect(() => {
    if (!isControlled && effectivePersistKey) {
      persistStoreRef.current?.set(effectivePersistKey, expanded);
    }
  }, [expanded, isControlled, effectivePersistKey]);

  const styles = getAccordionStyles(theme, variant, size, color, radiusStylesRef.current, density);

  // Dev warnings for duplicate keys
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      const seen = new Set<string>();
      const dups: string[] = [];
      items.forEach(i => { if (seen.has(i.key)) dups.push(i.key); else seen.add(i.key); });
      if (dups.length) console.warn(`[Accordion] Duplicate item keys detected: ${dups.join(', ')}`);
    }
  }, [items]);

  // Reconcile expanded keys when items change
  useEffect(() => {
    const itemKeySet = new Set(items.map(i => i.key));
    const filtered = expanded.filter(k => itemKeySet.has(k));
    if (filtered.length !== expanded.length) {
      setExpanded(filtered);
    }
  }, [items]);

  const handleItemPress = (itemKey: string) => {
    const item = items.find(i => i.key === itemKey);
    if (item?.disabled) return;

    let newExpanded: string[];
    const currentlyExpanded = expanded.includes(itemKey);

    if (type === 'single') {
      // Single mode: only one item can be open at a time
      if (currentlyExpanded) {
        // Close the currently open item
        newExpanded = [];
      } else {
        // Close any currently open item and open the clicked one
        newExpanded = [itemKey];
      }
    } else {
      // Multiple mode: items are independent
      newExpanded = currentlyExpanded
        ? expanded.filter(key => key !== itemKey)
        : [...expanded, itemKey];
    }

    setExpanded(newExpanded);
    onItemToggle?.({
      itemKey,
      expanded: !currentlyExpanded,
      expandedKeys: newExpanded,
      type,
      variant,
    });
  };

  // Ref methods
  useImperativeHandle(ref, () => ({
    expandAll: () => {
      if (type === 'single') {
        if (items[0]) handleItemPress(items[0].key); // ensure one open
        return;
      }
      const keys = items.filter(i => !i.disabled).map(i => i.key);
      setExpanded(keys);
    },
    collapseAll: () => {
      setExpanded([]);
    },
    toggle: (key: string) => handleItemPress(key),
    getExpanded: () => [...expanded],
  }), [expanded, items, type, variant, setExpanded]);

  // Accordion-level accent; reused unless an item overrides `color`.
  const defaultAccent: AccordionAccentStyles = {
    activeHeaderText: styles.activeHeaderText,
    activeItem: styles.activeItem,
    activeChevronColor: styles.activeChevronColor,
  };

  return (
    <View style={[styles.container, spacingStyles, style]} {...otherProps}>
      {items.map((item, index) => {
        const isExpanded = expanded.includes(item.key);
        const isDisabled = item.disabled;
        const isLast = index === items.length - 1;
        const accent = item.color ? buildAccentStyles(theme, item.color) : defaultAccent;

        return (
          <AccordionItemComponent
            key={item.key}
            item={item}
            isExpanded={isExpanded}
            isDisabled={isDisabled || false}
            isLast={isLast}
            variant={variant}
            onPress={() => handleItemPress(item.key)}
            showChevron={showChevron}
            styles={styles}
            accent={accent}
            chevronColor={theme.text.secondary}
            disabledChevronColor={theme.text.disabled}
            headerStyle={headerStyle}
            contentStyle={contentStyle}
            headerTextStyle={headerTextStyle}
            titleProps={titleProps}
            idPrefix={`accordion-${instanceId.current}`}
            animated={animated}
            transitionDuration={transitionDuration}
            reducedMotion={reducedMotion}
            chevronPosition={chevronPosition}
          />
        );
      })}
    </View>
  );
};

export const Accordion = forwardRef<AccordionRef, AccordionProps>(AccordionBase);

// Compound API scaffolding (future-proof). For now they just proxy to main implementation.
export const Root = Accordion;
export const Item = AccordionItemComponent; // In future could be standalone for advanced composition.

export const AccordionNamespace = Object.assign(Accordion, { Root, Item });

