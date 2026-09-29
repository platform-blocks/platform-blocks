import React from 'react';
import { SpotlightProvider, spotlight } from '../../components/Spotlight/SpotlightStore';
import { Spotlight } from '../../components/Spotlight';
import { useHotkeys } from '../../hooks/useHotkeys';
import type { HotkeyItem } from '../../hooks/useHotkeys';
import type { SpotlightItem } from './SpotlightTypes';
import type { HighlightProps as HighlightComponentProps } from '../Highlight';

interface SpotlightControllerProps {
  config?: {
    shortcut?: string | string[] | null;
    actions?: SpotlightItem[];
    alwaysMount?: boolean;
    highlightQuery?: boolean | HighlightComponentProps['highlight'];
    limit?: number;
    placeholder?: string;
  };
}

export const SpotlightController = React.memo<SpotlightControllerProps>(function SpotlightController({ config }) {
  const resolvedConfig = config ?? {};
  const shortcut = resolvedConfig.shortcut ?? ['cmd+k', 'ctrl+k'];
  const shortcuts = Array.isArray(shortcut)
    ? shortcut.filter(Boolean).map(String)
    : shortcut === null
      ? []
      : [String(shortcut)];

  useHotkeys(
    shortcuts.length
      ? shortcuts.map((hk): HotkeyItem => [hk, () => spotlight.toggle()])
      : [],
    [shortcuts.join('|')]
  );

  const actions = resolvedConfig.actions || [];
  const shouldRender = resolvedConfig.alwaysMount || actions.length > 0;

  if (!shouldRender) {
    return null;
  }

  return (
    <SpotlightProvider>
      <Spotlight
        actions={actions}
        shortcut={shortcuts}
        highlightQuery={resolvedConfig.highlightQuery}
        limit={resolvedConfig.limit}
        searchProps={{ placeholder: resolvedConfig.placeholder }}
      />
    </SpotlightProvider>
  );
});