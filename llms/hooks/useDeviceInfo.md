# useDeviceInfo

Gather a complete snapshot of runtime details, OS metadata, safe area insets, screen metrics, locale, input capabilities, and helper booleans.

## Metadata

- Canonical name: `useDeviceInfo`
- Package: `@platform-blocks/react-ui-library`
- Import: `import { useDeviceInfo } from '@platform-blocks/react-ui-library';`
- Status: beta
- Since: 0.4.0
- Category: platform
- Tags: device, responsive, platform
- Docs: https://react-ui-library.com/hooks/useDeviceInfo
- Source: https://github.com/platform-blocks/react-ui-library/tree/main/packages/ui/src/hooks/useDeviceInfo

## Definition

```ts
export interface DeviceInfo {
  runtime: {
    platform: 'browser' | 'native';
    browserName: string | null;
    browserVersion: string | null;
    jsEngine: 'Hermes' | 'JSC' | 'V8' | null;
    engineVersion: string | null;
  };
  system: {
    os: {
      name: string | null;
      version: string | null;
      buildId?: string | null;
    };
    device: {
      type: 'phone' | 'tablet' | 'desktop' | 'tv' | 'console' | 'wearable' | 'unknown';
      brand: string | null;
      model: string | null;
      isVirtual?: boolean;
    };
  };
  screen: {
    width: number;
    height: number;
    scale: number;
    fontScale?: number;
    orientation: 'portrait' | 'landscape';
  };
  locale: {
    language: string;
    region: string | null;
    full: string;
    timeZone: string;
    uses24HourClock: boolean;
  };
  appearance: {
    colorScheme: 'light' | 'dark' | 'no-preference';
    contrast: 'more' | 'less' | 'no-preference';
    reducedMotion: boolean;
    fontScale: number;
  };
  input: {
    primaryPointer: 'touch' | 'mouse' | 'pen' | 'unknown';
    pointerTypes: Array<'touch' | 'mouse' | 'pen'>;
    hasTouch: boolean;
    hasMouse: boolean;
    hasKeyboard: boolean | null;
  };
  safeArea: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  network?: {
    ipAddress?: string | null;
    macAddress?: string | null;
    connectionType?: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
    downlink?: number | null;
  };
  capabilities?: {
    hdr: boolean | null;
    gpu: string | null;
  };
  platform: {
    isWeb: boolean;
    isNative: boolean;
    isIOS: boolean;
    isAndroid: boolean;
    isMobile: boolean;
    isTablet: boolean;
    isPhone: boolean;
    isDesktop: boolean;
    isConsole: boolean;
    isTV: boolean;
    isWearable: boolean;
  };
  helpers: {
    isPhone: boolean;
    isTablet: boolean;
    isMobile: boolean;
    isDesktop: boolean;
    isDarkMode: boolean;
    isLandscape: boolean;
    getOS: () => string;
    getBrand: () => string | null;
  };
  meta: {
    updatedAt: number;
    ready: boolean;
  };
}

export interface UseDeviceInfoOptions {
  enableExtendedData?: boolean;
}

export function useDeviceInfo(options: UseDeviceInfoOptions = {}): DeviceInfo;
```

## Examples

### Device overview dashboard

Visualize OS, runtime, locale, and accessibility signals returned by useDeviceInfo.

```tsx
import { Block, DataList, Text, useDeviceInfo } from '@platform-blocks/react-ui-library';

export function Demo() {
  const { runtime, system, screen, appearance, locale, input, safeArea, helpers, network, meta } =
    useDeviceInfo({ enableExtendedData: true });

  return (
    <Block gap="lg">
      <Block gap="xs">
        <Text size="sm" weight="semibold">Platform & runtime</Text>
        <DataList labelWidth={150} withDivider>
          <DataList.Item
            label="Operating system"
            value={`${system.os.name ?? 'Unknown'} ${system.os.version ?? ''}`.trim()}
          />
          <DataList.Item
            label="Device"
            value={[system.device.type, system.device.brand, system.device.model].filter(Boolean).join(' • ')}
          />
          <DataList.Item
            label="Runtime"
            value={runtime.browserName
              ? `${runtime.browserName} ${runtime.browserVersion ?? ''}`.trim()
              : runtime.jsEngine ?? 'Native'}
          />
        </DataList>
      </Block>

      <Block gap="xs">
        <Text size="sm" weight="semibold">Screen & appearance</Text>
        <DataList labelWidth={150} withDivider>
          <DataList.Item
            label="Resolution"
            value={`${Math.round(screen.width)} × ${Math.round(screen.height)} @${screen.scale}x`}
          />
          <DataList.Item label="Orientation" value={screen.orientation} />
          <DataList.Item
            label="Safe area"
            value={`${safeArea.top} / ${safeArea.right} / ${safeArea.bottom} / ${safeArea.left}`}
          />
          <DataList.Item label="Color scheme" value={`${appearance.colorScheme} • contrast ${appearance.contrast}`} />
          <DataList.Item label="Reduced motion" value={appearance.reducedMotion ? 'Enabled' : 'Disabled'} />
        </DataList>
      </Block>

      <Block gap="xs">
        <Text size="sm" weight="semibold">Locale & input</Text>
        <DataList labelWidth={150} withDivider>
          <DataList.Item label="Locale" value={`${locale.language}-${locale.region ?? '??'}`.toUpperCase()} />
          <DataList.Item
            label="Time zone"
            value={`${locale.timeZone} • ${locale.uses24HourClock ? '24h' : '12h'} clock`}
          />
          <DataList.Item label="Pointers" value={input.pointerTypes.join(', ') || 'None'} />
          <DataList.Item
            label="Form factor"
            value={helpers.isMobile ? 'Mobile / touch-first' : helpers.isDesktop ? 'Desktop' : 'Unknown'}
          />
          <DataList.Item
            label="Network"
            value={network?.downlink
              ? `${network.connectionType} • ${network.downlink.toFixed(1)} Mbps`
              : network?.connectionType ?? (meta.ready ? 'Unavailable' : 'Loading…')}
          />
        </DataList>
      </Block>
    </Block>
  );
}
```
