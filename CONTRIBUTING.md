# Contributing to React UI Library

Thanks for helping build React UI Library! This guide covers the repo layout, the dev workflow, and how to add components, demos, and docs.

## Repo layout

| Path | What it is |
| --- | --- |
| `packages/ui` | `@platform-blocks/react-ui-library` — the component library (100+ components, hooks, theming) |
| `packages/charts` | `@platform-blocks/charts` — 25 chart types built on the same theming |
| `apps/react-ui-library.com` | The documentation site (Expo Router, statically rendered web) |
| `scripts/` | Generators: demos, docs metadata, llms.txt, sitemap, exports map, release |

## Getting started

```sh
git clone https://github.com/platform-blocks/react-ui-library.git
cd react-ui-library
npm install
```

Start the docs site (the main dev surface — component demos render here):

```sh
npm run dev
```

This starts the documentation app with Expo. Press `w` for web, or open it in the Expo Go app / an iOS simulator / an Android emulator.

## Working on the UI package

```sh
npm run ui:build     # rollup + type declarations
npm run ui:test      # jest (70% coverage threshold)
npm run ui:lint      # eslint
```

Each component lives in `packages/ui/src/components/<Name>/` with a conventional shape:

```
Button/
  Button.tsx  types.ts  index.ts
  __tests__/            # jest tests
  meta/component.md     # frontmatter: title, category, tags + prose
  demos/<slug>/         # index.tsx (default-export Demo) + description.md
```

### Adding a component

1. Create the directory following the shape above.
2. Export it from `packages/ui/src/index.ts`.
3. Run `npm run ui:exports` to regenerate the per-component `exports` map in `package.json` (CI fails if it's stale).
4. Add a row to `apps/react-ui-library.com/config/coreComponents.ts`.
5. Run `npm run docs:all` — the docs route, nav entry, props table, demo code blocks, sitemap, SEO tags, and llms.txt page are all generated.

### Adding a demo to an existing component

Create `demos/<slug>/index.tsx` (default-export `Demo` component) and `description.md` with frontmatter (`title`, `order`, `tags`), then run `npm run demos:all` to regenerate and validate.

## Working on the docs site

Guide-style pages keep their content in JSX-free modules under `apps/react-ui-library.com/config/` (e.g. `gettingStarted.ts`, `templates.ts`, `faq.ts`) so `scripts/generate-llms.ts` can render the same source into `llms.txt`. Adding a page touches: the route file in `app/`, a config module, `config/navigationConfig.ts`, and `config/routeSeo.ts` (the prerender check fails without SEO entries).

Before opening a PR that changes docs content, run:

```sh
npm run docs:all
```

## Verifying a change

```sh
npm run verify:packages   # exports check + lint + tests for both packages
```

## Starter templates & community

- Starter templates live in separate repos under the [platform-blocks org](https://github.com/platform-blocks) and are listed via `apps/react-ui-library.com/config/templates.ts`.
- Built a starter with your own stack? [Share it with us](https://github.com/platform-blocks/react-ui-library/issues/new?template=community_template.yml) — accepted templates get listed on the Getting Started page.

## Releases

Maintainers run `npm run release`, which verifies both packages (exports, lint, tests, build) and publishes `@platform-blocks/react-ui-library` and `@platform-blocks/charts` to npm.
