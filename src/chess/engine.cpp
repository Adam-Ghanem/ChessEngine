#include "chess/engine.hpp"

#include "chess/game_status.hpp"
#include "chess/move_generator.hpp"

#include <algorithm>
#include <array>
#include <chrono>
#include <cmath>
#include <cstddef>
#include <cstdint>
#include <limits>
#include <memory>
#include <random>
#include <sstream>
#include <string>
#include <unordered_map>
#include <utility>
#include <vector>

namespace chess {
namespace {

constexpr int Infinity = 32000;
constexpr int MateScore = 30000;
constexpr int MaxPly = 128;

constexpr std::array<int, 13> Material = {
    0, 100, 320, 330, 500, 900, 20000,
    -100, -320, -330, -500, -900, -20000
};

constexpr std::array<int, 64> PawnTable = {
     0,  0,  0,  0,  0,  0,  0,  0,
     8, 12, 12,-4,-4, 12, 12,  8,
     5,  4, 10, 20, 20, 10,  4,  5,
     2,  2,  6, 14, 14,  6,  2,  2,
     0,  0,  0,  8,  8,  0,  0,  0,
     3, -3,-6,  0,  0,-6,-3,  3,
     3,  4,  4,-10,-10,  4,  4,  3,
     0,  0,  0,  0,  0,  0,  0,  0
};

constexpr std::array<int, 64> KnightTable = {
    -50,-35,-25,-25,-25,-25,-35,-50,
    -35,-10,  0,  5,  5,  0,-10,-35,
    -25,  0, 15, 20, 20, 15,  0,-25,
    -25,  5, 20, 25, 25, 20,  5,-25,
    -25,  5, 20, 25, 25, 20,  5,-25,
    -25,  0, 15, 20, 20, 15,  0,-25,
    -35,-10,  0,  5,  5,  0,-10,-35,
    -50,-35,-25,-25,-25,-25,-35,-50
};

constexpr std::array<int, 64> BishopTable = {
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -20,-10,-10,-10,-10,-10,-10,-20
};

constexpr std::array<int, 64> RookTable = {
     0,  0,  5,  8,  8,  5,  0,  0,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
     5, 10, 10, 10, 10, 10, 10,  5,
     0,  0,  0,  0,  0,  0,  0,  0
};

constexpr std::array<int, 64> QueenTable = {
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
     -5,  0,  5,  5,  5,  5,  0, -5,
      0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20
};

constexpr std::array<int, 64> KingTable = {
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
     20, 20,  0,  0,  0,  0, 20, 20,
     20, 30, 10,  0,  0, 10, 30, 20
};

constexpr std::array<int, 64> KingEndgameTable = {
    -50,-30,-30,-30,-30,-30,-30,-50,
    -30,-10,  0,  0,  0,  0,-10,-30,
    -30,  0, 20, 30, 30, 20,  0,-30,
    -30,  0, 30, 40, 40, 30,  0,-30,
    -30,  0, 30, 40, 40, 30,  0,-30,
    -30,  0, 20, 30, 30, 20,  0,-30,
    -30,-10,  0,  0,  0,  0,-10,-30,
    -50,-30,-30,-30,-30,-30,-30,-50
};

std::uint64_t splitmix64(std::uint64_t& x) {
    x += 0x9e3779b97f4a7c15ULL;
    std::uint64_t z = x;
    z = (z ^ (z >> 30U)) * 0xbf58476d1ce4e5b9ULL;
    z = (z ^ (z >> 27U)) * 0x94d049bb133111ebULL;
    return z ^ (z >> 31U);
}

int mirroredSquare(int sq) noexcept {
    return sq ^ 56;
}

int pieceIndex(Piece piece) noexcept {
    return static_cast<int>(piece);
}

int tableValue(Piece piece, int sq, bool endgame) noexcept {
    const int s = pieceIndex(piece);
    switch (s) {
    case 1: return PawnTable[sq];
    case 2: return KnightTable[sq];
    case 3: return BishopTable[sq];
    case 4: return RookTable[sq];
    case 5: return QueenTable[sq];
    case 6: return endgame ? KingEndgameTable[sq] : KingTable[sq];
    case 7: return -PawnTable[mirroredSquare(sq)];
    case 8: return -KnightTable[mirroredSquare(sq)];
    case 9: return -BishopTable[mirroredSquare(sq)];
    case 10: return -RookTable[mirroredSquare(sq)];
    case 11: return -QueenTable[mirroredSquare(sq)];
    case 12: return -(endgame ? KingEndgameTable[mirroredSquare(sq)] : KingTable[mirroredSquare(sq)]);
    default: return 0;
    }
}

class Zobrist {
public:
    Zobrist() {
        std::uint64_t seed = 0x123456789abcdef0ULL;
        for (auto& row : pieceSquare_) for (auto& key : row) key = splitmix64(seed);
        side_ = splitmix64(seed);
        for (auto& key : castling_) key = splitmix64(seed);
        for (auto& key : ep_) key = splitmix64(seed);
    }

