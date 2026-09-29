import { Link, Text } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Text>
      Before publishing, review the <Link href="#brand">brand guidelines</Link>, consult our{' '}
      <Link href="#voice">voice and tone guide</Link>, and confirm each launch in the{' '}
      <Link href="#releases">release checklist</Link>.
    </Text>
  );
}
