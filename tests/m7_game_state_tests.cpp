#include "chess/game_state.hpp"

#include <cassert>
#include <iostream>

int main() {
    using namespace chess;

    {
        GameState state;
        const Position initial = state.position();
        assert(state.makeMove(Move::quiet(Square::E2, Square::E4)));
        assert(state.position().toFEN() == "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1");
        assert(state.unmakeMove());
        assert(state.position() == initial);
        assert(!state.unmakeMove());
    }

    {
        GameState state(Position::fromFEN("4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1"));
        const Position before = state.position();
        assert(state.makeMove(Move::enPassant(Square::E5, Square::D6)));
        assert(state.position().pieceAt(Square::D6) == Piece::WhitePawn);
        assert(state.position().pieceAt(Square::D5) == Piece::Empty);
        assert(state.unmakeMove());
        assert(state.position() == before);
    }

    {
        GameState state(Position::fromFEN("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1"));
        assert(state.makeMove(Move::castleKingside(Square::E1, Square::G1)));
        assert(state.position().pieceAt(Square::G1) == Piece::WhiteKing);
        assert(state.position().pieceAt(Square::F1) == Piece::WhiteRook);
        assert(!state.position().canCastleKingside(Color::White));
        assert(state.unmakeMove());
    }

    {
        GameState state(Position::fromFEN("4k3/P7/8/8/8/8/8/4K3 w - - 0 1"));
        assert(state.makeMove(Move::promotion(Square::A7, Square::A8, PieceType::Queen)));
        assert(state.position().pieceAt(Square::A8) == Piece::WhiteQueen);
        assert(state.unmakeMove());
    }

    {
        GameState state;
        assert(!state.makeMove(Move::quiet(Square::E2, Square::E5)));
    }

    std::cout << "M7 game state tests passed\n";
    return 0;
}
