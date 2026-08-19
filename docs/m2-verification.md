# M2 Verification

## Chess representation

M2 uses strongly typed C++20 enums for colors, piece types, pieces, and squares. Squares are indexed from A1=0 through H8=63 using rank-major bitboard indexing. `Bitboard` is an alias for `std::uint64_t`.

## Bitboard helpers

The representation provides constexpr helpers for square index, file, rank, and single-square bit masks. `Square::None` maps to a zero bitboard mask.

## Tests

`tests/m2_representation_tests.cpp` covers the 64-square mapping, file/rank extraction, bit masks, color inversion, and the bitboard type width. The test is registered with CTest alongside the foundation test.

## Verification note

The M2 test was previously present but was not registered in CMake. That integration issue was fixed before verification.
