import { Block, Button, Icon, Row } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block>
      <Row gap="md" wrap="wrap" align="flex-start">
        <Button tooltip="Save your current work.">Save</Button>
        <Button
          variant="outline"
          tooltip="Permanently delete this item."
          tooltipPosition="bottom"
        >
          Delete
        </Button>
        <Button
          variant="ghost"
          tooltip="Get help and support resources."
          tooltipPosition="right"
        >
          Help
        </Button>
      </Row>

      <Row gap="md" wrap="wrap" align="flex-start">
        <Button tooltip="Download the file to your device." tooltipPosition="left">
          Download
        </Button>
        <Button icon={<Icon name="settings" />} tooltip="Open the settings panel." accessibilityLabel="Open settings" />
        <Button disabled tooltip="Feature not available in demo mode.">
          Upload
        </Button>
      </Row>
    </Block>
  );
}
