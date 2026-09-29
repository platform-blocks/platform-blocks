import React from 'react';
import { act, renderHook } from '@testing-library/react-native';

// jest.setup.cjs replaces this module with a stub for component tests; test the real one.
jest.unmock('../../i18n/I18nContext');

import { I18nProvider, useI18n } from '../../i18n/I18nContext';

const resources = {
  en: { translation: { hello: 'Hello {{name}}', nested: { key: 'Nested' } as unknown as string } },
  fr: { translation: { hello: 'Bonjour {{name}}' } },
};

describe('I18nProvider', () => {
  it('keeps a stable value when the parent re-renders with an inline `initial`', () => {
    const { result, rerender } = renderHook(() => useI18n(), {
      initialProps: { locale: 'en' },
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <I18nProvider initial={{ locale: 'en', resources, onMissingKey: () => {} }}>{children}</I18nProvider>
      ),
    });
    const first = result.current;
    rerender({ locale: 'en' });
    expect(result.current).toBe(first);
    expect(result.current.t).toBe(first.t);
    expect(result.current.hasKey).toBe(first.hasKey);
  });

  it('translates, interpolates, resolves nested keys and reports missing ones via the latest callback', () => {
    const onMissingKey = jest.fn();
    const { result } = renderHook(() => useI18n(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <I18nProvider initial={{ locale: 'fr', fallbackLocale: 'en', resources, onMissingKey }}>{children}</I18nProvider>
      ),
    });
    expect(result.current.t('hello', { name: 'Ana' })).toBe('Bonjour Ana');
    expect(result.current.t('nested.key')).toBe('Nested');
    expect(result.current.t('missing')).toBe('missing');
    expect(onMissingKey).toHaveBeenCalledWith('missing', 'fr');
    expect(result.current.hasKey('hello')).toBe(true);
  });

  it('follows the locale prop, and setLocale still works', () => {
    let locale = 'en';
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <I18nProvider initial={{ locale, resources }}>{children}</I18nProvider>
    );
    const { result, rerender } = renderHook(() => useI18n(), { wrapper });
    expect(result.current.t('hello', { name: 'A' })).toBe('Hello A');

    locale = 'fr';
    rerender({});
    expect(result.current.locale).toBe('fr');
    expect(result.current.t('hello', { name: 'A' })).toBe('Bonjour A');

    act(() => result.current.setLocale('en'));
    expect(result.current.locale).toBe('en');
    rerender({}); // same prop: the user's choice sticks
    expect(result.current.locale).toBe('en');
  });
});
