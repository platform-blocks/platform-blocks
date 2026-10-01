import appSnacks from '../config/appSnackManifest.json';
import { SNACK_OPTIONAL_MODULE_DEPS, SNACK_PACKAGE_VERSION, SNACK_SDK_VERSION } from './snackUrl';

interface AppSnackEntry {
  slug: string;
  codeFiles: string[];
  assets: string[];
  dependencies: string[];
}

/** Enable after a representative app resolves its dependencies and runs in Snack. */
export const APP_SNACK_READY = false;

/** The example-apps repository hosts Snack-ready copies of the app source. */
export function buildAppSnackUrl(
  slug: string,
  sourceRoot = 'https://raw.githubusercontent.com/platform-blocks/examples/main/snacks'
): string | null {
  const entry = (appSnacks as AppSnackEntry[]).find(app => app.slug === slug);
  if (!entry) return null;

  const base = `${sourceRoot.replace(/\/$/, '')}/${encodeURIComponent(slug)}/`;
  const files: Record<string, { type: 'CODE'; url: string } | { type: 'ASSET'; contents: string }> = {};
  for (const name of entry.codeFiles) files[name] = { type: 'CODE', url: `${base}${name}` };
  for (const name of entry.assets) files[name] = { type: 'ASSET', contents: `${base}${name}` };

  const dependencies = [
    `@plocks/ui@${SNACK_PACKAGE_VERSION}`,
    `@plocks/ui-snack@${SNACK_PACKAGE_VERSION}`,
    ...SNACK_OPTIONAL_MODULE_DEPS,
    ...entry.dependencies,
  ];
  const params = new URLSearchParams({
    name: `plocks ${slug} example`,
    description: `Full app example from plocks.dev/examples`,
    sdkVersion: SNACK_SDK_VERSION,
    platform: 'mydevice',
    supportedPlatforms: 'mydevice,ios,android,web',
    dependencies: [...new Set(dependencies)].join(','),
    files: JSON.stringify(files),
    hideQueryParams: 'true',
  });
  return `https://snack.expo.dev/?${params.toString()}`;
}
