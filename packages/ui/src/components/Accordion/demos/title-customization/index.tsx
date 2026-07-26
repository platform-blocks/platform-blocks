import { Accordion } from '@platform-blocks/ui';
import { setupSteps } from '../data';

export default function Demo() {
  return (
    <Accordion
      items={setupSteps}
      titleProps={{ uppercase: true, tracking: 1, weight: '700', size: 'sm' }}
    />
  );
}