    std::uint64_t hash(const Position& p) const noexcept {
        std::uint64_t h = 0;
        for (int pi = 1; pi <= 12; ++pi) {
            const auto piece = static_cast<Piece>(pi);
            Bitboard bb = p.pieces(piece);
            while (bb) {
                const int sq = static_cast<int>(__builtin_ctzll(bb));
                h ^= pieceSquare_[pi][sq];
                bb &= bb - 1;
            }
        }
        if (p.sideToMove() == Color::Black) h ^= side_;
        unsigned rights = 0;
        if (p.canCastleKingside(Color::White)) rights |= 1U;
        if (p.canCastleQueenside(Color::White)) rights |= 2U;
        if (p.canCastleKingside(Color::Black)) rights |= 4U;
        if (p.canCastleQueenside(Color::Black)) rights |= 8U;
        h ^= castling_[rights];
        if (p.enPassantSquare() != Square::None) h ^= ep_[static_cast<int>(p.enPassantSquare()) & 7];
        return h;
    }

private:
    std::array<std::array<std::uint64_t, 64>, 13> pieceSquare_{};
    std::uint64_t side_{};
    std::array<std::uint64_t, 16> castling_{};
    std::array<std::uint64_t, 8> ep_{};
};

enum class Bound : std::uint8_t { Exact, Lower, Upper };

struct TTEntry {
    std::uint64_t key = 0;
    int depth = -1;
    int score = 0;
    Bound bound = Bound::Exact;
    Move best{};
};

} // namespace

struct Engine::Impl {
    std::vector<TTEntry> tt;
    std::size_t ttMask = 0;
    Zobrist zobrist;
    std::atomic<bool> stopFlag{false};
    std::chrono::steady_clock::time_point deadline{};
    bool timed = false;
    std::uint64_t nodes = 0;
    std::array<std::array<int, 64>, 2> history{};
    std::array<Move, MaxPly> killers1{};
    std::array<Move, MaxPly> killers2{};
    std::vector<Move> currentPv;

    explicit Impl() { resizeHash(32); }

    void resizeHash(std::size_t mb) {
        const std::size_t bytes = std::max<std::size_t>(1, mb) * 1024ULL * 1024ULL;
        std::size_t count = 1;
        while ((count << 1U) * sizeof(TTEntry) <= bytes) count <<= 1U;
        tt.assign(count, TTEntry{});
        ttMask = count - 1;
    }

    void checkTime() {
        if (timed && (nodes & 2047ULL) == 0 && std::chrono::steady_clock::now() >= deadline) stopFlag.store(true, std::memory_order_relaxed);
    }

    int evaluateAbsolute(const Position& p) const noexcept {
        int score = 0;
        int nonPawnMaterial = 0;
        int pieces = 0;
        for (int pi = 1; pi <= 12; ++pi) {
            const auto piece = static_cast<Piece>(pi);
            Bitboard bb = p.pieces(piece);
            const int value = Material[pi];
            if (pi != 1 && pi != 6 && pi != 7 && pi != 12) nonPawnMaterial += static_cast<int>(__builtin_popcountll(bb)) * std::abs(value);
            pieces += static_cast<int>(__builtin_popcountll(bb));
            while (bb) {
                const int sq = static_cast<int>(__builtin_ctzll(bb));
                score += value + tableValue(piece, sq, nonPawnMaterial < 2600);
                bb &= bb - 1;
            }
        }

        const int whiteBishops = __builtin_popcountll(p.pieces(Piece::WhiteBishop));
        const int blackBishops = __builtin_popcountll(p.pieces(Piece::BlackBishop));
        score += (whiteBishops >= 2 ? 30 : 0) - (blackBishops >= 2 ? 30 : 0);

        const int whiteMobility = static_cast<int>(generatePseudoLegalMoves(p).size());
        Position flipped = p;
        (void)flipped;
        score += (whiteMobility - 20) / 2;
        score += pieces < 10 ? 0 : 0;
        return score;
    }

    int evaluateForSide(const Position& p) const noexcept {
        const int score = evaluateAbsolute(p);
        return p.sideToMove() == Color::White ? score : -score;
    }

