import { Accordion } from '@plocks/ui';
import { setupSteps } from '../data';

export function Demo() {
  return (
    <Accordion
      items={setupSteps}
      titleProps={{ tt: 'uppercase', lts: 1, fw: '700', size: 'sm' }}
    />
  );
}
