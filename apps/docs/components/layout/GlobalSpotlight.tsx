import React from 'react';
import { useRouter } from 'expo-router';
import { Spotlight, directSpotlight, useDirectSpotlightState } from '@plocks/spotlight';
import { useDeviceInfo, hasDOM, useGlobalHotkeys, useListNavigation, Icon } from '@plocks/ui';
import { useSpotlightData, type SpotlightAction } from '../../utils/spotlightIntegration';
import { useI18n } from '@plocks/ui';

export const GlobalSpotlight: React.FC = () => {
  const { platform: { isWeb } } = useDeviceInfo();
  const router = useRouter();
  const { getSpotlightActions } = useSpotlightData(router);
  const { state, close, setQuery } = useDirectSpotlightState();
  const { t } = useI18n();
  const [selectedIndex, setSelectedIndex] = React.useState(-1);

  useGlobalHotkeys('global-spotlight-toggle', ['mod+k', () => { if (state.opened) { setQuery(''); close(); } else { directSpotlight.open(); } }]);

  const spotlightActions = React.useMemo(
    () => getSpotlightActions(state.query),
    [state.query, getSpotlightActions],
  );
  const flatActions = React.useMemo(() => {
    const out: SpotlightAction[] = [];
    spotlightActions.forEach(item => {
      if ('group' in item) out.push(...item.actions);
      else out.push(item);
    });
    return out;
  }, [spotlightActions]);

  const navigation = useListNavigation({
    count: flatActions.length,
    activeIndex: selectedIndex,
    onActiveChange: setSelectedIndex,
    getId: (index) => flatActions[index]?.id ?? `spotlight-${index}`,
    onSelect: (index) => {
      const action = flatActions[index];
      if (!action) return;
      action.onPress?.();
      setQuery('');
      close();
    },
    opened: state.opened,
    onClose: () => { setQuery(''); close(); },
  });
  const navigateUp = navigation.movePrevious;
  const navigateDown = navigation.moveNext;
  const selectAction = React.useCallback(() => navigation.selectActive(true), [navigation.selectActive]);

  // Clear the highlight whenever the query changes, since the index only means
  // anything relative to the current `flatActions`. Adjusted during render
  // rather than in an effect: an effect runs *after* the commit, so the list
  // painted one frame with the new results and the old row still highlighted —
  // and if the new list was shorter, Enter in that frame fired the wrong
  // action. Setting state during render makes React re-run this component
  // before touching the DOM, so neither is observable.
  const [queryAtLastReset, setQueryAtLastReset] = React.useState(state.query);
  if (state.query !== queryAtLastReset) {
    setQueryAtLastReset(state.query);
    setSelectedIndex(-1);
  }

  React.useEffect(() => { if (!isWeb || !hasDOM) return; if (!state.opened) return; const onKeyDown = (e: KeyboardEvent) => { if (e.isComposing) return; const tag = (e.target as HTMLElement)?.tagName; const isInput = tag === 'INPUT' || tag === 'TEXTAREA'; switch (e.key) { case 'ArrowDown': if (isInput) return; e.preventDefault(); navigateDown(); break; case 'ArrowUp': if (isInput) return; e.preventDefault(); navigateUp(); break; case 'Enter': e.preventDefault(); selectAction(); break; case 'Escape': e.preventDefault(); setQuery(''); close(); break; } }; window.addEventListener('keydown', onKeyDown); return () => window.removeEventListener('keydown', onKeyDown); }, [isWeb, state.opened, navigateDown, navigateUp, selectAction, setQuery, close]);

  return (
    <Spotlight.Root query={state.query} onQueryChange={setQuery} opened={state.opened} onClose={() => { setQuery(''); close(); }}>
      <Spotlight.Search value={state.query} onChangeText={setQuery} placeholder={t('actions.searchPlaceholder')} onNavigateDown={navigateDown} onNavigateUp={navigateUp} onSelectAction={selectAction} onClose={() => { setQuery(''); close(); }} />
      <Spotlight.ActionsList>
        {spotlightActions.length > 0 ? (() => {
          let flatIdx = 0; return spotlightActions.map((item, groupIdx) => {
            if ('group' in item) {
              return (
                <Spotlight.ActionsGroup key={`group-${groupIdx}`} label={item.group}>
                  {item.actions.map(action => {
                    const isSelected = flatIdx === selectedIndex; flatIdx++; return (
                      <Spotlight.Action key={action.id} label={action.label} description={action.description} selected={isSelected} startSection={action.icon ? (<Icon name={action.icon} size="md" />) : undefined} highlightQuery={state.query} onPress={() => {
                        action.onPress?.();
                        setQuery('');
                        close();
                      }} />);
                  })}
                </Spotlight.ActionsGroup>
              );
            } else {
              const isSelected = flatIdx === selectedIndex; flatIdx++; return (
                <Spotlight.Action key={item.id} label={item.label} description={item.description} selected={isSelected} startSection={item.icon ? (<Icon name={item.icon} size="md" />) : undefined} highlightQuery={state.query} onPress={() => {
                  item.onPress?.();
                  setQuery('');
                  close();
                }} />);
            }
          });
        })() : state.query.trim() ? (<Spotlight.Empty>{t('spotlight.noResults', { query: state.query })}</Spotlight.Empty>) : null}
      </Spotlight.ActionsList>
    </Spotlight.Root>
  );
};
