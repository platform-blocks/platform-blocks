import { Accordion } from '@platform-blocks/ui';
import { faqItems } from '../data';

export default function Demo() {
  return <Accordion type="single" items={faqItems} />;
}
