import { Badge, Icon, Row, Text, Tree, type TreeNode } from '@platform-blocks/ui';

import { STATUS_BADGES, TREE_DATA, TYPE_ICONS, type CustomNodeData } from './data';

export default function Demo() {
  const renderCustomLabel = (node: TreeNode) => {
    const data = node.data as CustomNodeData;
    const status = STATUS_BADGES[data.status];

    return (
      <Row gap="sm" align="center" style={{ flex: 1 }}>
        <Icon name={TYPE_ICONS[data.type]} size="sm" />
        <Text size="sm" style={{ flex: 1 }}>
          {node.label}
        </Text>
        <Badge variant="outline" color={status.color}>
          {status.label}
        </Badge>
      </Row>
    );
  };

  return <Tree data={TREE_DATA} renderLabel={renderCustomLabel} selectionMode="single" expandAll />;
}
