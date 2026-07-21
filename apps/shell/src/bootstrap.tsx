import React, { Suspense, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { getRemotes, loadRemote, type RemoteDefinition } from "./remote-loader";
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

const RemoteView = ({ remote }: { remote: RemoteDefinition }) => {
  const App = useMemo(
    () =>
      React.lazy(() =>
        loadRemote(remote).then((defaultExport) => ({
          default: defaultExport,
        })),
      ),
    [remote],
  );
  return (
    <RemoteErrorBoundary feature={remote.navigationLabel}>
      <Suspense fallback={<p className="status">Loading feature…</p>}>
        <App />
      </Suspense>
    </RemoteErrorBoundary>
  );
};

function App({ remotes }: { remotes: RemoteDefinition[] }) {
  const [activeRemoteId, setActiveRemoteId] = useState(remotes[0].id);
  const activeRemote = remotes.find((remote) => remote.id === activeRemoteId) ?? remotes[0];

  return (
    <main>
      <header>
        <a className="brand" href="#events">
          EventHub
        </a>
        <nav>
          {remotes.map((remote) => (
            <button
              key={remote.id}
              className={activeRemote.id === remote.id ? "active" : ""}
              onClick={() => setActiveRemoteId(remote.id)}
            >
              {remote.navigationLabel}
            </button>
          ))}
        </nav>
      </header>
      <section className="content">
        <RemoteView key={activeRemote.id} remote={activeRemote} />
      </section>
    </main>
  );
}

const root = createRoot(document.getElementById("root")!);

try {
  root.render(<App remotes={getRemotes()} />);
} catch (error) {
  root.render(
    <section className="remote-error">
      <h2>Application configuration is unavailable.</h2>
      <p>{error instanceof Error ? error.message : "The shell cannot load its remotes."}</p>
    </section>,
  );
}
