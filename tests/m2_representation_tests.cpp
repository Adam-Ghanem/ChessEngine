#include "chess/types.hpp"

#include <cassert>

int main() {
    using namespace chess;

    static_assert(sizeof(Bitboard) == sizeof(std::uint64_t));
    static_assert(squareIndex(Square::A1) == 0);
    static_assert(squareIndex(Square::H8) == 63);
    static_assert(fileOf(Square::A1) == 0);
    static_assert(rankOf(Square::A1) == 0);
    static_assert(fileOf(Square::H8) == 7);
    static_assert(rankOf(Square::H8) == 7);

    assert(squareBit(Square::A1) == 1ULL);
    assert(squareBit(Square::H8) == (1ULL << 63));
    assert(squareBit(Square::None) == 0ULL);
    assert(opposite(Color::White) == Color::Black);
    assert(opposite(Color::Black) == Color::White);

    return 0;
}
