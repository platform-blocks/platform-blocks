import { Alert, Block } from '@platform-blocks/ui';

export function Demo() {
  return (
    <Block>
      <Alert severity="info" title="Heads up">
        Use alerts to highlight contextual information inline with page content.
      </Alert>
      <Alert severity="success" title="Profile saved">
        Your changes were stored successfully.
      </Alert>
      <Alert severity="error" title="Connection issue">
        Retry the action or check the status page for outages.
      </Alert>
    </Block>
  );
}
