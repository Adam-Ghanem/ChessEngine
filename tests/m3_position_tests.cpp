#include "chess/position.hpp"

#include <cassert>
#include <stdexcept>
#include <string>
#include <vector>

using chess::Color;
using chess::Piece;
using chess::Position;
using chess::Square;

namespace {

void expectInvalid(const std::string& fen) {
    bool rejected = false;
    try {
        (void)Position::fromFEN(fen);
    } catch (const std::invalid_argument&) {
        rejected = true;
    }
    assert(rejected);
}

} // namespace

int main() {
    const Position initial;
    assert(initial.toFEN() == "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
    assert(initial.sideToMove() == Color::White);
    assert(initial.enPassantSquare() == Square::None);
    assert(initial.halfmoveClock() == 0);
    assert(initial.fullmoveNumber() == 1);
    assert(initial.canCastleKingside(Color::White));
    assert(initial.canCastleQueenside(Color::White));
    assert(initial.canCastleKingside(Color::Black));
    assert(initial.canCastleQueenside(Color::Black));
    assert(initial.whiteOccupancy() == 0x000000000000FFFFULL);
    assert(initial.blackOccupancy() == 0xFFFF000000000000ULL);

    const Position empty = Position::fromFEN("8/8/8/8/8/8/8/8 w - - 0 1");
    assert(empty.occupancy() == 0);
    assert(empty.toFEN() == "8/8/8/8/8/8/8/8 w - - 0 1");

    const std::vector<std::string> validFens = {
        "8/8/8/8/8/8/8/8 b - - 10 20",
        "4k3/8/8/3pP3/8/8/8/4K3 w KQkq e6 99 100",
        "r3k2r/pp1q1ppp/2npbn2/8/2B5/2NP1N2/PP3PPP/R2Q1RK1 b KQkq - 0 1",
        "8/1P6/2n5/3Q4/8/5b2/6p1/4K3 b - b3 10 20",
    };
    for (const auto& fen : validFens) {
        const Position first = Position::fromFEN(fen);
        const Position second = Position::fromFEN(first.toFEN());
        assert(first == second);
    }

    const Position black = Position::fromFEN("8/8/8/8/8/8/8/K6k b - - 10 20");
    assert(black.sideToMove() == Color::Black);
    assert(black.toFEN() == "8/8/8/8/8/8/8/K6k b - - 10 20");

    const std::vector<std::string> castlingFens = {
        "8/8/8/8/8/8/8/8 w K - 0 1",
        "8/8/8/8/8/8/8/8 w Q - 0 1",
        "8/8/8/8/8/8/8/8 w k - 0 1",
        "8/8/8/8/8/8/8/8 w q - 0 1",
        "8/8/8/8/8/8/8/8 w KQ - 0 1",
        "8/8/8/8/8/8/8/8 w kq - 0 1",
        "8/8/8/8/8/8/8/8 w KQkq - 0 1",
        "8/8/8/8/8/8/8/8 w - - 0 1",
    };
    for (const auto& fen : castlingFens) {
        assert(Position::fromFEN(fen).toFEN() == fen);
    }

    const Position pieces = Position::fromFEN("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq e3 99 100");
    assert(pieces.pieces(Piece::WhiteKing) == chess::squareBit(Square::E1));
    assert(pieces.pieces(Piece::BlackKing) == chess::squareBit(Square::E8));
    assert(pieces.pieces(Piece::WhiteQueen) == chess::squareBit(Square::D1));
    assert(pieces.pieces(Piece::BlackQueen) == chess::squareBit(Square::D8));
    assert(pieces.enPassantSquare() == Square::E3);

    expectInvalid("8/8/8/8/8/8/8/8 x - - 0 1");
    expectInvalid("8/8/8/8/8/8/8/8 w X - 0 1");
    expectInvalid("8/8/8/8/8/8/8/8 w - i4 0 1");
    expectInvalid("8/8/8/8/8/8/8/8 w - a4 0 1");
    expectInvalid("8/8/8/8/8/8/8 w - - 0 1");
    expectInvalid("8/8/8/8/8/8/8/9 w - - 0 1");
    expectInvalid("8/8/8/8/8/8/8/7 w - - 0 1");
    expectInvalid("8/8/8/8/8/8/8/8 w - - -1 1");
    expectInvalid("8/8/8/8/8/8/8/8 w - - 0 0");
    expectInvalid("8/8/8/8/8/8/8/8 w - - 0 1 extra");
    expectInvalid("8/8/8/8/8/8/8/8 w - - 0");
    expectInvalid("8/8/8/8/8/8/8/8 w KK - 0 1");
    expectInvalid("8/8/8/8/8/8/8/8 w - - 0 1z");

    return 0;
}
