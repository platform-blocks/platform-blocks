import React, { forwardRef, memo } from 'react';

import { ComponentWithProps, FactoryPayload } from './factory';

type DefaultProps = Record<string, unknown>;

// Polymorphic component types
type ElementType = React.ElementType;

type PropsOf<C extends ElementType> = React.JSX.LibraryManagedAttributes<
  C,
  React.ComponentPropsWithoutRef<C>
>;

type ComponentProp<C> = {
  component?: C;
};

type ExtendedProps<Props = DefaultProps, OverrideProps = DefaultProps> = OverrideProps &
  Omit<Props, keyof OverrideProps>;

type InheritedProps<C extends ElementType, Props = DefaultProps> = ExtendedProps<PropsOf<C>, Props>;

export type PolymorphicRef<C> = C extends React.ElementType
  ? React.ComponentPropsWithRef<C>['ref']
  : never;

export type PolymorphicComponentProps<C, Props = DefaultProps> = C extends React.ElementType
  ? InheritedProps<C, Props & ComponentProp<C>> & {
      ref?: PolymorphicRef<C>;
    }
  : Props & { component: React.ElementType };

// Polymorphic factory payload
export interface PolymorphicFactoryPayload extends FactoryPayload {
  defaultComponent: unknown;
  defaultRef: unknown;
}

/**
 * Polymorphic component interface
 * @deprecated see `polymorphicFactory`.
 */
export interface PolymorphicComponent<Payload extends PolymorphicFactoryPayload>
  extends ComponentWithProps<Payload['props']> {
  <C = Payload['defaultComponent']>(
    props: PolymorphicComponentProps<C, Payload['props']>
  ): React.ReactElement;
  /** Typed identity for theme component overrides. */
  extend: <T>(input: T) => T;
  displayName?: string;
}

export interface PolymorphicFactoryOptions<Props = object> {
  /** Optional display name applied to the resulting component */
  displayName?: string;
  /** Enable or disable memoization. Defaults to `true`. */
  memo?: boolean;
  /** Optional custom comparison used when memoization is enabled */
  arePropsEqual?: (prevProps: Readonly<Props>, nextProps: Readonly<Props>) => boolean;
}

type AnyProps = Record<string, unknown>;
type ErasedComponent = React.ForwardRefExoticComponent<AnyProps & React.RefAttributes<unknown>>;
type PropsComparator = (prev: Readonly<AnyProps>, next: Readonly<AnyProps>) => boolean;
interface PolymorphicHelperHost {
  displayName?: string;
  extend?: <T>(input: T) => T;
  withProps?: (fixedProps: AnyProps) => PolymorphicHelperHost;
}

/**
 * Factory function for creating polymorphic PlatformBlocks components
 *
 * @deprecated No component in the library uses it (every component is built with `factory`); it will be removed in the next major.
 */
export function polymorphicFactory<Payload extends PolymorphicFactoryPayload>(
  ui: React.ForwardRefRenderFunction<Payload['defaultRef'], Payload['props']>,
  options: PolymorphicFactoryOptions<Payload['props']> = {}
): PolymorphicComponent<Payload> {
  const { displayName, memo: shouldMemo = true } = options;
  const arePropsEqual = options.arePropsEqual as PropsComparator | undefined;

  const ForwardComponent = forwardRef(ui) as unknown as ErasedComponent;

  if (displayName) {
    ForwardComponent.displayName = displayName;
  }

  const Component: PolymorphicHelperHost = shouldMemo
    ? memo(ForwardComponent, arePropsEqual)
    : ForwardComponent;

  Component.withProps = (fixedProps: AnyProps) => {
    const Extended: ErasedComponent = forwardRef<unknown, AnyProps>((props, ref) => (
      <ForwardComponent {...fixedProps} {...props} ref={ref} />
    ));

    const baseName = ForwardComponent.displayName || ui.name || 'PolymorphicComponent';
    Extended.displayName = `WithProps(${baseName})`;

    const Result: PolymorphicHelperHost = shouldMemo
      ? memo(Extended, arePropsEqual)
      : Extended;
    Result.extend = Component.extend;
    Result.withProps = Component.withProps;
    return Result;
  };

  Component.extend = <T,>(input: T): T => input;

  return Component as PolymorphicComponent<Payload>;
}

/**
 * Creates a polymorphic component from a regular component
 *
 * @deprecated Unused by the library; build components with `factory`. It will be removed in the next major.
 */
export function createPolymorphicComponent<
  ComponentDefaultType,
  Props,
  StaticComponents = Record<string, never>,
>(component: unknown) {
  type ComponentProps<C> = PolymorphicComponentProps<C, Props>;

  type _PolymorphicComponent = <C = ComponentDefaultType>(
    props: ComponentProps<C>
  ) => React.ReactElement;

  type ComponentProperties = Omit<React.FunctionComponent<ComponentProps<ComponentDefaultType>>, never>;

  type PolymorphicComponent = _PolymorphicComponent & ComponentProperties & StaticComponents;

  return component as PolymorphicComponent;
}

// Helper type for creating polymorphic factory interfaces
export type PolymorphicFactory<Payload extends PolymorphicFactoryPayload> = Payload;
