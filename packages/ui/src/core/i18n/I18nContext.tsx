import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useLatestCallback } from '../hooks/useLatestCallback';
import { warnOnce } from '../utils/logger';
import type {
  I18nConfig,
  I18nContextValue,
  TranslationDictionary,
  TranslationFunction,
  TranslationParams,
} from './types';

const defaultConfig: I18nConfig = {
  locale: 'en',
  fallbackLocale: 'en',
  resources: { en: { translation: {} } },
  pluralSeparator: '::'
};

const I18nContext = createContext<I18nContextValue | null>(null);

type TranslationEntry = string | TranslationFunction;

const isEntry = (value: unknown): value is TranslationEntry =>
  typeof value === 'string' || typeof value === 'function';

function resolveKey(dict: TranslationDictionary | undefined, key: string): TranslationEntry | undefined {
  if (!dict) return undefined;
  if (key in dict) {
    const entry = dict[key];
    return isEntry(entry) ? entry : undefined;
  }
  // Support nested keys with dot notation
  if (key.includes('.')) {
    const parts = key.split('.');
    let cur: TranslationDictionary[string] | undefined = dict;
    for (const p of parts) {
      if (cur && typeof cur === 'object') cur = cur[p]; else return undefined;
    }
    if (isEntry(cur)) return cur;
  }
  return undefined;
}

export interface I18nProviderProps {
  initial?: Partial<I18nConfig>;
  children: React.ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ initial, children }) => {
  const propLocale = initial?.locale ?? defaultConfig.locale;
  const fallbackLocale = initial?.fallbackLocale ?? defaultConfig.fallbackLocale;
  const resourcesProp = initial?.resources;
  // Diagnostics callback: read through a ref so an inline function doesn't
  // rebuild `t` (and re-render every translated Text) on each parent render.
  const onMissingKey = useLatestCallback(initial?.onMissingKey);

  // Keyed on the individual fields, not the `initial` object, which callers
  // usually build inline.
  const resources = useMemo(
    () => ({ ...defaultConfig.resources, ...(resourcesProp || {}) }),
    [resourcesProp]
  );

  const [locale, setLocale] = useState(propLocale);
  // Follow the `locale` prop when it changes (adjusting state during render,
  // so there's no extra committed frame in the old locale).
  const [syncedPropLocale, setSyncedPropLocale] = useState(propLocale);
  if (syncedPropLocale !== propLocale) {
    setSyncedPropLocale(propLocale);
    setLocale(propLocale);
  }

  const t = useCallback((key: string, params?: TranslationParams) => {
    const current = resources[locale]?.translation;
    const fallback = resources[fallbackLocale]?.translation;
    let entry = resolveKey(current, key) ?? resolveKey(fallback, key);
    if (!entry) {
      onMissingKey(key, locale);
      return key; // return key as last resort
    }
    if (typeof entry === 'function') return entry(params || {});
    return interpolate(entry, params);
  }, [locale, resources, fallbackLocale, onMissingKey]);

  const formatNumber = useCallback((value: number, opts?: Intl.NumberFormatOptions) => new Intl.NumberFormat(locale, opts).format(value), [locale]);
  const formatDate = useCallback((value: Date, opts?: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, opts).format(value), [locale]);
  const formatRelativeTime = useCallback((value: number, unit: Intl.RelativeTimeFormatUnit, opts?: Intl.RelativeTimeFormatOptions) => new Intl.RelativeTimeFormat(locale, opts).format(value, unit), [locale]);
  const hasKey = useCallback((key: string) => !!resolveKey(resources[locale]?.translation, key) || !!resolveKey(resources[fallbackLocale]?.translation, key), [locale, resources, fallbackLocale]);

  const value = useMemo<I18nContextValue>(() => ({ locale, setLocale, t, formatNumber, formatDate, formatRelativeTime, hasKey }), [locale, t, formatNumber, formatDate, formatRelativeTime, hasKey]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

function interpolate(entry: string, params?: TranslationParams): string {
  if (!params || !Object.keys(params).length) return entry;
  return entry.replace(/{{(.*?)}}/g, (_, p) => {
    const v = params[p.trim()];
    return v == null ? '' : String(v);
  });
}

// Used when no I18nProvider is mounted, so library components (Text, inputs…)
// render standalone instead of throwing. Keys resolve to themselves.
const FALLBACK_I18N: I18nContextValue = {
  locale: defaultConfig.locale,
  setLocale: () => {
    warnOnce('i18n.setLocale', 'setLocale() has no effect without an I18nProvider (mounted by PlatformBlocksProvider).');
  },
  t: (key, params) => interpolate(key, params),
  formatNumber: (value, opts) => new Intl.NumberFormat(defaultConfig.locale, opts).format(value),
  formatDate: (value, opts) => new Intl.DateTimeFormat(defaultConfig.locale, opts).format(value),
  formatRelativeTime: (value, unit, opts) => new Intl.RelativeTimeFormat(defaultConfig.locale, opts).format(value, unit),
  hasKey: () => false,
};

/** The active i18n context, or an English pass-through when no provider is mounted. */
export function useI18n(): I18nContextValue {
  return useContext(I18nContext) ?? FALLBACK_I18N;
}
