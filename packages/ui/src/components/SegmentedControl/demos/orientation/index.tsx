import { Block, Row, SegmentedControl } from '@platform-blocks/react-ui-library';
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
