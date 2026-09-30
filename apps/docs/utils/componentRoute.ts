import componentsMeta from '../data/generated/components-meta.json';

type ComponentMeta = { packageName?: string };
const componentIndex = componentsMeta as Record<string, ComponentMeta>;

export function componentPackageSlug(name: string): string | null {
  const packageName = componentIndex[name]?.packageName;
  return packageName?.startsWith('@plocks/') ? packageName.slice('@plocks/'.length) : null;
}

export function componentRoute(name: string): string {
  return `/${componentPackageSlug(name) ?? 'ui'}/${name}`;
}

export function componentMatchesPackage(name: string, packageSlug: string): boolean {
  return componentPackageSlug(name) === packageSlug;
}
