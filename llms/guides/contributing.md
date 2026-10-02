# Contributing to plocks

How the repo is laid out, how to run it locally, and what it takes to land a component, a demo, or a docs page.

Docs: https://plocks.dev/contribute

plocks is developed in the open at [platform-blocks/plocks](https://github.com/platform-blocks/plocks). Issues and pull requests are welcome — this page is the short version of [CONTRIBUTING.md](https://github.com/platform-blocks/plocks/blob/main/CONTRIBUTING.md), which ships with the repo.

## Repo layout

- `packages/ui` — The core library published as `@plocks/ui` — 100+ components, hooks, and the theming system
- `packages/charts` — The charting package published as `@plocks/charts` — 24 chart types on that same theming
- `packages/{dates,code,media,carousel,spotlight}` — The packages built on `@plocks/ui`: date pickers, code and Markdown, audio and video, the carousel, and Spotlight
- `apps/docs` — This documentation site (Expo Router, statically rendered web)
- `scripts/` — Generators: demos, docs metadata, llms.txt, sitemap, exports map, release

## Set up the repo

plocks is one npm workspace. Install from the root — the workspaces are linked, so the docs site runs against your local packages rather than the published ones.

```bash
git clone https://github.com/platform-blocks/plocks.git
cd plocks
npm install
```

Start the docs site. It is the main development surface: every component demo renders there, against the source you are editing.

```bash
npm run dev
```

Press `w` for web, or open the project in Expo Go, an iOS simulator, or an Android emulator.

## Working on the UI package

Each component lives in `packages/<package>/src/components/<Name>/` — most in `packages/ui` — with a conventional shape: tests, docs metadata, and demos beside the source:

`packages/ui/src/components/Button`

```text
Button/
  Button.tsx  types.ts  index.ts
  __tests__/            # jest tests
  meta/component.md     # frontmatter: title, category, tags + prose
  demos/<slug>/         # index.tsx (default-export Demo) + description.md
```

Build, test, and lint the package from the repo root:

```bash
npm run ui:build     # rollup + type declarations
npm run ui:test      # jest (70% coverage threshold)
npm run ui:lint      # eslint
```

## Adding a component

A new component is five steps, and the last one writes most of the docs for you:

1. Create the directory following the shape above.
2. Export it from its package's `src/index.ts`.
3. In `packages/ui`, run `npm run ui:exports` to regenerate the per-component `exports` map in `package.json` — CI fails if it is stale.
4. Add a row to `apps/docs/config/coreComponents.ts`.
5. Run `npm run docs:all` — the docs route, nav entry, props table, demo code blocks, and llms.txt page are all generated.

## Adding a demo

Demos are the examples on a component page, and each one is a real component the site renders. Create `demos/<slug>/index.tsx` with a default-exported `Demo`, plus a `description.md` carrying `title`, `order`, and `tags` frontmatter, then regenerate:

```bash
npm run demos:all
```

The validator that runs afterwards fails on a missing description, a duplicate slug, or a demo that does not compile.

## Working on the docs site

Guide pages keep their copy in JSX-free modules under `apps/docs/config/` — `gettingStarted.ts`, `templates.ts`, `faq.ts`, and this page's `contribute.ts` — so `scripts/generate-llms.ts` can render the same source into `llms.txt` for language models. A new page touches four files:

- the route file under `app/`,
- a config module holding its copy,
- `config/navigationConfig.ts` for the sidebar entry,
- `config/routeSeo.ts` for the title and description — the prerender check fails without them.

Before opening a pull request that changes docs content, regenerate the derived files:

```bash
npm run docs:all
```

## Verifying a change

One command covers both packages — the exports map, the skills check, lint, and the test suites:

```bash
npm run verify:packages
```

## Starter templates & community

The starter templates are separate repositories, listed on the site from one config module.

- Templates live under the [platform-blocks GitHub org](https://github.com/platform-blocks) and are listed via `apps/docs/config/templates.ts`.
- Built a starter with your own stack? [Share it with us](https://github.com/platform-blocks/plocks/issues/new?template=community_template.yml) — accepted templates get listed on the [Getting Started](https://plocks.dev/getting-started) page.

## Releases

Maintainers run `npm run release`, which verifies every package (exports, lint, tests, build) and publishes them to npm together, at one version. Contributors never need to bump a version — say what the change is in the pull request and it lands in the next release.

Stuck on any of this? Open a [discussion](https://github.com/orgs/platform-blocks/discussions) or [issue](https://github.com/platform-blocks/plocks/issues) — a question that needed asking is usually a docs bug worth fixing.
