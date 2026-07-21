import { getRemotes, loadRemoteElement, type RemoteDefinition } from "./remote-loader";
import "./styles.css";

function element<K extends keyof HTMLElementTagNameMap>(tagName: K, className?: string) {
  const node = document.createElement(tagName);
  if (className) {
    node.className = className;
  }
  return node;
}

function unavailable(feature: string, detail: string) {
  const message = element("section", "remote-error");
  const heading = element("h2");
  const description = element("p");
  heading.textContent = `${feature} is temporarily unavailable.`;
  description.textContent = detail;
  message.append(heading, description);
  return message;
}

function renderShell(remotes: RemoteDefinition[]) {
  const root = document.getElementById("root");
  if (!root) {
    throw new Error("Shell root element is missing.");
  }

  const main = element("main");
  const header = element("header");
  const brand = element("a", "brand");
  brand.href = "#events";
  brand.textContent = "EventHub";
  const navigation = element("nav");
  const content = element("section", "content");
  const buttons = new Map<string, HTMLButtonElement>();
  let requestId = 0;

  header.append(brand, navigation);
  main.append(header, content);
  root.replaceChildren(main);

  async function showRemote(remote: RemoteDefinition) {
    const currentRequest = ++requestId;
    for (const [id, button] of buttons) {
      button.classList.toggle("active", id === remote.id);
    }

    const loading = element("p", "status");
    loading.textContent = "Loading feature…";
    content.replaceChildren(loading);

    try {
      await loadRemoteElement(remote);
      if (currentRequest !== requestId) {
        return;
      }

      content.replaceChildren(document.createElement(remote.elementName));
    } catch (error) {
      if (currentRequest !== requestId) {
        return;
      }

      content.replaceChildren(
        unavailable(
          remote.navigationLabel,
          error instanceof Error ? error.message : "Please try again in a moment.",
        ),
      );
    }
  }

  for (const remote of remotes) {
    const button = element("button");
    button.type = "button";
    button.textContent = remote.navigationLabel;
    button.addEventListener("click", () => void showRemote(remote));
    buttons.set(remote.id, button);
    navigation.append(button);
  }

  void showRemote(remotes[0]);
}

try {
  renderShell(getRemotes());
} catch (error) {
  const root = document.getElementById("root");
  if (root) {
    root.replaceChildren(
      unavailable(
        "Application configuration",
        error instanceof Error ? error.message : "The shell cannot load its remotes.",
      ),
    );
  }
}
