#include "chess/perft.hpp"

#include <cstdint>
#include <iostream>
#include <string>

namespace {

int failures = 0;

void expectEqual(std::uint64_t actual, std::uint64_t expected, const char* label) {
    if (actual != expected) {
        std::cerr << label << ": expected " << expected << ", got " << actual << '\n';
        ++failures;
    }
}

void testStartingPosition() {
    const chess::Position position = chess::Position::fromFEN(
        "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

    expectEqual(chess::perft(position, 0), 1, "start depth 0");
    expectEqual(chess::perft(position, 1), 20, "start depth 1");
    expectEqual(chess::perft(position, 2), 400, "start depth 2");
    expectEqual(chess::perft(position, 3), 8902, "start depth 3");
    expectEqual(chess::perft(position, 4), 197281, "start depth 4");

    std::uint64_t divideTotal = 0;
    for (const auto& entry : chess::perftDivide(position, 3)) divideTotal += entry.nodes;
    expectEqual(divideTotal, 8902, "start divide depth 3");
}

void testKiwipete() {
    const chess::Position position = chess::Position::fromFEN(
        "r3k2r/p1ppqpb1/bn2pnp1/2pP4/1p2P3/2N2N2/PPPB1PPP/R2Q1RK1 w kq - 0 1");

    expectEqual(chess::perft(position, 1), 48, "kiwipete depth 1");
    expectEqual(chess::perft(position, 2), 2039, "kiwipete depth 2");
    expectEqual(chess::perft(position, 3), 97862, "kiwipete depth 3");
}

} // namespace

int main() {
    testStartingPosition();
    testKiwipete();

    if (failures != 0) {
        std::cerr << failures << " M9 assertion(s) failed\n";
        return 1;
    }

    std::cout << "M9 perft tests passed\n";
    return 0;
}
