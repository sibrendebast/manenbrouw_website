# Prisma Docker Backup Dashboard

A production-ready, Dockerized system for automatically backing up your Prisma-managed databases (PostgreSQL or MySQL) with a sleek web dashboard.

## Features
- **Automated Backups:** Uses standard Cron syntax to schedule dumps.
- **Native Tools:** Uses `pg_dump` and `mysqldump` natively instead of JSON loops.
- **Web Dashboard:** A clean Tailwind CSS interface to manage configs, trigger manual runs, and download backup files.
- **Rotation:** Automatically deletes old backups to save storage.
- **Logs:** Real-time visibility into the backup engine.

## Setup & Execution

1. **Configure Environment:**
    You can either pass variables directly in `docker-compose.yml` or create an `.env` file in this directory.
    ```bash
    DATABASE_URL="postgres://user:pass@host:5432/db?sslmode=require"
    BACKUP_CRON_SCHEDULE="0 2 * * *"  # Runs at 2 AM daily
    BACKUP_RETENTION_COUNT=7          # Keeps the last 7 backups
    TZ="Europe/Brussels"              # Important for Cron accuracy
    ```
    *Note: if your Prisma URL uses pooling (e.g. `?pgbouncer=true`), you must provide the direct connection string instead so that `pg_dump` works properly.*

2. **Start the Service:**
    ```bash
    docker-compose up -d --build
    ```

3. **Access Dashboard:**
    Open `http://localhost:8080` in your browser.

## Volumes
- `./backups`: The raw `.sql` or `.dump` files are saved here. This directory is safe to copy/sync elsewhere.
- `./backup-system.log`: Persists the application output logs.

## Security Considerations & Production Best Practices

- **Basic Auth:** By default, the `/api/*` routes and the dashboard are open. In a production environment facing the public internet, you *must* restrict access. You can add Basic Authentication to Express in `server.js` using a package like `express-basic-auth` or place this container behind an NGINX proxy that requires authentication.
- **Network Isolation:** Do not expose port 8080 to the generic web. Keep it on an internal Docker network, reachable only by an authenticated reverse proxy or via a VPN.
- **Read-Only Credentials:** If possible, create a distinct Postgres user with read-only access to all tables specifically for the backup job, rather than using your superuser Prisma URL.
- **Off-site Sync:** The retention policy works locally. For true disaster recovery, you should configure a secondary cron job on the host machine to sync the `./backups` folder to S3 (e.g., using `aws-cli`).
