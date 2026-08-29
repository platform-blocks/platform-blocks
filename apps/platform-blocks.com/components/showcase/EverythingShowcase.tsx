import React from 'react';
import {
  Alert,
  Avatar,
  AvatarGroup,
  Badge,
  Block,
  Button,
  Calendar,
  Card,
  Checkbox,
  Chip,
  Code,
  DatePicker,
  DatePickerInput,
  Divider,
  Gauge,
  Icon,
  Input,
  KeyCap,
  Masonry,
  PasswordInput,
  Progress,
  QRCode,
  RadioGroup,
  RangeSlider,
  Rating,
  Row,
  Select,
  Slider,
  Switch,
  Text,
  Timeline,
  TimePickerInput,
  useToast,
  ToggleButton,
  ToggleGroup,
  Tooltip,
  useTheme,
  useBreakpoint,
} from '@platform-blocks/ui';
import { MiniCalendar } from 'platform-blocks/components/MiniCalendar/MiniCalendar';


export const EverythingPlayground = () => {
  const theme = useTheme();
  const breakpoint = useBreakpoint();
  const toast = useToast();

  const numColumns = React.useMemo(() => {
    switch (breakpoint) {
      case 'base':
      case 'xs':
      case 'sm':
        return 1;
      case 'md':
        return 2;
      default:
        return 3;
    }
  }, [breakpoint]);
  const isSmall = numColumns === 1;

  const [qrValue, setQrValue] = React.useState('https://platform-blocks.com');
  const [showTimeline, setShowTimeline] = React.useState(true);

  const [projectName, setProjectName] = React.useState('Platform Blocks Playground');
  const [volume, setVolume] = React.useState(42);
  const [budgetRange, setBudgetRange] = React.useState<[number, number]>([25, 75]);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [agreementChecked, setAgreementChecked] = React.useState(false);
  const [selectedFramework, setSelectedFramework] = React.useState('rn');
  const [selectedLayout, setSelectedLayout] = React.useState<string>('grid');
  const [selectedRole, setSelectedRole] = React.useState<string>('designer');
  const [passwordInputValue, setPasswordInputValue] = React.useState('');
  const [rating, setRating] = React.useState(4);
  const [progress, setProgress] = React.useState(45);
  const [gaugeValue, setGaugeValue] = React.useState(68);
  const [inlineDate, setInlineDate] = React.useState<Date | null>(new Date());

  const selectOptions = React.useMemo(
    () => [
      { label: 'React Native', value: 'rn' },
      { label: 'Expo', value: 'expo' },
      { label: 'Next.js', value: 'next' },
      { label: 'Remix', value: 'remix' },
    ],
    []
  );

  const radioOptions = React.useMemo(
    () => [
      {
        label: 'Designer',
        value: 'designer',
        description: 'Shapes the look & feel',
        icon: 'palette',
      },
      {
        label: 'Developer',
        value: 'developer',
        description: 'Builds the experience',
        icon: 'code',
      },
      {
        label: 'Clock',
        value: 'clock',
        description: 'Connects the dots',
        icon: <Icon name="clock" size="sm" variant="filled" color="#facc15" />,
      },
    ],
    []
  );

  const masonryItems = [
    {
      id: 'hero',
      content: (
        <Card p="lg">
          <Block direction="column" gap="md">

            <Row gap="sm" wrap="wrap">
              <Button
                radius="xl"
                title="Primary Action"
                onPress={() => toast.success({
                  title: 'Action executed',
                  message: 'You clicked the primary action button',
                })}
              />
              <Button
                title="Secondary"
                variant="secondary"
                onPress={() => setGaugeValue((value) => Math.max(10, value - 8))}
              />
              <Tooltip label="Great for onboarding hints" withArrow position="top">
                <Button title="With Tooltip" variant="outline" size="sm" />
              </Tooltip>
            </Row>
            <Row gap="sm" wrap="wrap">
              <Chip color="primary">React Native</Chip>
              <Chip color="secondary">Expo</Chip>
              <Chip color="success">Web</Chip>
              <Badge size="xs" variant="subtle" color="warning">
                Badge
              </Badge>
            </Row>

          </Block>
        </Card>
      ),
    },
    {
      id: 'dates',
      content: (
        <Row gap="sm" align="center" wrap="wrap">
          <Calendar defaultDate={new Date()} onChange={(date) => console.log(date)} />
          <MiniCalendar onChange={(date) => console.log(date)} />
          <DatePicker
            value={inlineDate}
            onChange={(next) => setInlineDate(next as Date | null)}
            calendarProps={{ highlightToday: true }}
            style={{
              padding: 12,
              borderRadius: 12,
              backgroundColor: theme.colors.gray[0],
              borderWidth: 1,
              borderColor: theme.colors.gray[3],
            }}
          />
          <DatePickerInput label="Start date" placeholder="Select date" />
          <TimePickerInput label="Start time" />
          <DatePickerInput label="Full width date" placeholder="Select date" fullWidth />
          <TimePickerInput label="Full width time" fullWidth format={12} withSeconds />
        </Row>
      )
    },
    {
      id: 'forms',
      content: (
        <Card p="lg">
          <Block direction="column" gap="md">
            <Input
              label="Project name"
              placeholder="New app launch"
              // value={projectName}
              onChangeText={setProjectName}
              description="Standard text input with helper text"
            />
            <Select
              label="Preferred stack"
              placeholder="Choose a starter"
              options={selectOptions}
              value={selectedFramework}
              onChange={setSelectedFramework}
              fullWidth
            />
            <PasswordInput
              label="Create password"
              placeholder="Your password"
              description="Includes a strength meter"
              fullWidth
              value={passwordInputValue}
              onChangeText={setPasswordInputValue}
            />

          </Block>
        </Card>
      ),
    },
    {
      id: 'toggles',
      content: (
        <Row gap="md" align="center" wrap="wrap">
          <Switch
            label="Enable notifications"
            description="Send realtime delivery updates"
            checked={notificationsEnabled}
            onChange={setNotificationsEnabled}
            color="success"
          />
          <Checkbox
            label="Agree to the collaboration guidelines"
            checked={agreementChecked}
            onChange={setAgreementChecked}
          />
          <ToggleGroup
            value={selectedLayout}
            exclusive
            required
            onChange={(value) => {
              if (Array.isArray(value)) {
                const [first] = value;
                if (typeof first === 'string') {
                  setSelectedLayout(first);
                }
              } else if (typeof value === 'string') {
                setSelectedLayout(value);
              }
            }}
          >
            <ToggleButton value="grid">
              <Block direction="row" align="center" gap="xs">
                <Icon name="grid" size="sm" />
                {/* <Text size="sm">Grid</Text> */}
              </Block>
            </ToggleButton>
            <ToggleButton value="list">
              <Block direction="row" align="center" gap="xs">
                <Icon name="list" size="sm" />
                {/* <Text size="sm">List</Text> */}
              </Block>
            </ToggleButton>
            <ToggleButton value="analytics">
              <Block direction="row" align="center" gap="xs">
                <Icon name="chart-line" size="sm" />
                {/* <Text size="sm">Analytics</Text> */}
              </Block>
            </ToggleButton>
          </ToggleGroup>

        </Row>
      ),
    },
    {
      id: 'sliders',
      content: (<RangeSlider
        label="Budget range"
        value={budgetRange}
        onChange={(value) => setBudgetRange(value as [number, number])}
        min={0}
        max={100}
        step={5}
        ticks={[{ value: 0 }, { value: 25 }, { value: 50 }, { value: 75 }, { value: 100 }]}
        description={`$${budgetRange[0]}k – $${budgetRange[1]}k`}
      />
      )
    },
    {
      id: 'data-display',
      content: (
        <Card p="lg">
          <Block direction="column" gap="md">
            {/* <Text variant="h4">Data display & people</Text> */}
            <AvatarGroup size="sm" spacing={-8}>
              <Avatar fallback="JS" backgroundColor="#2563eb" />
              <Avatar fallback="AG" backgroundColor="#e11d48" />
              <Avatar fallback="LM" backgroundColor="#10b981" />
              <Avatar fallback="+7" backgroundColor="#9333ea" />
            </AvatarGroup>
          </Block>
        </Card>
      ),
    },
    {
      id: 'radio',
      content: (<RadioGroup
        label="Team role"
        options={radioOptions}
        value={selectedRole}
        onChange={(value) => setSelectedRole(value as string)}
      />)
    },
    {
      id: 'timeline',
      content: showTimeline ? (<Timeline size="sm" active={showTimeline ? 2 : undefined}>
        <Timeline.Item
          title="Kickoff"
          bullet={<Icon name="calendar" size="sm" color="#fff" variant="filled" />}
        >
          <Text size="sm" color="secondary">
            Workshop with stakeholders to frame success metrics.
          </Text>
        </Timeline.Item>
        <Timeline.Item
          title="Design sprint"
          bullet={<Icon name="form" size="sm" color="#fff" variant="filled" />}
        >
          <Text size="sm" color="secondary">
            Prototype flows and gather qualitative feedback early.
          </Text>
        </Timeline.Item>
        <Timeline.Item
          title="Build"
          bullet={<Icon name="code" size="sm" color="#fff" variant="filled" />}
          active
        >
          <Text size="sm" color="secondary">
            Ship accessible components, instrumentation, and docs.
          </Text>
        </Timeline.Item>
      </Timeline>
      ) : null,
    },
    {
      id: 'alert',
      content: (<Alert variant="light" color="primary" severity="info">
        <Block direction="column" gap="xs">
          <Text weight="semibold">Live preview deployed</Text>
          <Text size="sm" color="secondary">
            Press <KeyCap>⌘</KeyCap> + <KeyCap>K</KeyCap> to open the <Code>Spotlight</Code> command palette.
            {/* Your documentation site was rebuilt 2 minutes ago. */}
          </Text>
        </Block>
      </Alert>),
    },
    {
      id: 'feedback',
      content: (
        <Card p="lg">
          <Block direction="column" gap="md">
            <Text variant="h4">Feedback & status</Text>

            <Text size="sm" weight="medium">
              Release progress — {progress}%
            </Text>
            <Progress value={progress} striped fullWidth />
            <Row gap="sm">
              <Button
                title="Add 10%"
                size="sm"
                variant="ghost"
                onPress={() => setProgress((value) => Math.min(100, value + 10))}
              />
              <Button
                title="Reset"
                size="sm"
                variant="secondary"
                onPress={() => setProgress(30)}
              />
            </Row>

          </Block>
        </Card>
      ),
    },

    {
      id: 'gauge',
      content: (
        <Alert variant="light" color="primary" severity="warning" icon={false}>
          <Block direction="column" gap="sm" align="center">
            <Text size="sm" weight="medium">
              Delivery health — {gaugeValue}%
            </Text>
            <Gauge value={gaugeValue} size={120} />
            <Slider value={gaugeValue} onChange={setGaugeValue} min={0} max={100} step={5} fullWidth />
          </Block>
        </Alert>
      ),
    },
    {
      id: 'qr-code',
      content: (
        <Block>
          <QRCode
            value={qrValue}
            size={200}
            m="auto"
            color={theme.colors.primary[6]}
            cornerRadius={0.4}
            gradient={{
              type: 'linear',
              from: theme.colors.primary[6],
              to: theme.colors.primary[8],
              rotation: 45
            }}
          />
          <Input value={qrValue} onChangeText={setQrValue} placeholder="https://" />
        </Block>
      )

    },
    {
      id: 'media-utilities',
      content: (
        <Block direction="column" gap="md">
          <Block direction="column" gap="sm">
            <Text size="sm" weight="medium">
              Rating & icons
            </Text>
            <Row gap="sm" align="center">
              <Rating value={rating} onChange={setRating} />
              <Text size="sm" color="secondary">
                {rating.toFixed(1)} / 5.0
              </Text>
            </Row>
            <Row gap="sm" align="center">
              <Icon name="bolt" size="md" color="#f97316" />
              <Icon name="check" size="md" color="#22c55e" />
              <Icon name="info" size="md" color="#3b82f6" />
            </Row>
          </Block>
          <Divider />
        </Block>
      ),
    },
  ]

  return (
    <Masonry
      data={masonryItems}
      numColumns={numColumns}
      gap={isSmall ? 'md' : 'lg'}
      contentContainerStyle={{ padding: isSmall ? 12 : 24 }}
    />
  );
};