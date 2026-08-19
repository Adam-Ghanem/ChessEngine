#include "chess/game_state.hpp"

#include "chess/move_generator.hpp"

#include <array>
#include <sstream>
#include <string>

namespace chess {
namespace {

using Board = std::array<Piece, 64>;

char pieceToFen(Piece piece) {
    switch (piece) {
    case Piece::WhitePawn: return 'P';
    case Piece::WhiteKnight: return 'N';
    case Piece::WhiteBishop: return 'B';
    case Piece::WhiteRook: return 'R';
    case Piece::WhiteQueen: return 'Q';
    case Piece::WhiteKing: return 'K';
    case Piece::BlackPawn: return 'p';
    case Piece::BlackKnight: return 'n';
    case Piece::BlackBishop: return 'b';
    case Piece::BlackRook: return 'r';
    case Piece::BlackQueen: return 'q';
    case Piece::BlackKing: return 'k';
    case Piece::Empty: return '1';
    }
    return '1';
}

Piece promotionPiece(Color color, PieceType type) noexcept {
    if (color == Color::White) {
        switch (type) {
        case PieceType::Knight: return Piece::WhiteKnight;
        case PieceType::Bishop: return Piece::WhiteBishop;
        case PieceType::Rook: return Piece::WhiteRook;
        case PieceType::Queen: return Piece::WhiteQueen;
        default: return Piece::Empty;
        }
    }
    switch (type) {
    case PieceType::Knight: return Piece::BlackKnight;
    case PieceType::Bishop: return Piece::BlackBishop;
    case PieceType::Rook: return Piece::BlackRook;
    case PieceType::Queen: return Piece::BlackQueen;
    default: return Piece::Empty;
    }
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
        default: return Piece::Empty;
        }
    }
    switch (type) {
    case PieceType::Pawn: return Piece::BlackPawn;
    case PieceType::Knight: return Piece::BlackKnight;
    case PieceType::Bishop: return Piece::BlackBishop;
    case PieceType::Rook: return Piece::BlackRook;
    case PieceType::Queen: return Piece::BlackQueen;
    case PieceType::King: return Piece::BlackKing;
    default: return Piece::Empty;
    }
}

bool isPawn(Piece piece) noexcept {
    return piece == Piece::WhitePawn || piece == Piece::BlackPawn;
}

bool isWhite(Piece piece) noexcept {
    return piece >= Piece::WhitePawn && piece <= Piece::WhiteKing;
}

bool isBlack(Piece piece) noexcept {
    return piece >= Piece::BlackPawn && piece <= Piece::BlackKing;
}

Color pieceColor(Piece piece) noexcept {
    return isWhite(piece) ? Color::White : Color::Black;
}

Board boardFromPosition(const Position& position) {
    Board board{};
    for (int i = 0; i < 64; ++i) board[static_cast<std::size_t>(i)] = position.pieceAt(static_cast<Square>(i));
    return board;
}

std::string squareName(Square square) {
    if (square == Square::None) return "-";
    std::string result;
    result += static_cast<char>('a' + fileOf(square));
    result += static_cast<char>('1' + rankOf(square));
    return result;
}

std::string placement(const Board& board) {
    std::string result;
    for (int rank = 7; rank >= 0; --rank) {
        int empty = 0;
        for (int file = 0; file < 8; ++file) {
            const Piece piece = board[static_cast<std::size_t>(rank * 8 + file)];
            if (piece == Piece::Empty) {
                ++empty;
                continue;
            }
            if (empty != 0) {
                result += static_cast<char>('0' + empty);
                empty = 0;
            }
            result += pieceToFen(piece);
        }
        if (empty != 0) result += static_cast<char>('0' + empty);
        if (rank != 0) result += '/';
    }
    return result;
}

bool containsLegalMove(const Position& position, const Move& wanted) {
    for (const Move& move : generateLegalMoves(position)) {
        if (move == wanted) return true;
    }
    return false;
}

