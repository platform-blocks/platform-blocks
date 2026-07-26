import { Tree } from '@platform-blocks/ui';

import { TREE_DATA } from './data';

export default function Demo() {
  return <Tree data={TREE_DATA} collapsible indent={20} />;
}
