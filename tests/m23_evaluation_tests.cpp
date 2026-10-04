#include "chess/engine.hpp"

#include <cassert>
#include <iostream>

int main() {
    using namespace chess;

    Engine engine;

    // Two equal-material positions with the same pawn-square and passed-pawn
    // bonuses. The c4/d4 pair is connected; d4/f4 are both isolated.
    const Position connected =
        Position::fromFEN("k7/8/8/8/2PP4/8/8/7K w - - 0 1");
    const Position isolated =
        Position::fromFEN("k7/8/8/8/3P1P2/8/8/7K w - - 0 1");

    const int connectedScore = engine.evaluate(connected);
    const int isolatedScore = engine.evaluate(isolated);
    assert(connectedScore > isolatedScore);

    // The endgame king PST is vertically symmetric. d4 and d5 must therefore
    // receive the same king-placement score when every other term is fixed.
    const Position kingD4 =
        Position::fromFEN("k7/8/8/8/3K4/8/8/8 w - - 0 1");
    const Position kingD5 =
        Position::fromFEN("k7/8/8/3K4/8/8/8/8 w - - 0 1");
    assert(engine.evaluate(kingD4) == engine.evaluate(kingD5));

    std::cout << "M23 evaluation correctness tests passed\n";
    return 0;
}
