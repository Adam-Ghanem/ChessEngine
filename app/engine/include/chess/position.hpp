#pragma once

#include "chess/types.hpp"

#include <array>
#include <cstdint>
#include <string>

namespace chess {

enum class CastlingRight : std::uint8_t {
    WhiteKingside = 1U << 0,
    WhiteQueenside = 1U << 1,
    BlackKingside = 1U << 2,
    BlackQueenside = 1U << 3,
};

class Position {
public:
    Position() noexcept;

    static Position fromFEN(const std::string& fen);
    std::string toFEN() const;

    Bitboard pieces(Piece piece) const noexcept;
    Bitboard whiteOccupancy() const noexcept { return whiteOccupancy_; }
    Bitboard blackOccupancy() const noexcept { return blackOccupancy_; }
    Bitboard occupancy() const noexcept { return occupancy_; }

    Color sideToMove() const noexcept { return sideToMove_; }
    Square enPassantSquare() const noexcept { return enPassantSquare_; }
    std::uint16_t halfmoveClock() const noexcept { return halfmoveClock_; }
    std::uint32_t fullmoveNumber() const noexcept { return fullmoveNumber_; }

    bool canCastleKingside(Color color) const noexcept;
    bool canCastleQueenside(Color color) const noexcept;

    Piece pieceAt(Square square) const noexcept;

    friend bool operator==(const Position& lhs, const Position& rhs) noexcept;
    friend bool operator!=(const Position& lhs, const Position& rhs) noexcept {
        return !(lhs == rhs);
    }

private:
    std::array<Bitboard, 13> pieces_{};
    Bitboard whiteOccupancy_ = 0;
    Bitboard blackOccupancy_ = 0;
    Bitboard occupancy_ = 0;
    Color sideToMove_ = Color::White;
    std::uint8_t castlingRights_ = 0;
    Square enPassantSquare_ = Square::None;
    std::uint16_t halfmoveClock_ = 0;
    std::uint32_t fullmoveNumber_ = 1;

    void setInitialPosition() noexcept;
    void clear() noexcept;
    void addPiece(Piece piece, Square square) noexcept;
};

} // namespace chess
