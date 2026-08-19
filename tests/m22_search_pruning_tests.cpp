#include "chess/engine.hpp"

#include <cassert>
#include <iostream>

namespace {

chess::SearchResult searchWithLmr(const chess::Position& position, int depth, bool enabled) {
    chess::Engine engine;
    engine.setNullMovePruning(true);
    engine.setLmr(enabled);
    engine.setFutilityPruning(false);

    chess::SearchLimits limits;
    limits.depth = depth;
    return engine.search(position, limits);
}

} // namespace

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

    const SearchResult mateOff = searchWithLmr(winning, 4, false);
    const SearchResult mateOn = searchWithLmr(winning, 4, true);
    assert(mateOff.score == mateOn.score);
    assert(mateOff.bestMove == mateOn.bestMove);
    assert(mateOn.score > 29000);

    Position secondMate = Position::fromFEN("7k/6Q1/6K1/8/8/8/8/8 b - - 0 1");
    const SearchResult secondOff = searchWithLmr(secondMate, 4, false);
    const SearchResult secondOn = searchWithLmr(secondMate, 4, true);
    assert(secondOff.score == secondOn.score);
    assert(secondOff.bestMove == secondOn.bestMove);
    assert(secondOn.score < -29000);

    const SearchResult nodesOff = searchWithLmr(start, 5, false);
    const SearchResult nodesOn = searchWithLmr(start, 5, true);
    assert(nodesOff.score == nodesOn.score);
    assert(nodesOff.nodes > 0);
    assert(nodesOn.nodes < nodesOff.nodes);

    std::cout << "M22.2 LMR tests passed\n";
    std::cout << "LMR nodes: " << nodesOn.nodes
              << " vs disabled: " << nodesOff.nodes << '\n';
    return 0;
}
