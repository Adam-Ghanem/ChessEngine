#pragma once

#include "chess/types.hpp"

#include <cstdint>
#include <stdexcept>
#include <string>

namespace chess {

enum class MoveType : std::uint8_t {
    Quiet = 0,
    DoublePawnPush,
    Capture,
    EnPassant,
    CastleKingside,
    CastleQueenside,
    Promotion,
    PromotionCapture,
};

class Move {
public:
    constexpr Move() noexcept = default;

    static constexpr Move quiet(Square from, Square to) {
        return make(from, to, MoveType::Quiet, PieceType::None);
    }

    static constexpr Move doublePawnPush(Square from, Square to) {
        return make(from, to, MoveType::DoublePawnPush, PieceType::None);
    }

    static constexpr Move capture(Square from, Square to) {
        return make(from, to, MoveType::Capture, PieceType::None);
    }

    static constexpr Move enPassant(Square from, Square to) {
        return make(from, to, MoveType::EnPassant, PieceType::None);
    }

    static constexpr Move castleKingside(Square from, Square to) {
        return make(from, to, MoveType::CastleKingside, PieceType::None);
    }

    static constexpr Move castleQueenside(Square from, Square to) {
        return make(from, to, MoveType::CastleQueenside, PieceType::None);
    }

    static constexpr Move promotion(Square from, Square to, PieceType piece) {
        return make(from, to, MoveType::Promotion, piece);
    }

    static constexpr Move promotionCapture(Square from, Square to, PieceType piece) {
        return make(from, to, MoveType::PromotionCapture, piece);
    }

    constexpr Square from() const noexcept {
        return static_cast<Square>(encoded_ & SquareMask);
    }

    constexpr Square to() const noexcept {
        return static_cast<Square>((encoded_ >> ToShift) & SquareMask);
    }

    constexpr MoveType type() const noexcept {
        return static_cast<MoveType>((encoded_ >> TypeShift) & TypeMask);
    }

    constexpr PieceType promotionPiece() const noexcept {
        return static_cast<PieceType>((encoded_ >> PromotionShift) & PromotionMask);
    }

    constexpr std::uint32_t encoded() const noexcept { return encoded_; }

    static constexpr Move fromEncoded(std::uint32_t encoded) {
        const Move move(encoded);
        if (!isValidSquare(move.from()) || !isValidSquare(move.to()) || !isValidType(move.type())) {
            throw std::invalid_argument("invalid encoded chess move");
        }
        if (move.isPromotion() && !isValidPromotionPiece(move.promotionPiece())) {
            throw std::invalid_argument("invalid promotion piece");
        }
        if (!move.isPromotion() && move.promotionPiece() != PieceType::None) {
            throw std::invalid_argument("promotion piece on non-promotion move");
        }
        if ((encoded >> 19U) != 0U) {
            throw std::invalid_argument("unused move bits must be zero");
        }
        return move;
    }

    constexpr bool isCapture() const noexcept {
        return type() == MoveType::Capture || type() == MoveType::EnPassant || type() == MoveType::PromotionCapture;
    }

    constexpr bool isPromotion() const noexcept {
        return type() == MoveType::Promotion || type() == MoveType::PromotionCapture;
    }

    constexpr bool isCastle() const noexcept {
        return type() == MoveType::CastleKingside || type() == MoveType::CastleQueenside;
    }

    constexpr bool isEnPassant() const noexcept { return type() == MoveType::EnPassant; }
    constexpr bool isQuiet() const noexcept { return type() == MoveType::Quiet; }
    constexpr bool isDoublePawnPush() const noexcept { return type() == MoveType::DoublePawnPush; }

    std::string toUci() const {
        return squareToUci(from()) + squareToUci(to()) + (isPromotion() ? promotionToUci(promotionPiece()) : "");
    }

    friend constexpr bool operator==(const Move& lhs, const Move& rhs) noexcept {
        return lhs.encoded_ == rhs.encoded_;
    }

    friend constexpr bool operator!=(const Move& lhs, const Move& rhs) noexcept {
        return !(lhs == rhs);
    }

private:
    static constexpr std::uint32_t SquareMask = 0x3FU;
    static constexpr unsigned ToShift = 6U;
    static constexpr unsigned TypeShift = 12U;
    static constexpr unsigned PromotionShift = 16U;
    static constexpr std::uint32_t TypeMask = 0x0FU;
    static constexpr std::uint32_t PromotionMask = 0x07U;

    std::uint32_t encoded_ = 0;

    constexpr explicit Move(std::uint32_t encoded) noexcept : encoded_(encoded) {}

    static constexpr bool isValidSquare(Square square) noexcept {
        return squareIndex(square) >= 0 && squareIndex(square) < 64;
    }

    static constexpr bool isValidType(MoveType type) noexcept {
        return static_cast<std::uint8_t>(type) <= static_cast<std::uint8_t>(MoveType::PromotionCapture);
    }

    static constexpr bool isValidPromotionPiece(PieceType piece) noexcept {
        return piece == PieceType::Knight || piece == PieceType::Bishop ||
               piece == PieceType::Rook || piece == PieceType::Queen;
    }

    static constexpr Move make(Square from, Square to, MoveType type, PieceType promotion) {
        if (!isValidSquare(from) || !isValidSquare(to)) {
            throw std::invalid_argument("invalid move square");
        }
        if (!isValidType(type)) {
            throw std::invalid_argument("invalid move type");
        }
        if (type == MoveType::Promotion || type == MoveType::PromotionCapture) {
            if (!isValidPromotionPiece(promotion)) {
                throw std::invalid_argument("invalid promotion piece");
            }
        } else if (promotion != PieceType::None) {
            throw std::invalid_argument("promotion piece on non-promotion move");
        }
        return Move(squareIndex(from) |
                    (static_cast<std::uint32_t>(squareIndex(to)) << ToShift) |
                    (static_cast<std::uint32_t>(type) << TypeShift) |
                    (static_cast<std::uint32_t>(promotion) << PromotionShift));
    }

    static std::string squareToUci(Square square) {
        if (!isValidSquare(square)) {
            throw std::invalid_argument("invalid move square");
        }
        std::string result;
        result += static_cast<char>('a' + fileOf(square));
        result += static_cast<char>('1' + rankOf(square));
        return result;
    }

    static std::string promotionToUci(PieceType piece) {
        switch (piece) {
        case PieceType::Knight: return "n";
        case PieceType::Bishop: return "b";
        case PieceType::Rook: return "r";
        case PieceType::Queen: return "q";
        default: throw std::invalid_argument("invalid promotion piece");
        }
    }
};

static_assert(sizeof(Move) == sizeof(std::uint32_t));

} // namespace chess
