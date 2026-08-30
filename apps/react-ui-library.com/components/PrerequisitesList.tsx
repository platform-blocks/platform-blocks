import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BrandIcon, DataList, Link, Text, useTheme } from '@platform-blocks/react-ui-library';
import { GETTING_STARTED_PREREQUISITES } from '../config/gettingStarted';

/**
 * Prerequisites for the Getting Started page, rendered with the same
 * label / logo / link geometry as ComponentResourceLinks so the two reference
 * tables on the site read as one pattern.
 */
export const PrerequisitesList: React.FC = () => {
  const theme = useTheme();
  const textColor = theme.text?.primary;

  return (
    <DataList orientation="horizontal" size="sm" labelWidth={110}>
      {GETTING_STARTED_PREREQUISITES.map(({ label, brand, version, href, note }) => (
        <DataList.Item key={label}>
          <DataList.ItemLabel>{label}</DataList.ItemLabel>
          {/* Rendered outside DataList.ItemValue so the anchor is not nested in a
              <Text>, which React Native does not allow for pressables. */}
          <View style={styles.value}>
            <View style={styles.icon}>
              <BrandIcon brand={brand} size="sm" />
            </View>
            {/* `target` alone opens a new tab with rel=noopener; `external` is
                skipped so the row icon carries the signal instead of a ↗ glyph. */}
            <Link
              href={href}
              target="_blank"
              variant="hover-underline"
              size="sm"
              color={textColor}
            >
              {version}
            </Link>
            <Text variant="small" color="secondary">
              {note}
            </Text>
          </View>
        </DataList.Item>
      ))}
    </DataList>
  );
};

const styles = StyleSheet.create({
  value: {
    flex: 1,
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
    rowGap: 2,
    flexWrap: 'wrap',
  },
  // Fixed box so the link text lines up across rows regardless of glyph width.
  icon: {
    width: 16,
    alignItems: 'center',
  },
});

export default PrerequisitesList;
