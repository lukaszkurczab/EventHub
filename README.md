# EventHub Microfrontends

EventHub is a proof of concept for an event-discovery platform. The user-facing shell is an independent application that composes separately owned and deployed microfrontends from runtime configuration:

- **Event catalog** — browse upcoming events.
- **Host dashboard** — manage a host's event portfolio.

The shell uses TypeScript and browser DOM APIs. The remotes use React internally and are delivered through Webpack 5 Module Federation, with Cloud Run, Cloud Build, Artifact Registry, and Terraform for deployment.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Each application keeps a stable local port: shell 3000, catalog 3001, and host dashboard 3002.

```bash
npm run typecheck
npm run build
npm run verify:independence
```

`verify:independence` builds and checks `events` and `host-dashboard` separately. Both applications have their own versioned workspace package, dependency declaration, Module Federation artifact, Dockerfile, and Cloud Build definition. Each remote exposes and registers a Custom Element; the shell does not import either package or share its framework runtime.

To build one remote only:

```bash
npm run verify:events
npm run verify:host-dashboard
```

## GCP deployment

The infrastructure is parameterised, so no GCP project, credentials, or image registry are committed. See [docs/architecture.md](docs/architecture.md) and `infra/` for the deployment model. The intended first deployment is:

```bash
cd infra
terraform init
terraform apply \
  -var='project_id=YOUR_PROJECT_ID' \
  -var='shell_image=REGION-docker.pkg.dev/YOUR_PROJECT_ID/eventhub/shell:TAG' \
  -var='events_image=REGION-docker.pkg.dev/YOUR_PROJECT_ID/eventhub/events:TAG' \
  -var='dashboard_image=REGION-docker.pkg.dev/YOUR_PROJECT_ID/eventhub/host-dashboard:TAG'
```

Cloud Build definitions live in `infra/cloudbuild/` and each builds exactly one image (`shell.yaml`, `events.yaml`, or `host-dashboard.yaml`). Terraform manages the Cloud Run services and injects the remote URLs into the shell at runtime.

url: https://eventhub-shell-3hsa4plphq-ew.a.run.app
