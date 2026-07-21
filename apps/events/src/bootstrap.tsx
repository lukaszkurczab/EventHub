import { register, elementName } from "./element";

register();

const root = document.getElementById("root");
if (!root) {
  throw new Error("Event catalog root element is missing.");
}

root.replaceChildren(document.createElement(elementName));
