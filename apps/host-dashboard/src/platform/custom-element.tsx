import { createRoot, type Root } from "react-dom/client";
import HostDashboard from "../feature";

export const elementName = "eventhub-host-dashboard";

class HostDashboardElement extends HTMLElement {
  private root?: Root;
  private mountPoint?: HTMLDivElement;

  connectedCallback() {
    if (this.root) {
      return;
    }

    const shadowRoot = this.shadowRoot ?? this.attachShadow({ mode: "open" });
    this.mountPoint ??= document.createElement("div");
    if (!this.mountPoint.isConnected) {
      shadowRoot.append(this.mountPoint);
    }

    this.root = createRoot(this.mountPoint);
    this.root.render(<HostDashboard />);
  }

  disconnectedCallback() {
    this.root?.unmount();
    this.root = undefined;
  }
}

export function register() {
  if (!customElements.get(elementName)) {
    customElements.define(elementName, HostDashboardElement);
  }
}
