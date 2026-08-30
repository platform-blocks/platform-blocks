import React from 'react';
import { Linking, StyleSheet, View, useWindowDimensions } from 'react-native';
import { BrandIcon, Button, Chip, Divider, Icon, Text } from '@platform-blocks/react-ui-library';
import { BREAKPOINTS } from '@platform-blocks/react-ui-library/core/responsive';
import { STARTER_TEMPLATES, type StarterTemplate } from '../config/templates';

/**
 * The starter templates, rendered as a list rather than a card grid: one row
 * per template with the toolchain mark, the repo name and description, and the
 * link out to GitHub, separated by hairlines.
 *
 * A row is the right shape here because the entries differ only by a line of
 * prose — cards gave each starter a box of its own and made six near-identical
 * blocks the reader had to compare across two axes instead of scanning down one.
 */
export const TemplatesList: React.FC = () => {
  const { width } = useWindowDimensions();
  // Below tablet width the three cells cannot sit side by side without
  // squeezing the description to a couple of words per line, so the row stacks.
  const stacked = width < BREAKPOINTS.md;

  return (
    <View>
      {STARTER_TEMPLATES.map((template, index) => (
        <View key={template.key}>
          {index > 0 && <Divider />}
          <TemplateRow template={template} stacked={stacked} />
        </View>
      ))}
    </View>
  );
};

const TemplateRow: React.FC<{ template: StarterTemplate; stacked: boolean }> = ({
  template,
  stacked,
}) => {
  const { name, description, brand, tags, repo, available } = template;

  // The Expo mark is a black glyph — inverted in dark mode so the row's leading
  // cell does not go invisible on the dark surface.
  const mark = (
    <BrandIcon
      brand={brand}
      size={stacked ? 'lg' : '2xl'}
      invertInDarkMode
      decorative
    />
  );

  return (
    <View style={[styles.row, stacked && styles.rowStacked]}>
      {/* Stacked, the mark sits on the name line instead of in a cell of its
          own — a column of icons above their titles reads as five orphans. */}
      {!stacked && <View style={styles.iconCell}>{mark}</View>}

      <View style={styles.info}>
        <View style={styles.titleLine}>
          {stacked && mark}
          <Text variant="p" weight="medium">{name}</Text>
          {!available && (
            <Chip size="xs" color="gray" variant="light">coming soon</Chip>
          )}
          {tags.map(tag => (
            <Chip key={tag} size="xs" variant="surface">{tag}</Chip>
          ))}
        </View>
        <Text variant="small" color="secondary">{description}</Text>
      </View>

      {/* The cell keeps its width even when the template has no link yet, so
          the buttons stay in one column down the list. */}
      <View style={[styles.actionCell, stacked && styles.actionCellStacked]}>
        {available && (
          <Button
            title="Use template"
            variant="default"
            size="xs"
            endIcon={<Icon name="external-link" size="xs" />}
            onPress={() => {
              Linking.openURL(repo).catch(err =>
                console.error('[TemplatesList] Failed to open template repo:', repo, err));
            }}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 12,
  },
  rowStacked: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  // Fixed box so names line up regardless of how wide each brand mark draws.
  iconCell: {
    width: 40,
    alignItems: 'center',
  },
  info: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    columnGap: 8,
    rowGap: 4,
  },
  actionCell: {
    width: 132,
    alignItems: 'flex-end',
  },
  actionCellStacked: {
    width: 'auto',
    alignItems: 'flex-start',
  },
});

export default TemplatesList;