    int moveScore(const Position& p, const Move& m, int ply, const Move& ttMove) const noexcept {
        if (m == ttMove) return 2'000'000;
        int score = 0;
        if (m.isPromotion()) score += 900'000 + static_cast<int>(m.promotionPiece()) * 10'000;
        if (m.isCapture()) {
            const Piece victim = p.pieceAt(m.to());
            const Piece attacker = p.pieceAt(m.from());
            score += 500'000 + std::abs(Material[pieceIndex(victim)]) * 16 - std::abs(Material[pieceIndex(attacker)]);
        }
        if (ply < MaxPly) {
            if (m == killers1[ply]) score += 400'000;
            else if (m == killers2[ply]) score += 350'000;
        }
        const int idx = (static_cast<int>(m.from()) * 64 + static_cast<int>(m.to())) & 63;
        score += history[p.sideToMove() == Color::White ? 0 : 1][idx];
        return score;
    }

    std::vector<Move> orderedMoves(const Position& p, std::vector<Move> moves, int ply, const Move& ttMove) const {
        std::stable_sort(moves.begin(), moves.end(), [&](const Move& a, const Move& b) {
            return moveScore(p, a, ply, ttMove) > moveScore(p, b, ply, ttMove);
        });
        return moves;
    }

    int quiescence(GameState& state, int alpha, int beta, int ply) {
        ++nodes;
        checkTime();
        const int stand = evaluateForSide(state.position());
        if (stand >= beta) return beta;
        if (stand > alpha) alpha = stand;
        if (ply >= MaxPly - 1 || stopFlag.load(std::memory_order_relaxed)) return alpha;

        auto moves = generateLegalMoves(state.position());
        moves.erase(std::remove_if(moves.begin(), moves.end(), [](const Move& m) { return !m.isCapture() && !m.isPromotion(); }), moves.end());
        moves = orderedMoves(state.position(), std::move(moves), ply, Move{});
        for (const Move& m : moves) {
            if (!state.makeMove(m)) continue;
            const int score = -quiescence(state, -beta, -alpha, ply + 1);
            state.unmakeMove();
            if (stopFlag.load(std::memory_order_relaxed)) return alpha;
            if (score >= beta) return beta;
            if (score > alpha) alpha = score;
        }
        return alpha;
    }

