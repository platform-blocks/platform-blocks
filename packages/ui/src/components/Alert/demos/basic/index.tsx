import { Alert, Block } from '@platform-blocks/ui';

export default function Demo() {
  return (
    <Block>
      <Alert sev="info" title="Heads up">
        Use alerts to highlight contextual information inline with page content.
      </Alert>
      <Alert sev="success" title="Profile saved">
        Your changes were stored successfully.
      </Alert>
      <Alert sev="error" title="Connection issue">
        Retry the action or check the status page for outages.
      </Alert>
    </Block>
  );
}
