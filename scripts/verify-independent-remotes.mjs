import { readFile } from "node:fs/promises";

const remotes = [
  {
    directory: "apps/events",
    packageName: "@eventhub/events",
    scope: "eventCatalog",
    imageName: "events",
  },
  {
    directory: "apps/host-dashboard",
    packageName: "@eventhub/host-dashboard",
    scope: "hostDashboard",
    imageName: "host-dashboard",
  },
];

for (const remote of remotes) {
  const packageJson = JSON.parse(
    await readFile(`${remote.directory}/package.json`, "utf8"),
  );
  const webpackConfig = await readFile(`${remote.directory}/webpack.config.js`, "utf8");
  const dockerfile = await readFile(`${remote.directory}/Dockerfile`, "utf8");
  const buildConfig = await readFile(
    `infra/cloudbuild/${remote.imageName}.yaml`,
    "utf8",
  );

  if (
    packageJson.name !== remote.packageName ||
    !packageJson.version ||
    !packageJson.scripts?.verify ||
    !packageJson.dependencies?.react ||
    !packageJson.dependencies?.["react-dom"]
  ) {
    throw new Error(`${remote.packageName} is not a self-describing deployable package.`);
  }

  const declaredDependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };
  const prohibitedPackage = ["@eventhub/shell", ...remotes.map((candidate) => candidate.packageName)].find(
    (packageName) => packageName !== remote.packageName && declaredDependencies[packageName],
  );
  if (prohibitedPackage) {
    throw new Error(`${remote.packageName} must not depend on ${prohibitedPackage}.`);
  }

  if (
    !webpackConfig.includes(`name: "${remote.scope}"`) ||
    !webpackConfig.includes('"./element"') ||
    webpackConfig.includes("shared:") ||
    !dockerfile.includes(`--workspace=${remote.packageName}`) ||
    !buildConfig.includes(`/${remote.imageName}:`)
  ) {
    throw new Error(`${remote.packageName} does not have an isolated artifact contract.`);
  }
}

const shellPackage = JSON.parse(await readFile("apps/shell/package.json", "utf8"));
const shellWebpackConfig = await readFile("apps/shell/webpack.config.js", "utf8");

if (
  shellPackage.dependencies?.react ||
  shellPackage.dependencies?.["react-dom"] ||
  shellPackage.devDependencies?.["@types/react"] ||
  shellPackage.devDependencies?.["@types/react-dom"] ||
  shellWebpackConfig.includes("ModuleFederationPlugin")
) {
  throw new Error("@eventhub/shell must remain a framework-neutral DOM host.");
}

console.log("shell is a framework-neutral DOM host; remotes have separate element, package, and build contracts");
