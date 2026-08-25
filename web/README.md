# ChessIQ Web Workstation

This workspace contains the static public-facing ChessIQ analysis preview. It is intentionally limited to visual interaction and local sample data; the existing C++ engine remains separate from this UI through the Embind/WebAssembly bridge in `src/web/wasm_bridge.cpp`.

## Preview capability

The flagship ChessIQ Analysis screen implements the **Intelligence in Motion** visual system. It includes a FEN-rendered board, selected-square feedback, evaluation spine, hoverable and clickable evaluation trace, synchronized notation, beginner and advanced engine density modes, IQ Pulse, Analysis Thread, classification states, critical-moment review, a Try Again practice sheet, dark/light themes, reduced-motion support, and public-facing metadata.

Current displayed chess data is explicitly labelled local development sample data. It must not be represented as a user’s history, personal statistics, account, or real server-side engine response.

## Real product

The authenticated ChessIQ product is in [`../app/`](../app/). It contains the Node and tRPC server, database migration and user-scoped persistence, OAuth integration, legal play flows, PGN import/export, lessons, puzzles, progress, coaching, and bounded C++ UCI analysis. Use [`../app/docs/CHESSIQ_FULLSTACK_DEPLOYMENT.md`](../app/docs/CHESSIQ_FULLSTACK_DEPLOYMENT.md) for full-stack deployment requirements.

## Run locally

```bash
pnpm install
pnpm dev
```

Use `pnpm check` for TypeScript validation and `pnpm build` for the production bundle.

## Historical engine integration path

1. Build `chessengine-wasm.js` and `chessengine-wasm.wasm` with `tools/build-wasm.sh`.
2. Place the generated browser assets in the frontend deployment pipeline.
3. Add a typed engine client that loads the modularized Emscripten module and calls `analyzePosition(fen, depth)`.
4. Convert selected PGN plies to FEN and normalize bridge responses into the contracts in `client/src/types/analysis.ts`.
5. Replace the local sample data incrementally with WebAssembly results, PGN state, Multi-PV, classification, and persisted history.

The audit, design system, and visual validation documents are located in `../docs/`. The active product validation and full-stack handoff documents are located in `../app/docs/`.
