import componentsMeta from '../data/generated/components-meta.json';
import hooksMeta from '../data/generated/hooks-meta.json';
import { CHART_DOCS } from './charts';
import { GITHUB_REPO, TWITTER_PROFILE, NPM_PACKAGE, DISCORD_INVITE, SITE_URL } from './urls';
import { FAQ_ITEMS } from './faq';

export { SITE_URL };
export const SITE_NAME = 'Platform Blocks';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;
export const SITE_LOGO = `${SITE_URL}/icon-512.png`;

export interface RouteMeta {
  title: string;
  description: string;
}

const DEFAULT_DESCRIPTION =
  'A modern React Native component library with theme support and consistent design tokens. Build beautiful, accessible interfaces for iOS, Android, and Web.';

/** Metadata for the static (non-parameterized) routes, keyed by pathname. */
const STATIC_ROUTES: Record<string, RouteMeta> = {
  '/': {
    title: 'Platform Blocks — React Native UI Component Library',
    description: DEFAULT_DESCRIPTION,
  },
  '/getting-started': {
    title: 'Getting Started',
    description:
      'Install @platform-blocks/ui, wire up the provider, and render your first themeable, cross-platform component on iOS, Android, and Web.',
  },
  '/extensions': {
    title: 'Extensions',
    description:
      'Packages that build on Platform Blocks — official and community extensions, plus a batteries-included template for building and publishing your own.',
  },
  '/examples': {
    title: 'Examples',
    description:
      'Complete screens built from Platform Blocks components — login, settings, dashboards, and more. Open fullscreen, then copy the source into your app.',
  },
  '/examples/login': {
    title: 'Login Screen Example',
    description:
      'A complete React Native sign-in screen built with Platform Blocks — inputs with inline validation, social sign-in buttons, and a remember-me control.',
  },
  '/examples/settings': {
    title: 'Settings Screen Example',
    description:
      'A grouped React Native preferences screen built with Platform Blocks — switch rows, a live theme-mode selector, and a profile header.',
  },
  '/examples/dashboard': {
    title: 'Stats Dashboard Example',
    description:
      'A responsive KPI dashboard built with Platform Blocks — stat tiles with trend sparklines from @platform-blocks/charts.',
  },
  '/components': {
    title: 'Components',
    description:
      'Browse 80+ accessible, themeable, cross-platform React Native components — inputs, layout, navigation, feedback, data display, and more.',
  },
  '/charts': {
    title: 'Charts',
    description:
      'A cross-platform charting library for React Native and Web — line, bar, area, pie, scatter, and 30+ more chart types with a shared theming system.',
  },
  '/hooks': {
    title: 'Hooks',
    description:
      'A collection of React hooks for building cross-platform apps — theming, disclosure, hotkeys, media queries, clipboard, haptics, and more.',
  },
  '/accessibility': {
    title: 'Accessibility',
    description:
      'How Platform Blocks builds in keyboard navigation, screen-reader support, focus management, and semantic roles across every component.',
  },
  '/contribute': {
    title: 'Contributing to Platform Blocks',
    description:
      'Contribute to Platform Blocks — the monorepo layout, local setup, and the workflow for adding a component, a demo, or a documentation page.',
  },
  '/localization': {
    title: 'Localization',
    description:
      'Internationalize your app with Platform Blocks — RTL support, locale-aware formatting, and translatable component copy.',
  },
  '/llms': {
    title: 'LLM Documentation',
    description:
      'Platform Blocks documentation as Markdown for language models — an llms.txt index, a full-text bundle, and a standalone Markdown file for every component, chart, hook, and guide.',
  },
  '/faq': {
    title: 'FAQ',
    description:
      'Frequently asked questions about Platform Blocks — licensing, platform support, theming, and how it compares to other React Native UI libraries.',
  },
};

type MetaRecord = Record<string, { title?: string; name?: string; description?: string; summary?: string }>;

const componentsIndex = componentsMeta as MetaRecord;
const hooksIndex = hooksMeta as MetaRecord;
const chartsIndex: Record<string, { title: string; summary?: string }> = Object.fromEntries(
  CHART_DOCS.map((c) => [c.slug, { title: c.title, summary: c.summary }]),
);

/**
 * Duplicate-content routes that should point their canonical at a primary URL
 * instead of self-referencing, so search engines consolidate ranking signals.
 *
 * Empty for now — the `/installation` and `/docs/installation` duplicates that
 * lived here were deleted rather than aliased. Keep the hook: any future route
 * that ships under two URLs belongs here instead of self-canonicalizing.
 */
