# Product Validation

## Browser arena

The ChessEngine Arena browser companion was verified in a live Chromium session. The initial position loaded the compiled C++ WebAssembly module successfully, reporting a real depth-3 evaluation, node count, and principal variation. A legal `e2e4` move was accepted by the board; the native engine replied with `b8c6` at depth 4 and refreshed the position data.

## Native engine

The Release CMake build and all 11 registered CTest targets passed after adding the WebAssembly bridge. The standalone Emscripten build script generated modular ES-module and `.wasm` artifacts, which were used directly by the browser arena.

## Limits

The arena is an in-browser single-player product. It deliberately does not represent the native engine as connected until the WebAssembly module has loaded. If loading fails, a clearly labelled client-side legal-move fallback keeps the board usable.