    int negamax(GameState& state, int depth, int alpha, int beta, int ply, std::vector<Move>& pv) {
        ++nodes;
        checkTime();
        if (stopFlag.load(std::memory_order_relaxed)) return 0;

        const auto legal = generateLegalMoves(state.position());
        if (legal.empty()) {
            if (isInCheck(state.position())) return -MateScore + ply;
            return 0;
        }
        if (depth <= 0) return quiescence(state, alpha, beta, ply);
        if (ply >= MaxPly - 1) return evaluateForSide(state.position());

        const std::uint64_t key = zobrist.hash(state.position());
        TTEntry& entry = tt[key & ttMask];
        Move ttMove{};
        if (entry.key == key) {
            ttMove = entry.best;
            if (entry.depth >= depth) {
                if (entry.bound == Bound::Exact) return entry.score;
                if (entry.bound == Bound::Lower && entry.score >= beta) return entry.score;
                if (entry.bound == Bound::Upper && entry.score <= alpha) return entry.score;
            }
        }

        const int originalAlpha = alpha;
        auto moves = orderedMoves(state.position(), legal, ply, ttMove);
        int bestScore = -Infinity;
        Move bestMove{};
        std::vector<Move> bestPv;
        int moveIndex = 0;

        for (const Move& m : moves) {
            if (!state.makeMove(m)) continue;
            std::vector<Move> childPv;
            int score;
            if (moveIndex == 0) {
                score = -negamax(state, depth - 1, -beta, -alpha, ply + 1, childPv);
            } else {
                score = -negamax(state, depth - 1, -alpha - 1, -alpha, ply + 1, childPv);
                if (score > alpha && score < beta) score = -negamax(state, depth - 1, -beta, -alpha, ply + 1, childPv);
            }
            state.unmakeMove();
            if (stopFlag.load(std::memory_order_relaxed)) return 0;

            if (score > bestScore) {
                bestScore = score;
                bestMove = m;
                bestPv.clear();
                bestPv.push_back(m);
                bestPv.insert(bestPv.end(), childPv.begin(), childPv.end());
            }
            if (score > alpha) alpha = score;
            if (alpha >= beta) {
                if (!m.isCapture() && !m.isPromotion()) {
                    if (ply < MaxPly) {
                        if (killers1[ply] != m) { killers2[ply] = killers1[ply]; killers1[ply] = m; }
                    }
                    const int side = state.position().sideToMove() == Color::White ? 0 : 1;
                    const int hi = (static_cast<int>(m.from()) * 64 + static_cast<int>(m.to())) & 63;
                    history[side][hi] = std::min(50'000, history[side][hi] + depth * depth);
                }
                break;
            }
            ++moveIndex;
        }

        if (!stopFlag.load(std::memory_order_relaxed)) {
            entry.key = key;
            entry.depth = depth;
            entry.score = bestScore;
            entry.best = bestMove;
            entry.bound = bestScore <= originalAlpha ? Bound::Upper : (bestScore >= beta ? Bound::Lower : Bound::Exact);
        }
        pv = std::move(bestPv);
        return bestScore;
    }

    SearchResult run(const Position& root, SearchLimits limits) {
        stopFlag.store(false, std::memory_order_relaxed);
        nodes = 0;
        currentPv.clear();
        timed = false;

        if (limits.moveTimeMs > 0) {
            timed = true;
            deadline = std::chrono::steady_clock::now() + std::chrono::milliseconds(limits.moveTimeMs);
        } else {
            const bool white = root.sideToMove() == Color::White;
            const int remaining = white ? limits.whiteTimeMs : limits.blackTimeMs;
            const int increment = white ? limits.whiteIncrementMs : limits.blackIncrementMs;
            if (remaining > 0) {
                const int budget = std::max(10, remaining / 30 + increment / 2);
                timed = true;
                deadline = std::chrono::steady_clock::now() + std::chrono::milliseconds(budget);
            }
        }

        auto rootMoves = generateLegalMoves(root);
        SearchResult result;
        if (rootMoves.empty()) return result;
        result.bestMove = rootMoves.front();

        // Small deterministic opening book. Search takes over as soon as the position leaves these lines.
        static const std::unordered_map<std::string, std::string> book = {
            {"rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq -", "e2e4"},
            {"rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq -", "g1f3"},
            {"rnbqkbnr/pppp1ppp/8/4p3/5N2/8/PPPP1PPP/RNBQKB1R b KQkq -", "b8c6"}
        };
        std::string fen = root.toFEN();
        const auto firstFour = fen.substr(0, fen.find_last_of(' ') == std::string::npos ? fen.size() : fen.find_last_of(' '));
        auto it = book.find(firstFour);
        if (it != book.end()) {
            for (const Move& m : rootMoves) if (m.toUci() == it->second) { result.bestMove = m; result.depth = 0; result.nodes = 0; result.principalVariation = {m}; return result; }
        }

        const int maxDepth = limits.depth > 0 ? std::min(limits.depth, 64) : 64;
        for (int depth = 1; depth <= maxDepth; ++depth) {
            if (stopFlag.load(std::memory_order_relaxed)) break;
            GameState state(root);
            std::vector<Move> pv;
            const int score = negamax(state, depth, -Infinity, Infinity, 0, pv);
            if (stopFlag.load(std::memory_order_relaxed)) break;
            if (!pv.empty()) {
                result.bestMove = pv.front();
                result.principalVariation = pv;
                result.score = score;
                result.depth = depth;
            }
            result.nodes = nodes;
            if (std::abs(score) >= MateScore - 100) break;
        }
        result.nodes = nodes;
        return result;
    }
};

Engine::Engine() : impl_(std::make_unique<Impl>()) {}
Engine::~Engine() = default;
Engine::Engine(Engine&&) noexcept = default;
Engine& Engine::operator=(Engine&&) noexcept = default;

void Engine::stop() noexcept { impl_->stopFlag.store(true, std::memory_order_relaxed); }
void Engine::clearHash() noexcept { std::fill(impl_->tt.begin(), impl_->tt.end(), TTEntry{}); }
void Engine::setHashSizeMb(std::size_t megabytes) { impl_->resizeHash(megabytes); }
int Engine::evaluate(const Position& position) const noexcept { return impl_->evaluateAbsolute(position); }
SearchResult Engine::search(const Position& position, const SearchLimits& limits) { return impl_->run(position, limits); }

std::string Engine::scoreToUci(int score) {
    if (std::abs(score) >= MateScore - 100) {
        const int mate = score > 0 ? 1 : -1;
        return "mate " + std::to_string(mate);
    }
    return "cp " + std::to_string(score);
}

std::string Engine::pvToUci(const std::vector<Move>& pv) {
    std::ostringstream out;
    for (std::size_t i = 0; i < pv.size(); ++i) {
        if (i) out << ' ';
        out << pv[i].toUci();
    }
    return out.str();
}

} // namespace chess
