import { Accordion, AccordionNamespace } from './Accordion';
export { Accordion, AccordionNamespace };
export const AccordionRoot = Accordion; // explicit alias
// Internal item component intentionally not exported publicly (was AccordionItemComponent)
export type { AccordionProps, AccordionItem as AccordionItemType, AccordionRef } from './types';
export type {
	AccordionType,
	AccordionVariant,
	AccordionComputedStyles,
	AccordionStyleResolver,
	AccordionToggleDetail,
	OnAccordionToggle,
	AccordionAnimationProp
} from './types';


