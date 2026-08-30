import { DataTable } from '@platform-blocks/react-ui-library';
import type { DataTableColumn } from '@platform-blocks/react-ui-library';

type Server = {
  id: number;
  host: string;
  region: string;
  cpu: string;
  memory: string;
  uptime: string;
  status: 'healthy' | 'degraded' | 'offline';
};

const REGIONS = ['us-east-1', 'us-west-2', 'eu-west-1', 'ap-south-1'];
const STATUSES: Server['status'][] = ['healthy', 'degraded', 'offline'];

const rows: Server[] = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  host: `node-${String(i + 1).padStart(2, '0')}.cluster.internal`,
  region: REGIONS[i % REGIONS.length],
  cpu: `${((i * 7) % 90) + 5}%`,
  memory: `${((i * 13) % 80) + 10}%`,
  uptime: `${(i % 30) + 1}d`,
  status: STATUSES[i % STATUSES.length],
}));

const columns: DataTableColumn<Server>[] = [
  // Pinned left, so the host stays visible while the rest scroll horizontally.
  { key: 'host', header: 'Host', accessor: 'host', sticky: 'left', width: 240, sortable: true },
  { key: 'region', header: 'Region', accessor: 'region', width: 160, sortable: true },
  { key: 'cpu', header: 'CPU', accessor: 'cpu', width: 120, align: 'right', sortable: true },
  { key: 'memory', header: 'Memory', accessor: 'memory', width: 120, align: 'right', sortable: true },
  { key: 'uptime', header: 'Uptime', accessor: 'uptime', width: 120, align: 'right' },
  { key: 'status', header: 'Status', accessor: 'status', sticky: 'right', width: 140, sortable: true },
];

export function Demo() {
  return (
    <DataTable
      data={rows}
      columns={columns}
      getRowId={(row) => row.id}
      height={320}
      fullWidth={false}
      searchable={false}
    />
  );
}
