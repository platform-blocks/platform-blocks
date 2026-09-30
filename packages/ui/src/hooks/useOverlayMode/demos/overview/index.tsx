import { Badge, Block, Row, Text, useOverlayMode } from '@plocks/ui';

export function Demo() {
  const { shouldUseModal, shouldUseOverlay, isMobileExperience, isDesktopExperience, isWeb } = useOverlayMode();

  const flags = [
    { label: 'Mobile experience', on: isMobileExperience },
    { label: 'Desktop experience', on: isDesktopExperience },
    { label: 'Web platform', on: isWeb },
    { label: 'Overlay available', on: shouldUseOverlay }
  ];

  return (
    <Block align="flex-start">
      <Badge size="lg" c={shouldUseModal ? 'primary' : 'success'}>
        {shouldUseModal ? 'Render a fullscreen modal' : 'Render an anchored overlay'}
      </Badge>
      <Row gap="xs" wrap="wrap">
        {flags.map(({ label, on }) => (
          <Badge key={label} variant={on ? 'light' : 'outline'} c={on ? 'primary' : 'gray'}>
            {label}
          </Badge>
        ))}
      </Row>
      <Text size="sm" c="muted">
        Resize the preview or switch platforms to see the recommendation change.
      </Text>
    </Block>
  );
}
