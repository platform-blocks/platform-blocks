import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, View, type TextInput } from 'react-native';
import { a11yProps } from '../../core/accessibility/a11yProps';
import { ClearButton } from '../../core/components/ClearButton';
import { factory } from '../../core/factory/factory';
import { useLatestCallback } from '../../core/hooks/useLatestCallback';
import { useThemedStyles } from '../../core/hooks/useThemedStyles';
import { webStyle } from '../../core/platform/webStyle';
import { getComponentDefaultRadius } from '../../core/theme/radius';
import { useTheme } from '../../core/theme/ThemeProvider';
import { getControlSize, resolveRadius, resolveSpacing } from '../../core/theme/tokens';
import { useMergedRef } from '../../core/utils/mergeRefs';
import { resolveStyleProps, extractStyleProps } from '../../core/utils/spacing';
import { useControllableState } from '../../hooks/useControllableState/useControllableState';
import { Icon } from '../Icon';
import { Input } from '../Input/Input';
import type { ExtendedTextInputProps } from '../Input/types';
import { Space } from '../Space';
import { useSurfaceStyles } from '../Surface/useSurfaceStyles';
import { Text } from '../Text';
import type { SearchProps } from './types';

const SEARCHBOX_PROPS: ExtendedTextInputProps = a11yProps({ role: 'searchbox' });

/**
 * Search field with a leading search icon, a clear button, an optional loading
 * indicator and debounced `onChangeText`. `buttonMode` renders a button that
 * calls `onPress` instead. `ref` points at the TextInput.
 */
export const Search = factory<{ props: SearchProps; ref: TextInput }>(
  (props, ref) => {
    const { styleProps, otherProps } = extractStyleProps(props);
    const {
      value,
      defaultValue,
      onChangeText,
      onSubmit,
      placeholder = 'Search...',
      size = 'sm',
      // Undefined by design — the `input` radius token supplies the default, both
      // for the Input below and for the button-mode trigger.
      radius,
      autoFocus,
      debounce = 0,
      clearButton = true,
      clearButtonLabel = 'Clear search',
      loading = false,
      endSection,
      rightComponent,
      accessibilityLabel = 'Search',
      disabled,
      style,
      testID,
      buttonMode = false,
      onPress,
    } = otherProps;

    const theme = useTheme();
    const triggerSurface = useSurfaceStyles({ raised: true, withBorder: true, shadow: 'none' });
    const spacingStyles = resolveStyleProps(styleProps, theme);
    const inputRef = useRef<TextInput | null>(null);
    const mergedRef = useMergedRef<TextInput>(inputRef, ref);
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Controlled: the parent owns the query. Uncontrolled: it lives here.
    const [query, setQuery, isControlled] = useControllableState<string>({
      value,
      defaultValue,
      finalValue: '',
    });
    // While a debounced change is pending, a controlled field still shows what was typed.
    const [pendingText, setPendingText] = useState<string | null>(null);
    const shownQuery = pendingText ?? query;

    const emitChange = useLatestCallback((next: string) => {
      onChangeText?.(next);
    });

    const cancelPending = useCallback(() => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
    }, []);

    useEffect(() => cancelPending, [cancelPending]);

    const handleChange = useCallback(
      (text: string) => {
        setQuery(text);
        if (debounce > 0) {
          if (isControlled) setPendingText(text);
          cancelPending();
          debounceTimer.current = setTimeout(() => {
            debounceTimer.current = null;
            setPendingText(null);
            emitChange(text);
          }, debounce);
        } else {
          emitChange(text);
        }
      },
      [setQuery, debounce, isControlled, cancelPending, emitChange]
    );

    const handleSubmit = useCallback(() => {
      onSubmit?.(shownQuery);
    }, [onSubmit, shownQuery]);

    const clear = useCallback(() => {
      if (!shownQuery) return;
      cancelPending();
      setPendingText(null);
      setQuery('');
      emitChange('');
      onSubmit?.('');
      requestAnimationFrame(() => inputRef.current?.focus());
    }, [shownQuery, cancelPending, setQuery, emitChange, onSubmit]);

    const metrics = getControlSize(theme, size);
    const styles = useThemedStyles(
      (t) => ({
        trigger: {
          flexDirection: 'row' as const,
          alignItems: 'center' as const,
          gap: resolveSpacing(t, 'xl') as number,
          paddingHorizontal: resolveSpacing(t, 'sm') as number,
          paddingVertical: resolveSpacing(t, 'xs') as number,
          borderRadius: resolveRadius(t, radius ?? getComponentDefaultRadius('input')),
          borderWidth: 1,
          minHeight: metrics.height,
        },
        triggerText: {
          flex: 1,
          marginStart: resolveSpacing(t, 'xs') as number,
          color: t.text.muted,
          fontSize: metrics.fontSize,
        },
      }),
      [radius, metrics]
    );

    const searchIcon = <Icon name="search" size={metrics.iconSize} color={theme.text.muted} />;

    // Trailing section: loading indicator, else the clear button, else the caller's section.
    let trailing: React.ReactNode = endSection;
    if (loading) {
      trailing = <Icon name="loader" size={metrics.iconSize} color={theme.text.muted} />;
    } else if (clearButton && shownQuery && !buttonMode) {
      trailing = (
        <ClearButton onPress={clear} size={size} disabled={disabled} accessibilityLabel={clearButtonLabel} />
      );
    }

    const handleButtonPress = useCallback(() => {
      onPress?.();
    }, [onPress]);

    if (buttonMode) {
      return (
        <View style={spacingStyles}>
          <Pressable
            onPress={handleButtonPress}
            disabled={disabled}
            {...a11yProps({ role: 'button', label: accessibilityLabel, disabled })}
            testID={testID}
            style={[
              styles.trigger,
              // A control sitting on its container, so it rises one step from
              // whatever surface it's placed on rather than assuming the page.
              { backgroundColor: triggerSurface.token.background, borderColor: triggerSurface.token.border },
              webStyle({ cursor: 'pointer' }),
              style,
            ]}
          >
            {searchIcon}
            <Text style={styles.triggerText}>{placeholder}</Text>
            <Space w={64} />
            {rightComponent || trailing}
          </Pressable>
        </View>
      );
    }

    return (
      <View style={spacingStyles}>
        <Input
          ref={mergedRef}
          type="search"
          value={shownQuery}
          onChangeText={handleChange}
          onEnter={handleSubmit}
          placeholder={placeholder}
          size={size}
          radius={radius}
          disabled={disabled}
          autoFocus={autoFocus}
          startSection={searchIcon}
          endSection={trailing}
          accessibilityLabel={accessibilityLabel}
          textInputProps={SEARCHBOX_PROPS}
          testID={testID}
          style={style}
        />
      </View>
    );
  },
  { displayName: 'Search' }
);
