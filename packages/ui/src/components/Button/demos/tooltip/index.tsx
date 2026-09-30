import { Button, Row } from '@plocks/ui';

export function Demo() {
  return (
    <Row gap="md" wrap="wrap">
      <Button tooltip="Save your current work.">Save</Button>
      <Button tooltip={{ label: 'Permanently delete this item.', position: 'bottom' }}>
        Delete
      </Button>
      <Button tooltip={{ label: 'Download the file to your device.', position: 'left' }}>
        Download
      </Button>
      <Button tooltip={{ label: 'Get help and support resources.', position: 'right' }}>
        Help
      </Button>
    </Row>
  );
}
