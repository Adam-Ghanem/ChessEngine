#include "chess/perft.hpp"

#include "chess/game_state.hpp"
#include "chess/move_generator.hpp"

namespace chess {

std::uint64_t perft(const Position& position, int depth) {
    if (depth <= 0) return 1;

    const std::vector<Move> moves = generateLegalMoves(position);
    if (depth == 1) return static_cast<std::uint64_t>(moves.size());

    std::uint64_t nodes = 0;
    for (const Move& move : moves) {
        GameState state(position);
        if (!state.makeMove(move)) continue;
        nodes += perft(state.position(), depth - 1);
    }
    return nodes;
}

std::vector<PerftDivideEntry> perftDivide(const Position& position, int depth) {
    std::vector<PerftDivideEntry> result;
    if (depth <= 0) return result;

    const std::vector<Move> moves = generateLegalMoves(position);
    result.reserve(moves.size());
    for (const Move& move : moves) {
        GameState state(position);
        if (!state.makeMove(move)) continue;
        result.push_back({move, perft(state.position(), depth - 1)});
    }
    return result;
}

} // namespace chess
