#include "chess/engine.hpp"

#include "chess/game_status.hpp"
#include "chess/move_generator.hpp"

#include <algorithm>
#include <array>
#include <atomic>
#include <bit>
#include <chrono>
#include <cmath>
#include <cstddef>
#include <cstdint>
#include <memory>
#include <sstream>
#include <string>
#include <vector>

namespace chess {
namespace {

constexpr int Infinity = 32000;
constexpr int MateScore = 30000;
constexpr int MaxPly = 128;
constexpr int MateThreshold = MateScore - MaxPly;

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
    -30,  0, 20, 30, 30, 20,  0,-30,
    -30,-10,  0,  0,  0,  0,-10,-30,
    -50,-30,-30,-30,-30,-30,-30,-50
};

std::uint64_t splitmix64(std::uint64_t& x) noexcept {
    x += 0x9e3779b97f4a7c15ULL;
    std::uint64_t z = x;
    z = (z ^ (z >> 30U)) * 0xbf58476d1ce4e5b9ULL;
    z = (z ^ (z >> 27U)) * 0x94d049bb133111ebULL;
    return z ^ (z >> 31U);
}

int mirroredSquare(int sq) noexcept { return sq ^ 56; }
int pieceIndex(Piece piece) noexcept { return static_cast<int>(piece); }

int tableValue(Piece piece, int sq, bool endgame) noexcept {
    switch (pieceIndex(piece)) {
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
        for (auto& row : pieceSquare_)
            for (auto& key : row)
                key = splitmix64(seed);
        side_ = splitmix64(seed);
        for (auto& key : castling_)
            key = splitmix64(seed);
        for (auto& key : ep_)
            key = splitmix64(seed);
    }

    std::uint64_t hash(const Position& p) const noexcept {
        std::uint64_t h = 0;
        for (int pi = 1; pi <= 12; ++pi) {
            Bitboard bb = p.pieces(static_cast<Piece>(pi));
            while (bb) {
                const int sq = static_cast<int>(std::countr_zero(bb));
                h ^= pieceSquare_[pi][sq];
                bb &= bb - 1;
            }
        }
        if (p.sideToMove() == Color::Black)
            h ^= side_;
        unsigned rights = 0;
        if (p.canCastleKingside(Color::White)) rights |= 1U;
        if (p.canCastleQueenside(Color::White)) rights |= 2U;
        if (p.canCastleKingside(Color::Black)) rights |= 4U;
        if (p.canCastleQueenside(Color::Black)) rights |= 8U;
        h ^= castling_[rights];
        if (p.enPassantSquare() != Square::None)
            h ^= ep_[static_cast<int>(p.enPassantSquare()) & 7];
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

int scoreToTt(int score, int ply) noexcept {
    if (score > MateThreshold) return score + ply;
    if (score < -MateThreshold) return score - ply;
    return score;
}

int scoreFromTt(int score, int ply) noexcept {
    if (score > MateThreshold) return score - ply;
    if (score < -MateThreshold) return score + ply;
    return score;
}

Bitboard fileMask(int file) noexcept { return 0x0101010101010101ULL << file; }

int pawnStructure(const Position& p) noexcept {
    int score = 0;
    const Bitboard wp = p.pieces(Piece::WhitePawn);
    const Bitboard bp = p.pieces(Piece::BlackPawn);
    for (int file = 0; file < 8; ++file) {
        const Bitboard mask = fileMask(file);
        const int wc = std::popcount(wp & mask);
        const int bc = std::popcount(bp & mask);
        if (wc > 1) score -= 14 * (wc - 1);
        if (bc > 1) score += 14 * (bc - 1);
        const Bitboard adjacent =
            (file > 0 ? fileMask(file - 1) : 0ULL) |
            (file < 7 ? fileMask(file + 1) : 0ULL);
        if (wc == 0 && (wp & adjacent) == 0) score -= 10;
        if (bc == 0 && (bp & adjacent) == 0) score += 10;
    }
    for (int sq = 0; sq < 64; ++sq) {
        const Bitboard bit = 1ULL << sq;
        const int file = sq & 7;
        const int rank = sq >> 3;
        const Bitboard frontFiles =
            fileMask(file) |
            (file > 0 ? fileMask(file - 1) : 0ULL) |
            (file < 7 ? fileMask(file + 1) : 0ULL);
        if (wp & bit) {
            const int frontRank = rank + 1;
            if (frontRank >= 8 ||
                (bp & frontFiles & ~((1ULL << (8 * frontRank)) - 1ULL)) == 0)
                score += 18 + rank * 8;
        }
        if (bp & bit) {
            const int frontRank = rank - 1;
            if (frontRank < 0 ||
                (wp & frontFiles & ((1ULL << (8 * (frontRank + 1))) - 1ULL)) == 0)
                score -= 18 + (7 - rank) * 8;
        }
    }
    return score;
}

} // namespace

struct Engine::Impl {
    std::vector<TTEntry> tt;
    std::size_t ttMask = 0;
    Zobrist zobrist;
    std::atomic<bool> stopFlag{false};
    std::chrono::steady_clock::time_point deadline{};
    bool timed = false;
    std::uint64_t nodes = 0;
    std::array<std::array<int, 4096>, 2> history{};
    std::array<Move, MaxPly> killers1{};
    std::array<Move, MaxPly> killers2{};
    bool nullMovePruning = true;
    bool lmr = false;
    bool futilityPruning = false;

    explicit Impl() { resizeHash(32); }

    void resizeHash(std::size_t mb) {
        const std::size_t bytes = std::max<std::size_t>(1, mb) * 1024ULL * 1024ULL;
        std::size_t count = 1;
        while ((count << 1U) * sizeof(TTEntry) <= bytes) count <<= 1;
        tt.assign(count, TTEntry{});
        ttMask = count - 1;
    }

    void checkTime() {
        if (timed && (nodes & 2047ULL) == 0 && std::chrono::steady_clock::now() >= deadline)
            stopFlag.store(true, std::memory_order_relaxed);
    }

    int evaluateAbsolute(const Position& p) const noexcept {
        int score = 0;
        int nonPawnMaterial = 0;
        for (int pi = 1; pi <= 12; ++pi) {
            const Piece piece = static_cast<Piece>(pi);
            Bitboard bb = p.pieces(piece);
            const int value = Material[pi];
            if (pi != 1 && pi != 6 && pi != 7 && pi != 12)
                nonPawnMaterial += std::popcount(bb) * std::abs(value);
            while (bb) {
                const int sq = static_cast<int>(std::countr_zero(bb));
                score += value + tableValue(piece, sq, nonPawnMaterial < 2600);
                bb &= bb - 1;
            }
        }
        const int wb = std::popcount(p.pieces(Piece::WhiteBishop));
        const int bb = std::popcount(p.pieces(Piece::BlackBishop));
        score += (wb >= 2 ? 30 : 0) - (bb >= 2 ? 30 : 0);
        score += pawnStructure(p);
        for (int file = 0; file < 8; ++file) {
            const Bitboard mask = fileMask(file);
            const bool wp = (p.pieces(Piece::WhitePawn) & mask) != 0;
            const bool bp = (p.pieces(Piece::BlackPawn) & mask) != 0;
            const int wr = std::popcount(p.pieces(Piece::WhiteRook) & mask);
            const int br = std::popcount(p.pieces(Piece::BlackRook) & mask);
            if (!wp) score += wr * 12;
            if (!bp) score -= br * 12;
            if (!wp && !bp) score += (wr - br) * 8;
        }
        return score;
    }

    int evaluateForSide(const Position& p) const noexcept {
        const int score = evaluateAbsolute(p);
        return p.sideToMove() == Color::White ? score : -score;
    }

    int moveIndex(const Move& m) const noexcept {
        return static_cast<int>(m.from()) * 64 + static_cast<int>(m.to());
    }

    int moveScore(const Position& p, const Move& m, int ply, const Move& ttMove) const noexcept {
        if (m == ttMove) return 2'000'000;
        int score = 0;
        if (m.isPromotion()) score += 900'000 + static_cast<int>(m.promotionPiece()) * 10'000;
        if (m.isCapture()) {
            const Piece victim = p.pieceAt(m.to());
            const Piece attacker = p.pieceAt(m.from());
            score += 500'000 + std::abs(Material[pieceIndex(victim)]) * 16
                - std::abs(Material[pieceIndex(attacker)]);
        }
        if (ply < MaxPly) {
            if (m == killers1[ply]) score += 400'000;
            else if (m == killers2[ply]) score += 350'000;
        }
        score += history[p.sideToMove() == Color::White ? 0 : 1][moveIndex(m)];
        return score;
    }

    std::vector<Move> orderedMoves(
        const Position& p,
        std::vector<Move> moves,
        int ply,
        const Move& ttMove) const {
        std::stable_sort(moves.begin(), moves.end(), [&](const Move& a, const Move& b) {
            return moveScore(p, a, ply, ttMove) > moveScore(p, b, ply, ttMove);
        });
        return moves;
    }

    bool hasNonPawnMaterial(const Position& p) const noexcept {
        return (p.pieces(Piece::WhiteKnight) |
                p.pieces(Piece::WhiteBishop) |
                p.pieces(Piece::WhiteRook) |
                p.pieces(Piece::WhiteQueen) |
                p.pieces(Piece::BlackKnight) |
                p.pieces(Piece::BlackBishop) |
                p.pieces(Piece::BlackRook) |
                p.pieces(Piece::BlackQueen)) != 0;
    }

    int quiescence(GameState& state, int alpha, int beta, int ply) {
        ++nodes;
        checkTime();
        const bool inCheck = isInCheck(state.position());
        if (stopFlag.load(std::memory_order_relaxed)) return 0;
        if (!inCheck) {
            const int stand = evaluateForSide(state.position());
            if (stand >= beta) return beta;
            if (stand > alpha) alpha = stand;
        }
        if (ply >= MaxPly - 1) return alpha;
        auto moves = generateLegalMoves(state.position());
        if (!inCheck) {
            moves.erase(std::remove_if(moves.begin(), moves.end(), [](const Move& m) {
                return !m.isCapture() && !m.isPromotion();
            }), moves.end());
        }
        moves = orderedMoves(state.position(), std::move(moves), ply, Move{});
        for (const Move& m : moves) {
            if (!state.makeMove(m)) continue;
            const int score = -quiescence(state, -beta, -alpha, ply + 1);
            state.unmakeMove();
            if (stopFlag.load(std::memory_order_relaxed)) return 0;
            if (score >= beta) return beta;
            if (score > alpha) alpha = score;
        }
        return alpha;
    }

    int negamax(GameState& state, int depth, int alpha, int beta, int ply, std::vector<Move>& pv) {
        ++nodes;
        checkTime();
        if (stopFlag.load(std::memory_order_relaxed)) return 0;
        const bool inCheck = isInCheck(state.position());
        const auto legal = generateLegalMoves(state.position());
        if (legal.empty()) return inCheck ? -MateScore + ply : 0;
        if (depth <= 0) return quiescence(state, alpha, beta, ply);
        if (ply >= MaxPly - 1) return evaluateForSide(state.position());
        const bool pvNode = (beta - alpha) > 1;

        const std::uint64_t key = zobrist.hash(state.position());
        TTEntry& entry = tt[key & ttMask];
        Move ttMove{};
        if (entry.key == key) {
            ttMove = entry.best;
            if (entry.depth >= depth) {
                const int ttScore = scoreFromTt(entry.score, ply);
                if (entry.bound == Bound::Exact) return ttScore;
                if (entry.bound == Bound::Lower && ttScore >= beta) return ttScore;
                if (entry.bound == Bound::Upper && ttScore <= alpha) return ttScore;
            }
        }

        if (nullMovePruning && !pvNode && !inCheck && depth >= 3 && hasNonPawnMaterial(state.position())) {
            const int reduction = depth >= 6 ? 3 : 2;
            if (state.makeNullMove()) {
                std::vector<Move> nullPv;
                const int score = -negamax(
                    state,
                    depth - 1 - reduction,
                    -beta,
                    -beta + 1,
                    ply + 1,
                    nullPv);
                state.unmakeNullMove();
                if (!stopFlag.load(std::memory_order_relaxed) && score >= beta) {
                    entry.key = key;
                    entry.depth = depth;
                    entry.score = scoreToTt(score, ply);
                    entry.best = Move{};
                    entry.bound = Bound::Lower;
                    pv.clear();
                    return score;
                }
            }
        }

        const int originalAlpha = alpha;
        auto moves = orderedMoves(state.position(), legal, ply, ttMove);
        int bestScore = -Infinity;
        Move bestMove{};
        std::vector<Move> bestPv;
        int moveNumber = 0;
        for (const Move& m : moves) {
            if (!state.makeMove(m)) continue;
            std::vector<Move> childPv;
            const bool givesCheck = isInCheck(state.position());
            const int childDepth = depth - 1 + ((givesCheck && depth <= 2) ? 1 : 0);
            const bool quietMove = !m.isCapture() && !m.isPromotion();
            const bool killerMove = ply < MaxPly && (m == killers1[ply] || m == killers2[ply]);
            const bool reduceMove = lmr && !inCheck && !givesCheck && quietMove &&
                !killerMove && moveNumber >= 4 && depth >= 3;
            int score;

            if (moveNumber == 0) {
                score = -negamax(state, childDepth, -beta, -alpha, ply + 1, childPv);
            } else if (reduceMove) {
                const int reducedDepth = std::max(1, childDepth - 1);
                score = -negamax(state, reducedDepth, -alpha - 1, -alpha, ply + 1, childPv);
                if (score > alpha && score < beta)
                    score = -negamax(state, childDepth, -alpha - 1, -alpha, ply + 1, childPv);
            } else {
                score = -negamax(state, childDepth, -alpha - 1, -alpha, ply + 1, childPv);
                if (score > alpha && score < beta)
                    score = -negamax(state, childDepth, -beta, -alpha, ply + 1, childPv);
            }
            state.unmakeMove();
            if (stopFlag.load(std::memory_order_relaxed)) return 0;
            if (score > bestScore) {
                bestScore = score;
                bestMove = m;
                bestPv = {m};
                bestPv.insert(bestPv.end(), childPv.begin(), childPv.end());
            }
            if (score > alpha) alpha = score;
            if (alpha >= beta) {
                if (!m.isCapture() && !m.isPromotion()) {
                    if (ply < MaxPly && killers1[ply] != m) {
                        killers2[ply] = killers1[ply];
                        killers1[ply] = m;
                    }
                    const int side = state.position().sideToMove() == Color::White ? 0 : 1;
                    history[side][moveIndex(m)] =
                        std::min(50'000, history[side][moveIndex(m)] + depth * depth);
                }
                break;
            }
            ++moveNumber;
        }
        if (!stopFlag.load(std::memory_order_relaxed)) {
            entry.key = key;
            entry.depth = depth;
            entry.score = scoreToTt(bestScore, ply);
            entry.best = bestMove;
            entry.bound = bestScore <= originalAlpha
                ? Bound::Upper
                : (bestScore >= beta ? Bound::Lower : Bound::Exact);
        }
        pv = std::move(bestPv);
        return bestScore;
    }

    SearchResult run(const Position& root, SearchLimits limits) {
        stopFlag.store(false, std::memory_order_relaxed);
        nodes = 0;
        timed = false;
        if (limits.moveTimeMs > 0) {
            timed = true;
            deadline = std::chrono::steady_clock::now() +
                std::chrono::milliseconds(limits.moveTimeMs);
        } else {
            const bool white = root.sideToMove() == Color::White;
            const int remaining = white ? limits.whiteTimeMs : limits.blackTimeMs;
            const int increment = white ? limits.whiteIncrementMs : limits.blackIncrementMs;
            if (remaining > 0) {
                const int budget = std::max(10, remaining / 30 + increment / 2);
                timed = true;
                deadline = std::chrono::steady_clock::now() +
                    std::chrono::milliseconds(budget);
            }
        }
        const auto rootMoves = generateLegalMoves(root);
        SearchResult result;
        if (rootMoves.empty()) return result;
        result.bestMove = rootMoves.front();
        const int maxDepth = limits.depth > 0 ? std::min(limits.depth, 64) : 64;
        int previousScore = 0;
        for (int depth = 1; depth <= maxDepth; ++depth) {
            if (stopFlag.load(std::memory_order_relaxed)) break;
            GameState state(root);
            std::vector<Move> pv;
            int alpha = -Infinity;
            int beta = Infinity;
            if (depth >= 4 && std::abs(previousScore) < MateThreshold) {
                alpha = previousScore - 50;
                beta = previousScore + 50;
            }
            int score = negamax(state, depth, alpha, beta, 0, pv);
            if (!stopFlag.load(std::memory_order_relaxed) && (score <= alpha || score >= beta)) {
                state = GameState(root);
                pv.clear();
                score = negamax(state, depth, -Infinity, Infinity, 0, pv);
            }
            if (stopFlag.load(std::memory_order_relaxed)) break;
            if (!pv.empty()) {
                result.bestMove = pv.front();
                result.principalVariation = pv;
                result.score = score;
                result.depth = depth;
                previousScore = score;
            }
            result.nodes = nodes;
            if (std::abs(score) >= MateThreshold) break;
        }
        result.nodes = nodes;
        return result;
    }
};

Engine::Engine() : impl_(std::make_unique<Impl>()) {}
Engine::~Engine() = default;
Engine::Engine(Engine&&) noexcept = default;
Engine& Engine::operator=(Engine&&) noexcept = default;

void Engine::stop() noexcept {
    impl_->stopFlag.store(true, std::memory_order_relaxed);
}

void Engine::clearHash() noexcept {
    std::fill(impl_->tt.begin(), impl_->tt.end(), TTEntry{});
}

void Engine::setHashSizeMb(std::size_t megabytes) {
    impl_->resizeHash(megabytes);
}

void Engine::setNullMovePruning(bool enabled) noexcept {
    impl_->nullMovePruning = enabled;
}

void Engine::setLmr(bool enabled) noexcept {
    impl_->lmr = enabled;
}

void Engine::setFutilityPruning(bool enabled) noexcept {
    impl_->futilityPruning = enabled;
}

int Engine::evaluate(const Position& position) const noexcept {
    return impl_->evaluateAbsolute(position);
}

SearchResult Engine::search(const Position& position, const SearchLimits& limits) {
    return impl_->run(position, limits);
}

std::string Engine::scoreToUci(int score) {
    if (std::abs(score) >= MateThreshold) {
        const int matePly = std::max(1, MateScore - std::abs(score));
        const int mate = (matePly + 1) / 2;
        return "mate " + std::to_string(score > 0 ? mate : -mate);
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
