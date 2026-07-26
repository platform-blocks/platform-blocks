// Native / default entry point for the home-page chart demos.
//
// Native (EAS export:embed) eager bundling injects a Metro async-require shim
// that fails to resolve dynamic imports in the build sandbox, so on native we
// import the charts statically. See components/layout/LazyComponents.tsx for
// the original note. The web build uses ChartDemosSection.web.tsx, which
// code-splits the charts library off the initial bundle via React.lazy.
export { default } from './ChartDemos';
export type { ChartDemosProps } from './ChartDemos';
