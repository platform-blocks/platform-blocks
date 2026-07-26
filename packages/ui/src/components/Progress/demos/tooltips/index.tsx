import { Block, Progress, Text } from '@platform-blocks/ui';

const SECTIONS = [
  { label: 'Documents', value: 34, color: 'primary' as const },
  { label: 'Photos', value: 26, color: 'success' as const },
  { label: 'Backups', value: 18, color: 'warning' as const }
];

export default function Demo() {
  return (
      <Progress.Root size="xl">
        {SECTIONS.map((section) => (
          <Progress.Section
            key={section.label}
            value={section.value}
            color={section.color}
            tooltip={`${section.label} — ${section.value}%`}
          >
            <Progress.Label>{section.value}%</Progress.Label>
          </Progress.Section>
        ))}
      </Progress.Root>
  );
}
