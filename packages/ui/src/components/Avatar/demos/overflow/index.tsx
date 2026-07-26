import { Avatar, AvatarGroup } from '@platform-blocks/ui';

const TEAM = [
  { id: 1, name: 'Sarah Johnson', initials: 'SJ', color: '#FF6B6B' },
  { id: 2, name: 'Marcus Chen', initials: 'MC', color: '#4ECDC4' },
  { id: 3, name: 'Elena Ruiz', initials: 'ER', color: '#45B7D1' },
  { id: 4, name: 'David Lee', initials: 'DL', color: '#96CEB4' },
  { id: 5, name: 'Kira Patel', initials: 'KP', color: '#FFEAA7' },
  { id: 6, name: 'Tom Ward', initials: 'TW', color: '#DDA0DD' },
  { id: 7, name: 'Aisha Bello', initials: 'AB', color: '#FFB6C1' }
];

const LIMIT = 3;

export default function Demo() {
  const hidden = TEAM.slice(LIMIT).map((member) => member.name);

  return (
    <AvatarGroup limit={LIMIT} size="md" surplusTooltip={hidden.join(', ')}>
      {TEAM.map(({ id, initials, color }) => (
        <Avatar key={id} fallback={initials} backgroundColor={color} />
      ))}
    </AvatarGroup>
  );
}
