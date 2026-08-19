#include "utils/log.hpp"

int main() {
    chess::log::write(chess::log::Level::Info, "ChessEngine v0.1.0 - foundation ready");
    return 0;
}
