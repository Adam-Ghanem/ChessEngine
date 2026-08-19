#include "chess/engine.hpp"
#include "chess/move_generator.hpp"

#include <cassert>
#include <iostream>
#include <string>

int main() {
    using namespace chess;

    Engine engine;
    Position start;

    assert(generateLegalMoves(start).size() == 20);
    assert(engine.evaluate(start) == 0);

    SearchLimits depthOne;
    depthOne.depth = 1;
    const SearchResult result = engine.search(start, depthOne);
    assert(result.depth == 1);
    assert(result.nodes > 0);
    assert(result.bestMove.encoded() != 0);

    Position winning = Position::fromFEN("7k/5Q2/7K/8/8/8/8/8 w - - 0 1");
    const SearchResult mate = engine.search(winning, depthOne);
    assert(mate.bestMove.encoded() != 0);
    assert(mate.score > 29000);

    Position black = Position::fromFEN("7k/5q2/7K/8/8/8/8/8 b - - 0 1");
    assert(engine.evaluate(black) < 0);

    std::cout << "M10 search tests passed\n";
    return 0;
}
