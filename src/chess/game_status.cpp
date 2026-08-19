#include "chess/game_status.hpp"

#include "chess/move_generator.hpp"

#include <array>
#include <cstdint>
#include <string>
#include <vector>

namespace chess {
namespace {

using Board = std::array<Piece, 64>;

bool isWhite(Piece piece) noexcept {
    return piece >= Piece::WhitePawn && piece <= Piece::WhiteKing;
}

bool isBlack(Piece piece) noexcept {
    return piece >= Piece::BlackPawn && piece <= Piece::BlackKing;
}

Piece kingFor(Color color) noexcept {
    return color == Color::White ? Piece::WhiteKing : Piece::BlackKing;
}

Piece pawnFor(Color color) noexcept {
    return color == Color::White ? Piece::WhitePawn : Piece::BlackPawn;
}

Piece knightFor(Color color) noexcept {
    return color == Color::White ? Piece::WhiteKnight : Piece::BlackKnight;
}

Piece bishopFor(Color color) noexcept {
    return color == Color::White ? Piece::WhiteBishop : Piece::BlackBishop;
}

Piece rookFor(Color color) noexcept {
    return color == Color::White ? Piece::WhiteRook : Piece::BlackRook;
}

Piece queenFor(Color color) noexcept {
    return color == Color::White ? Piece::WhiteQueen : Piece::BlackQueen;
}

Board boardFromPosition(const Position& position) noexcept {
    Board board{};
    for (int index = 0; index < 64; ++index) {
        board[static_cast<std::size_t>(index)] = position.pieceAt(static_cast<Square>(index));
    }
    return board;
}

bool onBoard(int file, int rank) noexcept {
    return file >= 0 && file < 8 && rank >= 0 && rank < 8;
}

bool squareAttacked(const Board& board, Square square, Color byColor) noexcept {
    const int file = fileOf(square);
    const int rank = rankOf(square);

    const int pawnRank = rank + (byColor == Color::White ? -1 : 1);
    if (pawnRank >= 0 && pawnRank < 8) {
        for (const int df : {-1, 1}) {
            const int pawnFile = file + df;
            if (onBoard(pawnFile, pawnRank)
                && board[static_cast<std::size_t>(pawnRank * 8 + pawnFile)] == pawnFor(byColor)) {
                return true;
            }
        }
    }

    constexpr int knightOffsets[8][2] = {
        {1, 2}, {2, 1}, {2, -1}, {1, -2},
        {-1, -2}, {-2, -1}, {-2, 1}, {-1, 2},
    };
    for (const auto& offset : knightOffsets) {
        const int f = file + offset[0];
        const int r = rank + offset[1];
        if (onBoard(f, r) && board[static_cast<std::size_t>(r * 8 + f)] == knightFor(byColor)) return true;
    }

    constexpr int kingOffsets[8][2] = {
        {0, 1}, {1, 1}, {1, 0}, {1, -1},
        {0, -1}, {-1, -1}, {-1, 0}, {-1, 1},
    };
    for (const auto& offset : kingOffsets) {
        const int f = file + offset[0];
        const int r = rank + offset[1];
        if (onBoard(f, r) && board[static_cast<std::size_t>(r * 8 + f)] == kingFor(byColor)) return true;
    }

    constexpr int bishopDirections[4][2] = {{1, 1}, {1, -1}, {-1, -1}, {-1, 1}};
    constexpr int rookDirections[4][2] = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}};

    for (const auto& direction : bishopDirections) {
        int f = file + direction[0];
        int r = rank + direction[1];
        while (onBoard(f, r)) {
            const Piece piece = board[static_cast<std::size_t>(r * 8 + f)];
            if (piece != Piece::Empty) {
                if (piece == bishopFor(byColor) || piece == queenFor(byColor)) return true;
                break;
            }
            f += direction[0];
            r += direction[1];
        }
    }

    for (const auto& direction : rookDirections) {
        int f = file + direction[0];
        int r = rank + direction[1];
        while (onBoard(f, r)) {
            const Piece piece = board[static_cast<std::size_t>(r * 8 + f)];
            if (piece != Piece::Empty) {
                if (piece == rookFor(byColor) || piece == queenFor(byColor)) return true;
                break;
            }
            f += direction[0];
            r += direction[1];
        }
    }

