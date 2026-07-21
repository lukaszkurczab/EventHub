import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scope = process.argv[2];

if (!scope) {
  throw new Error("A Module Federation scope is required.");
}

const appDirectory = {
  eventCatalog: "apps/events",
  hostDashboard: "apps/host-dashboard",
}[scope];

if (!appDirectory) {
  throw new Error(`Unknown remote scope: ${scope}`);
}

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const artifact = resolve(repositoryRoot, appDirectory, "dist/remoteEntry.js");
await access(artifact);

const source = await readFile(artifact, "utf8");

if (!source.includes(scope) || !source.includes("./App")) {
  throw new Error(`${artifact} does not expose the required ${scope}/./App contract.`);
}

console.log(`${scope}: remoteEntry.js exposes ./App`);