const CANONICAL_ALIASES: Record<string, string> = {};

/**
 * Pull the lead prose paragraph out of an authored Markdown document.
 *
 * Component and hook descriptions are whole documents — a `# Title`, a summary
 * paragraph, then `## Props` and a pipe table. Flattening all of that into one
 * line put table skeletons (`| Prop | Type | Default |  |------|------|`) into
 * meta descriptions and social previews. The first prose block is the summary
 * the author actually wrote, so that is what we want.
 *
 * Skips headings, tables, list items, blockquotes, and fenced code; returns the
 * whole input if no block qualifies, so a single-line description still works.
 */
export function leadParagraph(input: string): string {
  const blocks = input.split(/\n\s*\n/);
  let inFence = false;

  for (const raw of blocks) {
    const block = raw.trim();
    if (!block) continue;

    // A fence delimiter can open or close within a block; track it so code
    // bodies separated by blank lines aren't mistaken for prose.
    const fences = (block.match(/```/g) || []).length;
    if (inFence) {
      if (fences % 2 === 1) inFence = false;
      continue;
    }
    if (block.startsWith('```')) {
      if (fences % 2 === 1) inFence = true;
      continue;
    }

    if (/^#{1,6}\s/.test(block)) continue; // heading
    // Thematic break / frontmatter fence (`---`, `***`, `___`). One doc opens
    // with a bare `---`, which otherwise resolved as the whole description.
    if (/^([-*_])\s*(\1\s*){2,}$/.test(block)) continue;
    if (block.startsWith('|')) continue; // table row
    if (/^[-*+]\s/.test(block)) continue; // bullet list
    if (/^\d+\.\s/.test(block)) continue; // ordered list
    if (block.startsWith('>')) continue; // blockquote

    // Prose block: drop any trailing lines that start a table or list, which
    // happens when an author omits the blank line before them.
    const prose = block
      .split('\n')
      .filter(line => !/^\s*(\||[-*+]\s|\d+\.\s|#{1,6}\s)/.test(line))
      .join(' ')
      .trim();
    if (prose) return prose;
  }

  return input;
}

/**
 * Re-level the headings in an authored description so it nests correctly under
 * the page's `<h1>`.
 *
 * Docs are authored as standalone documents: some open with `# ComponentName`,
 * which rendered a second `<h1>` duplicating the page title, and others start
 * their sections at `###`, skipping `<h2>` entirely. Both break the document
 * outline that screen readers and search engines rely on.
 *
 * Drops a leading level-1 heading (the page already renders that title), then
 * shifts what remains so the shallowest heading becomes `<h2>`. Content inside
 * fenced code blocks is left untouched — `# comment` is not a heading there.
 */
export function normalizeDescriptionHeadings(markdown: string): string {
  const lines = markdown.split('\n');
  const headingAt = (line: string) => /^(#{1,6})\s+\S/.exec(line);

  // Mark which lines sit inside a fence so they're never treated as headings.
  const fenced: boolean[] = [];
  let inFence = false;
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      fenced.push(true);
      inFence = !inFence;
      continue;
    }
    fenced.push(inFence);
  }

  // Drop a leading H1 — the page title already occupies that level.
  let start = 0;
  while (start < lines.length && lines[start].trim() === '') start++;
  if (start < lines.length && !fenced[start]) {
    const m = headingAt(lines[start]);
    if (m && m[1].length === 1) {
      lines.splice(start, 1);
      fenced.splice(start, 1);
    }
  }

  const levels = lines
    .map((line, i) => (fenced[i] ? null : headingAt(line)))
    .filter((m): m is RegExpExecArray => m !== null)
    .map(m => m[1].length);
  if (levels.length === 0) return lines.join('\n');

  // Shift so the shallowest heading lands on h2; never promote past it.
  const shift = 2 - Math.min(...levels);
  if (shift === 0) return lines.join('\n');

  return lines
    .map((line, i) => {
      if (fenced[i]) return line;
      const m = headingAt(line);
      if (!m) return line;
      const level = Math.min(6, Math.max(2, m[1].length + shift));
      return `${'#'.repeat(level)}${line.slice(m[1].length)}`;
    })
    .join('\n');
}

/**
 * Reduce common Markdown to plain text for meta descriptions. Component/hook
 * descriptions are authored in Markdown, so raw backticks, emphasis markers, and
 * link syntax would otherwise leak into <meta> tags and social previews.
 */
export function stripMarkdown(input: string): string {
  return input
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // images ![alt](url) -> alt
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links [text](url) -> text
    .replace(/`+([^`]*)`+/g, '$1') // `code` -> code
    .replace(/(\*\*|__)(.*?)\1/g, '$2') // **bold** / __bold__ -> bold
    .replace(/(\*|_)(.*?)\1/g, '$2') // *italic* / _italic_ -> italic
    .replace(/~~(.*?)~~/g, '$1') // ~~strike~~ -> strike
    .replace(/^\s{0,3}#{1,6}\s+/gm, '') // heading markers
    .replace(/^\s{0,3}>\s?/gm, '') // blockquote markers
    .replace(/\s+/g, ' ') // collapse whitespace/newlines
    .trim();
}

/**
 * Longest meta description we emit. Google renders roughly 155–160 characters
 * on desktop and truncates the rest mid-word, so anything beyond this is dead
 * weight in the HTML and an ugly ellipsis in the SERP.
 */
const MAX_DESCRIPTION = 155;

/**
 * Clamp a description to `MAX_DESCRIPTION`, cutting on a word boundary and
 * adding an ellipsis. Component descriptions are authored as full prose — the
 * longest was ~2,900 characters — so they need trimming, not just cleaning.
 *
 * Prefers to end at the first sentence that fits: a complete sentence reads as
 * intentional copy, where a hard cut mid-clause reads as a bug.
 */
export function clampDescription(input: string, max: number = MAX_DESCRIPTION): string {
  const text = input.trim();
  if (text.length <= max) return text;

  const ELLIPSIS = '…';

  // A sentence ending in the back half makes a clean, natural cut, and needs no
  // ellipsis — so it gets the full budget.
  const sentenceWindow = text.slice(0, max + 1);
  const sentenceEnd = Math.max(
    sentenceWindow.lastIndexOf('. '),
    sentenceWindow.lastIndexOf('! '),
    sentenceWindow.lastIndexOf('? ')
  );
  if (sentenceEnd >= max * 0.6 && sentenceEnd + 1 <= max) {
    return text.slice(0, sentenceEnd + 1);
  }

  // Word cut: the ellipsis is part of the rendered string, so it has to come out
  // of the budget or the result lands one char over the limit.
  const budget = max - ELLIPSIS.length;
  const wordWindow = text.slice(0, budget + 1);
  const lastSpace = wordWindow.lastIndexOf(' ');
  const cut = lastSpace > 0 ? lastSpace : budget;
  // Drop trailing punctuation so we never emit ",…" or ".…".
  return `${text.slice(0, cut).replace(/[\s,;:.\-–—]+$/, '')}${ELLIPSIS}`;
}

function stripTrailingSlash(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

/**
 * Resolve SEO metadata (title + description) for a given pathname.
 * Handles both static routes and the parameterized detail routes
 * (`/components/:name`, `/charts/:name`, `/hooks/:name`).
 * Runs during static rendering (Node) and on the client, so it must not
 * touch browser APIs.
 */
export function resolveRouteMeta(rawPathname: string): RouteMeta {
  const meta = resolveRouteMetaUnclamped(rawPathname);
  // Clamp here, at the single exit point, rather than in each branch — every
  // description this module hands out is length-safe by construction.
  return { ...meta, description: clampDescription(meta.description) };
}

/**
 * Minimum useful description length. Below this a snippet reads as a stub in
 * search results and carries almost no query surface.
 */
const MIN_DESCRIPTION = 70;

/**
 * Append boilerplate context to descriptions too short to stand alone.
 *
 * Some authored summaries are a single short clause ("Flow diagram showing
 * volume between nodes."). Rather than invent copy, we suffix the same true,
 * generic sentence already used when a doc has no description at all.
 */
function withMinimumContext(description: string, fallback: string): string {
  const text = description.trim();
  if (!text) return fallback;
  if (text.length >= MIN_DESCRIPTION) return text;
  const separator = /[.!?]$/.test(text) ? ' ' : '. ';
  return `${text}${separator}${fallback}`;
}

function resolveRouteMetaUnclamped(rawPathname: string): RouteMeta {
  const pathname = stripTrailingSlash(rawPathname || '/');

  const staticMatch = STATIC_ROUTES[pathname];
  if (staticMatch) {
    return staticMatch;
  }

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 2) {
    const [section, slug] = segments;
    const decoded = decodeURIComponent(slug);

    if (section === 'components') {
      const meta = componentsIndex[decoded];
      const label = meta?.title || meta?.name || decoded;
      const fallback = `A themeable, accessible, cross-platform React Native component from Platform Blocks.`;
      return {
        title: `${label} Component`,
        description: withMinimumContext(
          meta?.description ? stripMarkdown(leadParagraph(meta.description)) : '',
          `${label} — ${fallback.charAt(0).toLowerCase()}${fallback.slice(1)}`
        ),
      };
    }

    if (section === 'charts') {
      const meta = chartsIndex[decoded];
      const label = meta?.title || decoded;
      return {
        title: label,
        description: withMinimumContext(
          meta?.summary ? stripMarkdown(leadParagraph(meta.summary)) : '',
          `${label} — a cross-platform chart for React Native and Web from Platform Blocks Charts.`
        ),
      };
    }

    if (section === 'hooks') {
      const meta = hooksIndex[decoded];
      const label = meta?.title || meta?.name || decoded;
      return {
        title: `${label} Hook`,
        description: withMinimumContext(
          meta?.description ? stripMarkdown(leadParagraph(meta.description)) : '',
          `${label} — a React hook for building cross-platform apps with Platform Blocks.`
        ),
      };
    }

    if (section === 'examples') {
      const label = decoded
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
      return {
        title: `${label} Example`,
        description: `${label} — a complete mini-app example built with Platform Blocks components.`,
      };
    }
  }

  // Unknown route: fall back to the site default.
  return STATIC_ROUTES['/'];
}

/** Absolute canonical URL for a pathname (resolving duplicate-content aliases). */
export function canonicalUrl(rawPathname: string): string {
  const pathname = stripTrailingSlash(rawPathname || '/');
  const target = CANONICAL_ALIASES[pathname] ?? pathname;
  return target === '/' ? `${SITE_URL}/` : `${SITE_URL}${target}`;
}

/** Full <title> string including the site name. */
export function formatTitle(title: string): string {
  if (!title) return SITE_NAME;
  return title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;
}

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

/** A short human label for a route segment (used in breadcrumbs). */
function segmentLabel(pathname: string): string {
  return resolveRouteMeta(pathname).title.replace(new RegExp(`\\s*\\|\\s*${SITE_NAME}$`), '');
}

/** BreadcrumbList itemListElement for a pathname (Home → … → current). */
function breadcrumbItems(pathname: string): Array<Record<string, unknown>> {
  const items = [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` }];
  if (pathname === '/') return items;

  const segments = pathname.split('/').filter(Boolean);
  let acc = '';
  segments.forEach((seg, i) => {
    acc += `/${seg}`;
    items.push({
      '@type': 'ListItem',
      position: i + 2,
      name: segmentLabel(acc),
      item: `${SITE_URL}${acc}`,
    });
  });
  return items;
}

