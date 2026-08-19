#pragma once

#include "chess/move.hpp"
#include "chess/position.hpp"

#include <vector>

namespace chess {

std::vector<Move> generatePseudoLegalMoves(const Position& position);
std::vector<Move> generateLegalMoves(const Position& position);

} // namespace chess
