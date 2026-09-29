import { Button, Row } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Row gap="md" wrap="wrap">
      <Button tooltip="Save your current work.">Save</Button>
      <Button tooltip="Permanently delete this item." tooltipPosition="bottom">
        Delete
      </Button>
      <Button tooltip="Download the file to your device." tooltipPosition="left">
        Download
      </Button>
      <Button tooltip="Get help and support resources." tooltipPosition="right">
        Help
      </Button>
    </Row>
  );
}
