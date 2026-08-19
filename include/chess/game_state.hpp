#pragma once

#include "chess/move.hpp"
#include "chess/position.hpp"

#include <vector>

namespace chess {

class GameState {
public:
    GameState() noexcept = default;
    explicit GameState(Position position);

    const Position& position() const noexcept { return position_; }
    const std::vector<Move>& moveHistory() const noexcept { return moves_; }
    const std::vector<Position>& positionHistory() const noexcept { return history_; }

    bool makeMove(const Move& move);
    bool unmakeMove() noexcept;

private:
    Position position_;
    std::vector<Position> history_;
    std::vector<Move> moves_;
};

} // namespace chess
