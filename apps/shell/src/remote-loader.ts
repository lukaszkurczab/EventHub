import type { ComponentType } from 'react';

declare const __webpack_init_sharing__: (scope: string) => Promise<void>;
declare const __webpack_share_scopes__: { default: unknown };

declare global {
  interface Window {
    __EVENTHUB_CONFIG__: { eventsRemoteUrl: string; dashboardRemoteUrl: string };
    [key: string]: any;
  }
}

type RemoteContainer = { init(shareScope: unknown): Promise<void>; get(module: string): Promise<() => { default: ComponentType }> };

export async function loadRemote(scope: string, url: string): Promise<ComponentType> {
  if (!window[scope]) {
    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Could not load ${scope} from ${url}`));
      document.head.appendChild(script);
    });
  }
  await __webpack_init_sharing__('default');
  const remote = window[scope] as RemoteContainer;
  await remote.init(__webpack_share_scopes__.default);
  return (await remote.get('./App'))().default;
}
