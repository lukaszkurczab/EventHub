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
  elementName: string;
  url: string;
};

type RemoteContainer = {
  get(module: string): Promise<() => unknown>;
};

type RemoteElementModule = {
  elementName: string;
  register: () => void;
};

const containers = new Map<string, Promise<RemoteContainer>>();

function isRemoteDefinition(value: unknown): value is RemoteDefinition {
  if (!value || typeof value !== "object") {
    return false;
  }

  const remote = value as Record<string, unknown>;
  return ["id", "navigationLabel", "scope", "module", "elementName", "url"].every(
    (field) => typeof remote[field] === "string" && remote[field].length > 0,
  );
}

function isRemoteElementModule(value: unknown): value is RemoteElementModule {
  if (!value || typeof value !== "object") {
    return false;
  }

  const remote = value as Record<string, unknown>;
  return typeof remote.elementName === "string" && typeof remote.register === "function";
}

export function getRemotes(): RemoteDefinition[] {
  const remotes = window.__EVENTHUB_CONFIG__?.remotes;

  if (!Array.isArray(remotes) || remotes.length === 0 || !remotes.every(isRemoteDefinition)) {
    throw new Error("Shell runtime configuration must define at least one valid remote.");
  }

  const ids = new Set<string>();
  const elementNames = new Set<string>();
  for (const remote of remotes) {
    if (ids.has(remote.id)) {
      throw new Error(`Shell runtime configuration contains the duplicate remote id: ${remote.id}.`);
    }
    if (elementNames.has(remote.elementName)) {
      throw new Error(`Shell runtime configuration contains the duplicate element name: ${remote.elementName}.`);
    }
    if (!remote.elementName.includes("-")) {
      throw new Error(`Remote ${remote.id} must use a hyphenated custom-element name.`);
    }
    ids.add(remote.id);
    elementNames.add(remote.elementName);

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
      const script = document.createElement("script");
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

export async function loadRemoteElement(remote: RemoteDefinition): Promise<void> {
  const container = await loadContainer(remote);
  const exposedModule = (await container.get(remote.module))();

  if (!isRemoteElementModule(exposedModule)) {
    throw new Error(`Remote ${remote.id} does not expose a custom-element registration module.`);
  }
  if (exposedModule.elementName !== remote.elementName) {
    throw new Error(`Remote ${remote.id} registered ${exposedModule.elementName}, not ${remote.elementName}.`);
  }

  exposedModule.register();
  await customElements.whenDefined(remote.elementName);
}
