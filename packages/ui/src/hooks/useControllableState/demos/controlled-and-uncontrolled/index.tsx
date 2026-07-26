import { useState } from 'react';
import { Badge, Block, Button, Rating, Row, Text, useControllableState } from '@platform-blocks/ui';

interface StarPickerProps {
  /** Controlled value. Passing this hands ownership to the parent. */
  value?: number;
  /** Initial value while uncontrolled. */
  defaultValue?: number;
  onChange?: (value: number) => void;
}

/** One component that supports both modes — the hook decides which is active. */
function StarPicker({ value, defaultValue, onChange }: StarPickerProps) {
  const [rating, setRating, isControlled] = useControllableState({
    value,
    defaultValue,
    finalValue: 0,
    onChange
  });

  return (
    <Row gap="sm" align="center">
      <Rating value={rating} onChange={setRating} />
      <Badge variant="light" color={isControlled ? 'primary' : 'gray'}>
        {isControlled ? 'controlled' : 'uncontrolled'}
      </Badge>
    </Row>
  );
}

export default function Demo() {
  const [rating, setRating] = useState(3);

  return (
    <Block gap="lg">
      <Block gap="xs">
        <Text size="sm" colorVariant="muted">No value prop — the hook keeps the rating in internal state.</Text>
        <StarPicker defaultValue={2} />
      </Block>

      <Block gap="xs">
        <Text size="sm" colorVariant="muted">A value prop — the parent owns the rating, so it can drive it too.</Text>
        <StarPicker value={rating} onChange={setRating} />
        <Row gap="sm" wrap="wrap">
          <Button size="sm" variant="outline" onPress={() => setRating(5)}>Set 5 from the parent</Button>
          <Button size="sm" variant="ghost" onPress={() => setRating(0)}>Clear</Button>
        </Row>
      </Block>
    </Block>
  );
}
