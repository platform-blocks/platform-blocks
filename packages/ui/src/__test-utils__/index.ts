/**
 * Test-only internals for the other @plocks packages' tests, reached as
 * `@plocks/ui/test-utils` through their jest and tsconfig.test mappings.
 * Not built or published.
 */
export { __resetLayerStackForTests } from '../core/overlay/layerStack';
export { clearAnnouncer } from '../core/accessibility/announce';
export { OverlayRenderer } from '../core/providers/OverlayRenderer';
export { resetWarnOnce } from '../core/utils/logger';
