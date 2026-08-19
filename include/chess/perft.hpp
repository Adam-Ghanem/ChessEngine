#pragma once

#include "chess/position.hpp"

#include <cstdint>
#include <vector>

namespace chess {

std::uint64_t perft(const Position& position, int depth);

struct PerftDivideEntry {
    Move move;
    std::uint64_t nodes;
};

std::vector<PerftDivideEntry> perftDivide(const Position& position, int depth);

} // namespace chess
