terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 6.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

resource "google_artifact_registry_repository" "eventhub" {
  location = var.region
  repository_id = "eventhub"
  format = "DOCKER"
}

resource "google_cloud_run_v2_service" "events" {
  name     = "eventhub-events"
  location = var.region

  template {
    containers {
      image = var.events_image

      ports {
        container_port = 80
      }
    }
  }
}

resource "google_cloud_run_v2_service" "dashboard" {
  name     = "eventhub-host-dashboard"
  location = var.region

  template {
    containers {
      image = var.dashboard_image

      ports {
        container_port = 80
      }
    }
  }
}

resource "google_cloud_run_v2_service" "shell" {
  name     = "eventhub-shell"
  location = var.region

  template {
    containers {
      image = var.shell_image

      ports {
        container_port = 80
      }

      env {
        name  = "EVENTS_REMOTE_URL"
        value = "${google_cloud_run_v2_service.events.uri}/remoteEntry.js"
      }

      env {
        name  = "DASHBOARD_REMOTE_URL"
        value = "${google_cloud_run_v2_service.dashboard.uri}/remoteEntry.js"
      }
    }
  }
}

# POC only: browser clients must fetch all three services. Replace this with IAP or a load-balancer identity boundary before production.
resource "google_cloud_run_v2_service_iam_member" "public" {
  for_each = toset([google_cloud_run_v2_service.shell.name, google_cloud_run_v2_service.events.name, google_cloud_run_v2_service.dashboard.name])
  location = var.region
  name = each.value
  role = "roles/run.invoker"
  member = "allUsers"
}
