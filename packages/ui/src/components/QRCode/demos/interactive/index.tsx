import { useState } from 'react';
import { Block, Button, Input, QRCode, Row, Text } from '@platform-blocks/ui';

const SIZES = [144, 168, 192] as const;
const ERROR_LEVELS = ['L', 'M', 'Q', 'H'] as const;
const MODULE_SHAPES = ['square', 'rounded', 'diamond'] as const;

export function Demo() {
  const [value, setValue] = useState('https://platform-blocks.com');
  const [size, setSize] = useState<(typeof SIZES)[number]>(168);
  const [errorLevel, setErrorLevel] = useState<(typeof ERROR_LEVELS)[number]>('M');
  const [moduleShape, setModuleShape] = useState<(typeof MODULE_SHAPES)[number]>('square');

  return (
    <Block>
      <Input value={value} onChangeText={setValue} placeholder="Enter text, URL, or contact info" />
      <Row gap="lg" wrap="wrap" align="flex-start">
        <Block>
          <Block>
            <Text variant="small" c="muted">
              Size
            </Text>
            <Row gap="xs" wrap="wrap">
              {SIZES.map((option) => (
                <Button
                  key={option}
                  size="xs"
                  variant={size === option ? 'filled' : 'outline'}
                  onPress={() => setSize(option)}
                >
                  {option}px
                </Button>
              ))}
            </Row>
          </Block>
          <Block>
            <Text variant="small" c="muted">
              Error correction
            </Text>
            <Row gap="xs" wrap="wrap">
              {ERROR_LEVELS.map((level) => (
                <Button
                  key={level}
                  size="xs"
                  variant={errorLevel === level ? 'filled' : 'outline'}
                  onPress={() => setErrorLevel(level)}
                >
                  {level}
                </Button>
              ))}
            </Row>
          </Block>
          <Block>
            <Text variant="small" c="muted">
              Module shape
            </Text>
            <Row gap="xs" wrap="wrap">
              {MODULE_SHAPES.map((shape) => (
                <Button
                  key={shape}
                  size="xs"
                  variant={moduleShape === shape ? 'filled' : 'outline'}
                  onPress={() => setModuleShape(shape)}
                >
                  {shape}
                </Button>
              ))}
            </Row>
          </Block>
        </Block>
        <QRCode
          value={value || 'Platform Blocks'}
          size={size}
          quietZone={2}
          errorCorrectionLevel={errorLevel}
          moduleShape={moduleShape}
        />
      </Row>
    </Block>
  );
}
