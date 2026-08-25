#include "utils/log.hpp"

#include <iostream>

namespace chess::log {

void write(Level level, std::string_view message) {
    switch (level) {
    case Level::Info:
        std::clog << "[INFO] ";
        break;
    case Level::Debug:
        std::clog << "[DEBUG] ";
        break;
    case Level::Error:
        std::clog << "[ERROR] ";
        break;
    }

    std::clog << message << '\n';
}

} // namespace chess::log
