#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="${1:-/home/ubuntu/webdev-static-assets/chessengine-wasm}"

mkdir -p "$OUTPUT_DIR"

em++ \
  -std=c++20 \
  -O3 \
  -I"$ROOT_DIR/include" \
  "$ROOT_DIR/src/chess/position.cpp" \
  "$ROOT_DIR/src/chess/move_generator.cpp" \
  "$ROOT_DIR/src/chess/legal_move_generator.cpp" \
  "$ROOT_DIR/src/chess/game_state.cpp" \
  "$ROOT_DIR/src/chess/game_status.cpp" \
  "$ROOT_DIR/src/chess/engine.cpp" \
  "$ROOT_DIR/src/web/wasm_bridge.cpp" \
  -lembind \
  -s MODULARIZE=1 \
  -s EXPORT_ES6=1 \
  -s ENVIRONMENT=web \
  -s ALLOW_MEMORY_GROWTH=1 \
  -s DISABLE_EXCEPTION_CATCHING=0 \
  -o "$OUTPUT_DIR/chessengine-wasm.js"

printf 'ChessEngine WebAssembly assets generated in %s\n' "$OUTPUT_DIR"
