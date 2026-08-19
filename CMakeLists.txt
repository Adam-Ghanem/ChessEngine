cmake_minimum_required(VERSION 3.20)

project(ChessEngine
    VERSION 0.2.0
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
    src/chess/move_generator.cpp
    src/chess/legal_move_generator.cpp
    src/chess/game_state.cpp
    src/chess/game_status.cpp
    src/chess/perft.cpp
    src/chess/engine.cpp
    src/utils/log.cpp
)

target_include_directories(ChessEngine PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/include)
target_compile_features(ChessEngine PRIVATE cxx_std_20)

if(MSVC)
    target_compile_options(ChessEngine PRIVATE /W4 /permissive-)
else()
    target_compile_options(ChessEngine PRIVATE -Wall -Wextra -Wpedantic)
endif()

if(CHESS_ENGINE_BUILD_TESTS)
    enable_testing()

    add_executable(ChessEngineFoundationTests tests/foundation_tests.cpp)
    add_executable(ChessEngineRepresentationTests tests/m2_representation_tests.cpp)
    add_executable(ChessEnginePositionTests src/chess/position.cpp tests/m3_position_tests.cpp)
    add_executable(ChessEngineMoveTests tests/m4_move_tests.cpp)
    add_executable(ChessEngineMoveGenerationTests src/chess/position.cpp src/chess/move_generator.cpp tests/m5_move_generation_tests.cpp)
    add_executable(ChessEngineLegalMoveTests src/chess/position.cpp src/chess/move_generator.cpp src/chess/legal_move_generator.cpp tests/m6_legal_move_tests.cpp)
    add_executable(ChessEngineGameStateTests src/chess/position.cpp src/chess/move_generator.cpp src/chess/legal_move_generator.cpp src/chess/game_state.cpp tests/m7_game_state_tests.cpp)
    add_executable(ChessEngineGameStatusTests src/chess/position.cpp src/chess/move_generator.cpp src/chess/legal_move_generator.cpp src/chess/game_state.cpp src/chess/game_status.cpp tests/m8_game_status_tests.cpp)
    add_executable(ChessEnginePerftTests src/chess/position.cpp src/chess/move_generator.cpp src/chess/legal_move_generator.cpp src/chess/game_state.cpp src/chess/perft.cpp tests/m9_perft_tests.cpp)
    add_executable(ChessEngineSearchTests src/chess/position.cpp src/chess/move_generator.cpp src/chess/legal_move_generator.cpp src/chess/game_state.cpp src/chess/game_status.cpp src/chess/engine.cpp tests/m10_search_tests.cpp)

    foreach(test_target
        ChessEngineFoundationTests ChessEngineRepresentationTests ChessEnginePositionTests
        ChessEngineMoveTests ChessEngineMoveGenerationTests ChessEngineLegalMoveTests
        ChessEngineGameStateTests ChessEngineGameStatusTests ChessEnginePerftTests ChessEngineSearchTests)
        target_include_directories(${test_target} PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/include)
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
    add_test(NAME ChessEngineMoveGenerationTests COMMAND ChessEngineMoveGenerationTests)
    add_test(NAME ChessEngineLegalMoveTests COMMAND ChessEngineLegalMoveTests)
    add_test(NAME ChessEngineGameStateTests COMMAND ChessEngineGameStateTests)
    add_test(NAME ChessEngineGameStatusTests COMMAND ChessEngineGameStatusTests)
    add_test(NAME ChessEnginePerftTests COMMAND ChessEnginePerftTests)
    add_test(NAME ChessEngineSearchTests COMMAND ChessEngineSearchTests)
endif()
