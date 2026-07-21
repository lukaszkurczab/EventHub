import type { ComponentType } from "react";

declare const __webpack_init_sharing__: (scope: string) => Promise<void>;
declare const __webpack_share_scopes__: { default: unknown };

declare global {
  interface Window {
    __EVENTHUB_CONFIG__?: { remotes?: unknown };
    [key: string]: unknown;
  }
}

export type RemoteDefinition = {
  id: string;
  navigationLabel: string;
  scope: string;
  module: string;
  url: string;
};

type RemoteContainer = {
  init(shareScope: unknown): Promise<void>;
  get(module: string): Promise<() => { default: ComponentType }>;
};

const containers = new Map<string, Promise<RemoteContainer>>();

function isRemoteDefinition(value: unknown): value is RemoteDefinition {
  if (!value || typeof value !== "object") {
    return false;
  }

  const remote = value as Record<string, unknown>;
  return ["id", "navigationLabel", "scope", "module", "url"].every(
    (field) => typeof remote[field] === "string" && remote[field].length > 0,
  );
}

export function getRemotes(): RemoteDefinition[] {
  const remotes = window.__EVENTHUB_CONFIG__?.remotes;

  if (!Array.isArray(remotes) || remotes.length === 0 || !remotes.every(isRemoteDefinition)) {
    throw new Error("Shell runtime configuration must define at least one valid remote.");
  }

  const ids = new Set<string>();
  for (const remote of remotes) {
    if (ids.has(remote.id)) {
      throw new Error(`Shell runtime configuration contains the duplicate remote id: ${remote.id}.`);
    }
    ids.add(remote.id);

    if (remote.url.startsWith("$")) {
      throw new Error(`Shell runtime configuration is missing the URL for ${remote.id}.`);
    }
  }

  return remotes;
}

async function loadContainer(remote: RemoteDefinition): Promise<RemoteContainer> {
  const key = `${remote.scope}:${remote.url}`;
  let container = containers.get(key);

  if (!container) {
    container = new Promise<RemoteContainer>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = remote.url;
      script.async = true;
      script.onload = () => {
        const loadedContainer = window[remote.scope] as RemoteContainer | undefined;
        if (!loadedContainer) {
          reject(new Error(`Remote ${remote.id} did not register the ${remote.scope} container.`));
          return;
        }
        resolve(loadedContainer);
      };
      script.onerror = () => reject(new Error(`Could not load ${remote.id} from ${remote.url}`));
      document.head.appendChild(script);
    });
    containers.set(key, container);
    void container.catch(() => containers.delete(key));
  }

  return container;
}

export async function loadRemote(remote: RemoteDefinition): Promise<ComponentType> {
  const container = await loadContainer(remote);
  await __webpack_init_sharing__('default');
  await container.init(__webpack_share_scopes__.default);
  return (await container.get(remote.module))().default;
}
