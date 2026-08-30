import { Accordion } from '@platform-blocks/react-ui-library';
import { faqItems } from '../data';

export function Demo() {
  return <Accordion type="single" items={faqItems} />;
}
