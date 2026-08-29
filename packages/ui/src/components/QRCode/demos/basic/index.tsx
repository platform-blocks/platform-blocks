import { QRCode } from '@platform-blocks/ui';

export function Demo() {
  return (
    <QRCode
      value="https://platform-blocks.com"
      size={168}
      quietZone={2}
      label="Scan to open the Platform Blocks docs."
    />
  );
}
