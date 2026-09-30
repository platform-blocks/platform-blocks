import { Block, StickyNote } from '@plocks/ui';

export function Demo() {
  return (
    <Block direction="row" wrap="wrap" gap={24} p="lg">
      <StickyNote title="Today" footer="Tuesday · 9:30 AM" color="yellow" rotation={-2}>
        Review the sketches and share feedback with the team.
      </StickyNote>
      <StickyNote title="Idea" color="blue" rotation={2}>
        Keep the interface simple enough to understand at a glance.
      </StickyNote>
      <StickyNote title="Remember" color="pink" rotation={-1}>
        Bring the latest prototype to the design review.
      </StickyNote>
    </Block>
  );
}
