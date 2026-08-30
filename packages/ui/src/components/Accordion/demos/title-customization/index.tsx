import { Accordion } from '@platform-blocks/react-ui-library';
import { setupSteps } from '../data';

export function Demo() {
  return (
    <Accordion
      items={setupSteps}
      titleProps={{ uppercase: true, tracking: 1, weight: '700', size: 'sm' }}
    />
  );
}
