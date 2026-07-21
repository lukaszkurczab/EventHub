import { elementName, register } from "./custom-element";

register();

const root = document.getElementById("root");
if (!root) {
  throw new Error("Host dashboard root element is missing.");
}

root.replaceChildren(document.createElement(elementName));
