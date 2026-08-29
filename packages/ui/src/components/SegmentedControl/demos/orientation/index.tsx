import { Block, Row, SegmentedControl } from '@platform-blocks/ui';
import { frameworks, panes } from '../data';

export function Demo() {
  return (
      <Block>
        <Row gap="lg" align="flex-start" wrap="wrap">
          <SegmentedControl
            label="Horizontal (default)"
            orientation="horizontal"
            defaultValue="react"
            data={frameworks}
          />
          <SegmentedControl
            label="Vertical"
            orientation="vertical"
            defaultValue="code"
            data={panes}
          />
        </Row>
      </Block>
  );
}
