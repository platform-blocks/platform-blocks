import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { 
  Text, 
  Card, 
  DataTable, 
  Chip, 
  QRCode, 
  Rating, 
  Gauge,
  Timeline,
  Markdown,
  Button,
  Switch,
  Slider,
  Input,
  Row,
  Block,
  useTheme,
  Title
} from '@platform-blocks/ui';
import type { DataTableSort, DataTableColumn, DataTablePagination } from '@platform-blocks/ui';

// Sample data for DataTable
interface Employee {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  department: string;
  salary: number;
  startDate: string;
}

const sampleEmployees: Employee[] = [
  { id: 1, name: 'John Doe', email: 'john@company.com', role: 'Senior Developer', status: 'active', department: 'Engineering', salary: 85000, startDate: '2021-03-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@company.com', role: 'UX Designer', status: 'active', department: 'Design', salary: 75000, startDate: '2020-08-22' },
  { id: 3, name: 'Mike Johnson', email: 'mike@company.com', role: 'Product Manager', status: 'active', department: 'Product', salary: 95000, startDate: '2019-11-10' },
  { id: 4, name: 'Sarah Wilson', email: 'sarah@company.com', role: 'DevOps Engineer', status: 'inactive', department: 'Engineering', salary: 80000, startDate: '2022-01-08' },
  { id: 5, name: 'David Brown', email: 'david@company.com', role: 'Data Analyst', status: 'active', department: 'Analytics', salary: 70000, startDate: '2021-09-12' },
  { id: 6, name: 'Emily Chen', email: 'emily@company.com', role: 'Frontend Developer', status: 'pending', department: 'Engineering', salary: 78000, startDate: '2023-02-20' },
];

const sampleMarkdown = `# Data Components Showcase

This playground demonstrates various **data display components** from Platform Blocks:

## Features
- **DataTable**: Sortable, filterable data grid
- **Charts**: Multiple chart types for visualization
- **QR Codes**: Generate QR codes from text
- **Ratings**: Star-based rating system
- **Gauges**: Progress and metric indicators
- **Timeline**: Event sequence display

### Code Example
\`\`\`typescript
const data = [
  { name: 'John', role: 'Developer' },
  { name: 'Jane', role: 'Designer' }
];
\`\`\`

> 💡 **Tip**: All components support theming and customization!
`;