/**
 * Build the JSON-LD `@graph` for a route. Returns an array of schema.org nodes:
 * WebSite/Organization/SoftwareApplication on the homepage, a BreadcrumbList on
 * every inner page, and a TechArticle on component/chart/hook detail pages.
 * Pure (no browser APIs) so it runs during the static build.
 */
export function jsonLdForRoute(rawPathname: string): Array<Record<string, unknown>> {
  const pathname = stripTrailingSlash(rawPathname || '/');
  const meta = resolveRouteMeta(pathname);
  const url = canonicalUrl(pathname);
  const graph: Array<Record<string, unknown>> = [];

  const organization = {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: SITE_LOGO,
    sameAs: [GITHUB_REPO, TWITTER_PROFILE, NPM_PACKAGE, DISCORD_INVITE],
  };

  if (pathname === '/') {
    graph.push(organization);
    graph.push({
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      description: meta.description,
      publisher: { '@id': ORGANIZATION_ID },
    });
    graph.push({
      '@type': 'SoftwareApplication',
      name: SITE_NAME,
      description: meta.description,
      url: `${SITE_URL}/`,
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'iOS, Android, Web',
      softwareRequirements: 'React Native, React',
      author: { '@id': ORGANIZATION_ID },
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    });
    return graph.map((node) => ({ '@context': 'https://schema.org', ...node }));
  }

  graph.push({
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems(pathname),
  });

  if (pathname === '/faq' && FAQ_ITEMS.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: FAQ_ITEMS.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: { '@type': 'Answer', text: item.answer },
      })),
    });
  }

  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 2 && ['components', 'charts', 'hooks'].includes(segments[0])) {
    graph.push({
      '@type': 'TechArticle',
      headline: meta.title,
      description: meta.description,
      url,
      inLanguage: 'en',
      isPartOf: { '@id': WEBSITE_ID },
      author: { '@id': ORGANIZATION_ID },
      publisher: { '@id': ORGANIZATION_ID },
    });
  }

  return graph.map((node) => ({ '@context': 'https://schema.org', ...node }));
}
