import { Block, Link } from '@plocks/ui';

export function Demo() {
  return (
    <Block>
      <Link href="#">Default underline</Link>
      <Link href="#" variant="hover-underline">
        Hover underline
      </Link>
      <Link href="#" variant="subtle">
        Subtle primary
      </Link>
      <Link href="#" variant="subtle" c="gray">
        Subtle gray
      </Link>
    </Block>
  );
}
