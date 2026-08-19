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
    src/chess/position.cpp
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

    add_executable(ChessEngineFoundationTests
        tests/foundation_tests.cpp
    )

    add_executable(ChessEngineRepresentationTests
        tests/m2_representation_tests.cpp
    )

    add_executable(ChessEnginePositionTests
        src/chess/position.cpp
        tests/m3_position_tests.cpp
    )

    add_executable(ChessEngineMoveTests
        tests/m4_move_tests.cpp
    )

    foreach(test_target
        ChessEngineFoundationTests
        ChessEngineRepresentationTests
        ChessEnginePositionTests
        ChessEngineMoveTests
    )
        target_include_directories(${test_target}
            PRIVATE
                ${CMAKE_CURRENT_SOURCE_DIR}/include
        )
        target_compile_features(${test_target} PRIVATE cxx_std_20)
        if(MSVC)
            target_compile_options(${test_target} PRIVATE /W4 /permissive-)
        else()
            target_compile_options(${test_target} PRIVATE -Wall -Wextra -Wpedantic)
        endif()
    endforeach()

    add_test(NAME ChessEngineFoundationTests COMMAND ChessEngineFoundationTests)
    add_test(NAME ChessEngineRepresentationTests COMMAND ChessEngineRepresentationTests)
    add_test(NAME ChessEnginePositionTests COMMAND ChessEnginePositionTests)
    add_test(NAME ChessEngineMoveTests COMMAND ChessEngineMoveTests)
endif()
