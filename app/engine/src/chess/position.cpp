#include "chess/position.hpp"

#include <cctype>
#include <sstream>
#include <stdexcept>
#include <string>
#include <string_view>

namespace chess {

namespace {

constexpr std::size_t pieceIndex(Piece piece) noexcept {
    return static_cast<std::size_t>(piece);
}

Piece pieceFromFen(char symbol) {
    switch (symbol) {
    case 'P': return Piece::WhitePawn;
    case 'N': return Piece::WhiteKnight;
    case 'B': return Piece::WhiteBishop;
    case 'R': return Piece::WhiteRook;
    case 'Q': return Piece::WhiteQueen;
    case 'K': return Piece::WhiteKing;
    case 'p': return Piece::BlackPawn;
    case 'n': return Piece::BlackKnight;
    case 'b': return Piece::BlackBishop;
    case 'r': return Piece::BlackRook;
    case 'q': return Piece::BlackQueen;
    case 'k': return Piece::BlackKing;
    default: throw std::invalid_argument("invalid FEN piece character");
    }
}

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
    case Piece::Empty: break;
    }
    throw std::invalid_argument("cannot serialize empty piece");
}

Square squareFromFen(std::string_view text) {
    if (text.size() != 2 || text[0] < 'a' || text[0] > 'h' || text[1] < '1' || text[1] > '8') {
        throw std::invalid_argument("invalid FEN square");
    }
    const int file = text[0] - 'a';
    const int rank = text[1] - '1';
    return static_cast<Square>(rank * 8 + file);
}

std::string squareToFen(Square square) {
    if (square == Square::None) {
        return "-";
    }
    if (squareIndex(square) < 0 || squareIndex(square) >= 64) {
        throw std::invalid_argument("invalid position square");
    }
    std::string result;
    result += static_cast<char>('a' + fileOf(square));
    result += static_cast<char>('1' + rankOf(square));
    return result;
}

} // namespace

Position::Position() noexcept {
    setInitialPosition();
}

void Position::clear() noexcept {
    pieces_.fill(0);
    whiteOccupancy_ = 0;
    blackOccupancy_ = 0;
    occupancy_ = 0;
    sideToMove_ = Color::White;
    castlingRights_ = 0;
    enPassantSquare_ = Square::None;
    halfmoveClock_ = 0;
    fullmoveNumber_ = 1;
}

void Position::addPiece(Piece piece, Square square) noexcept {
    const Bitboard bit = squareBit(square);
    pieces_[pieceIndex(piece)] |= bit;
    if (piece >= Piece::WhitePawn && piece <= Piece::WhiteKing) {
        whiteOccupancy_ |= bit;
    } else if (piece >= Piece::BlackPawn && piece <= Piece::BlackKing) {
        blackOccupancy_ |= bit;
    }
    occupancy_ = whiteOccupancy_ | blackOccupancy_;
}

void Position::setInitialPosition() noexcept {
    clear();
    for (int file = 0; file < 8; ++file) {
        addPiece(Piece::WhitePawn, static_cast<Square>(8 + file));
        addPiece(Piece::BlackPawn, static_cast<Square>(48 + file));
    }

    constexpr Piece backRank[8] = {
        Piece::WhiteRook, Piece::WhiteKnight, Piece::WhiteBishop, Piece::WhiteQueen,
        Piece::WhiteKing, Piece::WhiteBishop, Piece::WhiteKnight, Piece::WhiteRook,
    };
    constexpr Piece blackBackRank[8] = {
        Piece::BlackRook, Piece::BlackKnight, Piece::BlackBishop, Piece::BlackQueen,
        Piece::BlackKing, Piece::BlackBishop, Piece::BlackKnight, Piece::BlackRook,
    };
    for (int file = 0; file < 8; ++file) {
        addPiece(backRank[file], static_cast<Square>(file));
        addPiece(blackBackRank[file], static_cast<Square>(56 + file));
    }

    castlingRights_ = static_cast<std::uint8_t>(CastlingRight::WhiteKingside)
                    | static_cast<std::uint8_t>(CastlingRight::WhiteQueenside)
                    | static_cast<std::uint8_t>(CastlingRight::BlackKingside)
                    | static_cast<std::uint8_t>(CastlingRight::BlackQueenside);
}

