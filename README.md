# EventHub Microfrontends

EventHub is a proof of concept for an event-discovery platform. The user-facing shell composes two separately owned and deployed microfrontends:

- **Event catalog** — browse upcoming events.
- **Host dashboard** — manage a host's event portfolio.

The project uses React, TypeScript, Webpack 5 Module Federation, Cloud Run, Cloud Build, Artifact Registry, and Terraform.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Each application keeps a stable local port: shell 3000, catalog 3001, and host dashboard 3002.

```bash
npm run typecheck
npm run build
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

Cloud Build builds and pushes each application independently. Terraform manages the Cloud Run services and injects the remote URLs into the shell at runtime.

url: https://eventhub-shell-3hsa4plphq-ew.a.run.app
