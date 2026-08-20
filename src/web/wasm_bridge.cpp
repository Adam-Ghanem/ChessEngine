#include "chess/engine.hpp"

#include <algorithm>
#include <cstddef>
#include <exception>
#include <sstream>
#include <string>

#include <emscripten/bind.h>

namespace {

std::string jsonEscape(const std::string& value) {
    std::string escaped;
    escaped.reserve(value.size());
    for (const char ch : value) {
        if (ch == '\\' || ch == '"') escaped.push_back('\\');
        escaped.push_back(ch);
    }
    return escaped;
}

std::string analyzePosition(const std::string& fen, int requestedDepth) {
    try {
        const chess::Position position = chess::Position::fromFEN(fen);
        chess::Engine engine;
        chess::SearchLimits limits;
        limits.depth = std::clamp(requestedDepth, 1, 8);

        const chess::SearchResult result = engine.search(position, limits);
        std::ostringstream output;
        output << "{\"ok\":true,\"bestMove\":\"";
        if (result.bestMove.encoded() != 0) output << result.bestMove.toUci();
        output << "\",\"score\":" << result.score
               << ",\"depth\":" << result.depth
               << ",\"nodes\":" << result.nodes
               << ",\"pv\":\"" << jsonEscape(chess::Engine::pvToUci(result.principalVariation))
               << "\"}";
        return output.str();
    } catch (const std::exception& exception) {
        return "{\"ok\":false,\"error\":\"" + jsonEscape(exception.what()) + "\"}";
    }
}

} // namespace

EMSCRIPTEN_BINDINGS(chessengine_arena) {
    emscripten::function("analyzePosition", &analyzePosition);
}
