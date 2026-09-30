<p align="center">
  <a href="https://plocks.dev/" rel="noopener" target="_blank"><img height="64" src="https://raw.githubusercontent.com/platform-blocks/plocks/main/brand/png/mark.png" alt="plocks"/></a>
</p>

<h1 align="center">create-plocks</h1>

Start a new [plocks](https://plocks.dev/) app from a template.

```bash
npm create plocks@latest
```

It asks where to put the project and which template to use, downloads the template, names the project after its folder, installs dependencies with the package manager you ran it with, and makes a first git commit.

## Templates

| Template | What it is |
| --- | --- |
| `expo` | Expo Router app for iOS, Android and web — dark mode, testing and linting wired up |
| `expo-min` | One screen with the provider set up and nothing else |
| `universal` | Expo app with statically rendered web output |
| `native` | iOS and Android only |
| `web` | React Native Web only |

Any GitHub repository works too: `--template owner/repo`.

## Options

```bash
npm create plocks@latest my-app -- --template expo-min
```

| Option | |
| --- | --- |
| `-t, --template <name>` | A template above, or a GitHub repo as `owner/repo` |
| `--pm <npm\|pnpm\|yarn\|bun>` | Package manager to install with (default: the one you ran it with) |
| `--no-install` | Skip installing dependencies |
| `--no-git` | Skip creating a git repository |
| `-y, --yes` | Use the defaults for anything not given |

With npm, options go after `--`. `pnpm create plocks`, `yarn create plocks` and `bun create plocks` work too.

## License

[MIT](https://github.com/platform-blocks/plocks/blob/main/LICENSE) © [Josh Stovall](https://github.com/joshstovall). The bundled libraries' licenses ship in `dist/THIRD_PARTY_LICENSES.md`.
