import { Accordion } from '@platform-blocks/react-ui-library';
import { statusItems } from '../data';

export function Demo() {
  return (
    <Accordion
      type="multiple"
      variant="separated"
      defaultExpanded={['healthy']}
      items={statusItems}
    />
  );
}
