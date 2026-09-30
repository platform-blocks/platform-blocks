import { Block } from '@plocks/ui';
import { QRCode } from '@plocks/qrcode';

const QUIET_ZONES = [
  { label: 'Default quiet zone (4)', quietZone: undefined },
  { label: 'Minimal quiet zone (1)', quietZone: 1 },
  { label: 'No quiet zone (0)', quietZone: 0 }
] as const;

export function Demo() {
  return (
    <Block align="center">
      {QUIET_ZONES.map(({ label, quietZone }) => (
        <QRCode
          key={label}
          value="https://plocks.dev"
          size={150}
          quietZone={quietZone}
          label={label}
        />
      ))}
      <Block bg="subtle" radius="lg" p="sm">
        <QRCode
          value="https://plocks.dev"
          size={150}
          quietZone={0}
          m="xs"
        />
      </Block>
    </Block>
  );
}
