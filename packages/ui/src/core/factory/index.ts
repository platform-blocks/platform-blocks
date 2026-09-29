export type {
  Factory,
  FactoryPayload,
  FactoryComponent,
  FactoryStatics,
  FactoryExtendInput,
  PlatformBlocksComponent,
  FactoryOptions,
  ComponentWithProps,
  WithFixedProps,
} from './factory';
export { factory, withStatics } from './factory';
export {
  useVisibility,
  VisibilityGate,
  hasVisibilityProps,
  splitVisibilityProps,
  isHiddenBy,
} from './visibility';
export type {
  PolymorphicFactory,
  PolymorphicFactoryPayload,
  PolymorphicFactoryOptions,
  PolymorphicComponent,
  PolymorphicComponentProps,
  PolymorphicRef
} from './polymorphicFactory';
export { polymorphicFactory, createPolymorphicComponent } from './polymorphicFactory';
