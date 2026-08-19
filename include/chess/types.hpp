#pragma once

#include <cstdint>

namespace chess {

enum class Color : std::uint8_t {
    White = 0,
    Black = 1,
};

constexpr Color opposite(Color color) noexcept {
    return color == Color::White ? Color::Black : Color::White;
}

enum class PieceType : std::uint8_t {
    None = 0,
    Pawn,
    Knight,
    Bishop,
    Rook,
    Queen,
    King,
};

enum class Piece : std::uint8_t {
    Empty = 0,
    WhitePawn,
    WhiteKnight,
    WhiteBishop,
    WhiteRook,
    WhiteQueen,
    WhiteKing,
    BlackPawn,
    BlackKnight,
    BlackBishop,
    BlackRook,
    BlackQueen,
    BlackKing,
};

enum class Square : std::uint8_t {
    A1, B1, C1, D1, E1, F1, G1, H1,
    A2, B2, C2, D2, E2, F2, G2, H2,
    A3, B3, C3, D3, E3, F3, G3, H3,
    A4, B4, C4, D4, E4, F4, G4, H4,
    A5, B5, C5, D5, E5, F5, G5, H5,
    A6, B6, C6, D6, E6, F6, G6, H6,
    A7, B7, C7, D7, E7, F7, G7, H7,
    A8, B8, C8, D8, E8, F8, G8, H8,
    None = 64,
};

using Bitboard = std::uint64_t;

constexpr int squareIndex(Square square) noexcept {
    return static_cast<int>(square);
}

constexpr int fileOf(Square square) noexcept {
    return squareIndex(square) & 7;
}

constexpr int rankOf(Square square) noexcept {
    return squareIndex(square) >> 3;
}

constexpr Bitboard squareBit(Square square) noexcept {
    return square == Square::None ? 0ULL : (1ULL << squareIndex(square));
}

} // namespace chess
