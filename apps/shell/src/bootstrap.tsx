import React, { Suspense, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { loadRemote } from "./remote-loader";
import "./styles.css";

class RemoteErrorBoundary extends React.Component<
  { children: React.ReactNode; feature: string },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <section className="remote-error">
        <h2>{this.props.feature} is temporarily unavailable.</h2>
        <p>Please try again in a moment.</p>
      </section>
    ) : (
      this.props.children
    );
  }
}

const RemoteView = ({ scope, url }: { scope: string; url: string }) => {
  const App = useMemo(
    () =>
      React.lazy(() =>
        loadRemote(scope, url).then((defaultExport) => ({
          default: defaultExport,
        })),
      ),
    [scope, url],
  );
  return (
    <RemoteErrorBoundary
      feature={scope === "eventCatalog" ? "Event catalog" : "Host dashboard"}
    >
      <Suspense fallback={<p className="status">Loading feature…</p>}>
        <App />
      </Suspense>
    </RemoteErrorBoundary>
  );
};

function App() {
  const [page, setPage] = useState<"events" | "dashboard">("events");
  const config = window.__EVENTHUB_CONFIG__;
  const remote =
    page === "events"
      ? {
          scope: "eventCatalog",
          url: config.eventsRemoteUrl.startsWith("$")
            ? "http://localhost:3001/remoteEntry.js"
            : config.eventsRemoteUrl,
        }
      : {
          scope: "hostDashboard",
          url: config.dashboardRemoteUrl.startsWith("$")
            ? "http://localhost:3002/remoteEntry.js"
            : config.dashboardRemoteUrl,
        };
  return (
    <main>
      <header>
        <a className="brand" href="#events">
          EventHub
        </a>
        <nav>
          <button
            className={page === "events" ? "active" : ""}
            onClick={() => setPage("events")}
          >
            Explore events
          </button>
          <button
            className={page === "dashboard" ? "active" : ""}
            onClick={() => setPage("dashboard")}
          >
            Host dashboard
          </button>
        </nav>
      </header>
      <section className="content">
        <RemoteView key={page} {...remote} />
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
