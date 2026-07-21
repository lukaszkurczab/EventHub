window.__EVENTHUB_CONFIG__ = {
  remotes: [
    {
      id: "events",
      navigationLabel: "Explore events",
      scope: "eventCatalog",
      module: "./element",
      elementName: "eventhub-events",
      url: "http://localhost:3001/remoteEntry.js"
    },
    {
      id: "host-dashboard",
      navigationLabel: "Host dashboard",
      scope: "hostDashboard",
      module: "./element",
      elementName: "eventhub-host-dashboard",
      url: "http://localhost:3002/remoteEntry.js"
    }
  ]
};
