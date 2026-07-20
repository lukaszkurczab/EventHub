output "shell_url" { value = google_cloud_run_v2_service.shell.uri }
output "events_remote_url" { value = "${google_cloud_run_v2_service.events.uri}/remoteEntry.js" }
output "dashboard_remote_url" { value = "${google_cloud_run_v2_service.dashboard.uri}/remoteEntry.js" }
