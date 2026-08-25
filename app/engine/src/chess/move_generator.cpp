#include "chess/move_generator.hpp"

#include <array>
#include <cstdlib>
#include <utility>

namespace chess {
namespace {

bool isWhite(Piece piece) noexcept {
    return piece >= Piece::WhitePawn && piece <= Piece::WhiteKing;
}

bool isBlack(Piece piece) noexcept {
    return piece >= Piece::BlackPawn && piece <= Piece::BlackKing;
}

bool isFriendly(Piece piece, Color color) noexcept {
    return color == Color::White ? isWhite(piece) : isBlack(piece);
}

bool isEnemy(Piece piece, Color color) noexcept {
    return piece != Piece::Empty && !isFriendly(piece, color);
}

Piece pieceFor(Color color, PieceType type) noexcept {
    if (color == Color::White) {
        switch (type) {
        case PieceType::Pawn: return Piece::WhitePawn;
        case PieceType::Knight: return Piece::WhiteKnight;
        case PieceType::Bishop: return Piece::WhiteBishop;
        case PieceType::Rook: return Piece::WhiteRook;
        case PieceType::Queen: return Piece::WhiteQueen;
        case PieceType::King: return Piece::WhiteKing;
        case PieceType::None: break;
        }
    } else {
        switch (type) {
        case PieceType::Pawn: return Piece::BlackPawn;
        case PieceType::Knight: return Piece::BlackKnight;
        case PieceType::Bishop: return Piece::BlackBishop;
        case PieceType::Rook: return Piece::BlackRook;
        case PieceType::Queen: return Piece::BlackQueen;
        case PieceType::King: return Piece::BlackKing;
        case PieceType::None: break;
        }
    }
    return Piece::Empty;
}

void addPromotions(std::vector<Move>& moves, Square from, Square to, bool capture) {
    constexpr std::array<PieceType, 4> promotions = {
        PieceType::Knight, PieceType::Bishop, PieceType::Rook, PieceType::Queen,
    };
    for (const PieceType piece : promotions) {
        moves.push_back(capture ? Move::promotionCapture(from, to, piece)
                                : Move::promotion(from, to, piece));
    }
}

void addPawnMoves(const Position& position, Square from, Color color, std::vector<Move>& moves) {
    const int file = fileOf(from);
    const int rank = rankOf(from);
    const int direction = color == Color::White ? 1 : -1;
    const int promotionRank = color == Color::White ? 7 : 0;
    const int startRank = color == Color::White ? 1 : 6;

    const int oneRank = rank + direction;
    if (oneRank >= 0 && oneRank < 8) {
        const Square one = static_cast<Square>(oneRank * 8 + file);
        if (position.pieceAt(one) == Piece::Empty) {
            if (oneRank == promotionRank) {
                addPromotions(moves, from, one, false);
            } else {
                moves.push_back(Move::quiet(from, one));
                if (rank == startRank) {
                    const int twoRank = rank + 2 * direction;
                    const Square two = static_cast<Square>(twoRank * 8 + file);
                    if (position.pieceAt(two) == Piece::Empty) {
                        moves.push_back(Move::doublePawnPush(from, two));
                    }
                }
            }
        }
    }

    for (const int fileDelta : {-1, 1}) {
        const int targetFile = file + fileDelta;
        if (targetFile < 0 || targetFile >= 8 || oneRank < 0 || oneRank >= 8) {
            continue;
        }
        const Square target = static_cast<Square>(oneRank * 8 + targetFile);
        if (isEnemy(position.pieceAt(target), color)) {
            if (oneRank == promotionRank) {
                addPromotions(moves, from, target, true);
            } else {
                moves.push_back(Move::capture(from, target));
            }
        }
    }

    const Square ep = position.enPassantSquare();
    if (ep != Square::None && rankOf(ep) == rank + direction && std::abs(fileOf(ep) - file) == 1
        && position.pieceAt(ep) == Piece::Empty) {
        const int capturedRank = rankOf(ep) - direction;
        if (capturedRank >= 0 && capturedRank < 8) {
            const Square captured = static_cast<Square>(capturedRank * 8 + fileOf(ep));
            if (position.pieceAt(captured) == pieceFor(opposite(color), PieceType::Pawn)) {
                moves.push_back(Move::enPassant(from, ep));
            }
        }
    }
}

void addKnightMoves(const Position& position, Square from, Color color, std::vector<Move>& moves) {
    constexpr std::array<std::pair<int, int>, 8> offsets = {{
        {1, 2}, {2, 1}, {2, -1}, {1, -2},
        {-1, -2}, {-2, -1}, {-2, 1}, {-1, 2},
    }};
    const int file = fileOf(from);
    const int rank = rankOf(from);
    for (const auto [df, dr] : offsets) {
        const int targetFile = file + df;
        const int targetRank = rank + dr;
        if (targetFile < 0 || targetFile >= 8 || targetRank < 0 || targetRank >= 8) {
            continue;
        }
        const Square target = static_cast<Square>(targetRank * 8 + targetFile);
        const Piece targetPiece = position.pieceAt(target);
        if (isFriendly(targetPiece, color)) {
            continue;
        }
        moves.push_back(isEnemy(targetPiece, color) ? Move::capture(from, target) : Move::quiet(from, target));
    }
}

template <std::size_t N>
void addSlidingMoves(const Position& position, Square from, Color color,
                     const std::array<std::pair<int, int>, N>& directions,
                     std::vector<Move>& moves) {
    const int file = fileOf(from);
    const int rank = rankOf(from);
    for (const auto [df, dr] : directions) {
        int targetFile = file + df;
        int targetRank = rank + dr;
        while (targetFile >= 0 && targetFile < 8 && targetRank >= 0 && targetRank < 8) {
            const Square target = static_cast<Square>(targetRank * 8 + targetFile);
            const Piece targetPiece = position.pieceAt(target);
            if (isFriendly(targetPiece, color)) {
                break;
            }
            if (isEnemy(targetPiece, color)) {
                moves.push_back(Move::capture(from, target));
                break;
            }
            moves.push_back(Move::quiet(from, target));
            targetFile += df;
            targetRank += dr;
        }
    }
}

void addKingMoves(const Position& position, Square from, Color color, std::vector<Move>& moves) {
    constexpr std::array<std::pair<int, int>, 8> offsets = {{
        {0, 1}, {1, 1}, {1, 0}, {1, -1},
        {0, -1}, {-1, -1}, {-1, 0}, {-1, 1},
    }};
    const int file = fileOf(from);
    const int rank = rankOf(from);
    for (const auto [df, dr] : offsets) {
        const int targetFile = file + df;
        const int targetRank = rank + dr;
        if (targetFile < 0 || targetFile >= 8 || targetRank < 0 || targetRank >= 8) {
            continue;
        }
        const Square target = static_cast<Square>(targetRank * 8 + targetFile);
        const Piece targetPiece = position.pieceAt(target);
        if (isFriendly(targetPiece, color)) {
            continue;
        }
        moves.push_back(isEnemy(targetPiece, color) ? Move::capture(from, target) : Move::quiet(from, target));
    }
}

void addCastlingMoves(const Position& position, Color color, std::vector<Move>& moves) {
    const Square kingSquare = color == Color::White ? Square::E1 : Square::E8;
    if (position.pieceAt(kingSquare) != pieceFor(color, PieceType::King)) {
        return;
    }

    if (color == Color::White) {
        if (position.canCastleKingside(color)
            && position.pieceAt(Square::H1) == Piece::WhiteRook
            && position.pieceAt(Square::F1) == Piece::Empty
            && position.pieceAt(Square::G1) == Piece::Empty) {
            moves.push_back(Move::castleKingside(Square::E1, Square::G1));
        }
        if (position.canCastleQueenside(color)
            && position.pieceAt(Square::A1) == Piece::WhiteRook
            && position.pieceAt(Square::B1) == Piece::Empty
            && position.pieceAt(Square::C1) == Piece::Empty
            && position.pieceAt(Square::D1) == Piece::Empty) {
            moves.push_back(Move::castleQueenside(Square::E1, Square::C1));
        }
    } else {
        if (position.canCastleKingside(color)
            && position.pieceAt(Square::H8) == Piece::BlackRook
            && position.pieceAt(Square::F8) == Piece::Empty
            && position.pieceAt(Square::G8) == Piece::Empty) {
            moves.push_back(Move::castleKingside(Square::E8, Square::G8));
        }
        if (position.canCastleQueenside(color)
            && position.pieceAt(Square::A8) == Piece::BlackRook
            && position.pieceAt(Square::B8) == Piece::Empty
            && position.pieceAt(Square::C8) == Piece::Empty
            && position.pieceAt(Square::D8) == Piece::Empty) {
            moves.push_back(Move::castleQueenside(Square::E8, Square::C8));
        }
    }
}

} // namespace

std::vector<Move> generatePseudoLegalMoves(const Position& position) {
    std::vector<Move> moves;
    moves.reserve(64);

    constexpr std::array<std::pair<int, int>, 4> bishopDirections = {{
        {1, 1}, {1, -1}, {-1, -1}, {-1, 1},
    }};
    constexpr std::array<std::pair<int, int>, 4> rookDirections = {{
        {0, 1}, {1, 0}, {0, -1}, {-1, 0},
    }};
    constexpr std::array<std::pair<int, int>, 8> queenDirections = {{
        {0, 1}, {1, 1}, {1, 0}, {1, -1},
        {0, -1}, {-1, -1}, {-1, 0}, {-1, 1},
    }};

    const Color color = position.sideToMove();
    for (int index = 0; index < 64; ++index) {
        const Square from = static_cast<Square>(index);
        const Piece piece = position.pieceAt(from);
        if (!isFriendly(piece, color)) {
            continue;
        }

        switch (piece) {
        case Piece::WhitePawn:
        case Piece::BlackPawn:
            addPawnMoves(position, from, color, moves);
            break;
        case Piece::WhiteKnight:
        case Piece::BlackKnight:
            addKnightMoves(position, from, color, moves);
            break;
        case Piece::WhiteBishop:
        case Piece::BlackBishop:
            addSlidingMoves(position, from, color, bishopDirections, moves);
            break;
        case Piece::WhiteRook:
        case Piece::BlackRook:
            addSlidingMoves(position, from, color, rookDirections, moves);
            break;
        case Piece::WhiteQueen:
        case Piece::BlackQueen:
            addSlidingMoves(position, from, color, queenDirections, moves);
            break;
        case Piece::WhiteKing:
        case Piece::BlackKing:
            addKingMoves(position, from, color, moves);
            if ((color == Color::White && from == Square::E1)
                || (color == Color::Black && from == Square::E8)) {
                addCastlingMoves(position, color, moves);
            }
            break;
        case Piece::Empty:
            break;
        }
    }

    return moves;
}

} // namespace chess
