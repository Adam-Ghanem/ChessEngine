#include "chess/move_generator.hpp"

#include <array>

namespace chess {
namespace {

using Board = std::array<Piece, 64>;

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

Board boardFromPosition(const Position& position) {
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
            if (!onBoard(pawnFile, pawnRank)) continue;
            const Piece pawn = board[static_cast<std::size_t>(pawnRank * 8 + pawnFile)];
            if (pawn == pieceFor(byColor, PieceType::Pawn)) return true;
        }
    }

    constexpr int knightOffsets[8][2] = {
        {1, 2}, {2, 1}, {2, -1}, {1, -2},
        {-1, -2}, {-2, -1}, {-2, 1}, {-1, 2},
    };
    for (const auto& offset : knightOffsets) {
        const int f = file + offset[0];
        const int r = rank + offset[1];
        if (onBoard(f, r) && board[static_cast<std::size_t>(r * 8 + f)] == pieceFor(byColor, PieceType::Knight)) {
            return true;
        }
    }

    constexpr int kingOffsets[8][2] = {
        {0, 1}, {1, 1}, {1, 0}, {1, -1},
        {0, -1}, {-1, -1}, {-1, 0}, {-1, 1},
    };
    for (const auto& offset : kingOffsets) {
        const int f = file + offset[0];
        const int r = rank + offset[1];
        if (onBoard(f, r) && board[static_cast<std::size_t>(r * 8 + f)] == pieceFor(byColor, PieceType::King)) {
            return true;
        }
    }

    constexpr int bishopDirections[4][2] = {{1, 1}, {1, -1}, {-1, -1}, {-1, 1}};
    constexpr int rookDirections[4][2] = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}};

    for (const auto& direction : bishopDirections) {
        int f = file + direction[0];
        int r = rank + direction[1];
        while (onBoard(f, r)) {
            const Piece piece = board[static_cast<std::size_t>(r * 8 + f)];
            if (piece != Piece::Empty) {
                if (piece == pieceFor(byColor, PieceType::Bishop)
                    || piece == pieceFor(byColor, PieceType::Queen)) return true;
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
                if (piece == pieceFor(byColor, PieceType::Rook)
                    || piece == pieceFor(byColor, PieceType::Queen)) return true;
                break;
            }
            f += direction[0];
            r += direction[1];
        }
    }

    return false;
}

bool applyMove(Board& board, const Move& move, Color color) noexcept {
    const int from = squareIndex(move.from());
    const int to = squareIndex(move.to());
    if (from < 0 || from >= 64 || to < 0 || to >= 64) return false;

    const Piece moving = board[static_cast<std::size_t>(from)];
    if (!isFriendly(moving, color)) return false;

    board[static_cast<std::size_t>(to)] = moving;
    board[static_cast<std::size_t>(from)] = Piece::Empty;

    if (move.isEnPassant()) {
        const int direction = color == Color::White ? -1 : 1;
        const int captured = to + direction * 8;
        if (captured < 0 || captured >= 64 || board[static_cast<std::size_t>(captured)] != pieceFor(opposite(color), PieceType::Pawn)) {
            return false;
        }
        board[static_cast<std::size_t>(captured)] = Piece::Empty;
    }

    if (move.isCastle()) {
        if (color == Color::White && move.to() == Square::G1) {
            board[squareIndex(Square::F1)] = Piece::WhiteRook;
            board[squareIndex(Square::H1)] = Piece::Empty;
        } else if (color == Color::White && move.to() == Square::C1) {
            board[squareIndex(Square::D1)] = Piece::WhiteRook;
            board[squareIndex(Square::A1)] = Piece::Empty;
        } else if (color == Color::Black && move.to() == Square::G8) {
            board[squareIndex(Square::F8)] = Piece::BlackRook;
            board[squareIndex(Square::H8)] = Piece::Empty;
        } else if (color == Color::Black && move.to() == Square::C8) {
            board[squareIndex(Square::D8)] = Piece::BlackRook;
            board[squareIndex(Square::A8)] = Piece::Empty;
        } else {
            return false;
        }
    }

    if (move.isPromotion()) {
        board[static_cast<std::size_t>(to)] = pieceFor(color, move.promotionPiece());
    }

    return true;
}

Square kingSquare(const Board& board, Color color) noexcept {
    const Piece king = pieceFor(color, PieceType::King);
    for (int index = 0; index < 64; ++index) {
        if (board[static_cast<std::size_t>(index)] == king) return static_cast<Square>(index);
    }
    return Square::None;
}

bool leavesKingInCheck(const Board& original, const Move& move, Color color) noexcept {
    Board board = original;
    if (!applyMove(board, move, color)) return true;
    const Square king = kingSquare(board, color);
    return king == Square::None || squareAttacked(board, king, opposite(color));
}

bool castlePathSafe(const Board& board, const Move& move, Color color) noexcept {
    const Square from = move.from();
    const Square transit = color == Color::White
        ? (move.to() == Square::G1 ? Square::F1 : Square::D1)
        : (move.to() == Square::G8 ? Square::F8 : Square::D8);

    if (squareAttacked(board, from, opposite(color))) return false;

    Board transitBoard = board;
    transitBoard[squareIndex(from)] = Piece::Empty;
    transitBoard[squareIndex(transit)] = pieceFor(color, PieceType::King);
    if (squareAttacked(transitBoard, transit, opposite(color))) return false;

    return true;
}

} // namespace

std::vector<Move> generateLegalMoves(const Position& position) {
    const Color color = position.sideToMove();
    const Board board = boardFromPosition(position);
    const std::vector<Move> pseudo = generatePseudoLegalMoves(position);

    std::vector<Move> legal;
    legal.reserve(pseudo.size());

    for (const Move& move : pseudo) {
        const Piece target = board[static_cast<std::size_t>(squareIndex(move.to()))];
        if (target == pieceFor(opposite(color), PieceType::King)) continue;

        if (move.isCastle() && !castlePathSafe(board, move, color)) continue;
        if (!leavesKingInCheck(board, move, color)) legal.push_back(move);
    }

    return legal;
}

} // namespace chess
