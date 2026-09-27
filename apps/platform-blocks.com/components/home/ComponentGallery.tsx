import React, { useState } from 'react';
import {
  Accordion, Alert, AutoComplete, Avatar, AvatarGroup, Badge, Block, Button, Calendar, Card,
  Checkbox, Chip, Code, DatePickerInput, Gauge, Icon, IconButton, Input, KeyCap,
  Loader, NumberInput, Pagination, PasswordInput, PinInput, Progress, RadioGroup,
  RangeSlider, Rating, Search, Select, Skeleton, Slider, Switch, Tabs, Text, TextArea,
  TimePickerInput, Timeline, Title, ToggleButton, ToggleGroup, Tooltip, useBreakpoint, useToast,
} from '@platform-blocks/ui';
import ChartDemos from './ChartDemos';

type GalleryTab = 'Essentials' | 'Forms' | 'Selection' | 'Feedback' | 'Data' | 'Charts';
const GALLERY_TABS: GalleryTab[] = ['Essentials', 'Forms', 'Selection', 'Feedback', 'Data', 'Charts'];
const SELECT_OPTIONS = [
  { label: 'React Native', value: 'rn' },
  { label: 'Expo', value: 'expo' },
  { label: 'Next.js', value: 'next' },
];

export default function ComponentGallery() {
  const [tab, setTab] = useState<GalleryTab>('Essentials');
  const [name, setName] = useState('Alex Morgan');
  const [search, setSearch] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [password, setPassword] = useState('');
  const [quantity, setQuantity] = useState<number | undefined>(2);
  const [volume, setVolume] = useState(68);
  const [range, setRange] = useState<[number, number]>([25, 75]);
  const [subscribed, setSubscribed] = useState(true);
  const [checked, setChecked] = useState(true);
  const [framework, setFramework] = useState('rn');
  const [role, setRole] = useState('designer');
  const [layout, setLayout] = useState<string>('grid');
  const [rating, setRating] = useState(4);
  const [progress, setProgress] = useState(64);
  const [page, setPage] = useState(2);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const toast = useToast();
  const selectLayout = (value: string | number | (string | number)[]) => {
    setLayout(Array.isArray(value) ? String(value[0]) : String(value));
  };

  return (
    <Card p="md">
      <Block gap="md">
        <Block direction="row" align="center" justify="space-between" wrap="wrap" gap="md">
          <Tabs
            items={GALLERY_TABS.map((item) => ({ key: item, label: item, content: null }))}
            activeTab={tab}
            onTabChange={(next) => setTab(next as GalleryTab)}
            navigationOnly
            variant="chip"
            size="sm"
          />
          <Text size="xs" color="secondary">Live component playground</Text>
        </Block>
        <Title order={3} size="lg">{tab === 'Essentials' ? 'Try the building blocks.' : `Explore ${tab.toLowerCase()}.`}</Title>

        {tab === 'Charts' && <ChartDemos cols={{ base: 1, md: 2, lg: 3 }} />}

        {tab === 'Essentials' && <ComponentColumns>
          <Button title="Create project" onPress={() => toast.success({ title: 'Project created', message: 'Your new project is ready.' })} />
          <Button title="Secondary action" variant="outline" onPress={() => setPage((value) => value + 1)} />
          <Button title="Quiet action" variant="subtle" onPress={() => toast.info({ title: 'A little update', message: 'Subtle buttons still do the work.' })} />
          <IconButton icon={<Icon name="settings" size="sm" />} accessibilityLabel="Settings" variant="outline" />
          <Tooltip label="Helpful context, right where you need it" withArrow><Button title="Hover for a tooltip" size="sm" variant="ghost" /></Tooltip>
          <ToggleGroup value={layout} exclusive required onChange={selectLayout}>
            <ToggleButton value="grid"><Icon name="grid" size="sm" /></ToggleButton>
            <ToggleButton value="list"><Icon name="list" size="sm" /></ToggleButton>
            <ToggleButton value="analytics"><Icon name="chart-line" size="sm" /></ToggleButton>
          </ToggleGroup>
          <Title order={4} size="md">A clear, useful heading</Title>
          <Text color="secondary">Readable text styles make hierarchy easy to scan.</Text>
          <Code>npm install @platform-blocks/ui</Code>
          <Block direction="row" align="center" gap="xs"><KeyCap>⌘</KeyCap><Text color="secondary">+</Text><KeyCap>K</KeyCap><Text color="secondary">opens search</Text></Block>
          <Avatar fallback="JS" />
          <AvatarGroup size="sm" spacing={-8}><Avatar fallback="JS" /><Avatar fallback="AG" /><Avatar fallback="LM" /><Avatar fallback="+7" /></AvatarGroup>
          <Badge color="success">Published</Badge>
          <Badge variant="subtle" color="warning">In review</Badge>
          <Chip color="primary">React Native</Chip>
          <Chip color="secondary">Expo</Chip>
          <Chip color="success">Web</Chip>
        </ComponentColumns>}

        {tab === 'Forms' && <ComponentColumns>
          <Input label="Name" value={name} onChangeText={setName} placeholder="Your name" description={`Hello, ${name || 'there'}.`} />
          <Input label="Email" placeholder="you@example.com" keyboardType="email-address" />
          <PasswordInput label="Password" value={password} onChangeText={setPassword} placeholder="Create a password" />
          <NumberInput label="Quantity" value={quantity} onChange={setQuantity} min={0} max={20} withControls />
          <TextArea label="Notes" placeholder="Add a few details…" />
          <PinInput label="Verification code" length={4} />
          <Select label="Framework" options={SELECT_OPTIONS} value={framework} onChange={setFramework} placeholder="Choose a framework" />
          <Search value={search} onChange={setSearch} placeholder="Search components…" />
          <AutoComplete label="Jump to a component" placeholder="Type a component name" value={suggestion} onChangeText={setSuggestion} data={[{ label: 'Button', value: 'button' }, { label: 'Card', value: 'card' }, { label: 'Tabs', value: 'tabs' }, { label: 'Tooltip', value: 'tooltip' }]} />
          <DatePickerInput label="Release date" placeholder="Choose a date" value={selectedDate} onChange={(date) => setSelectedDate(date as Date | null)} />
          <TimePickerInput label="Release time" />
        </ComponentColumns>}

        {tab === 'Selection' && <ComponentColumns>
          <Switch label="Product updates" description="A short line of helpful context" checked={subscribed} onChange={setSubscribed} />
          <Checkbox label="Remember this device" checked={checked} onChange={setChecked} />
          <RadioGroup label="Team role" value={role} onChange={(value) => setRole(String(value))} options={[{ label: 'Designer', value: 'designer' }, { label: 'Developer', value: 'developer' }, { label: 'Product', value: 'product' }]} />
          <ToggleGroup value={layout} exclusive required onChange={selectLayout}>
            <ToggleButton value="grid">Grid</ToggleButton><ToggleButton value="list">List</ToggleButton><ToggleButton value="analytics">Analytics</ToggleButton>
          </ToggleGroup>
          <Block gap="sm"><Text weight="medium">Volume — {volume}%</Text><Slider min={0} max={100} value={volume} onChange={setVolume} accessibilityLabel="Volume" /></Block>
          <RangeSlider label="Budget range" value={range} onChange={(value) => setRange(value as [number, number])} min={0} max={100} step={5} description={`$${range[0]}k – $${range[1]}k`} />
          <Block direction="row" align="center" gap="sm"><Rating value={rating} onChange={setRating} /><Text color="secondary">{rating} out of 5</Text></Block>
        </ComponentColumns>}

        {tab === 'Feedback' && <ComponentColumns>
          <Alert severity="success" title="All caught up">Your workspace is looking good.</Alert>
          <Alert severity="info" title="New version available">A fresh update is ready to explore.</Alert>
          <Alert severity="warning" title="Action needed">Review your project settings.</Alert>
          <Block gap="sm"><Text weight="medium">Upload progress — {progress}%</Text><Progress value={progress} striped fullWidth /><Block direction="row"><Button title="Add 10%" size="sm" variant="subtle" onPress={() => setProgress((value) => Math.min(100, value + 10))} /><Button title="Reset" size="sm" variant="ghost" onPress={() => setProgress(64)} /></Block></Block>
          <Block direction="row" align="center" gap="sm"><Loader size="sm" /><Text color="secondary">Loading your workspace</Text></Block>
          <Block gap="sm"><Skeleton h={12} w="70%" /><Skeleton h={10} w="100%" /><Skeleton h={10} w="82%" /></Block>
          <Block align="center" gap="sm"><Gauge value={volume} size={112} /><Text color="secondary">Live gauge · {volume}%</Text></Block>
          <Button title="Show a toast" variant="outline" onPress={() => toast.success({ title: 'Saved successfully', message: 'Your changes are up to date.' })} />
          <Button title="Show an info toast" variant="subtle" onPress={() => toast.info({ title: 'Tip', message: 'Toasts keep feedback close to the action.' })} />
        </ComponentColumns>}

        {tab === 'Data' && <ComponentColumns>
          <Calendar defaultDate={new Date()} onChange={(date) => setSelectedDate(date as Date)} />
          <Pagination current={page} total={8} onChange={setPage} />
          <Tabs items={[{ key: 'overview', label: 'Overview', content: <Text color="secondary">A live tab panel.</Text> }, { key: 'activity', label: 'Activity', content: <Text color="secondary">Recent activity appears here.</Text> }]} />
          <Accordion items={[{ key: 'one', title: 'What is Platform Blocks?', content: <Text>A cross-platform component toolkit for React and React Native.</Text> }, { key: 'two', title: 'Can I customize the theme?', content: <Text>Yes. Components share a flexible, theme-aware design system.</Text> }]} defaultExpanded={['one']} />
          <Timeline size="sm" active={1}><Timeline.Item title="Project created"><Text color="secondary">A new workspace is ready.</Text></Timeline.Item><Timeline.Item title="Design review" active><Text color="secondary">The team is reviewing the latest changes.</Text></Timeline.Item><Timeline.Item title="Launch" /></Timeline>
          <Block gap="sm">
            <Block direction="row" justify="space-between"><Text weight="semibold">Component</Text><Text weight="semibold">Status</Text></Block>
            <Block direction="row" justify="space-between"><Text>Button</Text><Badge color="success">Ready</Badge></Block>
            <Block direction="row" justify="space-between"><Text>DataTable</Text><Badge variant="subtle" color="warning">Updated</Badge></Block>
          </Block>
          <Code>const theme = useTheme();</Code>
        </ComponentColumns>}
      </Block>
    </Card>
  );
}

function ComponentColumns({ children }: { children: React.ReactNode }) {
  const breakpoint = useBreakpoint();
  const columnCount = breakpoint === 'lg' || breakpoint === 'xl' ? 3 : breakpoint === 'md' ? 2 : 1;
  const examples = React.Children.toArray(children);
  const columns: React.ReactNode[][] = Array.from({ length: columnCount }, () => []);
  examples.forEach((example, index) => columns[index % columnCount].push(example));
  const columnBasis = columnCount === 1 ? '100%' : columnCount === 2 ? '45%' : '30%';
  const minColumnWidth = columnCount === 1 ? '100%' : 220;

  return (
    <Block direction="row" wrap="wrap" gap="md">
      {columns.map((column, columnIndex) => (
        <Block key={columnIndex} direction="column" gap="md" grow basis={columnBasis} minW={minColumnWidth}>
          {column.map((example, exampleIndex) => <Block key={exampleIndex} fullWidth>{example}</Block>)}
        </Block>
      ))}
    </Block>
  );
}
