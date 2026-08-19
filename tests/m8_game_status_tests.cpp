#include "chess/game_status.hpp"

#include <cassert>

using namespace chess;

int main() {
    {
        const Position position = Position::fromFEN("7k/6Q1/6K1/8/8/8/8/8 b - - 0 1");
        assert(isInCheck(position));
        assert(isCheckmate(position));
        assert(!isStalemate(position));
    }

    {
        const Position position = Position::fromFEN("7k/5Q2/6K1/8/8/8/8/8 b - - 0 1");
        assert(!isInCheck(position));
        assert(isStalemate(position));
        assert(!isCheckmate(position));
    }

    {
        const Position kings = Position::fromFEN("7k/8/8/8/8/8/8/K7 w - - 0 1");
        assert(isInsufficientMaterial(kings));

        const Position bishop = Position::fromFEN("7k/8/8/8/8/8/1B6/K7 w - - 0 1");
        assert(isInsufficientMaterial(bishop));

        const Position rook = Position::fromFEN("7k/8/8/8/8/8/1R6/K7 w - - 0 1");
        assert(!isInsufficientMaterial(rook));
    }

    {
        const Position fifty = Position::fromFEN("7k/8/8/8/8/8/2N5/K6n w - - 100 75");
        GameState state(fifty);
        assert(gameStatus(state) == GameStatus::FiftyMoveDraw);
    }

    {
        const Position repetition = Position::fromFEN("7k/8/8/8/8/8/8/K6N w - - 0 1");
        GameState state(repetition);
        assert(state.makeMove(Move::quiet(Square::H1, Square::F2)));
        assert(state.makeMove(Move::quiet(Square::H8, Square::G7)));
        assert(state.makeMove(Move::quiet(Square::F2, Square::H1)));
        assert(state.makeMove(Move::quiet(Square::G7, Square::H8)));
        assert(state.makeMove(Move::quiet(Square::H1, Square::F2)));
        assert(state.makeMove(Move::quiet(Square::H8, Square::G7)));
        assert(state.makeMove(Move::quiet(Square::F2, Square::H1)));
        assert(state.makeMove(Move::quiet(Square::G7, Square::H8)));
        assert(isThreefoldRepetition(state));
        assert(gameStatus(state) == GameStatus::ThreefoldRepetition);
    }

    return 0;
}
