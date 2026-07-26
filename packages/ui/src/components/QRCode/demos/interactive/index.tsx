import { useState } from 'react';
import { Block, Button, Input, QRCode, Row, Text } from '@platform-blocks/ui';
import { ERROR_LEVELS, MODULE_SHAPES, PRESETS, SIZES } from './data';

export default function Demo() {
  const [value, setValue] = useState<string>(PRESETS[0].value);
  const [size, setSize] = useState<(typeof SIZES)[number]>(SIZES[1]);
  const [errorLevel, setErrorLevel] = useState<(typeof ERROR_LEVELS)[number]>('M');
  const [moduleShape, setModuleShape] = useState<(typeof MODULE_SHAPES)[number]>('square');

  return (
    <Block>
      <Block>
        <Text variant="small" colorVariant="muted">
          Source content
        </Text>
        <Input
          value={value}
          onChangeText={setValue}
          placeholder="Enter text, URL, or contact info"
          multiline
          minLines={1}
          maxLines={3}
        />
        <Row gap="xs" wrap="wrap">
          {PRESETS.map(({ label, value: preset }) => (
            <Button
              key={label}
              size="xs"
              variant={value === preset ? 'filled' : 'outline'}
              onPress={() => setValue(preset)}
            >
              {label}
            </Button>
          ))}
        </Row>
        <Text variant="small" colorVariant="muted">
          {value.length} characters
        </Text>
      </Block>
      <Row gap="lg" wrap="wrap" align="flex-start">
        <Block maxW={320} w="full">
          <Block>
            <Block>
              <Text variant="small" colorVariant="muted">
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
              <Text variant="small" colorVariant="muted">
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
              <Text variant="small" colorVariant="muted">
                L≈7% • M≈15% • Q≈25% • H≈30% recovery
              </Text>
            </Block>
            <Block>
              <Text variant="small" colorVariant="muted">
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
                    {shape.charAt(0).toUpperCase() + shape.slice(1)}
                  </Button>
                ))}
              </Row>
            </Block>
          </Block>
        </Block>
        <QRCode
          value={value || 'Platform Blocks'}
          size={size}
          quietZone={2}
          errorCorrectionLevel={errorLevel}
          moduleShape={moduleShape}
          cornerRadius={moduleShape === 'rounded' ? 0.4 : undefined}
          copyOnPress={{ value }}
          label={`${size}px • Level ${errorLevel} • ${moduleShape} modules`}
          labelProps={{ style: { textAlign: 'center' } }}
        />
      </Row>
    </Block>
  );
}


