# Contributing to React UI Library

How the repo is laid out, how to run it locally, and what it takes to land a component, a demo, or a docs page.

Docs: https://react-ui-library.com/contribute

## Repo layout

- `packages/ui` — The component library published as `@platform-blocks/react-ui-library` — 100+ components, hooks, and the theming system
- `packages/charts` — The charting package published as `@platform-blocks/charts` — 25 chart types on that same theming
- `apps/react-ui-library.com` — This documentation site (Expo Router, statically rendered web)
- `scripts/` — Generators: demos, docs metadata, llms.txt, sitemap, exports map, release

## Set up the repo

React UI Library is one npm workspace. Install from the root — the workspaces are linked, so the docs site runs against your local packages rather than the published ones.

```bash
git clone https://github.com/platform-blocks/react-ui-library.git
cd react-ui-library
npm install
```

Start the docs site. It is the main development surface: every component demo renders there, against the source you are editing.

```bash
npm run dev
```

Press `w` for web, or open the project in Expo Go, an iOS simulator, or an Android emulator.

## Working on the UI package

Each component lives in `packages/ui/src/components/<Name>/` with a conventional shape — tests, docs metadata, and demos beside the source:

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
2. Export it from `packages/ui/src/index.ts`.
3. Run `npm run ui:exports` to regenerate the per-component `exports` map in `package.json` — CI fails if it is stale.
4. Add a row to `apps/react-ui-library.com/config/coreComponents.ts`.
5. Run `npm run docs:all` — the docs route, nav entry, props table, demo code blocks, and llms.txt page are all generated.

## Adding a demo

Demos are the examples on a component page, and each one is a real component the site renders. Create `demos/<slug>/index.tsx` with a default-exported `Demo`, plus a `description.md` carrying `title`, `order`, and `tags` frontmatter, then regenerate:

```bash
npm run demos:all
```

The validator that runs afterwards fails on a missing description, a duplicate slug, or a demo that does not compile.

## Working on the docs site

Guide pages keep their copy in JSX-free modules under `apps/react-ui-library.com/config/` — `gettingStarted.ts`, `templates.ts`, `faq.ts`, and this page's `contribute.ts` — so `scripts/generate-llms.ts` can render the same source into `llms.txt` for language models. A new page touches four files:

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

- Templates live under the [platform-blocks org](https://github.com/platform-blocks) and are listed via `apps/react-ui-library.com/config/templates.ts`.
- Built a starter with your own stack? [Share it with us](https://github.com/platform-blocks/react-ui-library/issues/new?template=community_template.yml) — accepted templates get listed on the [Getting Started](https://react-ui-library.com/getting-started) page.

## Releases

Maintainers run `npm run release`, which verifies both packages (exports, lint, tests, build) and publishes `@platform-blocks/react-ui-library` and `@platform-blocks/charts` to npm. Contributors never need to bump a version — say what the change is in the pull request and it lands in the next release.

Stuck on any of this? Open a [discussion](https://github.com/orgs/platform-blocks/discussions) or [issue](https://github.com/platform-blocks/react-ui-library/issues) — a question that needed asking is usually a docs bug worth fixing.
