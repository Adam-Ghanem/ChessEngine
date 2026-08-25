#pragma once

#include "chess/game_state.hpp"

namespace chess {

enum class GameStatus {
    Ongoing,
    Checkmate,
    Stalemate,
    FiftyMoveDraw,
    ThreefoldRepetition,
    InsufficientMaterial,
};

bool isInCheck(const Position& position) noexcept;
bool isCheckmate(const Position& position) noexcept;
bool isStalemate(const Position& position) noexcept;
bool isInsufficientMaterial(const Position& position) noexcept;
bool isThreefoldRepetition(const GameState& state) noexcept;
GameStatus gameStatus(const GameState& state) noexcept;

} // namespace chess
