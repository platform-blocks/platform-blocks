import { CopyButton, Flex } from '@plocks/ui';
import { CodeBlock } from "../../../packages/code/src/components/CodeBlock";

export function PackageInstallCommand({ packageName, compact = false }: {
  packageName: string;
  compact?: boolean;
}) {
  const command = `npm install ${packageName}`;

  return (
    <Flex direction="row" align="center" gap="xs" wrap="wrap">
      <CodeBlock p="xs" fullWidth={false} showCopyButton={false} withBorder={false} bg="transparent">{command}</CodeBlock>
    </Flex>
  );
}
