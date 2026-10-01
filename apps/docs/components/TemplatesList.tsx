import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { useBreakpoint, Button, Chip, Divider, Icon, Text } from '@plocks/ui';
import { BrandIcon } from '@plocks/brands';
import type { IconProps, SizeValue } from '@plocks/ui';
import type { BrandName } from '@plocks/brands';
import { CodeBlock } from '@plocks/code';
import { STARTER_TEMPLATES, getTemplateCreateCommand, type StarterTemplate } from '../config/templates';

/** A brand from the brand registry, or a plain icon where no brand fits (the web). */
type MarkSource = { brand: BrandName } | { icon: IconProps['name'] };

const TEMPLATE_MARKS: Record<StarterTemplate['mark'], MarkSource> = {
  expo: { brand: 'expo' },
  react: { brand: 'react' },
  globe: { icon: 'globe' },
};

/** Tags that name a platform or toolchain carry its mark; the rest are plain. */
const TAG_MARKS: Record<string, MarkSource> = {
  Expo: { brand: 'expo' },
  iOS: { brand: 'apple' },
  Android: { brand: 'android' },
  Web: { icon: 'globe' },
  'Static web': { icon: 'web' },
  'React Native Web': { brand: 'react' },
  'React Native CLI': { brand: 'react' },
};

const Mark: React.FC<{ source: MarkSource; size: SizeValue }> = ({ source, size }) =>
  'brand' in source ? (
    // Expo and Apple are black glyphs — inverted in dark mode so they stay visible.
    <BrandIcon brand={source.brand} size={size} invertInDarkMode decorative />
  ) : (
    <Icon name={source.icon} size={size} decorative />
  );

/**
 * The starter templates, rendered as a list rather than a card grid: one row
 * per template with the toolchain mark, the repo name and description, the
 * create command, and the link out to GitHub, separated by hairlines.
 *
 * A row keeps the starters easy to scan without splitting them into a card grid.
 */
export const TemplatesList: React.FC = () => {
  const breakpoint = useBreakpoint();
  // Below tablet width the three cells cannot sit side by side without
  // squeezing the description to a couple of words per line, so the row stacks.
  const stacked = breakpoint === 'base' || breakpoint === 'xs' || breakpoint === 'sm';

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
  const { name, description, mark: markKey, tags, repo, available } = template;
  const mark = <Mark source={TEMPLATE_MARKS[markKey]} size={stacked ? 'lg' : '2xl'} />;

  return (
    <View style={[styles.row, stacked && styles.rowStacked]}>
      {/* Stacked, the mark sits on the name line instead of in a cell of its
          own — a column of icons above their titles reads as five orphans. */}
      {!stacked && <View style={styles.iconCell}>{mark}</View>}

      <View style={styles.info}>
        <View style={styles.titleLine}>
          {stacked && mark}
          <Text variant="p" fw="medium">{name}</Text>
          {!available && (
            <Chip size="xs" color="gray" variant="light">coming soon</Chip>
          )}
          {tags.map(tag => (
            <Chip
              key={tag}
              size="xs"
              variant="surface"
              startSection={TAG_MARKS[tag] && <Mark source={TAG_MARKS[tag]} size="xs" />}
            >
              {tag}
            </Chip>
          ))}
        </View>
        <Text variant="small" c="secondary">{description}</Text>
        {available && (
          <CodeBlock language="bash" fullWidth style={styles.command}>
            {getTemplateCreateCommand(template)}
          </CodeBlock>
        )}
      </View>

      {/* The cell keeps its width even when the template has no link yet, so
          the buttons stay in one column down the list. */}
      <View style={[styles.actionCell, stacked && styles.actionCellStacked]}>
        {available && (
          <Button
            title="Use template"
            variant="default"
            size="xs"
            endSection={<Icon name="external-link" size="xs" />}
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
  command: {
    marginTop: 8,
    marginBottom: 0,
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
