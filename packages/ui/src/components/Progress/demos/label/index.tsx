import { Block, Progress } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block gap="lg" fullWidth>
      <Progress value={64} label="Uploading assets" description="12 of 18 files" />

      <Progress
        value={40}
        color="error"
        label="Sync"
        description="Retries every 30 seconds"
        error="Connection lost — retrying"
      />

      <Progress value={82} label="Storage" required labelPosition="left" color="success" />

      <Progress.Root label="Disk usage" description="Documents, photos, and system files">
        <Progress.Section value={35} color="primary" />
        <Progress.Section value={28} color="success" />
        <Progress.Section value={12} color="warning" />
      </Progress.Root>
    </Block>
  );
}