void updateCastlingRights(std::string& rights, Color color, Square from, Square to, Piece captured) {
    auto erase = [&rights](char c) {
        rights.erase(std::remove(rights.begin(), rights.end(), c), rights.end());
    };

    if (color == Color::White && from == Square::E1) {
        erase('K'); erase('Q');
    }
    if (color == Color::Black && from == Square::E8) {
        erase('k'); erase('q');
    }
    if (from == Square::A1 || to == Square::A1) erase('Q');
    if (from == Square::H1 || to == Square::H1) erase('K');
    if (from == Square::A8 || to == Square::A8) erase('q');
    if (from == Square::H8 || to == Square::H8) erase('k');

    if (captured == Piece::WhiteRook) {
        if (to == Square::A1) erase('Q');
        if (to == Square::H1) erase('K');
    }
    if (captured == Piece::BlackRook) {
        if (to == Square::A8) erase('q');
        if (to == Square::H8) erase('k');
    }
}

} // namespace

GameState::GameState(Position position) : position_(std::move(position)) {}

bool GameState::makeMove(const Move& move) {
    if (!containsLegalMove(position_, move)) return false;

    const Color color = position_.sideToMove();
    const Board before = boardFromPosition(position_);
    Board board = before;
    const int from = squareIndex(move.from());
    const int to = squareIndex(move.to());
    const Piece moving = board[static_cast<std::size_t>(from)];
    Piece captured = board[static_cast<std::size_t>(to)];

    board[static_cast<std::size_t>(from)] = Piece::Empty;

    if (move.isEnPassant()) {
        const int capturedIndex = to + (color == Color::White ? -8 : 8);
        captured = board[static_cast<std::size_t>(capturedIndex)];
        board[static_cast<std::size_t>(capturedIndex)] = Piece::Empty;
    }

    board[static_cast<std::size_t>(to)] = moving;

    if (move.isCastle()) {
        if (color == Color::White && move.to() == Square::G1) {
            board[squareIndex(Square::H1)] = Piece::Empty;
            board[squareIndex(Square::F1)] = Piece::WhiteRook;
        } else if (color == Color::White && move.to() == Square::C1) {
            board[squareIndex(Square::A1)] = Piece::Empty;
            board[squareIndex(Square::D1)] = Piece::WhiteRook;
        } else if (color == Color::Black && move.to() == Square::G8) {
            board[squareIndex(Square::H8)] = Piece::Empty;
            board[squareIndex(Square::F8)] = Piece::BlackRook;
        } else if (color == Color::Black && move.to() == Square::C8) {
            board[squareIndex(Square::A8)] = Piece::Empty;
            board[squareIndex(Square::D8)] = Piece::BlackRook;
        }
    }

    if (move.isPromotion()) board[static_cast<std::size_t>(to)] = promotionPiece(color, move.promotionPiece());

    std::string rights;
    if (position_.canCastleKingside(Color::White)) rights += 'K';
    if (position_.canCastleQueenside(Color::White)) rights += 'Q';
    if (position_.canCastleKingside(Color::Black)) rights += 'k';
    if (position_.canCastleQueenside(Color::Black)) rights += 'q';
    updateCastlingRights(rights, color, move.from(), move.to(), captured);
    if (rights.empty()) rights = "-";

    Square ep = Square::None;
    if (move.isDoublePawnPush()) {
        const int epIndex = (from + to) / 2;
        ep = static_cast<Square>(epIndex);
    }

    const std::uint16_t halfmove = (isPawn(moving) || move.isCapture()) ? 0 : static_cast<std::uint16_t>(position_.halfmoveClock() + 1);
    const std::uint32_t fullmove = position_.fullmoveNumber() + (color == Color::Black ? 1U : 0U);
    const Color next = opposite(color);

    const std::string fen = placement(board) + ' ' + (next == Color::White ? "w" : "b") + ' '
        + rights + ' ' + squareName(ep) + ' ' + std::to_string(halfmove) + ' ' + std::to_string(fullmove);

    history_.push_back(position_);
    moves_.push_back(move);
    position_ = Position::fromFEN(fen);
    return true;
}

bool GameState::unmakeMove() noexcept {
    if (history_.empty()) return false;
    position_ = history_.back();
    history_.pop_back();
    moves_.pop_back();
    return true;
}

} // namespace chess
