import { Accordion } from '@plocks/ui';
import { faqItems } from '../data';

export function Demo() {
  return <Accordion type="single" items={faqItems} />;
}
