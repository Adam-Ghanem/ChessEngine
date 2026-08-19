#include "chess/engine.hpp"
#include "chess/game_status.hpp"
#include "chess/move_generator.hpp"
#include "chess/perft.hpp"

#include <algorithm>
#include <atomic>
#include <chrono>
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
        if (move.toUci() == uci) {
            if (state.makeMove(move)) {
                position = state.position();
                return true;
            }
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

void runUci() {
    Engine engine;
    Position position;
    std::thread searchThread;
    std::atomic<bool> searching{false};

    auto stopSearch = [&]() {
        if (searching.load()) {
            engine.stop();
            if (searchThread.joinable()) searchThread.join();
            searching.store(false);
        }
    };

    std::string line;
    while (std::getline(std::cin, line)) {
        std::istringstream in(line);
        std::string command;
        in >> command;
        if (command.empty()) continue;

        if (command == "uci") {
            std::cout << "id name ChessEngine 0.2.0\n"
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
                std::string valueToken;
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
            std::string token;
            in >> token;
            if (token == "startpos") {
                position = Position{};
            } else if (token == "fen") {
                std::string fen, part;
                for (int i = 0; i < 6 && in >> part; ++i) {
                    if (part == "moves") break;
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
                else if (token == "infinite") limits.moveTimeMs = 0;
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
            SearchLimits limits;
            limits.depth = 6;
            const auto start = std::chrono::steady_clock::now();
            const SearchResult result = engine.search(position, limits);
            const auto ms = std::max<std::int64_t>(1, std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::steady_clock::now() - start).count());
            std::cout << "bench depth " << result.depth << " nodes " << result.nodes
                      << " nps " << (result.nodes * 1000ULL / static_cast<std::uint64_t>(ms))
                      << " bestmove " << result.bestMove.toUci() << '\n' << std::flush;
        }
    }
    stopSearch();
}

} // namespace

int main() {
    runUci();
    return 0;
}
