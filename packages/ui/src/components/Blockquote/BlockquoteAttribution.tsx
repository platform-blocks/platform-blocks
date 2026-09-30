import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../core/theme/ThemeProvider';
import { resolveSpacing } from '../../core/theme/tokens';
import type { PlocksTheme, SizeToken } from '../../core/theme/types';
import { BlockquoteAuthor } from './BlockquoteAuthor';
import { BlockquoteSource } from './BlockquoteSource';
import { BlockquoteMeta } from './BlockquoteMeta';
import type { BlockquoteAttributionProps } from './types';

const px = (theme: PlocksTheme, token: SizeToken): number => {
  const resolved = resolveSpacing(theme, token);
  return typeof resolved === 'number' ? resolved : 0;
};

export function BlockquoteAttribution({
  author,
  date,
  rating,
  source,
  links,
  verified,
  verifiedTooltip,
  alignment = 'right',
}: BlockquoteAttributionProps) {
  const theme = useTheme();

  const hasMeta = Boolean(date || rating || verified);
  const hasCredits = Boolean(source) || hasMeta;
  // Source and metadata read as a receipt for the quote, so they park on the
  // far side from the signature — but only when there are two sides to split.
  const splitSides = alignment !== 'center' && Boolean(author) && hasCredits;
  const creditsAlignment = splitSides
    ? (alignment === 'right' ? 'left' : 'right')
    : alignment;

  const containerStyle = {
    // Full width so the block can actually park against the edge it aligns to —
    // a shrink-to-fit container makes `alignItems` a no-op.
    width: '100%' as const,
    marginTop: px(theme, 'md'),
    gap: px(theme, 'xs'),
    alignItems: alignment === 'center' ? 'center' as const : alignment === 'right' ? 'flex-end' as const : 'flex-start' as const,
  };

  const authorBlock = author ? (
    <BlockquoteAuthor
      author={author}
      alignment={alignment}
    />
  ) : null;

  const creditsBlock = hasCredits ? (
    <View
      style={{
        gap: px(theme, 'xs'),
        flexShrink: 1,
        alignItems: creditsAlignment === 'center'
          ? 'center'
          : creditsAlignment === 'right' ? 'flex-end' : 'flex-start',
      }}
    >
      {source && (
        <BlockquoteSource
          source={source}
          alignment={creditsAlignment}
        />
      )}

      {hasMeta && (
        <BlockquoteMeta
          date={date}
          rating={rating}
          verified={verified}
          verifiedTooltip={verifiedTooltip}
          alignment={creditsAlignment}
        />
      )}
    </View>
  ) : null;

  if (splitSides) {
    // The author's own `alignSelf` steers the cross axis once it sits in a row,
    // so it gets a wrapper and the row keeps both columns on the same baseline.
    const authorWrapper = <View style={{ flexShrink: 1 }}>{authorBlock}</View>;

    return (
      <View
        style={{
          width: '100%',
          marginTop: px(theme, 'md'),
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          gap: px(theme, 'md'),
        }}
      >
        {alignment === 'right'
          ? <>{creditsBlock}{authorWrapper}</>
          : <>{authorWrapper}{creditsBlock}</>}
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      {authorBlock}
      {creditsBlock}
    </View>
  );
}