    return false;
}

Square kingSquare(const Board& board, Color color) noexcept {
    const Piece king = kingFor(color);
    for (int index = 0; index < 64; ++index) {
        if (board[static_cast<std::size_t>(index)] == king) return static_cast<Square>(index);
    }
    return Square::None;
}

bool sameRepetitionPosition(const Position& lhs, const Position& rhs) noexcept {
    if (lhs.sideToMove() != rhs.sideToMove()) return false;
    if (lhs.enPassantSquare() != rhs.enPassantSquare()) return false;
    if (lhs.canCastleKingside(Color::White) != rhs.canCastleKingside(Color::White)
        || lhs.canCastleQueenside(Color::White) != rhs.canCastleQueenside(Color::White)
        || lhs.canCastleKingside(Color::Black) != rhs.canCastleKingside(Color::Black)
        || lhs.canCastleQueenside(Color::Black) != rhs.canCastleQueenside(Color::Black)) return false;
    return lhs.toFEN().substr(0, lhs.toFEN().find(' ', lhs.toFEN().find(' ') + 1))
        == rhs.toFEN().substr(0, rhs.toFEN().find(' ', rhs.toFEN().find(' ') + 1));
}

bool onlyKings(const Board& board) noexcept {
    for (const Piece piece : board) {
        if (piece != Piece::Empty && piece != Piece::WhiteKing && piece != Piece::BlackKing) return false;
    }
    return true;
}

bool kingAndMinorOnly(const Board& board) noexcept {
    int bishops = 0;
    int knights = 0;
    for (const Piece piece : board) {
        if (piece == Piece::WhitePawn || piece == Piece::BlackPawn
            || piece == Piece::WhiteRook || piece == Piece::BlackRook
            || piece == Piece::WhiteQueen || piece == Piece::BlackQueen) return false;
        if (piece == Piece::WhiteBishop || piece == Piece::BlackBishop) ++bishops;
        if (piece == Piece::WhiteKnight || piece == Piece::BlackKnight) ++knights;
    }
    return bishops + knights <= 1;
}

bool bishopsSameColor(const Board& board) noexcept {
    int bishopCount = 0;
    int squareColor = -1;
    for (int index = 0; index < 64; ++index) {
        const Piece piece = board[static_cast<std::size_t>(index)];
        if (piece != Piece::WhiteBishop && piece != Piece::BlackBishop) continue;
        ++bishopCount;
        const int file = index % 8;
        const int rank = index / 8;
        const int color = (file + rank) & 1;
        if (squareColor == -1) squareColor = color;
        else if (squareColor != color) return false;
    }
    return bishopCount == 2;
}

} // namespace

bool isInCheck(const Position& position) noexcept {
    const Board board = boardFromPosition(position);
    const Square king = kingSquare(board, position.sideToMove());
    return king != Square::None && squareAttacked(board, king, opposite(position.sideToMove()));
}

bool isCheckmate(const Position& position) noexcept {
    return isInCheck(position) && generateLegalMoves(position).empty();
}

bool isStalemate(const Position& position) noexcept {
    return !isInCheck(position) && generateLegalMoves(position).empty();
}

bool isInsufficientMaterial(const Position& position) noexcept {
    const Board board = boardFromPosition(position);
    if (onlyKings(board) || kingAndMinorOnly(board)) return true;
    return bishopsSameColor(board);
}

bool isThreefoldRepetition(const GameState& state) noexcept {
    const Position& current = state.position();
    std::size_t count = 1;
    for (const Position& position : state.positionHistory()) {
        if (sameRepetitionPosition(position, current)) ++count;
    }
    return count >= 3;
}

GameStatus gameStatus(const GameState& state) noexcept {
    const Position& position = state.position();
    if (isCheckmate(position)) return GameStatus::Checkmate;
    if (isStalemate(position)) return GameStatus::Stalemate;
    if (position.halfmoveClock() >= 100) return GameStatus::FiftyMoveDraw;
    if (isThreefoldRepetition(state)) return GameStatus::ThreefoldRepetition;
    if (isInsufficientMaterial(position)) return GameStatus::InsufficientMaterial;
    return GameStatus::Ongoing;
}

} // namespace chess
