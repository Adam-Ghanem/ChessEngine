# ChessIQ Web Workstation

This workspace contains the first public-facing ChessIQ product surface: a responsive chess-analysis corridor built around understanding. The existing C++ engine remains separate from this UI. Its browser boundary is the Embind/WebAssembly bridge in `src/web/wasm_bridge.cpp`.

## Current capability

The flagship ChessIQ Analysis screen implements the **Intelligence in Motion** visual system. It includes a FEN-rendered board, selected-square feedback, evaluation spine, hoverable and clickable evaluation trace, synchronized notation, beginner and advanced engine density modes, IQ Pulse, Analysis Thread, classification states, critical-moment review, a Try Again practice sheet, dark/light themes, reduced-motion support, and public-facing metadata.

Current displayed chess data is an explicitly labelled local development sample. It is structured in `client/src/data/sampleAnalysis.ts` to be replaced by live values rather than represented as user history or personal statistics.

## Run locally

```bash
pnpm install
pnpm dev
```

Use `pnpm check` for TypeScript validation and `pnpm build` for the production bundle.

## Engine integration path

1. Build `chessengine-wasm.js` and `chessengine-wasm.wasm` with `tools/build-wasm.sh`.
2. Place the generated browser assets in the frontend deployment pipeline.
3. Add a typed engine client that loads the modularized Emscripten module and calls `analyzePosition(fen, depth)`.
4. Convert selected PGN plies to FEN and normalize bridge responses into the contracts in `client/src/types/analysis.ts`.
5. Replace the local sample data incrementally with WebAssembly results, PGN state, Multi-PV, classification, and persisted history.

The audit, design system, and visual validation documents are located in `../docs/`.
