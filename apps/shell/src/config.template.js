window.__EVENTHUB_CONFIG__ = {
  remotes: [
    {
      id: "events",
      navigationLabel: "Explore events",
      scope: "eventCatalog",
      module: "./element",
      elementName: "eventhub-events",
      url: "$EVENTS_REMOTE_URL"
    },
    {
      id: "host-dashboard",
      navigationLabel: "Host dashboard",
      scope: "hostDashboard",
      module: "./element",
      elementName: "eventhub-host-dashboard",
      url: "$DASHBOARD_REMOTE_URL"
    }
  ]
};
