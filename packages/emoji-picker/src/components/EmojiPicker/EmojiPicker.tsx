import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, View } from 'react-native';

import { a11yProps, factory, getLayoutStyles, Input, Text, useStyleProps, useTheme } from '@plocks/ui';
import { CATEGORY_LABELS, DEFAULT_EMOJIS, emojiForTone, nextRecent, recentItems, searchEmojis, TONE_EMOJIS, TONE_LABELS } from './catalog';
import type { EmojiPickerItem, EmojiPickerProps, EmojiPickerSelection, EmojiSkinTone } from './types';

type Row =
  | { key: string; type: 'heading'; title: string }
  | { key: string; type: 'emojis'; items: EmojiPickerItem[]; recent: boolean };

function addSection(rows: Row[], key: string, title: string, items: EmojiPickerItem[], columns: number, recent = false) {
  if (!items.length) return;
  rows.push({ key: `${key}-heading`, type: 'heading', title });
  for (let index = 0; index < items.length; index += columns) {
    rows.push({ key: `${key}-${index}`, type: 'emojis', items: items.slice(index, index + columns), recent });
  }
}

export const EmojiPicker = factory<{ props: EmojiPickerProps; ref: View }>((props, ref) => {
  const {
    onSelect,
    emojis = DEFAULT_EMOJIS,
    categoryLabels,
    skinTone,
    defaultSkinTone = 0,
    onSkinToneChange,
    recent,
    defaultRecent = [],
    onRecentChange,
    maxRecent = 24,
    searchPlaceholder = 'Search emoji',
    emptyText = 'No emoji found',
    style,
    testID,
  } = props;
  const theme = useTheme();
  const styleProps = useStyleProps(props);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [internalTone, setInternalTone] = useState<EmojiSkinTone>(defaultSkinTone);
  const [internalRecent, setInternalRecent] = useState<readonly string[]>(defaultRecent);
  const [width, setWidth] = useState(352);
  const tone = skinTone ?? internalTone;
  const currentRecent = recent ?? internalRecent;
  const columns = Math.max(4, Math.min(10, Math.floor((width - 24) / 42)));
  const cellSize = (width - 24) / columns;
  const hasSkinTones = useMemo(() => emojis.some(item => item.skins?.some(Boolean)), [emojis]);
  const categories = useMemo(() => {
    const keys = new Set(emojis.map(item => item.category));
    return [
      ...Object.keys(CATEGORY_LABELS).filter(key => keys.delete(key)),
      ...keys,
    ];
  }, [emojis]);
  const labels = useMemo(() => ({ ...CATEGORY_LABELS, ...categoryLabels }), [categoryLabels]);

  const rows = useMemo(() => {
    const result: Row[] = [];
    const found = query.trim() ? searchEmojis(emojis, query) : null;
    if (found) {
      addSection(result, 'results', 'Search results', found, columns);
    } else if (category === 'recent') {
      addSection(result, 'recent', 'Recently used', recentItems(emojis, currentRecent), columns, true);
    } else if (category === 'all') {
      addSection(result, 'recent', 'Recently used', recentItems(emojis, currentRecent), columns, true);
      for (const key of categories) {
        addSection(result, key, labels[key] ?? key, emojis.filter(item => item.category === key), columns);
      }
    } else {
      addSection(result, category, labels[category] ?? category, emojis.filter(item => item.category === category), columns);
    }
    return result;
  }, [emojis, query, category, currentRecent, columns, categories, labels]);

  const select = (item: EmojiPickerItem, exactEmoji?: string) => {
    const emoji = exactEmoji ?? emojiForTone(item, tone);
    const variantIndex = item.skins?.indexOf(emoji) ?? -1;
    const selectedTone = variantIndex >= 0 ? (variantIndex + 1) as EmojiSkinTone : 0;
    const selection: EmojiPickerSelection = {
      id: item.id,
      emoji,
      name: item.name,
      category: item.category,
      skinTone: selectedTone,
    };
    const updatedRecent = nextRecent(currentRecent, emoji, maxRecent);
    if (recent === undefined) setInternalRecent(updatedRecent);
    onRecentChange?.(updatedRecent);
    onSelect(selection);
  };

  return (
    <View
      ref={ref}
      testID={testID}
      onLayout={event => {
        const next = event.nativeEvent.layout.width;
        if (next > 0 && Math.abs(next - width) > 1) setWidth(next);
      }}
      style={[
        { width: 352, maxWidth: '100%', height: 420, backgroundColor: theme.backgrounds.elevated, borderColor: theme.backgrounds.border, borderWidth: 1, borderRadius: theme.radii.lg, overflow: 'hidden' },
        getLayoutStyles({ fullWidth: props.fullWidth }),
        styleProps,
        style,
      ]}
    >
      <View style={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 8, gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text c={theme.text.primary} fw="bold" size={15}>Emoji</Text>
          {hasSkinTones && <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 2, alignItems: 'center' }}>
            {TONE_EMOJIS.map((emoji, index) => {
              const selected = tone === index;
              return (
                <Pressable
                  key={emoji}
                  {...a11yProps({ role: 'button', label: TONE_LABELS[index], pressed: selected })}
                  onPress={() => {
                    const next = index as EmojiSkinTone;
                    if (skinTone === undefined) setInternalTone(next);
                    onSkinToneChange?.(next);
                  }}
                  style={{ width: 29, height: 29, alignItems: 'center', justifyContent: 'center', borderRadius: 7, backgroundColor: selected ? theme.backgrounds.selected : 'transparent' }}
                >
                  <Text size={19}>{emoji}</Text>
                </Pressable>
              );
            })}
          </ScrollView>}
        </View>
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder={searchPlaceholder}
          accessibilityLabel={searchPlaceholder}
          size="sm"
          mb={0}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always" contentContainerStyle={{ gap: 6 }}>
          {[
            { key: 'all', label: 'All' },
            ...(currentRecent.length ? [{ key: 'recent', label: 'Recent' }] : []),
            ...categories.map(key => ({ key, label: labels[key] ?? key })),
          ].map(tab => {
            const selected = category === tab.key;
            return (
              <Pressable
                key={tab.key}
                {...a11yProps({ role: 'tab', label: tab.label, selected })}
                onPress={() => { setCategory(tab.key); setQuery(''); }}
                style={{ paddingHorizontal: 11, paddingVertical: 6, borderRadius: 16, backgroundColor: selected ? theme.backgrounds.selected : theme.backgrounds.subtle }}
              >
                <Text size={12} fw={selected ? 'bold' : 'normal'} c={selected ? theme.text.primary : theme.text.secondary}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <FlatList
        data={rows}
        keyExtractor={row => row.key}
        keyboardShouldPersistTaps="always"
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 12 }}
        ListEmptyComponent={<Text c={theme.text.secondary} ta="center" py={24}>{emptyText}</Text>}
        renderItem={({ item: row }) => row.type === 'heading' ? (
          <Text c={theme.text.secondary} size={12} fw="bold" py={7}>{row.title}</Text>
        ) : (
          <View style={{ flexDirection: 'row' }}>
            {row.items.map(item => {
              const unicode = row.recent ? item.emoji : emojiForTone(item, tone);
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityLabel={item.name}
                  testID={testID ? `${testID}-emoji-${item.id}` : undefined}
                  onPress={() => select(item, row.recent ? unicode : undefined)}
                  style={({ pressed }) => ({ width: cellSize, height: cellSize, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: pressed ? theme.backgrounds.pressed : 'transparent' })}
                >
                  <Text size={26}>{unicode}</Text>
                </Pressable>
              );
            })}
          </View>
        )}
      />
    </View>
  );
}, { displayName: 'EmojiPicker' });
