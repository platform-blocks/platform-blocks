import { Block, Card, Link, Text } from '@platform-blocks/react-ui-library';

const resources = [
  { href: '#brand', label: 'brand guidelines' },
  { href: '#voice', label: 'voice and tone guide' },
  { href: '#releases', label: 'release checklist' },
];

const [brandGuide, voiceGuide, releaseChecklist] = resources;

export function Demo() {
  return (
    <Card p="md">
      <Block>
        <Text size="sm" color="secondary">
          Use `Link` inline with body copy to direct readers to additional guidance without breaking the flow of text.
        </Text>
        <Text size="sm">
          Before publishing, review the{' '}
          <Link href={brandGuide.href}>{brandGuide.label}</Link>, consult our{' '}
          <Link href={voiceGuide.href}>{voiceGuide.label}</Link>, and confirm each launch in the{' '}
          <Link href={releaseChecklist.href}>{releaseChecklist.label}</Link>.
        </Text>
      </Block>
    </Card>
  );
}


