#include "chess/move_generator.hpp"

#include <cassert>
#include <iostream>

namespace {

bool hasMove(const std::vector<chess::Move>& moves, chess::Square from, chess::Square to,
             chess::MoveType type = chess::MoveType::Quiet) {
    for (const auto& move : moves) {
        if (move.from() == from && move.to() == to && move.type() == type) return true;
    }
    return false;
}

} // namespace

int main() {
    using namespace chess;

    {
        const Position position;
        const auto moves = generateLegalMoves(position);
        assert(moves.size() == 20);
    }

    {
        const Position position = Position::fromFEN("4r1k1/8/8/8/8/8/4R3/4K3 w - - 0 1");
        const auto moves = generateLegalMoves(position);
        assert(hasMove(moves, Square::E2, Square::E8, MoveType::Capture));
        assert(!hasMove(moves, Square::E2, Square::A2));
    }

    {
        const Position position = Position::fromFEN("r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1");
        const auto moves = generateLegalMoves(position);
        assert(hasMove(moves, Square::E1, Square::G1, MoveType::CastleKingside));
        assert(hasMove(moves, Square::E1, Square::C1, MoveType::CastleQueenside));
    }

    {
        const Position position = Position::fromFEN("4r1k1/8/8/3pP3/8/8/8/4K3 w - d6 0 1");
        const auto moves = generateLegalMoves(position);
        assert(!hasMove(moves, Square::E5, Square::D6, MoveType::EnPassant));
    }

    {
        const Position position = Position::fromFEN("4r1k1/8/8/8/8/8/8/4K2R w K - 0 1");
        const auto moves = generateLegalMoves(position);
        assert(!hasMove(moves, Square::E1, Square::G1, MoveType::CastleKingside));
    }

    std::cout << "M6 legal move tests passed\n";
    return 0;
}
