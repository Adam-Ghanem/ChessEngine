#include "chess/engine.hpp"
#include "chess/game_status.hpp"
#include "chess/move_generator.hpp"
#include "chess/perft.hpp"

#include <algorithm>
#include <atomic>
#include <chrono>
#include <cstdint>
#include <iostream>
#include <sstream>
#include <string>
#include <thread>
#include <vector>

namespace {

using namespace chess;

bool playUciMove(Position& position, const std::string& uci) {
    GameState state(position);
    for (const Move& move : generateLegalMoves(position)) {
        if (move.toUci() == uci && state.makeMove(move)) {
            position = state.position();
            return true;
        }
    }
    return false;
}

void printUciInfo(const SearchResult& result) {
    std::cout << "info depth " << result.depth
              << " score " << Engine::scoreToUci(result.score)
              << " nodes " << result.nodes;
    if (!result.principalVariation.empty()) std::cout << " pv " << Engine::pvToUci(result.principalVariation);
    std::cout << '\n' << std::flush;
}

void runBench(Engine& engine, int depth) {
    struct BenchPosition { const char* name; const char* fen; };
    static constexpr BenchPosition suite[] = {
        {"startpos", "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"},
        {"kiwipete", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1"},
        {"tactical", "r1bq1rk1/ppp2ppp/2n1pn2/8/2B5/2N1PN2/PPPQ1PPP/2RR2K1 w - - 0 1"},
        {"endgame", "8/8/8/3k4/8/3K4/3P4/8 w - - 0 1"}
    };

    std::uint64_t totalNodes = 0;
    const auto start = std::chrono::steady_clock::now();
    for (const auto& item : suite) {
        engine.clearHash();
        const Position position = Position::fromFEN(item.fen);
        SearchLimits limits;
        limits.depth = std::clamp(depth, 1, 12);
        const SearchResult result = engine.search(position, limits);
        totalNodes += result.nodes;
        std::cout << "bench " << item.name
                  << " depth " << result.depth
                  << " nodes " << result.nodes
                  << " score " << Engine::scoreToUci(result.score)
                  << " bestmove " << result.bestMove.toUci()
                  << '\n';
    }
    const auto ms = std::max<std::int64_t>(1, std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::steady_clock::now() - start).count());
    std::cout << "bench total nodes " << totalNodes
              << " time " << ms << "ms"
              << " nps " << (totalNodes * 1000ULL / static_cast<std::uint64_t>(ms))
              << '\n' << std::flush;
}

void runUci() {
    Engine engine;
    Position position;
    std::thread searchThread;
    std::atomic<bool> searching{false};

    auto stopSearch = [&]() {
        if (searching.load()) engine.stop();
        if (searchThread.joinable()) searchThread.join();
        searching.store(false);
    };

    std::string line;
    while (std::getline(std::cin, line)) {
        std::istringstream in(line);
        std::string command;
        in >> command;
        if (command.empty()) continue;

        if (command == "uci") {
            std::cout << "id name ChessEngine 0.3.0\n"
                      << "id author Adam Ghanem\n"
                      << "option name Hash type spin default 32 min 1 max 1024\n"
                      << "uciok\n" << std::flush;
        } else if (command == "isready") {
            std::cout << "readyok\n" << std::flush;
        } else if (command == "setoption") {
            std::string token, name;
            in >> token;
            if (token == "name") in >> name;
            if (name == "Hash") {
                int value = 32;
                while (in >> token) if (token == "value") in >> value;
                engine.setHashSizeMb(static_cast<std::size_t>(std::clamp(value, 1, 1024)));
            }
        } else if (command == "ucinewgame") {
            stopSearch();
            position = Position{};
            engine.clearHash();
        } else if (command == "position") {
            stopSearch();
            try {
                std::string token;
                in >> token;
                if (token == "startpos") {
                    position = Position{};
                } else if (token == "fen") {
                    std::string fen, part;
                    for (int i = 0; i < 6 && in >> part; ++i) {
                        if (!fen.empty()) fen += ' ';
                        fen += part;
                    }
                    position = Position::fromFEN(fen);
                }
                if (in >> token && token == "moves") {
                    while (in >> token) {
                        if (!playUciMove(position, token)) break;
                    }
                }
            } catch (const std::exception& ex) {
                std::cout << "info string invalid position: " << ex.what() << '\n' << std::flush;
            }
        } else if (command == "go") {
            stopSearch();
            SearchLimits limits;
            std::string token;
            while (in >> token) {
                if (token == "depth") in >> limits.depth;
                else if (token == "movetime") in >> limits.moveTimeMs;
                else if (token == "wtime") in >> limits.whiteTimeMs;
                else if (token == "btime") in >> limits.blackTimeMs;
                else if (token == "winc") in >> limits.whiteIncrementMs;
                else if (token == "binc") in >> limits.blackIncrementMs;
            }
            const Position root = position;
            searching.store(true);
            searchThread = std::thread([&, root, limits]() {
                const SearchResult result = engine.search(root, limits);
                printUciInfo(result);
                std::cout << "bestmove " << result.bestMove.toUci() << '\n' << std::flush;
                searching.store(false);
            });
        } else if (command == "stop") {
            stopSearch();
        } else if (command == "quit") {
            stopSearch();
            break;
        } else if (command == "eval") {
            std::cout << "info score cp " << engine.evaluate(position) << '\n' << std::flush;
        } else if (command == "perft") {
            int depth = 1;
            in >> depth;
            const auto start = std::chrono::steady_clock::now();
            const auto nodes = perft(position, depth);
            const auto elapsed = std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::steady_clock::now() - start).count();
            std::cout << "perft depth " << depth << " nodes " << nodes << " time " << elapsed << "ms\n" << std::flush;
        } else if (command == "bench") {
            int depth = 6;
            in >> depth;
            stopSearch();
            runBench(engine, depth);
        }
    }
    stopSearch();
}

} // namespace

int main() {
    runUci();
    return 0;
}
