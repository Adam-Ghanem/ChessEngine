#include "chess/move_generator.hpp"

#include <algorithm>
#include <array>
#include <cassert>
#include <vector>

using chess::Color;
using chess::Move;
using chess::MoveType;
using chess::PieceType;
using chess::Position;
using chess::Square;

namespace {

bool hasMove(const std::vector<Move>& moves, Square from, Square to,
             MoveType type, PieceType promotion = PieceType::None) {
    return std::find_if(moves.begin(), moves.end(), [&](const Move& move) {
        return move.from() == from && move.to() == to && move.type() == type
            && move.promotionPiece() == promotion;
    }) != moves.end();
}

int countFrom(const std::vector<Move>& moves, Square from) {
    return static_cast<int>(std::count_if(moves.begin(), moves.end(), [&](const Move& move) {
        return move.from() == from;
    }));
}

bool isFriendlyPiece(chess::Piece piece, Color color) {
    if (color == Color::White) {
        return piece >= chess::Piece::WhitePawn && piece <= chess::Piece::WhiteKing;
    }
    return piece >= chess::Piece::BlackPawn && piece <= chess::Piece::BlackKing;
}

void assertNoFriendlyCaptures(const Position& position, const std::vector<Move>& moves) {
    for (const Move& move : moves) {
        if (move.isEnPassant()) {
            continue;
        }
        assert(!(move.isCapture() && isFriendlyPiece(position.pieceAt(move.to()), position.sideToMove())));
    }
}

void testInitialPositions() {
    const auto white = chess::generatePseudoLegalMoves(Position::fromFEN(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"));
    const auto black = chess::generatePseudoLegalMoves(Position::fromFEN(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1"));
    assert(white.size() == 20);
    assert(black.size() == 20);
}

void testKnights() {
    const Position center = Position::fromFEN("8/8/8/2p5/4N3/8/8/8 w - - 0 1");
    const auto moves = chess::generatePseudoLegalMoves(center);
    assert(countFrom(moves, Square::E4) == 8);
    assert(hasMove(moves, Square::E4, Square::D6, MoveType::Quiet));
    assert(hasMove(moves, Square::E4, Square::C5, MoveType::Capture));
    assert(hasMove(moves, Square::E4, Square::F6, MoveType::Quiet));

    const Position corner = Position::fromFEN("N7/8/8/8/8/8/8/7k w - - 0 1");
    const auto cornerMoves = chess::generatePseudoLegalMoves(corner);
    assert(countFrom(cornerMoves, Square::A8) == 2);
    assert(hasMove(cornerMoves, Square::A8, Square::B6, MoveType::Quiet));
    assert(hasMove(cornerMoves, Square::A8, Square::C7, MoveType::Quiet));
}

void testBishops() {
    const Position empty = Position::fromFEN("8/8/8/8/3B4/8/8/8 w - - 0 1");
    const auto moves = chess::generatePseudoLegalMoves(empty);
    assert(countFrom(moves, Square::D4) == 13);

    const Position blocked = Position::fromFEN("8/8/8/2p5/3B4/4P3/8/8 w - - 0 1");
    const auto blockedMoves = chess::generatePseudoLegalMoves(blocked);
    assert(hasMove(blockedMoves, Square::D4, Square::C5, MoveType::Capture));
    assert(!hasMove(blockedMoves, Square::D4, Square::B6, MoveType::Quiet));
    assert(!hasMove(blockedMoves, Square::D4, Square::E3, MoveType::Quiet));
}

void testRooksAndQueens() {
    const Position rookPosition = Position::fromFEN("8/8/8/8/3R4/8/8/8 w - - 0 1");
    const auto rookMoves = chess::generatePseudoLegalMoves(rookPosition);
    assert(countFrom(rookMoves, Square::D4) == 14);

    const Position queenPosition = Position::fromFEN("8/8/8/8/3Q4/8/8/8 w - - 0 1");
    const auto queenMoves = chess::generatePseudoLegalMoves(queenPosition);
    assert(countFrom(queenMoves, Square::D4) == 27);
    assert(hasMove(queenMoves, Square::D4, Square::D8, MoveType::Quiet));
    assert(hasMove(queenMoves, Square::D4, Square::H8, MoveType::Quiet));

    const Position stopped = Position::fromFEN("8/8/8/3p4/3R4/8/8/8 w - - 0 1");
    const auto stoppedMoves = chess::generatePseudoLegalMoves(stopped);
    assert(hasMove(stoppedMoves, Square::D4, Square::D5, MoveType::Capture));
    assert(!hasMove(stoppedMoves, Square::D4, Square::D6, MoveType::Quiet));
}

void testKings() {
    const Position center = Position::fromFEN("8/8/8/8/3K4/8/8/8 w - - 0 1");
    const auto moves = chess::generatePseudoLegalMoves(center);
    assert(countFrom(moves, Square::D4) == 8);

    const Position edge = Position::fromFEN("K7/8/8/8/8/8/8/7k w - - 0 1");
    const auto edgeMoves = chess::generatePseudoLegalMoves(edge);
    assert(countFrom(edgeMoves, Square::A8) == 3);

    const Position attacked = Position::fromFEN("4r1k1/8/8/8/8/8/8/4K3 w - - 0 1");
    const auto attackedMoves = chess::generatePseudoLegalMoves(attacked);
    assert(hasMove(attackedMoves, Square::E1, Square::E2, MoveType::Quiet));
}

void testPawns() {
    const Position white = Position::fromFEN("8/8/8/8/8/8/4P3/4K2k w - - 0 1");
    const auto whiteMoves = chess::generatePseudoLegalMoves(white);
    assert(hasMove(whiteMoves, Square::E2, Square::E3, MoveType::Quiet));
    assert(hasMove(whiteMoves, Square::E2, Square::E4, MoveType::DoublePawnPush));

    const Position black = Position::fromFEN("4k3/4p3/8/8/8/8/8/4K3 b - - 0 1");
    const auto blackMoves = chess::generatePseudoLegalMoves(black);
    assert(hasMove(blackMoves, Square::E7, Square::E6, MoveType::Quiet));
    assert(hasMove(blackMoves, Square::E7, Square::E5, MoveType::DoublePawnPush));

    const Position blocked = Position::fromFEN("4k3/4p3/4P3/8/8/8/8/4K3 b - - 0 1");
    const auto blockedMoves = chess::generatePseudoLegalMoves(blocked);
    assert(countFrom(blockedMoves, Square::E7) == 0);

    const Position captures = Position::fromFEN("4k3/8/3p4/4P3/5p2/8/8/4K3 w - - 0 1");
    const auto captureMoves = chess::generatePseudoLegalMoves(captures);
    assert(hasMove(captureMoves, Square::E5, Square::D6, MoveType::Capture));
}

void testPromotions() {
    constexpr std::array<PieceType, 4> pieces = {
        PieceType::Knight, PieceType::Bishop, PieceType::Rook, PieceType::Queen,
    };
    const Position white = Position::fromFEN("k7/4P3/8/8/8/8/8/4K3 w - - 0 1");
    const auto whiteMoves = chess::generatePseudoLegalMoves(white);
    for (const PieceType piece : pieces) {
        assert(hasMove(whiteMoves, Square::E7, Square::E8, MoveType::Promotion, piece));
    }

    const Position whiteCapture = Position::fromFEN("3rk3/4P3/8/8/8/8/8/4K3 w - - 0 1");
    const auto whiteCaptureMoves = chess::generatePseudoLegalMoves(whiteCapture);
    for (const PieceType piece : pieces) {
        assert(hasMove(whiteCaptureMoves, Square::E7, Square::D8, MoveType::PromotionCapture, piece));
    }

    const Position black = Position::fromFEN("4k3/8/8/8/8/8/4p3/4K3 b - - 0 1");
    const auto blackMoves = chess::generatePseudoLegalMoves(black);
    for (const PieceType piece : pieces) {
        assert(hasMove(blackMoves, Square::E2, Square::E1, MoveType::Promotion, piece));
    }

    const Position blackCapture = Position::fromFEN("4k3/8/8/8/8/8/4p3/3RK3 b - - 0 1");
    const auto blackCaptureMoves = chess::generatePseudoLegalMoves(blackCapture);
    for (const PieceType piece : pieces) {
        assert(hasMove(blackCaptureMoves, Square::E2, Square::D1, MoveType::PromotionCapture, piece));
    }
}

void testEnPassant() {
    const Position white = Position::fromFEN("4k3/8/8/3pP3/8/8/8/4K3 w - d6 0 1");
    const auto whiteMoves = chess::generatePseudoLegalMoves(white);
    assert(hasMove(whiteMoves, Square::E5, Square::D6, MoveType::EnPassant));

    const Position black = Position::fromFEN("4k3/8/8/8/3pP3/8/8/4K3 b - e3 0 1");
    const auto blackMoves = chess::generatePseudoLegalMoves(black);
    assert(hasMove(blackMoves, Square::D4, Square::E3, MoveType::EnPassant));

    const Position invalid = Position::fromFEN("4k3/8/8/3pP3/8/8/8/4K3 w - e6 0 1");
    const auto invalidMoves = chess::generatePseudoLegalMoves(invalid);
    assert(!hasMove(invalidMoves, Square::E5, Square::E6, MoveType::EnPassant));
}

void testCastling() {
    const Position white = Position::fromFEN("4k3/8/8/8/8/8/8/R3K2R w KQ - 0 1");
    const auto whiteMoves = chess::generatePseudoLegalMoves(white);
    assert(hasMove(whiteMoves, Square::E1, Square::G1, MoveType::CastleKingside));
    assert(hasMove(whiteMoves, Square::E1, Square::C1, MoveType::CastleQueenside));

    const Position black = Position::fromFEN("r3k2r/8/8/8/8/8/8/4K3 b kq - 0 1");
    const auto blackMoves = chess::generatePseudoLegalMoves(black);
    assert(hasMove(blackMoves, Square::E8, Square::G8, MoveType::CastleKingside));
    assert(hasMove(blackMoves, Square::E8, Square::C8, MoveType::CastleQueenside));

    const Position blocked = Position::fromFEN("4k3/8/8/8/8/8/8/R3KB1R w KQ - 0 1");
    const auto blockedMoves = chess::generatePseudoLegalMoves(blocked);
    assert(!hasMove(blockedMoves, Square::E1, Square::G1, MoveType::CastleKingside));
    assert(hasMove(blockedMoves, Square::E1, Square::C1, MoveType::CastleQueenside));

    const Position noRights = Position::fromFEN("4k3/8/8/8/8/8/8/R3K2R w - - 0 1");
    const auto noRightMoves = chess::generatePseudoLegalMoves(noRights);
    assert(!hasMove(noRightMoves, Square::E1, Square::G1, MoveType::CastleKingside));
    assert(!hasMove(noRightMoves, Square::E1, Square::C1, MoveType::CastleQueenside));
}

void testFriendlyProtectionAndEdges() {
    const Position friendly = Position::fromFEN("8/8/8/8/3R4/3P4/8/8 w - - 0 1");
    const auto moves = chess::generatePseudoLegalMoves(friendly);
    assertNoFriendlyCaptures(friendly, moves);
    assert(!hasMove(moves, Square::D4, Square::D3, MoveType::Capture));

    const Position bishopEdge = Position::fromFEN("B7/8/8/8/8/8/8/7k w - - 0 1");
    const auto bishopMoves = chess::generatePseudoLegalMoves(bishopEdge);
    assert(countFrom(bishopMoves, Square::A8) == 7);
    assert(!hasMove(bishopMoves, Square::A8, Square::H1, MoveType::Quiet));

    const Position knightEdge = Position::fromFEN("N7/8/8/8/8/8/8/7k w - - 0 1");
    const auto knightMoves = chess::generatePseudoLegalMoves(knightEdge);
    for (const Move& move : knightMoves) {
        assert(move.from() == Square::A8);
        assert(chess::fileOf(move.to()) >= 0 && chess::fileOf(move.to()) < 8);
        assert(chess::rankOf(move.to()) >= 0 && chess::rankOf(move.to()) < 8);
    }
}

void testDeterminismAndM4Integration() {
    const Position position = Position::fromFEN("r3k2r/8/3p4/4P3/8/8/8/R3K2R w KQkq - 0 1");
    const auto first = chess::generatePseudoLegalMoves(position);
    const auto second = chess::generatePseudoLegalMoves(position);
    assert(first == second);
    for (const Move move : first) {
        assert(Move::fromEncoded(move.encoded()) == move);
    }
    assert(hasMove(first, Square::E1, Square::G1, MoveType::CastleKingside));
    assert(hasMove(first, Square::E1, Square::C1, MoveType::CastleQueenside));
    assert(hasMove(first, Square::E5, Square::E6, MoveType::Quiet));
}

} // namespace

int main() {
    testInitialPositions();
    testKnights();
    testBishops();
    testRooksAndQueens();
    testKings();
    testPawns();
    testPromotions();
    testEnPassant();
    testCastling();
    testFriendlyProtectionAndEdges();
    testDeterminismAndM4Integration();
    return 0;
}
