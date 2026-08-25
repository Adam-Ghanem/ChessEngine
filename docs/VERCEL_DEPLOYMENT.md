# Vercel Deployment

# ChessIQ Deployment Targets

The repository includes two intentionally different ChessIQ delivery paths. The `web/` directory is a static Vercel preview of the analysis UI. The real authenticated product is the full-stack application in `app/`, which requires a Node server, database, OAuth callback configuration, and a compiled C++ engine process.

## Project settings

| Setting | Static visual preview | Real product |
| --- | --- |
| Source directory | `web` | `app` |
| Hosting model | Vercel static deployment | Docker-capable Node hosting |
| Build command | `pnpm run build:vercel` | `docker build -t chessiq ./app` |
| Output/runtime | `dist/public` static files | Node server and C++ UCI executable |
| Accounts, saved data, and protected API | No | Yes, after OAuth and database configuration |
| Engine analysis | UI preview only | First-party C++ engine process |

The Vercel preview no longer depends on Manus-only `/manus-storage` paths at runtime. The ChessIQ mark is code-rendered and the CC0 chess pieces reference their public upstream SVG sources. It remains useful for visual review, but it must not be presented as the persisted ChessIQ product. For the production service, follow [`../app/docs/CHESSIQ_FULLSTACK_DEPLOYMENT.md`](../app/docs/CHESSIQ_FULLSTACK_DEPLOYMENT.md).
