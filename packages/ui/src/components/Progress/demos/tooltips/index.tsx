import { Block, Progress } from '@plocks/ui';

const SECTIONS = [
  { label: 'Documents', value: 34, color: 'primary' as const },
  { label: 'Photos', value: 26, color: 'success' as const },
  { label: 'Backups', value: 18, color: 'warning' as const }
];

export function Demo() {
  return (
    <Block fullWidth>
      <Progress.Root>
        {SECTIONS.map((section) => (
          <Progress.Section
            key={section.label}
            value={section.value}
            color={section.color}
            tooltip={`${section.label} — ${section.value}%`}
          />
        ))}
      </Progress.Root>
    </Block>
  );
}
