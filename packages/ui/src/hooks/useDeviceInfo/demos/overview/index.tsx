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
