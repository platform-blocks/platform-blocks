import { Block, KeyCap, Row } from '@plocks/ui';

export function Demo() {
  return (
    <Block align="flex-start">
      <Row gap="sm" wrap="wrap">
        <KeyCap variant="default">Default</KeyCap>
        <KeyCap variant="filled">Filled</KeyCap>
        <KeyCap variant="minimal">Minimal</KeyCap>
        <KeyCap variant="outline">Outline</KeyCap>
      </Row>
    </Block>
  );
}
