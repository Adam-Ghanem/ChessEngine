#include "chess/engine.hpp"

#include <cassert>
#include <iostream>

int main() {
    using namespace chess;

    Position start;
    GameState state(start);
    assert(state.position().sideToMove() == Color::White);
    assert(state.makeNullMove());
    assert(state.position().sideToMove() == Color::Black);
    assert(state.position().enPassantSquare() == Square::None);
    assert(state.unmakeNullMove());
    assert(state.position().sideToMove() == Color::White);

    Position winning = Position::fromFEN("7k/5Q2/7K/8/8/8/8/8 w - - 0 1");
    SearchLimits depth4;
    depth4.depth = 4;

    Engine withNull;
    const SearchResult pruned = withNull.search(winning, depth4);
    assert(pruned.bestMove.encoded() != 0);
    assert(pruned.score > 29000);

    Engine withoutNull;
    withoutNull.setNullMovePruning(false);
    const SearchResult baseline = withoutNull.search(winning, depth4);
    assert(baseline.bestMove.encoded() != 0);
    assert(baseline.score > 29000);

    Engine isolated;
    isolated.setNullMovePruning(false);
    isolated.setLmr(false);
    isolated.setFutilityPruning(false);
    const SearchResult isolatedResult = isolated.search(start, depth4);
    assert(isolatedResult.depth == 4);
    assert(isolatedResult.nodes > 0);

    std::cout << "M22 null-move pruning tests passed\n";
    return 0;
}
