import { Block, QRCode, Row } from '@platform-blocks/ui';

const ERROR_LEVELS = [
  { label: 'Level L (~7%)', value: 'L' },
  { label: 'Level M (~15%)', value: 'M' },
  { label: 'Level Q (~25%)', value: 'Q' },
  { label: 'Level H (~30%)', value: 'H' }
] as const;

const QUIET_ZONES = [0, 2, 4, 8] as const;

export function Demo() {
  return (
    <Block>
      <Row gap="lg" wrap="wrap" justify="center">
        {ERROR_LEVELS.map(({ label, value }) => (
          <QRCode
            key={value}
            value={`https://platform-blocks.com/ecc/${value}`}
            errorCorrectionLevel={value}
            size={140}
            label={label}
          />
        ))}
      </Row>
      <Row gap="lg" wrap="wrap" justify="center">
        {QUIET_ZONES.map((quietZone) => (
          <QRCode
            key={quietZone}
            value={`https://platform-blocks.com/quiet-zone/${quietZone}`}
            quietZone={quietZone}
            size={140}
            label={`Quiet zone: ${quietZone}`}
          />
        ))}
      </Row>
    </Block>
  );
}
