#pragma once

#include "chess/game_state.hpp"

#include <atomic>
#include <cstdint>
#include <memory>
#include <string>
#include <vector>

namespace chess {

struct SearchLimits {
    int depth = 0;
    int moveTimeMs = 0;
    int whiteTimeMs = 0;
    int blackTimeMs = 0;
    int whiteIncrementMs = 0;
    int blackIncrementMs = 0;
};

struct SearchResult {
    Move bestMove{};
    int score = 0;
    int depth = 0;
    std::uint64_t nodes = 0;
    std::vector<Move> principalVariation;
};

class Engine {
public:
    Engine();
    ~Engine();
    Engine(Engine&&) noexcept;
    Engine& operator=(Engine&&) noexcept;
    Engine(const Engine&) = delete;
    Engine& operator=(const Engine&) = delete;

    void stop() noexcept;
    void clearHash() noexcept;
    void setHashSizeMb(std::size_t megabytes);
    void setNullMovePruning(bool enabled) noexcept;
    void setLmr(bool enabled) noexcept;
    void setFutilityPruning(bool enabled) noexcept;

    int evaluate(const Position& position) const noexcept;
    SearchResult search(const Position& position, const SearchLimits& limits);

    static std::string scoreToUci(int score);
    static std::string pvToUci(const std::vector<Move>& pv);

private:
    struct Impl;
    std::unique_ptr<Impl> impl_;
};

} // namespace chess
