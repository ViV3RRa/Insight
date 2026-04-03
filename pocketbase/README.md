# PocketBase — Insight Backend

## Setup

Download and install the PocketBase binary:

```sh
npm run pb:setup
```

This detects your OS/architecture and downloads the correct binary to `pocketbase/pocketbase`.

## First-Time Admin

After starting PocketBase, create your admin account at:

```
http://127.0.0.1:8090/_/
```

## Running

### PocketBase only

```sh
npm run pb:serve
```

### Both PocketBase and Vite dev server

```sh
npm run dev
```

This uses `concurrently` to run PocketBase and Vite side by side.

## Migrations

Migration files live in `pocketbase/pb_migrations/` and are applied automatically on startup. They define all collections (settings, investment, home, vehicles) with ownership-based API rules.

## Data

The `pocketbase/pb_data/` directory is gitignored — it contains your local database and uploaded files.