Position Position::fromFEN(const std::string& fen) {
    std::istringstream stream(fen);
    std::string placement;
    std::string activeColor;
    std::string castling;
    std::string enPassant;
    std::string halfmove;
    std::string fullmove;
    std::string extra;

    if (!(stream >> placement >> activeColor >> castling >> enPassant >> halfmove >> fullmove) || (stream >> extra)) {
        throw std::invalid_argument("FEN must contain exactly six fields");
    }

    Position position;
    position.clear();

    std::size_t rank = 7;
    std::size_t file = 0;
    std::size_t ranks = 0;
    for (char symbol : placement) {
        if (symbol == '/') {
            if (file != 8 || rank == 0) {
                throw std::invalid_argument("invalid FEN piece placement");
            }
            --rank;
            file = 0;
            ++ranks;
            continue;
        }

        if (file >= 8) {
            throw std::invalid_argument("FEN rank contains too many squares");
        }

        if (symbol >= '1' && symbol <= '8') {
            file += static_cast<std::size_t>(symbol - '0');
            if (file > 8) {
                throw std::invalid_argument("FEN rank contains too many squares");
            }
            continue;
        }

        if (std::isalpha(static_cast<unsigned char>(symbol)) == 0) {
            throw std::invalid_argument("invalid FEN piece character");
        }

        position.addPiece(pieceFromFen(symbol), static_cast<Square>(rank * 8 + file));
        ++file;
    }

    if (rank != 0 || file != 8 || ranks != 7) {
        throw std::invalid_argument("FEN piece placement must contain eight complete ranks");
    }

    if (activeColor == "w") {
        position.sideToMove_ = Color::White;
    } else if (activeColor == "b") {
        position.sideToMove_ = Color::Black;
    } else {
        throw std::invalid_argument("invalid FEN active color");
    }

    if (castling != "-") {
        for (char right : castling) {
            std::uint8_t flag = 0;
            switch (right) {
            case 'K': flag = static_cast<std::uint8_t>(CastlingRight::WhiteKingside); break;
            case 'Q': flag = static_cast<std::uint8_t>(CastlingRight::WhiteQueenside); break;
            case 'k': flag = static_cast<std::uint8_t>(CastlingRight::BlackKingside); break;
            case 'q': flag = static_cast<std::uint8_t>(CastlingRight::BlackQueenside); break;
            default: throw std::invalid_argument("invalid FEN castling rights");
            }
            if ((position.castlingRights_ & flag) != 0) {
                throw std::invalid_argument("duplicate FEN castling right");
            }
            position.castlingRights_ |= flag;
        }
    }

    if (enPassant == "-") {
        position.enPassantSquare_ = Square::None;
    } else {
        position.enPassantSquare_ = squareFromFen(enPassant);
        const int rankIndex = rankOf(position.enPassantSquare_);
        if (rankIndex != 2 && rankIndex != 5) {
            throw std::invalid_argument("invalid FEN en-passant rank");
        }
    }

    try {
        std::size_t consumed = 0;
        const unsigned long value = std::stoul(halfmove, &consumed);
        if (consumed != halfmove.size() || value > 65535UL) {
            throw std::invalid_argument("invalid FEN halfmove clock");
        }
        position.halfmoveClock_ = static_cast<std::uint16_t>(value);

        consumed = 0;
        const unsigned long fullmoveValue = std::stoul(fullmove, &consumed);
        if (consumed != fullmove.size() || fullmoveValue == 0 || fullmoveValue > 4294967295UL) {
            throw std::invalid_argument("invalid FEN fullmove number");
        }
        position.fullmoveNumber_ = static_cast<std::uint32_t>(fullmoveValue);
    } catch (const std::invalid_argument&) {
        throw std::invalid_argument("invalid FEN counters");
    } catch (const std::out_of_range&) {
        throw std::invalid_argument("FEN counters out of range");
    }

    return position;
}

std::string Position::toFEN() const {
    std::string placement;
    placement.reserve(64);
    for (int rank = 7; rank >= 0; --rank) {
        int empty = 0;
        for (int file = 0; file < 8; ++file) {
            const Piece piece = pieceAt(static_cast<Square>(rank * 8 + file));
            if (piece == Piece::Empty) {
                ++empty;
            } else {
                if (empty != 0) {
                    placement += static_cast<char>('0' + empty);
                    empty = 0;
                }
                placement += pieceToFen(piece);
            }
        }
        if (empty != 0) {
            placement += static_cast<char>('0' + empty);
        }
        if (rank != 0) {
            placement += '/';
        }
    }

    std::string castling;
    if (canCastleKingside(Color::White)) castling += 'K';
    if (canCastleQueenside(Color::White)) castling += 'Q';
    if (canCastleKingside(Color::Black)) castling += 'k';
    if (canCastleQueenside(Color::Black)) castling += 'q';
    if (castling.empty()) castling = "-";

    return placement + ' ' + (sideToMove_ == Color::White ? "w" : "b") + ' '
        + castling + ' ' + squareToFen(enPassantSquare_) + ' '
        + std::to_string(halfmoveClock_) + ' ' + std::to_string(fullmoveNumber_);
}

Bitboard Position::pieces(Piece piece) const noexcept {
    const auto index = pieceIndex(piece);
    return index < pieces_.size() ? pieces_[index] : 0ULL;
}

bool Position::canCastleKingside(Color color) const noexcept {
    const auto flag = color == Color::White ? CastlingRight::WhiteKingside : CastlingRight::BlackKingside;
    return (castlingRights_ & static_cast<std::uint8_t>(flag)) != 0;
}

bool Position::canCastleQueenside(Color color) const noexcept {
    const auto flag = color == Color::White ? CastlingRight::WhiteQueenside : CastlingRight::BlackQueenside;
    return (castlingRights_ & static_cast<std::uint8_t>(flag)) != 0;
}

Piece Position::pieceAt(Square square) const noexcept {
    const Bitboard bit = squareBit(square);
    if (bit == 0) return Piece::Empty;
    for (std::size_t index = 1; index < pieces_.size(); ++index) {
        if ((pieces_[index] & bit) != 0) {
            return static_cast<Piece>(index);
        }
    }
    return Piece::Empty;
}

bool operator==(const Position& lhs, const Position& rhs) noexcept {
    return lhs.pieces_ == rhs.pieces_
        && lhs.sideToMove_ == rhs.sideToMove_
        && lhs.castlingRights_ == rhs.castlingRights_
        && lhs.enPassantSquare_ == rhs.enPassantSquare_
        && lhs.halfmoveClock_ == rhs.halfmoveClock_
        && lhs.fullmoveNumber_ == rhs.fullmoveNumber_;
}

} // namespace chess
