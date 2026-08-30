import { Block, Divider, Text } from '@platform-blocks/react-ui-library';

export function Demo() {
  return (
    <Block>
      <Block>
        <Text variant="p" weight="medium">
          Release Notes
        </Text>
        <Text variant="p" color="muted">
          Default solid divider keeps sections crisp.
        </Text>
        <Divider variant="solid" />
        <Text variant="p">
          The winter update introduces a revamped queue and faster syncing.
        </Text>
      </Block>

      <Block>
        <Text variant="p" weight="medium">
          Sprint Checklist
        </Text>
        <Text variant="p" color="muted">
          Dashed lines work nicely for in-progress flows.
        </Text>
        <Divider variant="dashed" />
        <Text variant="p">
          QA sign-off, regression pass, and rollout comms are scheduled for Friday.
        </Text>
      </Block>

      <Block>
        <Text variant="p" weight="medium">
          Creator Status
        </Text>
        <Text variant="p" color="muted">
          Dotted borders add a softer visual break.
        </Text>
        <Divider variant="dotted" />
        <Text variant="p">
          Enable payouts once verification documents finish processing.
        </Text>
      </Block>

      <Block>
        <Text variant="p" weight="medium">
          Section break
        </Text>
        <Text variant="p" color="muted">
          Gradient variant fades the line in and out — softer than a hard rule.
        </Text>
        <Divider variant="gradient" color="primary" />
        <Text variant="p">
          The fade keeps long-form content breathable without dropping a horizontal stripe.
        </Text>
      </Block>

      <Block direction="row" align="center" wrap="wrap">
        <Text variant="small" weight="medium">
          Published
        </Text>
        <Divider orientation="vertical" variant="solid" style={{ height: 48 }} />
        <Text variant="small" weight="medium">
          Drafts
        </Text>
        <Divider orientation="vertical" variant="dashed" style={{ height: 48 }} />
        <Text variant="small" weight="medium">
          Scheduled
        </Text>
        <Divider orientation="vertical" variant="dotted" label="Beta" color="warning" style={{ height: 48 }} />
        <Text variant="small" weight="medium">
          Archived
        </Text>
      </Block>
    </Block>
  );
}
