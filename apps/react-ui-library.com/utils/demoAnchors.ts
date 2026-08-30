/**
 * Fragment ids for demo headings on a component page.
 *
 * The id is derived from the demo's title rather than its short id so the URL
 * reads as the heading does (`/components/Button#full-width` over `#width`).
 * Two demos on one page can share a title, so ids are deduped here — a page
 * with two elements answering to the same fragment has no defined target, and
 * TableOfContents drops the duplicate entry.
 */
export function slugifyDemoTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Map of demo id → fragment id, unique within the page. */
export function buildDemoAnchors(demos: { id: string; title?: string }[]): Record<string, string> {
  const used = new Set<string>();
  const anchors: Record<string, string> = {};

  for (const demo of demos) {
    const base = slugifyDemoTitle(demo.title || demo.id) || demo.id;
    let candidate = base;
    let suffix = 2;
    while (used.has(candidate)) {
      candidate = `${base}-${suffix++}`;
    }
    used.add(candidate);
    anchors[demo.id] = candidate;
  }

  return anchors;
}
