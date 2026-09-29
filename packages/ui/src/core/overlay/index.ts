// Overlay primitives: the layer stack, the anchored-overlay hook, and nested
// hosting. Library code imports the defining modules directly; this barrel is
// for the package's public entry.
export {
  useLayer,
  useIsTopLayer,
  useLayerStack,
  useParentLayerId,
  LayerScope,
} from './useLayer';
export type { UseLayerOptions, UseLayerResult, LayerDismissReason } from './useLayer';
export {
  handleBackPress,
  handleModalRequestClose,
  dismissTopLayerOnEscape,
  isTopLayer,
} from './layerStack';
export { useFloating } from './useFloating';
export type {
  UseFloatingOptions,
  UseFloatingReturn,
  FloatingRefs,
  FloatingLayer,
  FloatingPopupType,
  FloatingTrigger,
  FloatingDismissReason,
  FloatingRenderOptions,
} from './useFloating';
export { OverlayHost } from './OverlayHost';
export type { OverlayHostProps } from './OverlayHost';
export { resolvePlacementForDirection } from './placement';
