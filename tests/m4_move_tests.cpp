#include "chess/move.hpp"

#include <cassert>
#include <cstdint>
#include <stdexcept>

using chess::Move;
using chess::MoveType;
using chess::PieceType;
using chess::Square;

namespace {

void assertRoundTrip(Move move) {
    const Move decoded = Move::fromEncoded(move.encoded());
    assert(decoded == move);
    assert(decoded.from() == move.from());
    assert(decoded.to() == move.to());
    assert(decoded.type() == move.type());
    assert(decoded.promotionPiece() == move.promotionPiece());
}

void expectInvalid(void (*factory)()) {
    bool rejected = false;
    try {
        factory();
    } catch (const std::invalid_argument&) {
        rejected = true;
    }
    assert(rejected);
}

void invalidPromotion() {
    (void)Move::promotion(Square::E7, Square::E8, PieceType::Pawn);
}

void invalidKingPromotion() {
    (void)Move::promotion(Square::E7, Square::E8, PieceType::King);
}

void invalidSquare() {
    (void)Move::quiet(Square::None, Square::A1);
}

} // namespace

int main() {
    const Move e2e3 = Move::quiet(Square::E2, Square::E3);
    assert(e2e3.from() == Square::E2);
    assert(e2e3.to() == Square::E3);
    assert(e2e3.type() == MoveType::Quiet);
    assert(e2e3.promotionPiece() == PieceType::None);
    assert(e2e3.isQuiet());
    assert(!e2e3.isCapture());
    assert(!e2e3.isPromotion());
    assert(!e2e3.isCastle());
    assert(!e2e3.isEnPassant());
    assert(!e2e3.isDoublePawnPush());
    assert(e2e3.toUci() == "e2e3");

    const Move e2e4 = Move::doublePawnPush(Square::E2, Square::E4);
    assert(e2e4.type() == MoveType::DoublePawnPush);
    assert(e2e4.isDoublePawnPush());
    assert(e2e4.toUci() == "e2e4");

    const Move e4d5 = Move::capture(Square::E4, Square::D5);
    assert(e4d5.type() == MoveType::Capture);
    assert(e4d5.isCapture());
    assert(!e4d5.isPromotion());
    assert(!e4d5.isCastle());
    assert(!e4d5.isEnPassant());
    assert(e4d5.toUci() == "e4d5");

    const Move ep = Move::enPassant(Square::E5, Square::D6);
    assert(ep.type() == MoveType::EnPassant);
    assert(ep.isEnPassant());
    assert(ep.isCapture());
    assert(ep.toUci() == "e5d6");

    const Move whiteKingCastle = Move::castleKingside(Square::E1, Square::G1);
    const Move whiteQueenCastle = Move::castleQueenside(Square::E1, Square::C1);
    const Move blackKingCastle = Move::castleKingside(Square::E8, Square::G8);
    const Move blackQueenCastle = Move::castleQueenside(Square::E8, Square::C8);
    assert(whiteKingCastle.type() == MoveType::CastleKingside);
    assert(whiteQueenCastle.type() == MoveType::CastleQueenside);
    assert(blackKingCastle.isCastle());
    assert(blackQueenCastle.isCastle());
    assert(whiteKingCastle.toUci() == "e1g1");
    assert(whiteQueenCastle.toUci() == "e1c1");
    assert(blackKingCastle.toUci() == "e8g8");
    assert(blackQueenCastle.toUci() == "e8c8");

    constexpr PieceType promotions[] = {
        PieceType::Knight, PieceType::Bishop, PieceType::Rook, PieceType::Queen,
    };
    for (const PieceType piece : promotions) {
        const Move promotion = Move::promotion(Square::E7, Square::E8, piece);
        assert(promotion.isPromotion());
        assert(!promotion.isCapture());
        assert(promotion.promotionPiece() == piece);
        assertRoundTrip(promotion);
        const Move promotionCapture = Move::promotionCapture(Square::E7, Square::D8, piece);
        assert(promotionCapture.isPromotion());
        assert(promotionCapture.isCapture());
        assert(promotionCapture.promotionPiece() == piece);
        assertRoundTrip(promotionCapture);
    }

    assert(e2e3 == Move::quiet(Square::E2, Square::E3));
    assert(e2e3 != Move::quiet(Square::E2, Square::E4));
    assert(e2e3 != Move::capture(Square::E2, Square::E3));
    assert(Move::promotion(Square::E7, Square::E8, PieceType::Queen) !=
           Move::promotion(Square::E7, Square::E8, PieceType::Rook));

    const Move roundTrips[] = {
        e2e3,
        e2e4,
        e4d5,
        ep,
        whiteKingCastle,
        whiteQueenCastle,
        blackKingCastle,
        blackQueenCastle,
        Move::promotion(Square::E7, Square::E8, PieceType::Queen),
        Move::promotionCapture(Square::E7, Square::D8, PieceType::Knight),
    };
    for (const Move move : roundTrips) {
        assertRoundTrip(move);
    }

    const Move a1h8 = Move::quiet(Square::A1, Square::H8);
    const Move h1a8 = Move::capture(Square::H1, Square::A8);
    assertRoundTrip(a1h8);
    assertRoundTrip(h1a8);
    assert(a1h8.from() == Square::A1);
    assert(a1h8.to() == Square::H8);
    assert(h1a8.from() == Square::H1);
    assert(h1a8.to() == Square::A8);

    expectInvalid(invalidPromotion);
    expectInvalid(invalidKingPromotion);
    expectInvalid(invalidSquare);

    const std::uint32_t invalidPromotionBits = Move::quiet(Square::E2, Square::E3).encoded() | (4U << 16U);
    bool rejected = false;
    try {
        (void)Move::fromEncoded(invalidPromotionBits);
    } catch (const std::invalid_argument&) {
        rejected = true;
    }
    assert(rejected);

    const std::uint32_t invalidExtraBits = Move::quiet(Square::E2, Square::E3).encoded() | (1U << 19U);
    rejected = false;
    try {
        (void)Move::fromEncoded(invalidExtraBits);
    } catch (const std::invalid_argument&) {
        rejected = true;
    }
    assert(rejected);

    return 0;
}
