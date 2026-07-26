import { Block, Text, Timeline } from '@platform-blocks/ui';

const events = [
  {
    title: 'Discovery',
    description: 'Ran stakeholder interviews and confirmed the project scope.',
    timestamp: '3 weeks ago',
  },
  {
    title: 'Design',
    description: 'Delivered the initial design system and screen mocks.',
    timestamp: '2 weeks ago',
  },
  {
    title: 'Development',
    description: 'Implementing core flows while gathering early feedback.',
    timestamp: 'Last week',
  },
  {
    title: 'Validation',
    description: 'QA pass is underway with regression tracking in place.',
    timestamp: 'In progress',
  },
];

export default function Demo() {
  return (
      <Timeline active={2}>
        {events.map((event) => (
          <Timeline.Item key={event.title} title={event.title}>
            <Text colorVariant="secondary" size="xs">
              {event.timestamp}
            </Text>
            <Text size="sm">{event.description}</Text>
          </Timeline.Item>
        ))}
      </Timeline>
  );
}


