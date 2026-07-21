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

## Updating a remote

For normal product work, edit only the chosen remote's `src/feature/` directory:

- `apps/events/src/feature/` contains the event catalog UI, data, and styles.
- `apps/host-dashboard/src/feature/` contains the host dashboard UI, data, and styles.

Do not change `src/platform/` for feature work. It owns the stable Custom Element registration and standalone mount. A remote must keep its `elementName` and `register()` exports so the shell can continue to load it.

### Changing a remote's React version

React is private to each remote. For example, to downgrade only `events` to React 18.2.0:

```bash
npm install --workspace=@eventhub/events --save-exact react@18.2.0 react-dom@18.2.0
npm install --workspace=@eventhub/events --save-dev --save-exact @types/react@18 @types/react-dom@18
npm run verify:events
```

This updates `apps/events/package.json` and the root lockfile only. The shell and `host-dashboard` do not need matching React versions or a rebuild. For React 17, adapt `apps/events/src/platform/custom-element.tsx`: `react-dom/client` and `createRoot` are React 18 APIs, so use React 17's `ReactDOM.render` and `unmountComponentAtNode` instead.

### Releasing one compatible remote to GCP

If a change preserves the remote's Custom Element contract, build and deploy that remote alone. Use a unique image tag and keep the image references for the untouched services at their currently deployed values in your Terraform variables.

```bash
export PROJECT_ID="eventhubpoc"
export REGION="europe-west1"
export REPOSITORY="eventhub"
export TAG="events-20260721"

gcloud builds submit . \
  --config=infra/cloudbuild/events.yaml \
  --substitutions=_REGION="$REGION",_REPOSITORY="$REPOSITORY",_TAG="$TAG"

cd infra
terraform apply \
  -var="project_id=$PROJECT_ID" \
  -var="events_image=$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/events:$TAG" \
  -var="shell_image=THE_CURRENT_SHELL_IMAGE" \
  -var="dashboard_image=THE_CURRENT_DASHBOARD_IMAGE"
```

Use `host-dashboard.yaml` and `dashboard_image` for the equivalent dashboard release. A change to `elementName`, `register()`, or the exposed `./element` module is a breaking host-contract change: deploy the shell and both remotes together in a maintenance window. For no-downtime migration, publish the new remote under a separate versioned URL before pointing a new shell revision at it.

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

### Building and deploying a full release

Authenticate with the Google Cloud CLI, select the target project, and use one unique tag for the three images:

```bash
export PROJECT_ID="YOUR_PROJECT_ID"
export REGION="europe-west1"
export REPOSITORY="eventhub"
export TAG="release-YYYYMMDD"

gcloud auth login
gcloud auth application-default login
gcloud config set project "$PROJECT_ID"

gcloud builds submit . \
  --config=infra/cloudbuild/events.yaml \
  --substitutions=_REGION="$REGION",_REPOSITORY="$REPOSITORY",_TAG="$TAG"

gcloud builds submit . \
  --config=infra/cloudbuild/host-dashboard.yaml \
  --substitutions=_REGION="$REGION",_REPOSITORY="$REPOSITORY",_TAG="$TAG"

gcloud builds submit . \
  --config=infra/cloudbuild/shell.yaml \
  --substitutions=_REGION="$REGION",_REPOSITORY="$REPOSITORY",_TAG="$TAG"
```

Review the resulting infrastructure change before applying it:

```bash
cd infra
terraform init
terraform plan \
  -out=tfplan \
  -var="project_id=$PROJECT_ID" \
  -var="region=$REGION" \
  -var="events_image=$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/events:$TAG" \
  -var="dashboard_image=$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/host-dashboard:$TAG" \
  -var="shell_image=$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/shell:$TAG"
terraform apply tfplan
terraform output shell_url
```

Open the reported shell URL in a fresh browser session and verify both navigation entries. For a rollback, repeat the Terraform apply with the three previously deployed, immutable image tags. Do not reuse mutable tags such as `latest`.

The earlier [single-remote release procedure](#releasing-one-compatible-remote-to-gcp) is sufficient only when its Custom Element contract is unchanged. A contract migration needs the full release above; use parallel versioned remote URLs if users cannot tolerate a mixed-version period.

url: https://eventhub-shell-3hsa4plphq-ew.a.run.app
