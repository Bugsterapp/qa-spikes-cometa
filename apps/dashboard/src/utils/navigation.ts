import type { NavItemKey } from '../components/nav-section/vertical/types';
import { mainNav, configurationNav } from '../components/layouts/dashboard/navbar/NavConfig';

const pathToNavKeyMap = new Map<string, NavItemKey>();
const configurationNavKeys = new Set<NavItemKey>();

function initializeMappings() {
  if (pathToNavKeyMap.size === 0) {
    [...Object.values(mainNav).flat(), ...Object.values(configurationNav).flat()].forEach((item) => {
      pathToNavKeyMap.set(item.path, item.key);
    });

    Object.values(configurationNav)
      .flat()
      .forEach((item) => {
        configurationNavKeys.add(item.key);
      });
  }
}

export function getNavKeyFromPath(pathname: string): NavItemKey | null {
  initializeMappings();

  const exactMatch = pathToNavKeyMap.get(pathname);
  if (exactMatch) {
    return exactMatch;
  }

  for (const [path, key] of pathToNavKeyMap) {
    if (pathname.startsWith(path + '/')) {
      return key;
    }
  }

  return null;
}

export function isPathActive(itemPath: string, pathname: string): boolean {
  return pathname === itemPath || pathname.startsWith(itemPath + '/');
}

export function isConfigurationNavKey(navKey: NavItemKey): boolean {
  initializeMappings();
  return configurationNavKeys.has(navKey);
}