export default function DataShowcase() {
  const theme = useTheme();
  
  // DataTable state
  const [sortBy, setSortBy] = useState<DataTableSort[]>([]);
  const [pagination, setPagination] = useState<DataTablePagination>({
    page: 1,
    pageSize: 4,
    total: sampleEmployees.length
  });
  const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Other component states
  const [rating, setRating] = useState(4);
  const [gaugeValue, setGaugeValue] = useState(75);
  const [qrText, setQrText] = useState('https://platform-blocks.com');
  const [showTimeline, setShowTimeline] = useState(true);

  // DataTable columns
  const columns: DataTableColumn<Employee>[] = [
    {
      key: 'name',
      header: 'Name',
      accessor: 'name',
      sortable: true,
      cell: (value: any) => (
        <Text weight="semibold">{value}</Text>
      )
    },
    {
      key: 'email',
      header: 'Email',
      accessor: 'email',
      sortable: true,
      cell: (value: any) => (
        <Text size="sm" color="secondary">{value}</Text>
      )
    },
    // {
    //   key: 'role',
    //   header: 'Role',
    //   accessor: 'role',
    //   sortable: true
    // },
    {
      key: 'status',
      header: 'Status',
      accessor: 'status',
      sortable: true,
      cell: (value: Employee['status']) => (
        <Chip 
          color={value === 'active' ? 'success' : value === 'pending' ? 'warning' : 'error'}
          size="sm"
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </Chip>
      )
    },
    // {
    //   key: 'department',
    //   header: 'Department',
    //   accessor: 'department',
    //   sortable: true
    // },
    {
      key: 'salary',
      header: 'Salary',
      accessor: 'salary',
      sortable: true,
      cell: (value: number) => (
        <Text weight="medium">${value.toLocaleString()}</Text>
      )
    }
  ];

  // Filter data based on search
  const filteredData = sampleEmployees.filter(employee =>
    employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    employee.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Paginate data
  const startIndex = (pagination.page - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return (
    <ScrollView >
    

      {/* DataTable Section */}
       <Title text="Data Table" variant="h2" afterline />
        <Text variant="p" color="secondary">
          Interactive data grid with sorting, searching, and pagination
        </Text>
        
        <Input
          placeholder="Search employees..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <DataTable
          data={paginatedData}
          columns={columns}
          sortBy={sortBy}
          onSortChange={setSortBy}
          selectedRows={selectedRows}
          onSelectionChange={setSelectedRows}
          pagination={{
            ...pagination,
            total: filteredData.length
          }}
          onPaginationChange={setPagination}
          selectable
          fullWidth
        />

      {/* Chips Section */}
      <Card >
        <Text variant="h2" >Chips</Text>
        <Text variant="p" color="secondary">
          Compact elements for tags, statuses, and categories
        </Text>
        
        <Row wrap="wrap" gap="sm">
          <Chip color="gray">Default</Chip>
          <Chip color="primary">Primary</Chip>
          <Chip color="success">Success</Chip>
          <Chip color="warning">Warning</Chip>
          <Chip color="error">Error</Chip>
          <Chip color="secondary">Secondary</Chip>
        </Row>

        <Text variant="small" color="secondary">Different sizes:</Text>
        <Row wrap="wrap" gap="sm">
          <Chip size="sm">Small</Chip>
          <Chip size="md">Medium</Chip>
          <Chip size="lg">Large</Chip>
        </Row>
      </Card>

      {/* Rating Section */}
      <Card >
        <Text variant="h2">Rating</Text>
        <Text variant="p" color="secondary">
          Star-based rating system for feedback and reviews
        </Text>
        
        <Block direction="column" gap="md">
          <Row gap="md" align="center">
            <Text>Interactive Rating:</Text>
            <Rating value={rating} onChange={setRating} />
            <Text color="secondary">({rating}/5)</Text>
          </Row>
          
          <Row gap="md" align="center">
            <Text>Read-only Rating:</Text>
            <Rating value={3.5} readOnly />
            <Text color="secondary">(3.5/5)</Text>
          </Row>
          
          <Row gap="md" align="center">
            <Text>Large Rating:</Text>
            <Rating value={4} size="lg" readOnly />
          </Row>
        </Block>
      </Card>

      {/* Gauge Section */}
      <Card >
        <Text variant="h2"  >Gauge</Text>
        <Text variant="p" color="secondary" >
          Progress and metric indicators
        </Text>
        
        <Block direction="column" gap="lg">
          <Row gap="lg" align="center">
            <Gauge value={gaugeValue} size={120} />
            <Block direction="column" gap="sm">
              <Text variant="h3">{gaugeValue}%</Text>
              <Text color="secondary">Project Completion</Text>
              <Slider
                value={gaugeValue}
                onChange={setGaugeValue}
                min={0}
                max={100}
                step={5}
              />
            </Block>
          </Row>
          
          <Row gap="md" align="center">
            <Gauge value={85} size={80} color={theme.colors.success[5]} />
            <Text>Performance: 85%</Text>
          </Row>
        </Block>
      </Card>

      {/* QRCode Section */}
      <Card >
        <Text variant="h2"  >QR Code</Text>
        <Text variant="p" color="secondary" >
          Generate QR codes from text or URLs
        </Text>
        
        <Block direction="column" gap="md">
          <Input
            label="QR Code Content"
            value={qrText}
            onChangeText={setQrText}
            placeholder="Enter text or URL..."
          />
          
          <Row gap="lg" align="center">
            <QRCode value={qrText} size={120} />
            <Block direction="column" gap="sm">
              <Text weight="medium">Scan this code</Text>
              <Text size="sm" color="secondary">
                {qrText.length > 30 ? qrText.substring(0, 30) + '...' : qrText}
              </Text>
            </Block>
          </Row>
        </Block>
          </Card>

    
      {/* Timeline Section */}
      <Card >
        <Text variant="h2"  >Timeline</Text>
        <Text variant="p" color="secondary" >
          Display sequence of events in chronological order
        </Text>
        
        <Row gap="md" align="center" >
          <Text>Show Timeline:</Text>
          <Switch checked={showTimeline} onChange={setShowTimeline} />
        </Row>
        
        {showTimeline && (
          <Timeline active={2}>
            <Timeline.Item
              title="Project Kickoff"
              bullet={<Text selectable={false}>🚀</Text>}
            >
              <Text size="sm" color="secondary">
                Initial project planning and team alignment meeting
              </Text>
            </Timeline.Item>
            <Timeline.Item
              title="Design Phase Complete"
              bullet={<Text selectable={false}>🎨</Text>}
            >
              <Text size="sm" color="secondary">
                All wireframes and mockups finalized and approved
              </Text>
            </Timeline.Item>
            <Timeline.Item
              title="Development Started"
              bullet={<Text selectable={false}>💻</Text>}
              active
            >
              <Text size="sm" color="secondary">
                Frontend and backend development commenced
              </Text>
            </Timeline.Item>
            <Timeline.Item
              title="Testing Phase"
              bullet={<Text selectable={false}>🧪</Text>}
            >
              <Text size="sm" color="secondary">
                Quality assurance and user acceptance testing
              </Text>
            </Timeline.Item>
            <Timeline.Item
              title="Production Deployment"
              bullet={<Text selectable={false}>🚀</Text>}
            >
              <Text size="sm" color="secondary">
                Successfully deployed to production environment
              </Text>
            </Timeline.Item>
          </Timeline>
        )}
      </Card>

      {/* Markdown Section */}
      <Card >
        <Text variant="h2"  >Markdown</Text>
        <Text variant="p" color="secondary" >
          Render markdown content with syntax highlighting
        </Text>
        
        <Markdown>{sampleMarkdown}</Markdown>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  
});