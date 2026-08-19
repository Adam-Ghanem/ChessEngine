cmake_minimum_required(VERSION 3.20)

project(ChessEngine
    VERSION 0.1.0
    DESCRIPTION "A modular chess engine built from scratch in modern C++"
    LANGUAGES CXX
)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

option(CHESS_ENGINE_BUILD_TESTS "Build ChessEngine tests" ON)

add_executable(ChessEngine
    src/main.cpp
    src/utils/log.cpp
)

target_include_directories(ChessEngine
    PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}/include
)

target_compile_features(ChessEngine PRIVATE cxx_std_20)

if(MSVC)
    target_compile_options(ChessEngine PRIVATE /W4 /permissive-)
else()
    target_compile_options(ChessEngine PRIVATE -Wall -Wextra -Wpedantic)
endif()

if(CHESS_ENGINE_BUILD_TESTS)
    enable_testing()
    add_executable(ChessEngineTests
        tests/foundation_tests.cpp
    )
    target_include_directories(ChessEngineTests
        PRIVATE
            ${CMAKE_CURRENT_SOURCE_DIR}/include
    )
    target_compile_features(ChessEngineTests PRIVATE cxx_std_20)
    if(MSVC)
        target_compile_options(ChessEngineTests PRIVATE /W4 /permissive-)
    else()
        target_compile_options(ChessEngineTests PRIVATE -Wall -Wextra -Wpedantic)
    endif()
    add_test(NAME ChessEngineTests COMMAND ChessEngineTests)
endif()
