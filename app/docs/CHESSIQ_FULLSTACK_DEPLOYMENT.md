# ChessIQ Full-Stack Deployment Handoff

## Deployment boundary

The real ChessIQ product is the full-stack application that lives in this project root. It contains the Node server, tRPC API, Manus OAuth integration, database schema and migrations, user-scoped persistence, and the staged first-party C++ engine source. Its production container compiles the engine with `g++`, builds the web application, and runs the resulting Node server.

The historical `web/` directory in the source repository remains a **static visual preview** for Vercel. It must not be described as the authenticated ChessIQ product: static hosting cannot run the protected API, connect to the managed database, complete the configured OAuth callback flow, or spawn the C++ UCI engine process.

| Deployment target | Source directory in the repository | Supports real accounts and saved data | Runs the C++ engine |
| --- | --- | --- | --- |
| Full-stack service | `app/` | Yes, after environment configuration | Yes |
| Static visual preview | `web/` | No | No |

## Full-stack container

Build the Docker image from the `app/` directory so the container receives the application source and the staged `engine/` source tree:

```bash
docker build -t chessiq ./app
docker run --rm -p 3000:3000 --env-file .env.production chessiq
```

The Dockerfile performs three production-critical steps: it installs `g++`, runs `pnpm run build:engine`, and sets `CHESSIQ_ENGINE_PATH=/app/engine/bin/ChessEngine` for the server. Do not mount or accept an engine executable path from end users.

## Required environment configuration

The deployment needs a managed MySQL-compatible `DATABASE_URL`, a strong `JWT_SECRET`, and the OAuth settings used by the app: `VITE_APP_ID`, `OAUTH_SERVER_URL`, and `VITE_OAUTH_PORTAL_URL`. Configure the OAuth provider callback to the deployed service’s `/api/oauth/callback` endpoint before testing sign-in. Do not commit values for these variables to source control.

## Release checks

Run the following in `app/` before publishing a new full-stack image:

```bash
pnpm run build:engine
pnpm check
pnpm test
pnpm build
pnpm test:accessibility
```

The repository’s root-level C++ engine remains independently buildable with CMake. The full-stack release does not modify the original engine implementation; it compiles the staged copy only to package a predictable runtime inside the application container.

## Publishing from the managed project

Within the managed ChessIQ project, create a checkpoint and use the **Publish** control in the project interface. The full-stack Docker configuration is already present to support the Node server and engine binary. The prior Vercel site can remain online as a visual preview, but it is not a substitute for this deployment.
