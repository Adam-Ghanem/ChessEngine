# Vercel Deployment

The frontend is configured for a static Vercel deployment from the `web/` repository directory. The committed `vercel.json` uses `pnpm run build:vercel` and serves the Vite output directory at `dist/public`.

## Project settings

| Setting | Value |
| --- | --- |
| Root Directory | `web` |
| Build Command | `pnpm run build:vercel` |
| Output Directory | `dist/public` |
| Install Command | `pnpm install --frozen-lockfile` |

The frontend no longer depends on Manus-only `/manus-storage` paths at runtime. The ChessIQ mark is code-rendered and the CC0 chess pieces reference their public upstream SVG sources.
