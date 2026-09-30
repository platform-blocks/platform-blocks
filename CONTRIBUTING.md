# Contributing to plocks

Issues and pull requests are welcome. The [contribution guide](https://plocks.dev/contribute) covers the repository layout and the workflow for components, demos, and documentation.

## Run the docs locally

From this repository root:

```sh
npm install
npm run dev
```

The docs app uses the local workspace packages, so edits to a component are visible there. Run the relevant package checks before opening a pull request; for the core UI package:

```sh
npm run ui:typecheck
npm run ui:lint
npm run ui:test
```

## Full example apps

The standalone apps live in a separate examples checkout. If you have that checkout, place it beside `plocks` and follow its README. The docs site can bundle the apps and their source pages with `npm run site:build-with-demos`.
