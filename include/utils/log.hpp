#pragma once

#include <string_view>

namespace chess::log {

enum class Level {
    Info,
    Debug,
    Error
};

void write(Level level, std::string_view message);

} // namespace chess::log
